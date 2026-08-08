"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Device as TwilioDevice, Call as Connection } from "@twilio/voice-sdk";
import {
    PhoneCall,
    Wifi,
    Radio,
    Loader2,
    AlertTriangle,
    PhoneForwarded,
    PhoneOff,
    Search,
    Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

type LeadLabel = "HOT" | "WARM" | "COLD" | "NEUTRAL";

interface CallListItem {
    callId: string;
    direction: "inbound" | "outbound" | "wifi";
    from: string;
    to: string;
    createdAt: string;
    updatedAt?: string;
    leadLabel: LeadLabel;
    language: string;
    emotions: string[];
    hasTranscript: boolean;
    summary?: string;
}

interface VoiceAnalysis {
    ok: boolean;
    callId: string;
    language: string;
    transcript: string;
    summary: string;
    lead: { label: LeadLabel; score: number };
    emotions: string[];
    faqs: { q: string; a: string; confidence: number }[];
    keySignals: string[];
}

const LEAD_ICONS: Record<LeadLabel, string> = {
    HOT: "🔥",
    WARM: "🟠",
    COLD: "🧊",
    NEUTRAL: "⚪",
};

const DIRECTION_BADGE: Record<CallListItem["direction"], string> = {
    inbound: "Inbound PSTN",
    outbound: "Outbound PSTN",
    wifi: "WiFi Call",
};

const DEMO_ANALYSIS: VoiceAnalysis = {
    ok: true,
    callId: "demo-call",
    language: "en",
    transcript:
        "Caller: Hey, I saw your LinkedIn post about the autonomous voice SDR. Does it integrate with HubSpot?\nAgent: Absolutely. We push qualified calls directly into any HubSpot pipeline.\nCaller: Huge. We need Hindi + English for our Mumbai team.\nAgent: Sarvam can code-switch without latency. I can spin up a bilingual agent for this campaign.\nCaller: Perfect. Send pricing and a sandbox this week.",
    summary:
        "Prospect needs HubSpot sync plus bilingual support and requested pricing + sandbox this week.",
    lead: { label: "HOT", score: 92 },
    emotions: ["Confident", "Curious", "Urgent"],
    faqs: [
        {
            q: "Do you integrate with HubSpot?",
            a: "Yes. Summaries, follow-up tasks, and lead scores sync to any HubSpot pipeline in seconds.",
            confidence: 0.94,
        },
        {
            q: "Can you handle bilingual (Hindi + English) calls?",
            a: "Sarvam's multilingual pipeline lets a single agent switch languages mid-sentence without latency.",
            confidence: 0.9,
        },
    ],
    keySignals: [
        "Sandbox requested this week",
        "Need bilingual SDR (Hindi + English)",
        "CRM: HubSpot is mandatory",
    ],
};

const DEMO_CALL: CallListItem = {
    callId: "demo-call",
    direction: "wifi",
    from: "Demo Prospect",
    to: "AI Agent",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    leadLabel: "HOT",
    language: "EN",
    emotions: DEMO_ANALYSIS.emotions,
    hasTranscript: true,
    summary: DEMO_ANALYSIS.summary,
};

const TAB_ITEMS = ["Transcript", "Summary", "Lead"] as const;
type DetailTab = (typeof TAB_ITEMS)[number];

function formatTimeLabel(value?: string) {
    if (!value) return "Just now";
    const date = new Date(value);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatRelative(value?: string) {
    if (!value) return "Just now";
    const diff = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function normalizeDialNumber(value: string) {
    const cleaned = value.replace(/[\s\-()]/g, "");
    if (cleaned.startsWith("+") || cleaned.startsWith("00")) {
        return cleaned.startsWith("00") ? `+${cleaned.slice(2)}` : cleaned;
    }
    return cleaned ? `+${cleaned}` : cleaned;
}

function formatLiveDate(date = new Date()) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
    const [calls, setCalls] = useState<CallListItem[]>([DEMO_CALL]);
    const [callsLoading, setCallsLoading] = useState(true);
    const [selectedCallId, setSelectedCallId] = useState<string>(DEMO_CALL.callId);
    const [analysis, setAnalysis] = useState<VoiceAnalysis>(DEMO_ANALYSIS);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [detailTab, setDetailTab] = useState<DetailTab>("Transcript");
    const [faqQuery, setFaqQuery] = useState<string>("");

    const [callerId, setCallerId] = useState<string>("");
    const [outboundNumber, setOutboundNumber] = useState("");
    const [outboundStatus, setOutboundStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [outboundMessage, setOutboundMessage] = useState<string>("");

    const [wifiStatus, setWifiStatus] = useState<"idle" | "ready" | "connecting" | "in-call" | "ended" | "error">("idle");
    const [wifiMessage, setWifiMessage] = useState<string>("Tap start to launch a Twilio WebRTC session.");
    const [voiceDevice, setVoiceDevice] = useState<TwilioDevice | null>(null);
    const [wifiConnection, setWifiConnection] = useState<Connection | null>(null);
    // Ref mirrors voiceDevice so callbacks always see the latest instance (avoids stale closure)
    const voiceDeviceRef = useRef<TwilioDevice | null>(null);
    // Track token expiry so we can proactively refresh before 45-min mark
    const tokenExpiryRef = useRef<number>(0);
    const tokenRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const selectedCall = useMemo(() => calls.find((call) => call.callId === selectedCallId) ?? calls[0], [calls, selectedCallId]);

    const callStats = useMemo(() => {
        const total = calls.length;
        const hot = calls.filter((call) => call.leadLabel === "HOT").length;
        const wifi = calls.filter((call) => call.direction === "wifi").length;
        const updated = calls[0]?.updatedAt || calls[0]?.createdAt || null;
        return {
            total,
            hot,
            wifi,
            lastUpdatedLabel: updated ? `${formatTimeLabel(updated)} · ${formatLiveDate(new Date(updated))}` : "Awaiting data",
        };
    }, [calls]);

    const filteredFaqs = useMemo(() => {
        if (!analysis?.faqs) return [];
        if (!faqQuery.trim()) return analysis.faqs;
        const needle = faqQuery.toLowerCase();
        return analysis.faqs.filter((faq) => faq.q.toLowerCase().includes(needle) || faq.a.toLowerCase().includes(needle));
    }, [analysis?.faqs, faqQuery]);

    const loadCalls = useCallback(async () => {
        try {
            setCallsLoading(true);
            const results = await api.getCalls();
            const finalResults = results.length ? (results as unknown as CallListItem[]) : [DEMO_CALL];
            setCalls(finalResults);
            setSelectedCallId((prev) => {
                if (prev && finalResults.some((call) => call.callId === prev)) {
                    return prev;
                }
                return finalResults[0]?.callId ?? prev ?? DEMO_CALL.callId;
            });
        } catch (error) {
            console.error("[dashboard] failed to load calls", error);
            setCalls((prev) => (prev.length ? prev : [DEMO_CALL]));
        } finally {
            setCallsLoading(false);
        }
    }, []);

    const loadCallDetails = useCallback(async (callId: string) => {
        if (!callId) return;
        try {
            setAnalysisLoading(true);
            const res = await fetch(`/api/calls/${callId}`, { cache: "no-store" });
            const text = await res.text();
            if (!res.ok) {
                console.error("Response not OK:", text);
                throw new Error("call_detail_missing");
            }
            let payload: any;
            try {
                payload = JSON.parse(text);
            } catch {
                console.error("Non JSON response:", text);
                throw new Error("Server returned non JSON");
            }
            const normalized = payload.data?.analysis as VoiceAnalysis | undefined;
            if (normalized) {
                setAnalysis(normalized);
            }
        } catch (error) {
            console.warn("[dashboard] falling back to demo analysis", error);
            setAnalysis({ ...DEMO_ANALYSIS, callId });
        } finally {
            setAnalysisLoading(false);
        }
    }, []);

    const refreshAnalysis = useCallback(async () => {
        const targetCall = selectedCallId || `demo-${Date.now()}`;
        setAnalysisLoading(true);
        setDetailTab("Transcript");
        try {
            const body: Record<string, unknown> = {
                callId: selectedCallId ? targetCall : undefined,
                source: selectedCallId ? "dashboard" : "demo",
            };
            if (!selectedCallId) {
                body.transcript = DEMO_ANALYSIS.transcript;
                body.languageHint = "en";
            }
            const res = await fetch("/api/analyze/voice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const text = await res.text();
            if (!res.ok) {
                console.error("Response not OK:", text);
                let errorMessage = "analysis_error";
                try {
                    const errorPayload = JSON.parse(text);
                    errorMessage = errorPayload?.error || errorMessage;
                } catch {
                    /* ignore parse error for error extraction */
                }
                throw new Error(errorMessage);
            }
            let payload: any;
            try {
                payload = JSON.parse(text);
            } catch {
                console.error("Non JSON response:", text);
                throw new Error("Server returned non JSON");
            }
            setAnalysis(payload);
            await loadCalls();
        } catch (error) {
            console.error("[dashboard] analyze fallback", error);
            setAnalysis({ ...DEMO_ANALYSIS, callId: targetCall });
        } finally {
            setAnalysisLoading(false);
        }
    }, [loadCalls, selectedCallId]);

    const fetchCallerId = useCallback(async () => {
        try {
            const res = await fetch("/api/twilio/number", { cache: "no-store" });
            // Route may have been removed — fail silently with a placeholder
            if (res.status === 404) {
                setCallerId("your Twilio number");
                return;
            }
            const text = await res.text();
            if (!res.ok) return;
            try {
                const data = JSON.parse(text);
                setCallerId(data.number || "your Twilio number");
            } catch {
                /* non-JSON — ignore */
            }
        } catch {
            // Network failure — non-critical, use placeholder
            setCallerId("your Twilio number");
        }
    }, []);

    /** Fetch a fresh access token from the Next.js API route. */
    const fetchVoiceToken = useCallback(async (): Promise<string> => {
        const identity = `operator-${Date.now()}`;
        const res = await fetch(`/api/twilio/token?identity=${encodeURIComponent(identity)}`, { cache: "no-store" });
        const text = await res.text();
        if (!res.ok) {
            let detail = "Token API returned an error";
            try { detail = JSON.parse(text)?.error ?? detail; } catch { /* ignore */ }
            throw new Error(detail);
        }
        let parsed: { token?: string };
        try { parsed = JSON.parse(text); } catch { throw new Error("Token response was not valid JSON"); }
        if (!parsed.token) throw new Error("Token response missing 'token' field");
        // Schedule proactive refresh at 45 minutes (token TTL is 60 min)
        tokenExpiryRef.current = Date.now() + 45 * 60 * 1000;
        return parsed.token;
    }, []);

    /**
     * Register (or re-use) the Twilio Device.
     * Uses a ref to avoid stale-closure issues — `voiceDevice` state is
     * set asynchronously so callbacks inside this function see the ref instead.
     */
    const registerVoiceDevice = useCallback(async (): Promise<TwilioDevice> => {
        // Re-use existing healthy device
        if (voiceDeviceRef.current && voiceDeviceRef.current.state !== "destroyed") {
            return voiceDeviceRef.current;
        }

        // Request microphone permission before touching the SDK
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            throw new Error("Microphone access denied. Please allow mic permission and try again.");
        }

        const token = await fetchVoiceToken();
        const device = new TwilioDevice(token, {
            logLevel: "warn",
            codecPreferences: ["opus" as any, "pcmu" as any],
        });

        device.on("registered", () => {
            setWifiStatus("ready");
            setWifiMessage("Device registered. Tap \"Start WiFi Call\" to connect.");
        });
        device.on("tokenWillExpire", async () => {
            // SDK fires this 10s before expiry — refresh proactively
            try {
                const newToken = await fetchVoiceToken();
                device.updateToken(newToken);
                console.info("[wifi-call] token refreshed");
            } catch (err) {
                console.error("[wifi-call] token refresh failed", err);
            }
        });
        device.on("error", (err: Error & { code?: number }) => {
            console.error("[wifi-call][device-error]", err.code, err.message);
            // 31205 = token expired, 31000 = generic transport error
            const msg = err.code === 31205
                ? "Voice token expired. Click \"Start WiFi Call\" to reconnect."
                : (err.message || "Voice SDK error — check console for details.");
            setWifiStatus("error");
            setWifiMessage(msg);
        });
        device.on("disconnect", () => {
            setWifiStatus("ended");
            setWifiMessage("WiFi call ended.");
            setWifiConnection(null);
        });
        device.on("incoming", (call: Connection) => {
            // Auto-accept inbound WebRTC calls to this device
            call.accept();
        });

        await device.register();
        voiceDeviceRef.current = device;
        setVoiceDevice(device);
        return device;
    }, [fetchVoiceToken]);

    const startWifiCall = useCallback(async () => {
        try {
            setWifiStatus("connecting");
            setWifiMessage("Initialising voice device…");

            // Hang up any live connection first
            if (wifiConnection) {
                wifiConnection.disconnect();
                setWifiConnection(null);
            }

            const device = await registerVoiceDevice();

            setWifiMessage("Connecting to Twilio…");
            const connection = await device.connect();

            connection.on("accept", () => {
                setWifiStatus("in-call");
                setWifiMessage("WiFi call live — audio routed via browser.");
                loadCalls();
            });
            connection.on("disconnect", () => {
                setWifiStatus("ended");
                setWifiMessage("WiFi call ended.");
                setWifiConnection(null);
            });
            connection.on("error", (err: Error) => {
                setWifiStatus("error");
                setWifiMessage(err.message || "Call error — see console.");
                setWifiConnection(null);
            });

            setWifiConnection(connection);
        } catch (error) {
            console.error("[wifi-call] startWifiCall failed", error);
            setWifiStatus("error");
            setWifiMessage((error as Error)?.message || "Unable to start WiFi call.");
        }
    }, [loadCalls, registerVoiceDevice, wifiConnection]);

    const hangupWifiCall = useCallback(() => {
        wifiConnection?.disconnect();
        setWifiConnection(null);
        voiceDeviceRef.current?.disconnectAll();
        setWifiStatus("ended");
        setWifiMessage("Call ended.");
    }, [wifiConnection]);

    const handleOutboundCall = useCallback(async () => {
        const sanitized = normalizeDialNumber(outboundNumber);
        if (!sanitized || sanitized.length < 8) {
            setOutboundStatus("error");
            setOutboundMessage("Enter a valid phone number with country code.");
            return;
        }
        setOutboundStatus("sending");
        setOutboundMessage("Dialing now...");
        try {
            const payload = await api.triggerCall(sanitized);
            setOutboundStatus("success");
            setOutboundMessage("Twilio is calling you now.");
            await loadCalls();
            setSelectedCallId(payload.callSid || sanitized);
            await loadCallDetails(payload.callSid || sanitized);
        } catch (error) {
            console.error("[outbound] failed", error);
            setOutboundStatus("error");
            setOutboundMessage((error as Error)?.message || "Unable to start call");
        }
    }, [loadCallDetails, loadCalls, outboundNumber]);

    useEffect(() => {
        loadCalls();
        fetchCallerId();
        const interval = setInterval(loadCalls, 8000);
        return () => clearInterval(interval);
    }, [fetchCallerId, loadCalls]);

    // Destroy the Twilio device on page unmount to release audio resources
    useEffect(() => {
        return () => {
            if (tokenRefreshTimer.current) clearTimeout(tokenRefreshTimer.current);
            voiceDeviceRef.current?.destroy();
            voiceDeviceRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (selectedCallId) {
            loadCallDetails(selectedCallId);
        }
    }, [loadCallDetails, selectedCallId]);

    return (
        <main className="min-h-screen w-full px-6 py-8 text-white">
            <section className="mb-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.6em] text-white/50">Live command center</p>
                        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                            <span className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#7df2c9] via-[#9be8ff] to-[#8ca8ff] drop-shadow-[0_0_18px_rgba(123,242,201,0.35)]">
                                VAANI AI
                            </span>
                            <span className="text-base uppercase tracking-[0.4em] text-white/55">Voice Dashboard</span>
                        </div>
                        <p className="mt-2 max-w-2xl text-sm text-white/70">
                            Twilio PSTN, WiFi Voice SDK, and Sarvam cognition unified in one operator view.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                            <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_0_6px_rgba(248,113,113,0.3)]" />
                            Live · {formatLiveDate()}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                            {callStats.lastUpdatedLabel}
                        </span>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                        { label: "Call volume", value: callStats.total.toString(), desc: "records in feed" },
                        { label: "🔥 Hot leads", value: callStats.hot.toString(), desc: "flagged by Sarvam" },
                        { label: "WiFi calls", value: callStats.wifi.toString(), desc: "Twilio Voice SDK" },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">{stat.label}</p>
                            <p className="mt-1 text-2xl font-semibold text-white">{stat.value}</p>
                            <p className="text-xs uppercase tracking-[0.25em] text-white/50">{stat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
                <div className="space-y-6">
                    <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 backdrop-blur">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.4em] text-white/50">Outbound PSTN</p>
                                <h2 className="text-lg font-semibold">Call my phone</h2>
                            </div>
                            <PhoneForwarded className="text-lime-300" size={20} />
                        </div>
                        <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Destination</label>
                        <input
                            type="tel"
                            value={outboundNumber}
                            onChange={(event) => setOutboundNumber(event.target.value)}
                            placeholder="+1 415 555 2671"
                            className="mt-1 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm focus:border-white/40 focus:outline-none"
                        />
                        <p className="mt-3 text-xs text-white/60">Caller ID will be {callerId || "your Twilio number"}.</p>
                        {outboundStatus === "error" && (
                            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-50">
                                <AlertTriangle size={14} /> {outboundMessage}
                            </div>
                        )}
                        {outboundStatus === "success" && (
                            <div className="mt-3 rounded-2xl border border-lime-300/30 bg-lime-300/10 px-3 py-2 text-xs text-lime-100">
                                {outboundMessage}
                            </div>
                        )}
                        <button
                            type="button"
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(255,255,255,0.25)] disabled:opacity-60"
                            onClick={handleOutboundCall}
                            disabled={outboundStatus === "sending"}
                        >
                            {outboundStatus === "sending" ? <Loader2 size={16} className="animate-spin" /> : <PhoneCall size={16} />}
                            {outboundStatus === "sending" ? "Dialing..." : "Call my phone"}
                        </button>
                    </div>

                    <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 backdrop-blur">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.4em] text-white/50">WiFi Call</p>
                                <h2 className="text-lg font-semibold">Browser to Twilio</h2>
                            </div>
                            <Wifi className="text-cyan-300" size={20} />
                        </div>
                        <p className="text-sm text-white/70">Use the Twilio Voice SDK to connect over WebRTC. Perfect for demoing without PSTN.</p>
                        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.4em] text-white/40">State</p>
                                <p className="text-sm font-semibold">{wifiStatus.toUpperCase()}</p>
                            </div>
                            <div className="text-right text-xs text-white/60">{wifiMessage}</div>
                        </div>
                        <div className="mt-4 flex gap-3">
                            <button
                                type="button"
                                className="flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold"
                                onClick={startWifiCall}
                                disabled={wifiStatus === "connecting" || wifiStatus === "in-call"}
                            >
                                {wifiStatus === "connecting" ? "Connecting..." : "Start WiFi Call"}
                            </button>
                            <button
                                type="button"
                                className="flex-1 rounded-2xl border border-white/15 bg-black/20 px-4 py-2 text-sm font-semibold"
                                onClick={hangupWifiCall}
                                disabled={wifiStatus !== "in-call"}
                            >
                                <PhoneOff size={14} className="mr-1 inline" /> Hang up
                            </button>
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 backdrop-blur">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.4em] text-white/50">Calls</p>
                                <h2 className="text-lg font-semibold">Recent Activity</h2>
                            </div>
                            <button
                                type="button"
                                onClick={loadCalls}
                                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70"
                            >
                                Refresh
                            </button>
                        </div>
                        <div className="space-y-3">
                            {callsLoading && (
                                <div className="animate-pulse space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                            <div className="flex items-center justify-between">
                                                <div className="h-3 w-16 rounded-full bg-white/20"></div>
                                                <div className="h-3 w-12 rounded-full bg-white/10"></div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 rounded bg-white/20"></div>
                                                    <div className="h-3 w-24 rounded bg-white/10"></div>
                                                </div>
                                                <div className="h-6 w-6 rounded-full bg-white/20"></div>
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                <div className="h-4 w-12 rounded-full bg-white/20"></div>
                                                <div className="h-4 w-12 rounded-full bg-white/10"></div>
                                                <div className="h-4 w-16 rounded-full bg-white/10"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!callsLoading && calls.map((call) => (
                                <button
                                    key={call.callId}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCallId(call.callId);
                                        setDetailTab("Transcript");
                                    }}
                                    className={`w-full rounded-2xl border px-4 py-3 text-left ${call.callId === selectedCallId ? "border-white/50 bg-white/10" : "border-white/10 bg-black/20 hover:border-white/20"}`}
                                >
                                    <div className="flex items-center justify-between text-xs text-white/60">
                                        <span>{DIRECTION_BADGE[call.direction]}</span>
                                        <span>{formatRelative(call.updatedAt || call.createdAt)}</span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">{call.from} → {call.to}</p>
                                            <p className="text-xs text-white/60">{formatTimeLabel(call.createdAt)} · {call.language}</p>
                                        </div>
                                        <span className="text-2xl" aria-label={`${call.leadLabel} lead`}>
                                            {LEAD_ICONS[call.leadLabel]}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-white/70">
                                            {call.leadLabel}
                                        </span>
                                        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                                            {call.language}
                                        </span>
                                        {call.emotions.slice(0, 3).map((emotion) => (
                                            <span
                                                key={`${call.callId}-${emotion}`}
                                                className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70"
                                            >
                                                {emotion}
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-[#0b0b12] via-[#101020] to-[#050506] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Call Details</p>
                            <h2 className="text-2xl font-semibold">
                                {selectedCall?.from} · {LEAD_ICONS[selectedCall?.leadLabel ?? "NEUTRAL"]}
                            </h2>
                            <p className="text-sm text-white/60">
                                {selectedCall ? `${selectedCall.direction.toUpperCase()} · ${formatTimeLabel(selectedCall.createdAt)}` : "No call selected"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={refreshAnalysis}
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                            disabled={analysisLoading}
                        >
                            {analysisLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {analysisLoading ? "Analyzing" : "Analyze voice data"}
                        </button>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        {(analysis?.emotions || ["Neutral"]).map((emotion) => (
                            <span key={emotion} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                                {emotion}
                            </span>
                        ))}
                        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                            Lang: {(analysis?.language || "en").toUpperCase()}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                            Score: {analysis?.lead?.score ?? 0}
                        </span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {TAB_ITEMS.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                className={`rounded-full px-4 py-1 text-sm font-semibold ${detailTab === tab ? "bg-white text-black" : "bg-white/10 text-white/70"}`}
                                onClick={() => setDetailTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 rounded-[28px] border border-white/10 bg-black/30 p-4 max-h-[360px] overflow-y-auto">
                        {detailTab === "Transcript" && (
                            <div className="space-y-3 text-sm leading-relaxed text-white/80">
                                {(analysis?.transcript || DEMO_ANALYSIS.transcript)
                                    .split(/\n+/)
                                    .filter(Boolean)
                                    .map((line, index) => (
                                        <p key={`${line}-${index}`}>{line}</p>
                                    ))}
                            </div>
                        )}
                        {detailTab === "Summary" && (
                            <p className="text-sm leading-relaxed text-white/80">{analysis?.summary || DEMO_ANALYSIS.summary}</p>
                        )}
                        {detailTab === "Lead" && (
                            <div className="space-y-3 text-sm">
                                <p className="text-lg font-semibold">{analysis?.lead?.label ?? "NEUTRAL"}</p>
                                <div className="h-2 w-full rounded-full bg-white/10">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-[#ffb347] via-[#ffcc33] to-[#51ffbd]"
                                        style={{ width: `${Math.min(100, analysis?.lead?.score ?? 50)}%` }}
                                    />
                                </div>
                                <ul className="list-disc pl-4 text-white/70">
                                    {(analysis?.keySignals || DEMO_ANALYSIS.keySignals).map((signal) => (
                                        <li key={signal}>{signal}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                            <div className="mb-3 flex items-center justify-between text-sm text-white/60">
                                <span>FAQ matches</span>
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search FAQ answers"
                                value={faqQuery}
                                onChange={(event) => setFaqQuery(event.target.value)}
                                className="mb-3 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                            />
                            <div className="space-y-3 text-sm">
                                {filteredFaqs.length === 0 && <p className="text-white/50">No FAQ matches yet.</p>}
                                {filteredFaqs.map((faq) => (
                                    <div key={faq.q} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                        <p className="font-semibold">{faq.q}</p>
                                        <p className="text-white/70">{faq.a}</p>
                                        <p className="text-xs text-white/40">Confidence {(faq.confidence * 100).toFixed(0)}%</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                            <div className="mb-3 flex items-center justify-between text-sm text-white/60">
                                <span>Key signals</span>
                                <Radio size={16} />
                            </div>
                            <ul className="space-y-2 text-sm text-white/80">
                                {(analysis?.keySignals || DEMO_ANALYSIS.keySignals).map((signal) => (
                                    <li key={signal} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                                        {signal}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
