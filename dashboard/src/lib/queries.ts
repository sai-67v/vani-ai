// ─────────────────────────────────────────────
// All Supabase query functions — each function tries
// Supabase first, then falls back to mock data.
// ─────────────────────────────────────────────
import { supabase } from "./supabase";
import {
    MOCK_CALLS,
    MOCK_TRANSCRIPTS,
    MOCK_CALLBACKS,
    computeMockKpis,
} from "./mock-data";
import type { Call, Transcript, CallbackQueueItem, KpiData } from "./types";

const PAGE_SIZE = 10;

// ── KPI Data ─────────────────────────────────────────────────────────────────

export async function fetchKpis(): Promise<KpiData> {
    if (!supabase) return computeMockKpis();

    try {
        // Total calls
        const { count: totalCalls } = await supabase
            .from("calls")
            .select("*", { count: "exact", head: true });

        // Qualified = lead_score >= 65 OR outcome = "callback"
        const { count: qualified } = await supabase
            .from("calls")
            .select("*", { count: "exact", head: true })
            .or("lead_score.gte.65,outcome.eq.callback");

        // Callbacks pending
        const { count: callbacksPending } = await supabase
            .from("callback_queue")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending");

        // Average duration — fetch durations client-side (Supabase REST doesn't have AVG natively)
        const { data: durationRows } = await supabase
            .from("calls")
            .select("duration_seconds")
            .not("duration_seconds", "is", null);

        const durations = (durationRows ?? [])
            .map((r: { duration_seconds: number | null }) => r.duration_seconds!)
            .filter(Boolean);
        const avgDurationSeconds = durations.length
            ? Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length)
            : 0;

        return {
            totalCalls: totalCalls ?? 0,
            qualified: qualified ?? 0,
            callbacksPending: callbacksPending ?? 0,
            avgDurationSeconds,
        };
    } catch {
        return computeMockKpis();
    }
}

// ── Calls Table ───────────────────────────────────────────────────────────────

export async function fetchCalls(
    page = 0
): Promise<{ data: Call[]; count: number }> {
    if (!supabase)
        return {
            data: MOCK_CALLS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
            count: MOCK_CALLS.length,
        };

    try {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, count, error } = await supabase
            .from("calls")
            .select(
                "id, provider_call_id, customer_number, status, outcome, lead_score, duration_seconds, started_at, ended_at, summary",
                { count: "exact" }
            )
            .order("started_at", { ascending: false })
            .range(from, to);

        if (error) throw error;
        return { data: (data ?? []) as Call[], count: count ?? 0 };
    } catch {
        return {
            data: MOCK_CALLS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
            count: MOCK_CALLS.length,
        };
    }
}

// ── Transcript Panel ──────────────────────────────────────────────────────────

export async function fetchTranscript(callId: string): Promise<Transcript[]> {
    // Return mock transcript if available
    if (!supabase) return MOCK_TRANSCRIPTS[callId] ?? [];

    try {
        const { data, error } = await supabase
            .from("transcripts")
            .select("id, call_id, speaker, text, ts")
            .eq("call_id", callId)
            .order("ts", { ascending: true });

        if (error) throw error;
        // If no data found in Supabase, fall back to mock
        if (!data || data.length === 0) return MOCK_TRANSCRIPTS[callId] ?? [];
        return data;
    } catch {
        return MOCK_TRANSCRIPTS[callId] ?? [];
    }
}

// ── Callback Queue ────────────────────────────────────────────────────────────

export async function fetchCallbacks(): Promise<CallbackQueueItem[]> {
    if (!supabase) return MOCK_CALLBACKS;

    try {
        const { data, error } = await supabase
            .from("callback_queue")
            .select(
                `id, call_id, customer_number, reason, priority, status, requested_at,
         call:calls(lead_score, summary, ended_at)`
            )
            .order("requested_at", { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) return MOCK_CALLBACKS;

        // Supabase returns the FK join as an array; flatten to single object
        return data.map((row) => ({
            ...row,
            call: Array.isArray(row.call) ? row.call[0] ?? null : row.call,
        })) as CallbackQueueItem[];
    } catch {
        return MOCK_CALLBACKS;
    }
}

export async function updateCallbackStatus(
    id: string,
    status: CallbackQueueItem["status"]
): Promise<void> {
    if (!supabase) return; // mock — no-op

    const { error } = await supabase
        .from("callback_queue")
        .update({ status })
        .eq("id", id);

    if (error) console.error("[updateCallbackStatus]", error);
}
