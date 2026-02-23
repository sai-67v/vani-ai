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

export async function fetchKpis(demoMode = false): Promise<KpiData> {
    const emptyKpi = { totalCalls: 0, qualified: 0, callbacksPending: 0, avgDurationSeconds: 0 };
    if (!supabase) return demoMode ? computeMockKpis() : emptyKpi;

    try {
        const mock = computeMockKpis();
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

        const liveCount = totalCalls ?? 0;

        if (demoMode) {
            if (liveCount === 0) {
                return mock;
            } else {
                return {
                    totalCalls: liveCount + mock.totalCalls,
                    qualified: (qualified ?? 0) + mock.qualified,
                    callbacksPending: (callbacksPending ?? 0) + mock.callbacksPending,
                    avgDurationSeconds: avgDurationSeconds || mock.avgDurationSeconds,
                };
            }
        }

        return {
            totalCalls: liveCount,
            qualified: qualified ?? 0,
            callbacksPending: callbacksPending ?? 0,
            avgDurationSeconds: avgDurationSeconds,
        };
    } catch {
        return demoMode ? computeMockKpis() : emptyKpi;
    }
}

// ── Calls Table ───────────────────────────────────────────────────────────────

export async function fetchCalls(
    page = 0,
    demoMode = false
): Promise<{ data: Call[]; count: number }> {
    const emptyResult = { data: [], count: 0 };
    if (!supabase) {
        return demoMode ? {
            data: MOCK_CALLS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
            count: MOCK_CALLS.length,
        } : emptyResult;
    }

    try {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, count, error } = await supabase
            .from("calls")
            .select(
                "id, provider_call_id, provider, customer_number, to_number, status, outcome, lead_score, emotion_score, duration_seconds, started_at, ended_at, summary, recording_url",
                { count: "exact" }
            )
            .order("started_at", { ascending: false })
            .range(from, to);

        if (error) throw error;

        const liveCalls = (data ?? []) as Call[];
        const liveCount = count ?? 0;

        let combined = liveCalls;
        let totalCount = liveCount;

        if (demoMode) {
            if (liveCount === 0) {
                combined = MOCK_CALLS;
                totalCount = MOCK_CALLS.length;
            } else {
                combined = [...liveCalls, ...MOCK_CALLS];
                totalCount = liveCount + MOCK_CALLS.length;
            }
        }

        return {
            data: combined.slice(from, to + 1),
            count: totalCount
        };
    } catch {
        return demoMode ? {
            data: MOCK_CALLS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
            count: MOCK_CALLS.length,
        } : emptyResult;
    }
}

// ── Transcript Panel ──────────────────────────────────────────────────────────

export async function fetchTranscript(callId: string): Promise<Transcript[]> {
    if (!supabase) return MOCK_TRANSCRIPTS[callId] ?? [];

    // If it's a mock call ID, just return the mock transcript
    if (MOCK_TRANSCRIPTS[callId]) {
        return MOCK_TRANSCRIPTS[callId];
    }

    try {
        const { data, error } = await supabase
            .from("transcripts")
            .select("id, call_id, speaker, text, ts")
            .eq("call_id", callId)
            .order("ts", { ascending: true });

        if (error) throw error;
        return data ?? [];
    } catch {
        return [];
    }
}

// ── Callback Queue ────────────────────────────────────────────────────────────

export async function fetchCallbacks(demoMode = false): Promise<CallbackQueueItem[]> {
    if (!supabase) return demoMode ? MOCK_CALLBACKS : [];

    try {
        const { data, error } = await supabase
            .from("callback_queue")
            .select(
                `id, call_id, customer_number, reason, priority, status, requested_at,
         call:calls(lead_score, summary, ended_at)`
            )
            .order("requested_at", { ascending: false });

        if (error) throw error;

        const liveCallbacks = (data ?? []).map((row) => ({
            ...row,
            call: Array.isArray(row.call) ? row.call[0] ?? null : row.call,
        })) as CallbackQueueItem[];

        if (demoMode) {
            return liveCallbacks.length === 0 ? MOCK_CALLBACKS : [...liveCallbacks, ...MOCK_CALLBACKS];
        }

        return liveCallbacks;
    } catch {
        return demoMode ? MOCK_CALLBACKS : [];
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
