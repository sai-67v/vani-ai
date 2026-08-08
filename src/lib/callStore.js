const { randomUUID } = require("crypto");
const { DEMO_ANALYSIS, DEMO_CALL_META } = require("./demoData");
const logger = require("./logger");

const calls = new Map();

function ensureCallId(callId) {
    return callId || randomUUID();
}

function normalizeLeadLabel(scoreOrLabel) {
    if (!scoreOrLabel) return "NEUTRAL";
    if (typeof scoreOrLabel === "string") return scoreOrLabel.toUpperCase();
    const score = Number(scoreOrLabel) || 0;
    if (score >= 80) return "HOT";
    if (score >= 60) return "WARM";
    if (score >= 40) return "COLD";
    return "NEUTRAL";
}

const { db } = require("./supabase/admin");

function upsertCall(callId, patch = {}) {
    const id = ensureCallId(callId);
    const existing = calls.get(id) || {
        callId: id,
        createdAt: new Date().toISOString(),
    };
    const next = {
        ...existing,
        ...patch,
        callId: id,
        updatedAt: new Date().toISOString(),
    };
    calls.set(id, next);

    // Seamlessly sync to Supabase (fire and forget)
    db.from("calls").upsert({
        provider_call_id: id,
        provider: "twilio",
        customer_number: next.from === "Unknown" ? null : next.from,
        to_number: next.to === "Unknown" ? null : next.to,
        status: next.status || "in-progress",
        summary: next.summary || null,
        recording_url: next.audioUrl || null
    }, { onConflict: "provider_call_id" })
        .then(({ error }) => {
            if (error) {
                logger.error("callStore", "Supabase sync error", { error: error?.message || error });
            } else {
                logger.info("callStore", "Seamlessly synced call to Supabase", { callId: id });
            }
        });

    return next;
}

function recordAnalysis(callId, analysis) {
    if (!analysis) return null;
    const leadLabel = normalizeLeadLabel(analysis.lead?.label || analysis.lead?.score);
    const stored = upsertCall(callId, {
        analysis,
        leadLabel,
        language: analysis.language || "en",
        emotions: analysis.emotions || [],
        summary: analysis.summary || "",
        transcript: analysis.transcript || "",
        hasTranscript: Boolean(analysis.transcript),
    });
    return stored;
}

function attachRecording(callId, info = {}) {
    const leadLabel = info.leadLabel ? normalizeLeadLabel(info.leadLabel) : undefined;
    return upsertCall(callId, {
        ...info,
        ...(leadLabel ? { leadLabel } : {}),
    });
}

function listCalls() {
    return Array.from(calls.values())
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
        .map((call) => ({
            callId: call.callId,
            direction: call.direction || "inbound",
            from: call.from || "Unknown",
            to: call.to || "Unknown",
            createdAt: call.createdAt,
            updatedAt: call.updatedAt,
            leadLabel: (call.leadLabel || call.analysis?.lead?.label || "NEUTRAL").toUpperCase(),
            language: (call.language || call.analysis?.language || "EN").toUpperCase(),
            emotions: call.emotions || call.analysis?.emotions || [],
            hasTranscript: Boolean(call.hasTranscript || call.analysis?.transcript),
            summary: call.summary || call.analysis?.summary || "",
        }));
}

function getCall(callId) {
    return calls.get(callId) || null;
}

function seedDemoCall() {
    if (calls.has(DEMO_CALL_META.callId)) return;
    calls.set(DEMO_CALL_META.callId, {
        ...DEMO_CALL_META,
        leadLabel: DEMO_ANALYSIS.lead.label,
        language: DEMO_ANALYSIS.language,
        emotions: DEMO_ANALYSIS.emotions,
        hasTranscript: true,
        transcript: DEMO_ANALYSIS.transcript,
        analysis: DEMO_ANALYSIS,
        updatedAt: new Date().toISOString(),
    });
}

module.exports = {
    upsertCall,
    recordAnalysis,
    attachRecording,
    listCalls,
    getCall,
    seedDemoCall,
};
