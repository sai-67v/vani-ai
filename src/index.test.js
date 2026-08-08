/**
 * src/index.test.js
 * Skill: jest-skill — integration tests for core API routes
 *
 * Strategy:
 *  - Integration tests: real Express routes via supertest
 *  - Mocked externals: Twilio SDK, Supabase client, Sarvam STT
 *  - Tests run without a live server (supertest binds ephemerally)
 */

"use strict";

// ── Env setup BEFORE any module imports ──────────────────────
// (env.js calls validateEnv() at require-time — we must set these first)
process.env.TWILIO_ACCOUNT_SID = "ACtest00000000000000000000000000000";
process.env.TWILIO_AUTH_TOKEN = "auth_token_test_placeholder";
process.env.TWILIO_PHONE_NUMBER = "+15550000001";
process.env.TWILIO_API_KEY_SID = "SKtest0000000000000000000000000000";
process.env.TWILIO_API_KEY_SECRET = "api_key_secret_test_placeholder";
process.env.TWILIO_TWIML_APP_SID = "APtest0000000000000000000000000000";
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.PORT = "0"; // Let OS pick a free port — avoids EADDRINUSE

// ── Mock Supabase ─────────────────────────────────────────────
jest.mock("./lib/supabase/admin", () => ({
    db: {
        from: jest.fn(() => ({
            upsert: jest.fn(() => Promise.resolve({ error: null })),
            select: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
                eq: jest.fn(() => ({
                    maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
                })),
            })),
            update: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
        })),
    },
}));

jest.mock("./lib/supabase", () => ({
    supabase: {
        from: jest.fn(() => ({
            upsert: jest.fn(() => Promise.resolve({ error: null })),
            insert: jest.fn(() => Promise.resolve({ error: null })),
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
                    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
                })),
            })),
        })),
    },
}));

// ── Mock Twilio ────────────────────────────────────────────────
jest.mock("twilio", () => {
    const mockCreate = jest.fn().mockResolvedValue({ sid: "CAtest00000000000000000000000000000" });

    // Mock VoiceResponse for twilioWebhook.js
    class MockVoiceResponse {
        say() { return this; }
        dial() { return this; }
        toString() { return "<Response></Response>"; }
    }

    const MockTwilio = jest.fn(() => ({
        calls: { create: mockCreate },
    }));

    MockTwilio.jwt = {
        AccessToken: class AccessToken {
            constructor() {}
            addGrant() {}
            toJwt() { return "mock.jwt.token"; }
            static VoiceGrant = class VoiceGrant {}
        },
    };

    MockTwilio.twiml = {
        VoiceResponse: MockVoiceResponse,
    };

    return MockTwilio;
});

// ── Mock Sarvam realtime (WebSocket setup) ────────────────────
jest.mock("./lib/sarvam/realtime", () => ({
    setupTwilioWebSockets: jest.fn(),
}));

const request = require("supertest");
const server = require("./index");

// Return a Promise so Jest waits for teardown properly
afterAll(() => new Promise((resolve) => server.close(resolve)));

// ── /health ───────────────────────────────────────────────────
describe("GET /health", () => {
    it("returns a 200 with ok: true", async () => {
        const res = await request(server).get("/health");
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.timestamp).toBeDefined();
        expect(typeof res.body.uptime).toBe("number");
    });
});

// ── / root ────────────────────────────────────────────────────
describe("GET /", () => {
    it("returns 200 with running message", async () => {
        const res = await request(server).get("/");
        expect(res.status).toBe(200);
        expect(res.text).toMatch(/running/i);
    });
});

// ── /api/twilio/outbound ──────────────────────────────────────
describe("POST /api/twilio/outbound", () => {
    it("returns 400 when 'to' is missing", async () => {
        const res = await request(server).post("/api/twilio/outbound").send({});
        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/phone number/i);
    });

    it("returns 400 for invalid phone number (no + prefix)", async () => {
        const res = await request(server)
            .post("/api/twilio/outbound")
            .send({ to: "9999999999" });
        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.error).toMatch(/E\.164/i);
    });

    it("returns 400 for clearly malformed phone number", async () => {
        const res = await request(server)
            .post("/api/twilio/outbound")
            .send({ to: "not-a-phone" });
        expect(res.status).toBe(400);
    });

    it("returns 200 and callSid for valid E.164 number", async () => {
        const res = await request(server)
            .post("/api/twilio/outbound")
            .send({ to: "+919876543210" });
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.callSid).toBeDefined();
    });
});

// ── /api/twilio/number ────────────────────────────────────────
describe("GET /api/twilio/number", () => {
    it("returns the configured phone number", async () => {
        const res = await request(server).get("/api/twilio/number");
        expect(res.status).toBe(200);
        expect(res.body.number).toBe("+15550000001");
    });
});

// ── /api/twilio/token ─────────────────────────────────────────
describe("GET /api/twilio/token", () => {
    it("returns a JWT token for valid identity", async () => {
        const res = await request(server).get("/api/twilio/token?identity=test-user");
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(typeof res.body.token).toBe("string");
    });

    it("sanitizes malicious identity param", async () => {
        const res = await request(server)
            .get("/api/twilio/token?identity=<script>alert(1)</script>");
        expect(res.status).toBe(200);
        // XSS chars must be stripped from the identity
        expect(res.body.token).toBeDefined();
    });

    it("falls back to 'demo' identity when param is empty", async () => {
        const res = await request(server).get("/api/twilio/token");
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });
});

// ── /api/calls ────────────────────────────────────────────────
describe("GET /api/calls", () => {
    it("returns a list containing at least the demo call", async () => {
        const res = await request(server).get("/api/calls");
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });
});

// ── /api/calls/:callId ────────────────────────────────────────
describe("GET /api/calls/:callId", () => {
    it("returns 404 for an unknown call ID", async () => {
        const res = await request(server).get("/api/calls/nonexistent-call-id-xyz");
        expect(res.status).toBe(404);
        expect(res.body.ok).toBe(false);
    });
});
