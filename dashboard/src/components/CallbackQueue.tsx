"use client";
import { useState } from "react";
import styles from "./CallbackQueue.module.css";
import { updateCallbackStatus } from "@/lib/queries";
import type { CallbackQueueItem } from "@/lib/types";

const STATUS_CYCLE: Record<
    CallbackQueueItem["status"],
    CallbackQueueItem["status"]
> = {
    pending: "completed",
    completed: "cancelled",
    cancelled: "pending",
};

const STATUS_CONFIG = {
    pending: { label: "Pending", cls: styles.pending },
    completed: { label: "Done", cls: styles.completed },
    cancelled: { label: "Cancelled", cls: styles.cancelled },
};

const PRIORITY_CONFIG = {
    urgent: { label: "Urgent", cls: styles.urgent },
    high: { label: "High", cls: styles.high },
    normal: { label: "Normal", cls: styles.normal },
    low: { label: "Low", cls: styles.low },
};

function fmtAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
    items: CallbackQueueItem[];
}

export function CallbackQueue({ items: initialItems }: Props) {
    const [items, setItems] = useState(initialItems);
    const [toggling, setToggling] = useState<string | null>(null);

    async function toggle(id: string, current: CallbackQueueItem["status"]) {
        const next = STATUS_CYCLE[current];
        setToggling(id);
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: next } : item))
        );
        await updateCallbackStatus(id, next);
        setToggling(null);
    }

    const pending = items.filter((i) => i.status === "pending").length;

    return (
        <div className={`glass ${styles.wrapper}`}>
            <div className={styles.header}>
                <span className="section-title" style={{ marginBottom: 0 }}>
                    Callback Queue
                </span>
                {pending > 0 && (
                    <span className={styles.pendingPill}>{pending} pending</span>
                )}
            </div>

            <div className={styles.list}>
                {items.length === 0 ? (
                    <div className={styles.empty}>No callbacks queued</div>
                ) : (
                    items.map((item, i) => {
                        const sc = STATUS_CONFIG[item.status];
                        const pc = PRIORITY_CONFIG[item.priority];
                        return (
                            <div
                                key={item.id}
                                className={`${styles.item} fade-up`}
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className={styles.itemHeader}>
                                    <span className={styles.phone}>
                                        {item.customer_number ?? "Unknown"}
                                    </span>
                                    <span className={`${styles.priorityBadge} ${pc.cls}`}>
                                        {pc.label}
                                    </span>
                                </div>

                                <p className={styles.reason}>{item.reason}</p>

                                {item.call?.lead_score != null && (
                                    <div className={styles.score}>
                                        Lead score:{" "}
                                        <strong style={{ color: item.call.lead_score >= 70 ? "var(--score-hot)" : item.call.lead_score >= 50 ? "var(--score-warm)" : "var(--score-cold)" }}>
                                            {item.call.lead_score}
                                        </strong>
                                    </div>
                                )}

                                <div className={styles.itemFooter}>
                                    <span className={styles.ago}>
                                        {item.requested_at ? fmtAgo(item.requested_at) : "—"}
                                    </span>
                                    <button
                                        className={`${styles.statusBtn} ${sc.cls}`}
                                        onClick={() => toggle(item.id, item.status)}
                                        disabled={toggling === item.id}
                                        title="Click to advance status"
                                    >
                                        {sc.label}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
