// ─────────────────────────────────────────────
// TypeScript interfaces matching the Supabase schema
// from Agent A (vapiWebhook.js + PAYLOAD_MAPPING.md)
// ─────────────────────────────────────────────

export interface Call {
    id: string;
    provider_call_id: string;
    provider?: string | null;
    assistant_id: string | null;
    customer_number: string | null;
    to_number?: string | null;
    status: "queued" | "ringing" | "in-progress" | "forwarding" | "ended";
    outcome: string | null; // "completed" | "callback" | "customer-ended-call" | etc.
    lead_score: number | null; // 0–100
    emotion_score?: number | null; // -1,0,1
    started_at: string | null;
    ended_at: string | null;
    summary: string | null;
    recording_url?: string | null;
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

export interface CallInsight {
    id: string;
    call_id: string;
    reply_text: string | null;
    lead_score: number | null;
    emotion: string | null;
    intent: string | null;
    next_best_action: string | null;
    summary: string | null;
    is_final: boolean;
    created_at?: string;
    updated_at?: string;
}
