/**
 * src/lib/schemas.js
 * Zod validation schemas for API endpoints.
 * Skill: nodejs-best-practices — "Validate at Boundaries"
 */

const { z } = require("zod");

const outboundCallSchema = z.object({
  to: z.string().min(1, "Phone number required").regex(/^\+[1-9]\d{9,14}$/, "Phone number must be in E.164 format"),
});

const analyzeVoiceSchema = z.object({
  callId: z.string().optional(),
  audioUrl: z.string().url().optional(),
  transcript: z.string().optional(),
  languageHint: z.string().optional(),
});

module.exports = { outboundCallSchema, analyzeVoiceSchema };
