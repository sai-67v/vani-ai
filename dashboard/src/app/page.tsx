"use client";
import { useEffect, useState, useCallback } from "react";
import { KpiCards } from "@/components/KpiCards";
import { CallsTable } from "@/components/CallsTable";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { CallbackQueue } from "@/components/CallbackQueue";
import {
    fetchKpis,
    fetchCalls,
    fetchTranscript,
    fetchCallbacks,
} from "@/lib/queries";
import type { Call, Transcript, CallbackQueueItem, KpiData } from "@/lib/types";
import { computeMockKpis } from "@/lib/mock-data";

const EMPTY_KPI: KpiData = computeMockKpis();

export default function DashboardPage() {
    // KPIs
    const [kpiData, setKpiData] = useState<KpiData>(EMPTY_KPI);
    const [kpiLoading, setKpiLoading] = useState(true);

    // Calls table
    const [calls, setCalls] = useState<Call[]>([]);
    const [callsTotal, setCallsTotal] = useState(0);
    const [callsPage, setCallsPage] = useState(0);
    const [callsLoading, setCallsLoading] = useState(true);

    // Transcript panel
    const [selectedCall, setSelectedCall] = useState<Call | null>(null);
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [transcriptLoading, setTranscriptLoading] = useState(false);

    // Callback queue
    const [callbacks, setCallbacks] = useState<CallbackQueueItem[]>([]);

    // Load KPIs
    useEffect(() => {
        (async () => {
            setKpiLoading(true);
            const data = await fetchKpis();
            setKpiData(data);
            setKpiLoading(false);
        })();
    }, []);

    // Load calls (re-runs on page change)
    useEffect(() => {
        (async () => {
            setCallsLoading(true);
            const { data, count } = await fetchCalls(callsPage);
            setCalls(data);
            setCallsTotal(count);
            setCallsLoading(false);
        })();
    }, [callsPage]);

    // Load callbacks once
    useEffect(() => {
        (async () => {
            const data = await fetchCallbacks();
            setCallbacks(data);
        })();
    }, []);

    // When a call row is clicked, load its transcript
    const handleSelectCall = useCallback(async (call: Call) => {
        setSelectedCall(call);
        setTranscriptLoading(true);
        const data = await fetchTranscript(call.id);
        setTranscripts(data);
        setTranscriptLoading(false);
    }, []);

    const handleClosePanel = useCallback(() => {
        setSelectedCall(null);
        setTranscripts([]);
    }, []);

    return (
        <main className="dashboard">
            {/* ── KPI Row ─────────────────────────────────────────── */}
            <KpiCards data={kpiData} loading={kpiLoading} />

            {/* ── Main Area ────────────────────────────────────────── */}
            <div className="main-area">
                {/* Left column: Calls table */}
                <CallsTable
                    calls={calls}
                    total={callsTotal}
                    page={callsPage}
                    onPageChange={setCallsPage}
                    onSelectCall={handleSelectCall}
                    selectedCallId={selectedCall?.id ?? null}
                    loading={callsLoading}
                />

                {/* Right column: Callback queue */}
                <CallbackQueue items={callbacks} />
            </div>

            {/* ── Transcript side panel (fixed overlay) ────────────── */}
            <TranscriptPanel
                call={selectedCall}
                transcripts={transcripts}
                loading={transcriptLoading}
                onClose={handleClosePanel}
            />
        </main>
    );
}
