"use client";
import styles from "./KpiCards.module.css";
import type { KpiData } from "@/lib/types";

function formatDuration(secs: number) {
    const m = Math.floor(secs / 60);
    const s = String(secs % 60).padStart(2, "0");
    return `${m}m ${s}s`;
}

interface Props {
    data: KpiData;
    loading?: boolean;
}

const cards = (data: KpiData) => [
    {
        label: "Total Calls",
        value: data.totalCalls.toLocaleString(),
        icon: "📞",
        color: "blue",
        sub: "All time",
    },
    {
        label: "Qualified Leads",
        value: data.qualified.toLocaleString(),
        icon: "🔥",
        color: "rose",
        sub: "Score ≥ 65 or callback",
    },
    {
        label: "Callbacks Pending",
        value: data.callbacksPending.toLocaleString(),
        icon: "⏳",
        color: "amber",
        sub: "Awaiting follow-up",
    },
    {
        label: "Avg Duration",
        value: formatDuration(data.avgDurationSeconds),
        icon: "⏱",
        color: "purple",
        sub: "Per completed call",
    },
];

export function KpiCards({ data, loading }: Props) {
    return (
        <div className={styles.grid}>
            {cards(data).map((card, i) => (
                <div
                    key={card.label}
                    className={`${styles.card} ${styles[card.color]} glass fade-up`}
                    style={{ animationDelay: `${i * 60}ms` }}
                >
                    <div className={styles.icon}>{card.icon}</div>
                    <div className={styles.body}>
                        <div className={styles.label}>{card.label}</div>
                        <div className={loading ? styles.skeleton : styles.value}>
                            {loading ? "" : card.value}
                        </div>
                        <div className={styles.sub}>{card.sub}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
