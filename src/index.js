require("dotenv").config();

const express = require("express");
const http = require("http");
const vapiWebhookRouter = require("./routes/vapiWebhook");
const twilioWebhookRouter = require("./routes/twilioWebhook");
const { setupTwilioWebSockets } = require("./lib/sarvam/realtime");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true })); // Twilio sends form-urlencoded data

app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// ── Routes ─────────────────────────────────────────────────
app.use("/api/vapi/webhook", vapiWebhookRouter); // Legacy
app.use("/api/twilio", twilioWebhookRouter);     // New Twilio telephony

app.get("/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ── HTTP & WebSockets Server ───────────────────────────────
const server = http.createServer(app);
setupTwilioWebSockets(server);

// ── Start ──────────────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║  Vani A.I. Engine running on port ${PORT}          
║  REST: /api/twilio/incoming                      
║  WSS:  /stream (Twilio Media Streams)          
╚══════════════════════════════════════════════════╝
  `);

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn("⚠️  SUPABASE credentials missing. DB writes will fail.");
    }
    if (!process.env.SARVAM_API_KEY) {
        console.warn("⚠️  SARVAM_API_KEY missing. Engine downstream to Sarvam will fail.");
    }
});

module.exports = server;
