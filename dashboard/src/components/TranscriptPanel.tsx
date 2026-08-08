import { useEffect, useRef } from "react";
import styles from "./TranscriptPanel.module.css";
import type { Call, Transcript, CallInsight } from "@/lib/types";
import { InsightBadges } from "./InsightBadges";

interface Props {
    call: Call | null;
    transcripts: Transcript[];
    loading: boolean;
    insight: CallInsight | null;
    insightLoading: boolean;
    onClose: () => void;
    isLive?: boolean;
}

function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export function TranscriptPanel({ call, transcripts, loading, insight, insightLoading, onClose, isLive }: Props) {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const isOpen = !!call;
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic when live
    useEffect(() => {
        if (isLive && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcripts, isLive]);

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className={styles.backdrop}
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Panel */}
            <div
                className={`${styles.panel} glass ${isOpen ? styles.open : ""}`}
                role="complementary"
                aria-label="Call transcript"
                style={{
                    borderTopLeftRadius: '24px',
                    borderBottomLeftRadius: '24px',
                    boxShadow: '-12px 0 40px rgba(0,0,0,0.15)',
                    borderLeft: '1px solid rgba(255,255,255,0.08)'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--theme-accent)]/5 to-transparent pointer-events-none opacity-40" aria-hidden />
                <div className="grain-overlay opacity-20" aria-hidden />
                <div className={`${styles.panelHeader} relative z-10`}>
                    <div>
                        <div className={`${styles.panelTitle} flex items-center gap-2`} style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                            Transcript
                            {isLive && (
                                <span className={styles.listeningBadge}>
                                    <span className={styles.pulseDot} /> Listening...
                                </span>
                            )}
                        </div>
                        {call && (
                            <div className={styles.panelSubtitle}>
                                {call.customer_number ?? "Unknown number"} ·{" "}
                                {call.duration_seconds != null
                                    ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`
                                    : call.status}
                            </div>
                        )}
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close panel">
                        ✕
                    </button>
                </div>

                {/* Summary */}
                {call?.summary && (
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryLabel}>AI Summary</div>
                        <div className={styles.summaryText}>{call.summary}</div>
                    </div>
                )}

                {/* Real-time Insights Strip */}
                {call && (
                    <div style={{ padding: '0 24px', marginBottom: '8px' }}>
                        <InsightBadges insight={insight} loading={insightLoading} />
                    </div>
                )}

                {/* Transcript body */}
                <div className={`${styles.messages} ${isLive ? styles.autoScroll : ""}`} ref={scrollRef}>
                    {loading ? (
                        <div className={styles.loadingState}>Loading transcript…</div>
                    ) : transcripts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span>🎙</span>
                            <p>No transcript segments yet.</p>
                            <p style={{ fontSize: 11 }}>Transcripts appear after the call ends.</p>
                        </div>
                    ) : (
                        transcripts.map((t) => (
                            <div
                                key={t.id}
                                className={`${styles.message} ${t.speaker === "assistant" ? styles.assistant : styles.user
                                    }`}
                            >
                                <div className={styles.speaker}>
                                    {t.speaker === "assistant" ? "🤖 Agent" : "👤 Caller"}
                                    <span className={styles.ts}>{fmtTime(t.ts)}</span>
                                </div>
                                <div className={styles.bubble}>{t.text}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
