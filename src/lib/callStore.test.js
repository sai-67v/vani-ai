const { upsertCall, listCalls, getCall, recordAnalysis, attachRecording } = require("./callStore");

jest.mock("./supabase/admin", () => ({
  db: { from: jest.fn(() => ({ upsert: jest.fn(() => Promise.resolve({ error: null })) })) }
}));

describe("callStore", () => {
  it("upserts and retrieves a call", () => {
    upsertCall("test-123", { from: "+1555", to: "+1444", status: "queued" });
    const call = getCall("test-123");
    expect(call.callId).toBe("test-123");
    expect(call.status).toBe("queued");
  });

  it("normalizes lead label from score", () => {
    recordAnalysis("test-abc", { lead: { score: 85 }, language: "en" });
    const call = getCall("test-abc");
    expect(call.leadLabel).toBe("HOT");
  });

  it("lists calls sorted by updatedAt desc", () => {
    const calls = listCalls();
    expect(Array.isArray(calls)).toBe(true);
  });
  
  it("attaches recording info to an existing call", () => {
    upsertCall("test-rec", { from: "+111", to: "+222" });
    attachRecording("test-rec", { audioUrl: "http://example.com/audio.mp3", leadLabel: "WARM" });
    const call = getCall("test-rec");
    expect(call.audioUrl).toBe("http://example.com/audio.mp3");
    expect(call.leadLabel).toBe("WARM");
  });
});
