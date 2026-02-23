import { NextResponse } from "next/server";
import { basicAuthHeader, buildTurnTwiml, xmlResponse } from "@/lib/server/twilio";
import { sarvamSttFromAudio, sarvamTtsFromText } from "@/lib/server/sarvam";
import { runLlm } from "@/lib/server/llm";
import { uploadAudioToSupabase } from "@/lib/server/storage";
import { getSupabaseServer } from "@/lib/server/supabaseServer";

export async function POST(request: Request) {
    const form = await request.formData();
    const callSid = (form.get("CallSid") as string) || "";
    const from = (form.get("From") as string) || null;
    const to = (form.get("To") as string) || null;
    const recordingUrlRaw = (form.get("RecordingUrl") as string) || "";
    const recordingUrl = recordingUrlRaw
        ? recordingUrlRaw.endsWith(".wav") || recordingUrlRaw.endsWith(".mp3")
            ? recordingUrlRaw
            : `${recordingUrlRaw}.wav`
        : "";

    const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    const authToken = process.env.TWILIO_AUTH_TOKEN || "";
    const baseUrl = process.env.PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "";

    let userText = "";
    let replyText = "Thanks for calling. Could you share more details?";
    let leadScore = 60;
    let emotionScore = 0; // -1 negative, 0 neutral, 1 positive
    let ttsUrl: string | null = null;
    let summary = "";
    let intent = "";

    // Download recording
    if (recordingUrl && accountSid && authToken) {
        try {
            const res = await fetch(recordingUrl, {
                headers: { Authorization: basicAuthHeader(accountSid, authToken) },
            });
            const audioBuf = Buffer.from(await res.arrayBuffer());

            // STT
            const stt = await sarvamSttFromAudio(audioBuf, res.headers.get("content-type") || "audio/wav");
            if (stt.text) {
                userText = stt.text;
            }

            // LLM
            const llm = await runLlm(
                `Caller said: "${userText || "(empty)"}". Return concise JSON with replyText, lead (hot|warm|cold), emotion (positive|neutral|negative), summary, intent.`
            );
            if (llm) {
                replyText = llm.replyText;
                leadScore = mapLeadToScore(llm.lead);
                emotionScore = mapEmotionToScore(llm.emotion);
                summary = llm.summary || userText;
                intent = llm.intent || "";
            }

            // TTS
            const tts = await sarvamTtsFromText(replyText);
            if (tts.audio) {
                const fname = `twilio-tts/${callSid}-${Date.now()}.mp3`;
                ttsUrl = await uploadAudioToSupabase(fname, tts.audio, tts.contentType || "audio/mpeg");
            }
        } catch (err) {
            console.error("[processTurn]", err);
        }
    }

    // Supabase logging
    await upsertCallAndTranscript({
        callSid,
        from,
        to,
        recordingUrl,
        userText,
        replyText,
        leadScore,
        emotionScore,
        summary,
        intent,
    });

    const redirectUrl = baseUrl ? `${baseUrl}/api/twilio/voice` : null;
    const twiml = buildTurnTwiml(ttsUrl, redirectUrl, replyText);
    return xmlResponse(twiml);
}

function mapLeadToScore(lead: string) {
    if (lead === "hot") return 90;
    if (lead === "warm") return 70;
    return 40;
}

function mapEmotionToScore(emotion: string) {
    if (emotion === "positive") return 1;
    if (emotion === "negative") return -1;
    return 0;
}

async function upsertCallAndTranscript(params: {
    callSid: string;
    from: string | null;
    to: string | null;
    recordingUrl: string;
    userText: string;
    replyText: string;
    leadScore: number;
    emotionScore: number;
    summary: string;
    intent: string;
}) {
    const supabase = getSupabaseServer();
    if (!supabase) return;

    try {
        const { data: callRow } = await supabase
            .from("calls")
            .upsert({
                provider_call_id: params.callSid,
                provider: "twilio",
                customer_number: params.from,
                to_number: params.to,
                status: "in-progress",
                lead_score: params.leadScore,
                emotion_score: params.emotionScore,
                recording_url: params.recordingUrl,
                summary: params.summary || null,
                started_at: new Date().toISOString(),
            }, { onConflict: "provider_call_id" })
            .select("id")
            .single();

        const callId = callRow?.id;
        if (!callId) return;

        const now = new Date().toISOString();
        const transcriptsPayload = [] as any[];
        if (params.userText) {
            transcriptsPayload.push({ call_id: callId, speaker: "user", text: params.userText, ts: now });
        }
        if (params.replyText) {
            transcriptsPayload.push({ call_id: callId, speaker: "assistant", text: params.replyText, ts: now });
        }
        if (transcriptsPayload.length) {
            await supabase.from("transcripts").insert(transcriptsPayload).throwOnError();
        }

        if (params.summary || params.intent) {
            await supabase.from("insights").insert({
                call_id: callId,
                summary: params.summary,
                intent: params.intent,
                sentiment: params.emotionScore > 0 ? "positive" : params.emotionScore < 0 ? "negative" : "neutral",
            }).throwOnError();
        }
    } catch (err) {
        console.error("[upsertCallAndTranscript]", err);
    }
}

export const runtime = "nodejs";
