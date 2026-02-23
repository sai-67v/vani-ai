"use client";
import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Play, Sparkles, Headphones, Activity } from "lucide-react";

const cards = [
    {
        title: "Live call",
        metric: "00:48",
        badge: "Streaming",
        accent: "from-raycast-blue/30 to-white/5",
    },
    {
        title: "Sentiment",
        metric: "+0.82",
        badge: "Positive",
        accent: "from-calories-lime/30 to-white/5",
    },
    {
        title: "Latency",
        metric: "220 ms",
        badge: "LLM",
        accent: "from-raycast-red/30 to-white/5",
    },
];

export function DemoPreview() {
    return (
        <section id="demo" className="px-6 py-16">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-3">
                    <ScrollReveal className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Interactive demo</ScrollReveal>
                    <ScrollReveal className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
                        Play with the control surface before you integrate
                    </ScrollReveal>
                </div>

                <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
                    <ScrollReveal className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/2 to-black/40 p-6 shadow-2xl shadow-black/40">
                        <div className="absolute inset-0 hero-gradient opacity-60" aria-hidden />
                        <div className="grain-overlay" aria-hidden />
                        <div className="relative flex items-center justify-between gap-4 text-sm text-white/70">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1">
                                <Headphones size={16} /> Live assist
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1">
                                <Activity size={16} /> Auto QA on
                            </div>
                        </div>

                        <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
                            <motion.div
                                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30"
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center gap-3 text-white">
                                    <div className="h-10 w-10 rounded-xl bg-white/10 grid place-items-center">
                                        <Sparkles size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Intent</p>
                                        <p className="text-xs text-white/60">"Upgrade plan"</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2 text-xs text-white/70">
                                    <p>Confidence 0.92 · CC score 87</p>
                                    <p>Next action: open billing service and push callback</p>
                                </div>
                                <div className="mt-4 inline-flex gap-2 text-[11px] font-semibold text-white/70">
                                    <span className="rounded-full bg-white/10 px-3 py-1">LLM guardrails</span>
                                    <span className="rounded-full bg-white/10 px-3 py-1">Safety filters</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30"
                                whileHover={{ y: -4 }}
                                drag
                                dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
                            >
                                <div className="flex items-center justify-between text-sm text-white/70">
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Waveform</span>
                                    <span className="text-lime-200">Stable</span>
                                </div>
                                <div className="mt-3 h-24 rounded-xl bg-gradient-to-r from-white/10 via-white/5 to-white/10" />
                                <p className="mt-3 text-xs text-white/60">ASR + VAD running in parallel. Auto-fallback to telephony.</p>
                            </motion.div>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3 text-sm text-white/70">
                            <div className="flex items-center gap-3">
                                <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover-lift">
                                    <Play size={16} /> Play sample
                                </button>
                                <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover-lift">
                                    Transcript
                                </button>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                                Live QA · CTR glow on
                            </div>
                        </div>
                    </ScrollReveal>

                    <div className="space-y-4">
                        {cards.map((card, idx) => (
                            <ScrollReveal key={card.title} delay={idx * 0.08} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 hover-lift">
                                <div className={`rounded-xl bg-gradient-to-br ${card.accent} p-4`}> 
                                    <div className="flex items-center justify-between text-xs text-white/70">
                                        <span className="rounded-full bg-white/10 px-3 py-1">{card.badge}</span>
                                        <span>Step {idx + 1}</span>
                                    </div>
                                    <div className="mt-3 flex items-end justify-between">
                                        <div>
                                            <p className="text-sm text-white/70">{card.title}</p>
                                            <p className="text-2xl font-semibold text-white">{card.metric}</p>
                                        </div>
                                        <motion.div
                                            className="h-16 w-16 rounded-2xl border border-white/10 bg-black/40"
                                            whileHover={{ rotate: 6, scale: 1.05 }}
                                        />
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
