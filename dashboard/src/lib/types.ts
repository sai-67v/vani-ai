// ─────────────────────────────────────────────
// TypeScript interfaces matching the Supabase schema
// from Agent A (vapiWebhook.js + PAYLOAD_MAPPING.md)
// ─────────────────────────────────────────────

export interface Call {
    id: string;
    provider_call_id: string;
    assistant_id: string | null;
    customer_number: string | null;
    status: "queued" | "ringing" | "in-progress" | "forwarding" | "ended";
    outcome: string | null; // "completed" | "callback" | "customer-ended-call" | etc.
    lead_score: number | null; // 0–100
    started_at: string | null;
    ended_at: string | null;
    summary: string | null;
    cost: number | null;
    duration_seconds: number | null;
    created_at?: string;
}

export interface Transcript {
    id: string;
    call_id: string;
    speaker: "user" | "assistant" | "bot" | "unknown";
    text: string;
    ts: string; // ISO timestamptz
}

export interface CallbackQueueItem {
    id: string;
    call_id: string;
    customer_number: string | null;
    reason: string;
    priority: "low" | "normal" | "high" | "urgent";
    status: "pending" | "completed" | "cancelled";
    requested_at?: string;
    // Joined from calls table via call_id
    call?: Pick<Call, "lead_score" | "summary" | "ended_at">;
}

export interface KpiData {
    totalCalls: number;
    qualified: number; // outcome = "callback" OR lead_score >= 70
    callbacksPending: number;
    avgDurationSeconds: number;
}
