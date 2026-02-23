require("dotenv").config();

const express = require("express");
const vapiWebhookRouter = require("./routes/vapiWebhook");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(express.json({ limit: "5mb" })); // Vapi payloads can be large (end-of-call-report)

// Request logging
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// ── Routes ─────────────────────────────────────────────────
app.use("/api/vapi/webhook", vapiWebhookRouter);

// Health check
app.get("/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║  Vapi Webhook Server running on port ${PORT}        ║
║  Endpoint: POST /api/vapi/webhook               ║
║  Health:   GET  /health                          ║
╚══════════════════════════════════════════════════╝
  `);

    // Warn if Supabase is not configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn("⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.");
        console.warn("   Webhook routing will work but DB writes will fail.");
        console.warn("   Copy .env.example → .env and fill in your values.\n");
    }
});

module.exports = app;
