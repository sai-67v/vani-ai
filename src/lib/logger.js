/**
 * src/lib/logger.js
 * Structured JSON logger for the Vaani AI backend.
 * Skill: analytics-tracking — "produce reliable, decision-ready data"
 *
 * Outputs JSON lines — machine-parseable for log aggregators (Datadog, Logtail, etc.)
 * and human-readable with `node src/index.js | jq .` in development.
 *
 * Usage:
 *   const logger = require("./lib/logger");
 *   logger.info("twilio.outbound", "Call initiated", { to, callSid });
 *   logger.error("supabase.sync", "Upsert failed", { error: err.message, callId });
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LOG_LEVELS.info;

/**
 * @param {"debug"|"info"|"warn"|"error"} level
 * @param {string} context   - Component/module (e.g., "twilio.outbound")
 * @param {string} message   - Human-readable message
 * @param {object} [meta]    - Additional structured data
 */
function log(level, context, message, meta = {}) {
  if (LOG_LEVELS[level] < CURRENT_LEVEL) return;

  const entry = {
    ts: new Date().toISOString(),
    level: level.toUpperCase(),
    context,
    message,
    ...meta,
  };

  const output = JSON.stringify(entry);

  if (level === "error" || level === "warn") {
    console.error(output);
  } else {
    console.log(output);
  }
}

module.exports = {
  debug: (ctx, msg, meta) => log("debug", ctx, msg, meta),
  info: (ctx, msg, meta) => log("info", ctx, msg, meta),
  warn: (ctx, msg, meta) => log("warn", ctx, msg, meta),
  error: (ctx, msg, meta) => log("error", ctx, msg, meta),
};
