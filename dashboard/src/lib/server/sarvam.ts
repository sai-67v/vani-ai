type SttResult = { text: string | null; error?: string };
type TtsResult = { audio: Buffer | null; contentType?: string; error?: string };

const SARVAM_STT_URL = process.env.SARVAM_STT_URL || "https://api.sarvam.ai/speech-to-text";
const SARVAM_TTS_URL = process.env.SARVAM_TTS_URL || "https://api.sarvam.ai/text-to-speech";
const sarvamKey = process.env.SARVAM_API_KEY || "";

export async function sarvamSttFromAudio(audio: Buffer, contentType = "audio/wav"): Promise<SttResult> {
    if (!sarvamKey) return { text: null, error: "missing SARVAM_API_KEY" };
    try {
        const res = await fetch(SARVAM_STT_URL, {
            method: "POST",
            headers: {
                "Content-Type": contentType,
                Authorization: `Bearer ${sarvamKey}`,
            },
            // Buffer is a Uint8Array; cast for Fetch body
            body: audio as any,
        });
        if (!res.ok) throw new Error(`STT ${res.status}`);
        const data = await res.json();
        const text = data.text || data.transcript || null;
        return { text };
    } catch (err: any) {
        console.error("[sarvamSttFromAudio]", err?.message || err);
        return { text: null, error: err?.message || "stt_failed" };
    }
}

export async function sarvamTtsFromText(text: string): Promise<TtsResult> {
    if (!sarvamKey) return { audio: null, error: "missing SARVAM_API_KEY" };
    try {
        const res = await fetch(SARVAM_TTS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sarvamKey}`,
            },
            body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error(`TTS ${res.status}`);
        const arrayBuf = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") || "audio/mpeg";
        return { audio: Buffer.from(arrayBuf), contentType };
    } catch (err: any) {
        console.error("[sarvamTtsFromText]", err?.message || err);
        return { audio: null, error: err?.message || "tts_failed" };
    }
}
