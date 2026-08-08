const { WaveFile } = require("wavefile");
const { transcribeAudio } = require("./stt");
const { pushTranscript } = require("../sseClients");
const { supabase } = require("../supabase");

const CHUNK_TIME_MS = 1500; // 1.5 seconds

class AudioChunkBuffer {
    constructor(callSid) {
        this.callSid = callSid;
        this.buffer = Buffer.alloc(0);
        this.lastProcessTime = Date.now();
        this.processing = false;
    }

    addChunk(base64Payload) {
        const chunk = Buffer.from(base64Payload, "base64");
        this.buffer = Buffer.concat([this.buffer, chunk]);

        if (!this.processing && Date.now() - this.lastProcessTime > CHUNK_TIME_MS) {
            this.processBuffer();
        }
    }

    async processBuffer() {
        if (this.buffer.length < 4000) return; // Need at least 0.5s of audio

        this.processing = true;
        this.lastProcessTime = Date.now();

        // Extract chunk to process and clear buffer
        const chunkToProcess = this.buffer;
        this.buffer = Buffer.alloc(0);

        try {
            // Twilio sends 8kHz, 8-bit, mono mu-law
            const wav = new WaveFile();
            // Twilio payload is raw mulaw bytes. `wavefile` code '8m' represents mu-law.
            wav.fromScratch(1, 8000, "8m", chunkToProcess);
            wav.fromMuLaw(); // Decode to 16-bit PCM

            const wavBuffer = wav.toBuffer();

            // Call Sarvam STT
            const sttResult = await transcribeAudio(wavBuffer, "en-IN");
            const text = sttResult.text?.trim() || "";

            if (text && text.length > 1 && !text.includes("No transcript returned")) {
                const ts = new Date().toISOString();

                console.log(`[STT MicroBatch] ${this.callSid} -> "${text}"`);

                // Push delta to dashboard
                pushTranscript(this.callSid, { speaker: "user", text, ts });

                // Save to DB
                this.saveToSupabase(text, ts);
            }
        } catch (err) {
            console.error(`[STT MicroBatch] Error for ${this.callSid}:`, err.message);
        } finally {
            this.processing = false;
        }
    }

    async saveToSupabase(text, ts) {
        try {
            const { data: callRow } = await supabase
                .from("calls")
                .select("id")
                .eq("provider_call_id", this.callSid)
                .maybeSingle();

            if (callRow?.id) {
                await supabase.from("transcripts").insert({
                    call_id: callRow.id,
                    speaker: "user",
                    text,
                    ts
                });
            }
        } catch (dbErr) {
            console.error("[STT MicroBatch] DB Save error:", dbErr.message);
        }
    }
}

const activeBuffers = new Map();

function handleStreamAudio(callSid, base64Payload) {
    if (!callSid) return;
    if (!activeBuffers.has(callSid)) {
        activeBuffers.set(callSid, new AudioChunkBuffer(callSid));
    }
    activeBuffers.get(callSid).addChunk(base64Payload);
}

function flushStreamAudio(callSid) {
    if (activeBuffers.has(callSid)) {
        const buffer = activeBuffers.get(callSid);
        if (buffer.buffer.length > 0) {
            buffer.processBuffer().finally(() => {
                activeBuffers.delete(callSid);
            });
        } else {
            activeBuffers.delete(callSid);
        }
    }
}

module.exports = {
    handleStreamAudio,
    flushStreamAudio
};
