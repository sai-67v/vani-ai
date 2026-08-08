"use client";

import React from "react";
import type { CallInsight } from "@/lib/types";
import { Smile, Target, BrainCircuit, Lightbulb, Loader2 } from "lucide-react";
import styles from "./InsightBadges.module.css";

interface InsightBadgesProps {
    insight: CallInsight | null;
    loading: boolean;
}

export function InsightBadges({ insight, loading }: InsightBadgesProps) {
    if (loading && !insight) {
        // Skeleton state exactly following react-ui-patterns
        return (
            <div className={`${styles.container} ${styles.loadingSkeleton}`}>
                <div className="flex items-center gap-2 text-muted-text text-sm mb-2">
                    <Loader2 size={16} className="animate-spin" /> Analyzing caller insights...
                </div>
            </div>
        );
    }

    if (!insight) {
        return null; // Don't show anything if no data and not loading
    }

    // Colors for lead score
    let scoreColor = "var(--theme-primary)";
    if (insight.lead_score && insight.lead_score >= 70) scoreColor = "#4ade80";
    else if (insight.lead_score && insight.lead_score < 40) scoreColor = "#f87171";

    return (
        <div className={styles.container}>
            {/* Lead Score */}
            <div className={styles.badge}>
                <div
                    className={styles.leadScoreRing}
                    style={{ borderColor: scoreColor, border: `2px solid ${scoreColor}`, color: scoreColor }}
                >
                    {insight.lead_score || "--"}
                </div>
                <div className="flex flex-col">
                    <span className={styles.label}>Lead Score</span>
                </div>
            </div>

            {/* Emotion */}
            <div className={styles.badge}>
                <Smile size={16} strokeWidth={1.5} style={{ color: "var(--theme-accent-1)" }} />
                <div className="flex flex-col">
                    <span className={styles.label}>Emotion</span>
                    <span className={styles.value} style={{ textTransform: "capitalize" }}>
                        {insight.emotion || "Neutral"}
                    </span>
                </div>
            </div>

            {/* Intent */}
            <div className={styles.badge}>
                <Target size={16} strokeWidth={1.5} style={{ color: "var(--theme-accent-2)" }} />
                <div className="flex flex-col">
                    <span className={styles.label}>Intent</span>
                    <span className={styles.value} style={{ textTransform: "capitalize" }}>
                        {insight.intent || "Unknown"}
                    </span>
                </div>
            </div>

            {/* Next Best Action */}
            {insight.next_best_action && (
                <div className={styles.actionCard}>
                    <div className={styles.actionLabel}>
                        <Lightbulb size={14} /> Next Best Action
                    </div>
                    <div className={styles.actionValue}>
                        {insight.next_best_action}
                    </div>
                </div>
            )}

            {/* Live Indicator if not final */}
            {!insight.is_final && (
                <div className="w-full text-xs text-muted-text flex items-center justify-end gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-theme-primary animate-pulse" />
                    Live analysis in progress
                </div>
            )}
        </div>
    );
}
