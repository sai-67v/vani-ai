/**
 * src/lib/twilioClient.js
 * Singleton Twilio client.
 * Skill: nodejs-best-practices — avoid instantiating clients per-request.
 *
 * Previously `twilio(accountSid, authToken)` was called inside
 * the POST /api/twilio/outbound handler on every request.
 * This singleton pattern creates the client once at startup.
 */

const twilio = require("twilio");

let _client = null;

/**
 * Returns the shared Twilio REST client.
 * Lazily initialized on first call.
 * @returns {import("twilio").Twilio}
 */
function getTwilioClient() {
  if (!_client) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error("[twilioClient] TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is not set.");
    }

    _client = twilio(accountSid, authToken);
    console.log("[startup] ✅ Twilio client initialized.");
  }
  return _client;
}

module.exports = { getTwilioClient };
