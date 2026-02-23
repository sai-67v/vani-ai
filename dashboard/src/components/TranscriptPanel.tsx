"use client";
import { useEffect } from "react";
import styles from "./TranscriptPanel.module.css";
import type { Call, Transcript } from "@/lib/types";

interface Props {
    call: Call | null;
    transcripts: Transcript[];
    loading: boolean;
    onClose: () => void;
}

function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export function TranscriptPanel({ call, transcripts, loading, onClose }: Props) {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const isOpen = !!call;

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
            >
                <div className={styles.panelHeader}>
                    <div>
                        <div className={styles.panelTitle}>Transcript</div>
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

                {/* Lead score pill */}
                {call?.lead_score != null && (
                    <div className={styles.scoreBanner}>
                        <span className={styles.scoreLabel}>Lead Score</span>
                        <span
                            className={`badge ${call.lead_score >= 80
                                    ? "badge-hot"
                                    : call.lead_score >= 65
                                        ? "badge-warm"
                                        : call.lead_score >= 40
                                            ? "badge-cool"
                                            : "badge-cold"
                                }`}
                            style={{ fontSize: 13, padding: "3px 12px" }}
                        >
                            {call.lead_score}/100
                        </span>
                    </div>
                )}

                {/* Transcript body */}
                <div className={styles.messages}>
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
