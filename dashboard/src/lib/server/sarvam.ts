import { SarvamAIClient } from "sarvamai";

type SttResult = { text: string | null; error?: string };
type TtsResult = { audio: Buffer | null; contentType?: string; error?: string };

const sarvamKey = process.env.SARVAM_API_KEY || "";

function getClient() {
    if (!sarvamKey) return null;
    return new SarvamAIClient({ apiSubscriptionKey: sarvamKey });
}

export async function sarvamSttFromAudio(audio: Buffer, contentType = "audio/wav"): Promise<SttResult> {
    const client = getClient();
    if (!client) return { text: null, error: "missing SARVAM_API_KEY" };
    try {
        const response = await client.speechToText.transcribe({
            file: {
                data: audio,
                filename: "recording.wav",
                contentType,
            },
            language_code: "unknown",
        });
        return { text: response.transcript || null };
    } catch (err: any) {
        console.error("[sarvamSttFromAudio]", err?.message || err);
        return { text: null, error: err?.message || "stt_failed" };
    }
}

export async function sarvamTtsFromText(text: string): Promise<TtsResult> {
    const client = getClient();
    if (!client) return { audio: null, error: "missing SARVAM_API_KEY" };
    try {
        const response = await client.textToSpeech.convert({
            text,
            target_language_code: "en-IN",
            model: "bulbul:v3",
            output_audio_codec: "mp3",
        });
        const audioBase64 = response.audios?.[0];
        if (!audioBase64) throw new Error("no_audio");
        return { audio: Buffer.from(audioBase64, "base64"), contentType: "audio/mpeg" };
    } catch (err: any) {
        console.error("[sarvamTtsFromText]", err?.message || err);
        return { audio: null, error: err?.message || "tts_failed" };
    }
}
