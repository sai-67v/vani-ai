require("dotenv").config();

// ── Best Practice: Fail-fast env validation at startup ──────
const { validateEnv } = require("./lib/env");
validateEnv();

const express = require("express");
const http = require("http");
const twilio = require("twilio");
const { randomUUID } = require("crypto");
const vapiWebhookRouter = require("./routes/vapiWebhook");
const twilioWebhookRouter = require("./routes/twilioWebhook");
const { setupTwilioWebSockets } = require("./lib/sarvam/realtime");
const { analyzeVoicePayload } = require("./lib/voiceAnalysis");
const { seedDemoCall, upsertCall, recordAnalysis, listCalls, getCall } = require("./lib/callStore");
const { getTwilioClient } = require("./lib/twilioClient");
const { errorHandler, ValidationError } = require("./lib/errors");
const logger = require("./lib/logger");
const { outboundCallSchema, analyzeVoiceSchema } = require("./lib/schemas");

const app = express();
seedDemoCall();
const PORT = process.env.PORT || 3000;
const E164_PATTERN = /^\+[1-9]\d{9,14}$/;

function sanitizePhoneNumber(value) {
    const raw = String(value || "").trim();
    if (!raw) {
        return "";
    }

    const stripped = raw.replace(/[\s\-()]/g, "");
    if (!stripped) {
        return "";
    }

    if (stripped.startsWith("+")) {
        return "+" + stripped.slice(1).replace(/\+/g, "");
    }

    return stripped.replace(/\+/g, "");
}

function getMissingEnvVars(keys) {
    return keys.filter((key) => !process.env[key]);
}

// ── Best Practice: Graceful shutdown & process error handlers ─
process.on("unhandledRejection", (error) => {
    logger.error("process", "Unhandled promise rejection", { error: error?.message, stack: error?.stack });
    // Give in-flight requests a chance to finish, then exit
    server?.close(() => process.exit(1));
    setTimeout(() => process.exit(1), 5000).unref();
});

process.on("uncaughtException", (error) => {
    logger.error("process", "Uncaught exception — exiting", { error: error?.message, stack: error?.stack });
    process.exit(1); // process is in unknown state — must restart
});

process.on("SIGTERM", () => {
    logger.info("process", "SIGTERM received — shutting down gracefully");
    server?.close(() => {
        logger.info("process", "All connections closed. Exiting.");
        process.exit(0);
    });
    setTimeout(() => process.exit(0), 10_000).unref();
});

function getWebhookBase(req) {
    const explicit = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "");
    if (explicit) {
        return explicit;
    }

    return "http://localhost:3000";
}

// ── Middleware ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request correlation IDs — traces a single request through all logs
app.use((req, _res, next) => {
    req.requestId = randomUUID();
    next();
});

// Structured request/response logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        logger.info("http", `${req.method} ${req.originalUrl}`, {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            durationMs: Date.now() - start,
            ip: req.ip,
            requestId: req.requestId,
        });
    });
    next();
});

app.get("/api/twilio/number", (req, res) => {
    res.json({ number: process.env.TWILIO_PHONE_NUMBER || "" });
});

app.post("/api/twilio/outbound", async (req, res, next) => {
    const sanitizedTo = sanitizePhoneNumber(req.body?.to);
    
    const parsed = outboundCallSchema.safeParse({ to: sanitizedTo });
    if (!parsed.success) {
        return next(new ValidationError(parsed.error.issues[0].message));
    }
    
    const explicitBaseUrl = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "") || "";
    const baseUrlLog = explicitBaseUrl || "unset";

    try {
        logger.info("twilio.outbound", "Initiating outbound call", { to: sanitizedTo, baseUrl: baseUrlLog });

        const requiredVars = [
            "TWILIO_ACCOUNT_SID",
            "TWILIO_AUTH_TOKEN",
            "TWILIO_PHONE_NUMBER",
        ];
        const missingVars = getMissingEnvVars(requiredVars);
        if (missingVars.length) {
            return res.status(500).json({
                ok: false,
                error: `Missing environment variables: ${missingVars.join(", ")}`,
            });
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        const client = getTwilioClient(); // Best Practice: use singleton, not per-request instantiation
        const webhookBase = getWebhookBase(req);
        const webhookUrl = webhookBase ? `${webhookBase}/api/twilio/voice` : "/api/twilio/voice";

        const call = await client.calls.create({
            from: fromNumber,
            to: sanitizedTo,
            url: webhookUrl,
            method: "POST",
        });

        logger.info("twilio.outbound", "Call initiated", { to: sanitizedTo, callSid: call.sid, webhookUrl });
        
        upsertCall(call.sid, {
            callId: call.sid,
            direction: "outbound",
            from: fromNumber,
            to: sanitizedTo,
            status: "queued",
        });
        return res.status(200).json({ ok: true, callSid: call.sid });
    } catch (error) {
        logger.error("twilio.outbound", "Error initiating outbound call", { error: error?.message, stack: error?.stack });
        return res.status(500).json({
            ok: false,
            error: error?.message || "Unable to initiate outbound call",
        });
    }
});

app.get("/api/twilio/token", (req, res) => {
    // Best Practice: Sanitize identity — only allow safe alphanumeric chars
    const identity = String(req.query.identity || "demo")
        .replace(/[^a-zA-Z0-9_\-]/g, "")
        .slice(0, 64) || "demo";
    const missing = getMissingEnvVars([
        "TWILIO_ACCOUNT_SID",
        "TWILIO_API_KEY_SID",
        "TWILIO_API_KEY_SECRET",
        "TWILIO_TWIML_APP_SID",
    ]);

    if (missing.length) {
        return res.status(500).json({ ok: false, error: `Missing environment variables: ${missing.join(", ")}`, missing });
    }

    try {
        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;
        const token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_API_KEY_SID,
            process.env.TWILIO_API_KEY_SECRET,
            { identity, ttl: 3600 }
        );
        const grant = new VoiceGrant({
            outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
            incomingAllow: true,
        });
        token.addGrant(grant);
        res.json({ token: token.toJwt() });
    } catch (error) {
        logger.error("twilio.token", "Failed to generate token", { error: error?.message });
        res.status(500).json({ ok: false, error: "Unable to generate token" });
    }
});

app.post("/api/analyze/voice", async (req, res, next) => {
    try {
        const payload = req.body || {};
        const parsed = analyzeVoiceSchema.safeParse(payload);
        if (!parsed.success) {
            return next(new ValidationError(parsed.error.issues[0].message));
        }
        
        const resolvedCallId = payload.callId || randomUUID();
        const callRecord = getCall(resolvedCallId);
        const analysis = await analyzeVoicePayload({
            ...payload,
            callId: resolvedCallId,
            audioUrl: payload.audioUrl || callRecord?.audioUrl,
            transcript: payload.transcript || callRecord?.analysis?.transcript || callRecord?.transcript,
            languageHint: payload.languageHint || callRecord?.language,
        });
        recordAnalysis(resolvedCallId, analysis);
        res.json(analysis);
    } catch (error) {
        logger.error("analyze.voice", "Voice analysis failed", { error: error?.message });
        res.status(500).json({ ok: false, error: "Voice analysis failed" });
    }
});

app.get("/api/calls", (_req, res) => {
    res.json({ ok: true, data: listCalls() });
});

app.get("/api/calls/:callId", (req, res) => {
    const call = getCall(req.params.callId);
    if (!call) {
        return res.status(404).json({ ok: false, error: "Call not found" });
    }
    res.json({ ok: true, data: call });
});

// ── Routes ─────────────────────────────────────────────────
app.use("/api/twilio", twilioWebhookRouter);
app.use("/api/vapi/webhook", vapiWebhookRouter); // Legacy
app.use("/api/transcript", require("./routes/transcriptSSE"));
app.use("/api/call_insights", require("./routes/callInsights"));

// ── Centralized Error Handler (MUST be last middleware) ──────
app.use(errorHandler);

app.get("/", (_req, res) => {
    res.status(200).send("Vani AI Backend is running successfully! 🚀");
});

app.get("/health", async (_req, res) => {
    // Best Practice: health check verifies actual dependencies, not just "process is alive"
    const { db } = require("./lib/supabase/admin");
    const checks = {};

    try {
        const { error } = await db.from("calls").select("id").limit(1);
        checks.database = error ? "degraded" : "ok";
    } catch {
        checks.database = "down";
    }

    const envKeys = ["TWILIO_ACCOUNT_SID", "SUPABASE_URL", "SARVAM_API_KEY"];
    checks.config = envKeys.every((k) => !!process.env[k]) ? "ok" : "degraded";

    const allOk = Object.values(checks).every((v) => v === "ok");
    res.status(allOk ? 200 : 503).json({
        ok: allOk,
        checks,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

// ── HTTP & WebSockets Server ───────────────────────────────
const server = http.createServer(app);
setupTwilioWebSockets(server);

// ── Start ──────────────────────────────────────────────────
server.listen(PORT, () => {
    logger.info("server", `Vani A.I. Engine running on port ${PORT}`);
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        logger.warn("server", "SUPABASE credentials missing. DB writes will fail.");
    }
    if (!process.env.SARVAM_API_KEY) {
        logger.warn("server", "SARVAM_API_KEY missing. Engine downstream to Sarvam will fail.");
    }
});

module.exports = server;
