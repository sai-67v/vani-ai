"use client";
import { useState } from "react";
import styles from "./CallsTable.module.css";
import type { Call } from "@/lib/types";

function scoreLabel(score: number | null): { label: string; cls: string } {
    if (score == null) return { label: "—", cls: "" };
    if (score >= 80) return { label: `${score}`, cls: "hot" };
    if (score >= 65) return { label: `${score}`, cls: "warm" };
    if (score >= 40) return { label: `${score}`, cls: "cool" };
    return { label: `${score}`, cls: "cold" };
}

function fmtDuration(s: number | null) {
    if (s == null) return "—";
    return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

function fmtTime(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function statusBadge(status: string, outcome: string | null) {
    if (status === "in-progress") return <span className="badge badge-live">● Live</span>;
    if (outcome === "callback") return <span className="badge badge-callback">Callback</span>;
    return <span className={`badge ${styles.statusNeutral}`}>{status}</span>;
}

function emotionBadge(score: number | null) {
    if (score == null) return <span className={styles.emotionNeutral}>—</span>;
    if (score > 0) return <span className={styles.emotionPositive}>Positive</span>;
    if (score < 0) return <span className={styles.emotionNegative}>Negative</span>;
    return <span className={styles.emotionNeutral}>Neutral</span>;
}

interface Props {
    calls: Call[];
    total: number;
    page: number;
    onPageChange: (p: number) => void;
    onSelectCall: (call: Call) => void;
    selectedCallId: string | null;
    loading?: boolean;
}

export function CallsTable({
    calls,
    total,
    page,
    onPageChange,
    onSelectCall,
    selectedCallId,
    loading,
}: Props) {
    const pageSize = 10;
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className={`glass ${styles.wrapper}`}>
            <div className={styles.tableHeader}>
                <span className="section-title" style={{ marginBottom: 0 }}>
                    Recent Calls
                </span>
                <span className={styles.count}>{total.toLocaleString()} total</span>
            </div>

            <div className={styles.tableScroll}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Number</th>
                            <th>Provider</th>
                            <th>Status</th>
                            <th>Lead</th>
                            <th>Emotion</th>
                            <th>Duration</th>
                            <th>Time</th>
                            <th>Summary</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className={styles.skeletonRow}>
                                    {Array.from({ length: 6 }).map((__, j) => (
                                        <td key={j}><div className={styles.skeletonCell} /></td>
                                    ))}
                                </tr>
                            ))
                            : calls.map((call) => {
                                const score = scoreLabel(call.lead_score);
                                const isSelected = call.id === selectedCallId;
                                return (
                                    <tr
                                        key={call.id}
                                        className={`${styles.row} ${isSelected ? styles.selected : ""}`}
                                        onClick={() => onSelectCall(call)}
                                        title="Click to view transcript"
                                    >
                                        <td className={styles.number}>
                                            {call.customer_number ?? "—"}
                                        </td>
                                        <td>
                                            <span className={styles.providerBadge}>{call.provider ?? "—"}</span>
                                        </td>
                                        <td>{statusBadge(call.status, call.outcome)}</td>
                                        <td>
                                            <span className={`badge badge-${score.cls}`}>
                                                {score.label}
                                            </span>
                                        </td>
                                        <td>{emotionBadge(call.emotion_score ?? null)}</td>
                                        <td className={styles.mono}>{fmtDuration(call.duration_seconds)}</td>
                                        <td className={styles.mono}>{fmtTime(call.started_at)}</td>
                                        <td className={styles.summary}>
                                            {call.summary?.slice(0, 70) ?? (
                                                <span style={{ color: "var(--muted)" }}>No summary yet</span>
                                            )}
                                            {(call.summary?.length ?? 0) > 70 ? "…" : ""}
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        disabled={page === 0}
                        onClick={() => onPageChange(page - 1)}
                    >
                        ← Prev
                    </button>
                    <span className={styles.pageInfo}>
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        className={styles.pageBtn}
                        disabled={page >= totalPages - 1}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
