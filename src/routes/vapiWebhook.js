const express = require("express");
const { supabase } = require("../lib/supabase");

const router = express.Router();

// ────────────────────────────────────────────────────────────
// POST /api/vapi/webhook
// Receives ALL server messages from Vapi and routes by type.
// Vapi expects a 2xx response — non-2xx causes retries.
// ────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.type) {
            console.warn("[vapi-webhook] Received payload with no message.type", req.body);
            return res.status(200).json({ received: true });
        }

        console.log(`[vapi-webhook] ← ${message.type}`, message.call?.id ?? "");

        switch (message.type) {
            case "status-update":
                await handleStatusUpdate(message);
                break;

            case "speech-update":
            case "transcript":
                await handleTranscript(message);
                break;

            case "function-call":
                // Vapi expects a result in the response for function-calls
                const fnResult = await handleFunctionCall(message);
                return res.status(200).json(fnResult);

            case "end-of-call-report":
                await handleEndOfCallReport(message);
                break;

            default:
                console.log(`[vapi-webhook] Unhandled message type: ${message.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (err) {
        console.error("[vapi-webhook] Error processing webhook:", err);
        // Still return 200 so Vapi doesn't retry endlessly
        return res.status(200).json({ received: true, error: err.message });
    }
});

// ────────────────────────────────────────────────────────────
// 1) STATUS-UPDATE  →  Upsert calls row
// Fires on: queued → ringing → in-progress → forwarding → ended
// ────────────────────────────────────────────────────────────
async function handleStatusUpdate(message) {
    const call = message.call || {};
    const providerCallId = call.id;
    if (!providerCallId) return;

    const status = call.status || message.status;

    const row = {
        provider_call_id: providerCallId,
        assistant_id: call.assistantId || null,
        customer_number: call.customer?.number || null,
        status,
    };

    // If call just started, record the timestamp
    if (status === "in-progress") {
        row.started_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from("calls")
        .upsert(row, { onConflict: "provider_call_id" });

    if (error) {
        console.error("[status-update] Supabase upsert error:", error);
    } else {
        console.log(`[status-update] Upserted call ${providerCallId} → ${status}`);
    }
}

// ────────────────────────────────────────────────────────────
// 2) TRANSCRIPT  →  Insert into transcripts
// We only persist "final" transcripts, not partials.
// ────────────────────────────────────────────────────────────
async function handleTranscript(message) {
    // Temporarily disabled "final" check to see data shape:
    // if (message.transcriptType !== "final") return;
    console.log("Transcript Payload:", JSON.stringify(message, null, 2));

    const providerCallId = message.call?.id;
    if (!providerCallId) return;

    // Look up our internal call_id
    const { data: callRow, error: lookupErr } = await supabase
        .from("calls")
        .select("id")
        .eq("provider_call_id", providerCallId)
        .maybeSingle();

    if (lookupErr) {
        console.error("[transcript] Call lookup error:", lookupErr);
        return;
    }

    // If call doesn't exist yet (race condition), upsert it first
    let callId = callRow?.id;
    if (!callId) {
        const { data: newCall, error: upsertErr } = await supabase
            .from("calls")
            .upsert(
                { provider_call_id: providerCallId, status: "in-progress" },
                { onConflict: "provider_call_id" }
            )
            .select("id")
            .single();

        if (upsertErr || !newCall) {
            console.error("[transcript] Call upsert error:", upsertErr);
            return;
        }
        callId = newCall.id;
    }

    const { error } = await supabase.from("transcripts").insert({
        call_id: callId,
        speaker: message.role || "unknown",
        text: message.transcript || "",
        ts: message.timestamp
            ? new Date(message.timestamp * 1000).toISOString()
            : new Date().toISOString(),
    });

    if (error) {
        console.error("[transcript] Insert error:", error);
    } else {
        console.log(`[transcript] Saved: ${message.role} → "${(message.transcript || "").slice(0, 60)}..."`);
    }
}

// ────────────────────────────────────────────────────────────
// 3) FUNCTION-CALL  →  Handle agent tool calls
// We specifically handle "callback_requested" here.
// ────────────────────────────────────────────────────────────
async function handleFunctionCall(message) {
    const functionCall = message.functionCall || {};
    const functionName = functionCall.name;
    const params = functionCall.parameters || {};
    const providerCallId = message.call?.id;

    console.log(`[function-call] Function: ${functionName}`, params);

    if (functionName === "callback_requested") {
        return await handleCallbackRequested(providerCallId, params);
    }

    // Unknown function — return a neutral result so the agent can continue
    console.warn(`[function-call] Unknown function: ${functionName}`);
    return { result: { success: false, message: `Unknown function: ${functionName}` } };
}

/**
 * callback_requested — the voice agent decided the caller wants a callback.
 * 
 * Expected params from Vapi function call:
 *   { reason: string, priority?: string, customer_number?: string }
 */
async function handleCallbackRequested(providerCallId, params) {
    // Look up the call
    const { data: callRow, error: lookupErr } = await supabase
        .from("calls")
        .select("id, customer_number")
        .eq("provider_call_id", providerCallId)
        .maybeSingle();

    if (lookupErr || !callRow) {
        console.error("[callback_requested] Call lookup failed:", lookupErr);
        return { result: { success: false, message: "Call not found" } };
    }

    // Calculate a simple lead_score based on available signals
    const leadScore = calculateLeadScore(params);

    // Insert callback_queue row
    const { error: insertErr } = await supabase.from("callback_queue").insert({
        call_id: callRow.id,
        customer_number: params.customer_number || callRow.customer_number,
        reason: params.reason || "Customer requested callback",
        priority: params.priority || "normal",
        status: "pending",
    });

    if (insertErr) {
        console.error("[callback_requested] Queue insert error:", insertErr);
        return { result: { success: false, message: "Failed to queue callback" } };
    }

    // Update calls row with outcome + lead_score
    const { error: updateErr } = await supabase
        .from("calls")
        .update({ outcome: "callback", lead_score: leadScore })
        .eq("id", callRow.id);

    if (updateErr) {
        console.error("[callback_requested] Call update error:", updateErr);
    }

    console.log(`[callback_requested] Queued callback for call ${providerCallId}, lead_score=${leadScore}`);

    // Return result to Vapi so the agent can confirm to the caller
    return {
        result: {
            success: true,
            message: "Callback has been scheduled. A team member will call you back shortly.",
        },
    };
}

/**
 * Simple lead scoring heuristic.
 * In production, replace with your ML model or rule engine.
 */
function calculateLeadScore(params) {
    let score = 50; // baseline

    const reason = (params.reason || "").toLowerCase();

    // High-intent signals
    if (reason.includes("pricing") || reason.includes("demo") || reason.includes("buy")) {
        score += 30;
    }
    if (reason.includes("urgent") || reason.includes("asap")) {
        score += 15;
    }

    // Priority bump
    if (params.priority === "high" || params.priority === "urgent") {
        score += 10;
    }

    return Math.min(score, 100);
}

// ────────────────────────────────────────────────────────────
// 4) END-OF-CALL-REPORT  →  Update calls with final data
// ────────────────────────────────────────────────────────────
async function handleEndOfCallReport(message) {
    const call = message.call || {};
    const providerCallId = call.id;
    if (!providerCallId) return;

    // Build the summary from the report
    const summary =
        message.summary ||
        message.analysis?.summary ||
        message.artifact?.messages
            ?.map((m) => `${m.role}: ${m.content}`)
            .join("\n")
            .slice(0, 2000) ||
        null;

    const updateData = {
        status: "ended",
        ended_at: call.endedAt || new Date().toISOString(),
        summary,
        cost: message.cost ?? call.cost ?? null,
        duration_seconds: message.durationSeconds ?? call.durationSeconds ?? null,
        raw_end_report: message, // store full payload for debugging
    };

    // Only set outcome to "completed" if it wasn't already set to something more specific
    const { data: existing } = await supabase
        .from("calls")
        .select("id, outcome")
        .eq("provider_call_id", providerCallId)
        .maybeSingle();

    if (!existing?.outcome) {
        updateData.outcome = message.endedReason === "customer-ended-call"
            ? "completed"
            : message.endedReason || "completed";
    }

    const { error } = await supabase
        .from("calls")
        .update(updateData)
        .eq("provider_call_id", providerCallId);

    if (error) {
        console.error("[end-of-call-report] Update error:", error);
    } else {
        console.log(`[end-of-call-report] Finalized call ${providerCallId}`);
    }

    // Fire and forget STT pipeline
    const recordingUrl = message.artifact?.recordingUrl || call.recordingUrl;
    if (existing?.id && recordingUrl) {
        processRecording(providerCallId, existing.id, recordingUrl).catch(err => {
            console.error("[end-of-call-report] STT processing error:", err);
        });
    }
}

async function processRecording(providerCallId, callId, recordingUrl) {
    console.log(`[stt] Fetching recording for call ${providerCallId} from ${recordingUrl}`);

    // dynamically require so we don't break earlier if not configured
    const { transcribeAudio } = require("../lib/sarvam/stt");

    const res = await fetch(recordingUrl);
    if (!res.ok) throw new Error(`Failed to fetch recording: ${res.statusText}`);

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[stt] Transcribing audio for call ${providerCallId}...`);
    const transcriptResult = await transcribeAudio(buffer, "hi-IN");

    if (transcriptResult && transcriptResult.transcript) {
        const { error } = await supabase.from("transcripts").insert({
            call_id: callId,
            speaker: "mixed", // Sarvam STT standard returns mixed text unless diarized
            text: transcriptResult.transcript,
            ts: new Date().toISOString(),
        });

        if (error) {
            console.error("[stt] Insert error:", error);
        } else {
            console.log(`[stt] Saved Sarvam transcript for call ${providerCallId}`);
        }
    } else {
        console.warn(`[stt] No transcript returned for call ${providerCallId}`);
    }
}

module.exports = router;
