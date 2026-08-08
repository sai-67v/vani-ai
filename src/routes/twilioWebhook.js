const express = require("express");
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const { analyzeVoicePayload } = require("../lib/voiceAnalysis");
const { upsertCall, recordAnalysis } = require("../lib/callStore");
const logger = require("../lib/logger");
const { getTwilioClient } = require("../lib/twilioClient");

const router = express.Router();

function getBaseUrl(req) {
    return process.env.PUBLIC_BASE_URL || `https://${req.get("host")}`;
}

router.post("/voice", (req, res) => {
    const twiml = new VoiceResponse();
    const { CallSid, From, To } = req.body || {};
    const direction = typeof From === "string" && From.startsWith("client:") ? "wifi" : "inbound";

    if (CallSid) {
        upsertCall(CallSid, {
            callId: CallSid,
            from: From || "Unknown",
            to: To || "Unknown",
            direction,
            status: "in-progress",
        });
    }

    logger.info("twilio.webhook", "Inbound call received", { direction, callSid: CallSid || "unknown" });

    twiml.say("You are speaking with Vaani AI. Share your message after the tone.");
    twiml.record({
        action: `${getBaseUrl(req)}/api/twilio/processTurn`,
        method: "POST",
        playBeep: true,
        maxLength: 90,
        timeout: 5,
        trim: "trim-silence",
    });

    res.type("text/xml").send(twiml.toString());
});

router.post("/processTurn", async (req, res) => {
    const { CallSid, From, To, RecordingUrl } = req.body || {};
    const twiml = new VoiceResponse();
    const audioUrl = RecordingUrl
        ? RecordingUrl.endsWith(".wav") || RecordingUrl.endsWith(".mp3")
            ? RecordingUrl
            : `${RecordingUrl}.wav`
        : null;

    logger.info("twilio.webhook", "Processing turn", { callSid: CallSid || "unknown", audioUrl });

    try {
        if (!audioUrl) {
            throw new Error("recording_missing");
        }

        upsertCall(CallSid, {
            callId: CallSid,
            from: From || "Unknown",
            to: To || "Unknown",
            direction: typeof From === "string" && From.startsWith("client:") ? "wifi" : "inbound",
            audioUrl,
            status: "completed",
        });

        const analysis = await analyzeVoicePayload({
            callId: CallSid,
            audioUrl,
            languageHint: req.body?.Language || req.body?.RecordingTrack,
            source: "twilio-inbound",
        });
        recordAnalysis(CallSid, analysis);

        twiml.say("Thanks for telling us more. Our AI analyst captured the insights.");
        twiml.hangup();
    } catch (error) {
        logger.error("twilio.webhook", "Error processing turn", { error: error?.message });
        twiml.say("We couldn't process that audio. Please try again later.");
        twiml.hangup();
    }

    res.type("text/xml").send(twiml.toString());
});

router.post("/dial", async (req, res) => {
    try {
        const { to } = req.body;
        if (!to) return res.status(400).json({ error: "Missing 'to' phone number" });

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!fromNumber) {
            return res.status(500).json({ error: "TWILIO_PHONE_NUMBER missing in .env" });
        }

        const client = getTwilioClient();
        const call = await client.calls.create({
            url: `${getBaseUrl(req)}/api/twilio/voice`,
            to,
            from: fromNumber,
        });

        upsertCall(call.sid, {
            callId: call.sid,
            direction: "outbound",
            from: fromNumber,
            to,
            status: "queued",
        });

        res.json({ success: true, callSid: call.sid });
    } catch (error) {
        logger.error("twilio.webhook", "Dial error", { error: error?.message });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
