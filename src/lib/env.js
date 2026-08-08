/**
 * src/lib/env.js
 * Validates all required environment variables at startup.
 * Skill: nodejs-best-practices — "Validate at Boundaries" (startup boundary)
 * 
 * Call validateEnv() once at the top of src/index.js.
 * The process exits immediately if any required var is missing
 * (fail-fast principle — don't let the server silently limp along).
 */

const REQUIRED_VARS = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "TWILIO_API_KEY_SID",
  "TWILIO_API_KEY_SECRET",
  "TWILIO_TWIML_APP_SID",
];

/** Warn-only vars — server can still start but features will be degraded */
const OPTIONAL_VARS = [
  { key: "SUPABASE_URL", feature: "DB writes" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", feature: "DB writes" },
  { key: "SARVAM_API_KEY", feature: "STT/LLM pipeline" },
  { key: "PUBLIC_BASE_URL", feature: "Webhook URL generation" },
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length) {
    console.error(
      `[startup] ❌ FATAL: Missing required environment variables:\n  ${missing.join("\n  ")}`
    );
    console.error("[startup] Set these in your .env file and restart.");
    process.exit(1);
  }

  console.log("[startup] ✅ All required environment variables are set.");

  // Warn about optional but degraded features
  for (const { key, feature } of OPTIONAL_VARS) {
    if (!process.env[key]) {
      console.warn(`[startup] ⚠️  ${key} missing — ${feature} will be unavailable.`);
    }
  }
}

module.exports = { validateEnv };
