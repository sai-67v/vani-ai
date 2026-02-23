const express = require("express");
const VoiceResponse = require("twilio").twiml.VoiceResponse;

const router = express.Router();

// POST /api/twilio/voice
// Twilio calls this when a user dials in
router.post("/voice", (req, res) => {
    const twiml = new VoiceResponse();
    const baseUrl = process.env.PUBLIC_BASE_URL || `https://${req.get("host")}`;

    console.log(`[twilio-voice] Incoming call...`);

    twiml.say("Connecting you to Vani A I... Please begin speaking after the beep.");

    twiml.record({
        maxLength: 8,
        playBeep: true,
        method: "POST",
        action: `${baseUrl}/api/twilio/processTurn`
    });

    res.type("text/xml");
    res.send(twiml.toString());
});

// POST /api/twilio/processTurn
// Twilio calls this after gathering <Record> audio
router.post("/processTurn", async (req, res) => {
    const { CallSid, From, To, RecordingUrl } = req.body;
    console.log(`[twilio-processTurn] Call: ${CallSid} | Audio: ${RecordingUrl}`);

    const twiml = new VoiceResponse();
    const baseUrl = process.env.PUBLIC_BASE_URL || `https://${req.get("host")}`;

    if (!RecordingUrl) {
        twiml.say("Sorry, I could not hear you. Please try again.");
        twiml.redirect({ method: "POST" }, `${baseUrl}/api/twilio/voice`);
        res.type("text/xml");
        return res.send(twiml.toString());
    }

    try {
        // Agent 2: Load services
        const { transcribeAudio } = require("../lib/sarvam/stt");
        const { generateResponse } = require("../lib/sarvam/llm");
        const { textToSpeech } = require("../lib/sarvam/tts");
        const { db } = require("../lib/supabase/admin");

        // 1. Download audio from Twilio
        const authHeader = "Basic " + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
        const audioRes = await fetch(`${RecordingUrl}.wav`, {
            headers: { "Authorization": authHeader }
        });
        const audioBuffer = await audioRes.buffer();

        // 2. STT 
        const sttResult = await transcribeAudio(audioBuffer);
        const userText = sttResult.text || "";
        console.log(`[Twilio->Sarvam] User said: "${userText}"`);

        // 3. LLM (JSON)
        const llmResult = await generateResponse(userText);
        console.log(`[Sarvam LLM] Generated Reply:`, llmResult);

        // 4. TTS (Buffer)
        const ttsBuffer = await textToSpeech(llmResult.replyText, "en-IN");

        // 5. Upload TTS audio to Supabase Storage
        const fileName = `reply-${CallSid}-${Date.now()}.wav`;
        await db.storage.from("audio-replies").upload(fileName, ttsBuffer, {
            contentType: "audio/wav",
            upsert: true
        });
        const { data: publicUrlData } = db.storage.from("audio-replies").getPublicUrl(fileName);
        const generatedAudioUrl = publicUrlData.publicUrl;

        // 6. Log Turn to Supabase
        const { data: callData, error: callError } = await db.from("calls").upsert({
            provider_call_id: CallSid,
            provider: "twilio",
            customer_number: From || "",
            to_number: To || "",
            status: "in-progress",
            lead_score: llmResult.leadScore,
            emotion_score: llmResult.emotionScore,
            summary: llmResult.summary
        }, { onConflict: "provider_call_id" }).select("id").single();

        if (callError) {
            console.error("[Supabase Calls] Error:", callError);
        }

        const callId = callData?.id;

        if (callId) {
            await db.from("transcripts").insert([
                { call_id: callId, speaker: "user", text: userText, ts: new Date().toISOString() },
                { call_id: callId, speaker: "assistant", text: llmResult.replyText, ts: new Date().toISOString() }
            ]);
        }

        // 7. Play Audio & Continue Turn
        twiml.play(generatedAudioUrl);
        twiml.redirect({ method: "POST" }, `${baseUrl}/api/twilio/voice`);
    } catch (err) {
        console.error(`[twilio-processTurn] Error for ${CallSid}:`, err);
        twiml.say("System error encountered. Let's restart.");
        twiml.redirect({ method: "POST" }, `${baseUrl}/api/twilio/voice`);
    }

    res.type("text/xml");
    res.send(twiml.toString());
});

// POST /api/twilio/dial
// Dashboard calls this to trigger an outbound call (kept for existing functionality)
router.post("/dial", async (req, res) => {
    try {
        const { to } = req.body;
        if (!to) return res.status(400).json({ error: "Missing 'to' phone number" });

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
            return res.status(500).json({ error: "Twilio credentials missing in .env" });
        }

        const client = require("twilio")(accountSid, authToken);
        const baseUrl = process.env.PUBLIC_BASE_URL || `https://${req.get("host")}`;

        const call = await client.calls.create({
            url: `${baseUrl}/api/twilio/voice`,
            to: to,
            from: fromNumber
        });

        console.log(`[twilio-dial] Initiated call to ${to}, CallSid: ${call.sid}`);
        res.json({ success: true, callSid: call.sid });
    } catch (err) {
        console.error("[twilio-dial] Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
