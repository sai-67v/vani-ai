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
import { DemoDialog } from "@/components/ui/demo";
import { TelephonyDialer } from "@/components/ui/TelephonyDialer";
import { Moon, Sun, RefreshCw, PhoneForwarded, Download } from "lucide-react";
import { CallCard } from "@/components/ui/CallCard";

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

    const [demoMode, setDemoMode] = useState(false);

    // Initial load from storage
    useEffect(() => {
        const stored = localStorage.getItem("vani_demo_mode");
        if (stored === "true") setDemoMode(true);
    }, []);

    const handleToggleDemoMode = () => {
        const next = !demoMode;
        setDemoMode(next);
        localStorage.setItem("vani_demo_mode", next ? "true" : "false");
    };

    // Load KPIs
    useEffect(() => {
        (async () => {
            setKpiLoading(true);
            const data = await fetchKpis(demoMode);
            setKpiData(data);
            setKpiLoading(false);
        })();
    }, [demoMode]);

    // Load calls (re-runs on page change or demo mode change)
    useEffect(() => {
        (async () => {
            setCallsLoading(true);
            const { data, count } = await fetchCalls(callsPage, demoMode);
            setCalls(data);
            setCallsTotal(count);
            setCallsLoading(false);
        })();
    }, [callsPage, demoMode]);

    // Load callbacks
    useEffect(() => {
        (async () => {
            const data = await fetchCallbacks(demoMode);
            setCallbacks(data);
        })();
    }, [demoMode]);
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
            {/* ── Hero Area ─────────────────────────────────────────── */}
            <div className="flex flex-col items-center justify-center text-center fade-up" style={{ marginBottom: "48px", marginTop: "16px" }}>
                <div className="header-logo inline-flex mb-4" style={{ width: 64, height: 64, fontSize: 24, borderRadius: "var(--r-md)" }}>▼</div>
                <h1 className="type-heading-md" style={{ color: "var(--text)", textShadow: "0 0 24px rgba(255, 250, 234, 0.2)", marginBottom: "8px" }}>
                    Vani AI Voice Engine
                </h1>
                <p className="type-overline" style={{ color: "var(--theme-primary)" }}>
                    Autonomous Customer Analytics &amp; Callback Routing
                </p>
            </div>

            {/* ── KPI Row ─────────────────────────────────────────── */}
            <KpiCards data={kpiData} loading={kpiLoading} />

            {/* ── Action Bar ───────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3" style={{ marginBottom: "24px", justifyContent: "flex-end" }}>
                <button
                    onClick={handleToggleDemoMode}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-300 ${demoMode ? 'border-raycast-red/40 bg-raycast-red/10 text-raycast-red shadow-[0_0_15px_rgba(255,99,99,0.15)]' : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'}`}
                >
                    <span className={`h-2 w-2 rounded-full transition-colors ${demoMode ? 'bg-raycast-red shadow-[0_0_0_4px_rgba(255,99,99,0.2)]' : 'bg-white/30'}`} />
                    Demo: {demoMode ? "ON" : "OFF"}
                </button>

                <DemoDialog />

                <button className="btn inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 hover:bg-white/10 hover:text-white hover-lift transition-all" onClick={() => window.location.reload()} title="Refresh Data">
                    <RefreshCw size={14} />
                </button>
                <button className="btn inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 hover:bg-white/10 hover:text-white hover-lift transition-all" onClick={() => alert("Preparing CSV Download...")} title="Export CSV">
                    <Download size={14} />
                </button>
                <TelephonyDialer />
                <CallCard compact />
            </div>

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
