import os
import httpx
from dotenv import load_dotenv
from loguru import logger
from pipecat.frames.frames import LLMRunFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.runner.types import RunnerArguments
from pipecat.runner.utils import create_transport
from pipecat.services.sarvam.stt import SarvamSTTService
from pipecat.services.sarvam.tts import SarvamTTSService
from pipecat.services.sarvam.llm import SarvamLLMService
from pipecat.transports.websocket.fastapi import FastAPIWebsocketParams

load_dotenv(override=True)

# -- Sector prompts (expand per sector) --
SYSTEM_PROMPTS = {
    "general": """You are Ava, a friendly AI voice assistant for VoiceFlow Solutions.
Keep responses brief (under 15 words per turn). Mirror the caller's language — 
if they speak Tamil, reply in Tamil; if Hindi, reply in Hindi.
Switch languages immediately if the caller switches.""",
    "spa": """You are a helpful receptionist for a spa and salon.
Answer questions about services, pricing, and bookings.
Mirror the caller's language automatically.""",
}

def get_system_prompt(sector: str) -> str:
    return SYSTEM_PROMPTS.get(sector, SYSTEM_PROMPTS["general"])

async def bot(runner_args: RunnerArguments, sector: str = "general"):
    transport = await create_transport(
        runner_args,
        {
            "exotel": lambda: FastAPIWebsocketParams(
                audio_in_enabled=True, audio_out_enabled=True
            ),
        },
    )

    # Auto-detect language — core differentiator
    stt = SarvamSTTService(
        api_key=os.getenv("SARVAM_API_KEY"),
        settings=SarvamSTTService.Settings(
            model="saaras:v3",
            language="unknown",  # auto-detect per utterance
        ),
        mode="transcribe",
    )

    tts = SarvamTTSService(
        api_key=os.getenv("SARVAM_API_KEY"),
        settings=SarvamTTSService.Settings(
            model="bulbul:v3",
            voice="aditya",
            language="en-IN",  # default; will evolve with dynamic switching
        ),
    )

    llm = SarvamLLMService(
        api_key=os.getenv("SARVAM_API_KEY"),
        settings=SarvamLLMService.Settings(
            model="sarvam-105b",
            reasoning_effort=None,  # disable thinking mode — avoids call latency
        ),
    )

    messages = [{"role": "system", "content": get_system_prompt(sector)}]
    context = LLMContext(messages)
    context_aggregator = LLMContextAggregatorPair(context)

    pipeline = Pipeline([
        transport.input(),
        stt,
        context_aggregator.user(),
        llm,
        tts,
        transport.output(),
        context_aggregator.assistant(),
    ])

    # Exotel streams 8kHz audio
    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            audio_in_sample_rate=8000,
            audio_out_sample_rate=8000,
        ),
    )

    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        logger.info("Caller connected")
        messages.append({
            "role": "system",
            "content": "Greet the caller warmly and ask how you can help."
        })
        await task.queue_frames([LLMRunFrame()])

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info("Caller disconnected — sending summary to Express")
        # Build transcript from context
        transcript = "\n".join(
            f"{m['role'].upper()}: {m['content']}"
            for m in messages
            if m["role"] in ("user", "assistant")
        )
        webhook_url = os.getenv("EXPRESS_WEBHOOK_URL")
        if webhook_url and transcript:
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(webhook_url, json={
                        "message": {
                            "type": "end-of-call-report",
                            "transcript": transcript,
                            "summary": transcript[:500],
                        }
                    }, timeout=10)
            except Exception as e:
                logger.error(f"Failed to send webhook: {e}")
        await task.cancel()

    runner = PipelineRunner(handle_sigint=runner_args.handle_sigint)
    await runner.run(task)

if __name__ == "__main__":
    from pipecat.runner.run import main
    main()
