"use client";
import styles from "./KpiCards.module.css";
import type { KpiData } from "@/lib/types";
import { Phone, Flame, Clock, Timer } from "lucide-react";

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
        icon: <Phone size={18} color="#818cf8" />,
        color: "primary",
        sub: "All time",
    },
    {
        label: "Qualified Leads",
        value: data.qualified.toLocaleString(),
        icon: <Flame size={18} color="#fbbf24" />,
        color: "warn",
        sub: "Score ≥ 65 or callback",
    },
    {
        label: "Callbacks Pending",
        value: data.callbacksPending.toLocaleString(),
        icon: <Clock size={18} color="#ef4444" />,
        color: "danger",
        sub: "Awaiting follow-up",
    },
    {
        label: "Avg Duration",
        value: formatDuration(data.avgDurationSeconds),
        icon: <Timer size={18} color="#34d399" />,
        color: "accent",
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
                    <div className={styles.header}>
                        <div className={styles.label}>{card.label}</div>
                        <div className={styles.icon}>{card.icon}</div>
                    </div>
                    <div className={styles.body}>
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
