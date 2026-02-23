"use client";
import { motion } from "framer-motion";
import { FloatingShape } from "./FloatingShape";
import { ScrollReveal } from "./ScrollReveal";
import { CallCard } from "@/components/ui/CallCard";

export function Hero() {
    return (
        <section id="hero" className="relative overflow-hidden px-6 pb-20 pt-16 sm:pb-28 sm:pt-20">
            <div className="absolute inset-0 blur-3xl opacity-70" aria-hidden>
                <FloatingShape className="left-[-6%] top-[-8%]" />
                <FloatingShape className="right-[-8%] top-[24%] opacity-70" />
            </div>
            <div className="grain-overlay" aria-hidden />
            <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 md:flex-row md:items-center">
                <div className="flex-1 space-y-6">
                    <ScrollReveal className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 type-overline text-white/70">
                        <span className="h-2 w-2 rounded-full bg-raycast-red shadow-[0_0_0_6px_rgba(255,99,99,0.25)]" />
                        Realtime voice · Analytics · Routing
                    </ScrollReveal>

                    <ScrollReveal className="space-y-4">
                        <motion.h1
                            className="type-display1 text-white"
                            transition={{ duration: 0.6, ease: [0.2, 0.9, 0.3, 1] }}
                        >
                            Command-grade voice intelligence built for teams and developers
                        </motion.h1>
                        <motion.p className="type-body-base max-w-2xl text-white/70">
                            Capture every customer signal, route the perfect response, and ship AI-first voice products faster with a production-ready platform.
                        </motion.p>
                    </ScrollReveal>

                    <div className="flex flex-wrap items-center gap-3">
                        <motion.a
                            href="/dashboard"
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="hover-lift cta-glow-pulse inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-glow-cta"
                        >
                            Launch live demo
                            <span className="text-base">→</span>
                        </motion.a>
                        <motion.a
                            href="#pricing"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 hover:border-white/30 hover:text-white hover-lift"
                        >
                            See pricing
                        </motion.a>
                    </div>

                    {/* ── Live number CTA ─── */}
                    <CallCard compact />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[{
                            label: "Latency",
                            value: "220 ms",
                            desc: "avg response to first token"
                        }, {
                            label: "Coverage",
                            value: "32 languages",
                            desc: "global-ready voice"
                        }, {
                            label: "Reliability",
                            value: "99.9%",
                            desc: "uptime SLA for prod"
                        }].map((stat) => (
                            <ScrollReveal key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 hover-lift">
                                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/50">{stat.label}</p>
                                <p className="mt-1 text-2xl font-semibold text-white">{stat.value}</p>
                                <p className="text-sm text-white/60">{stat.desc}</p>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>

                <ScrollReveal className="relative flex-1">
                    <div className="absolute left-[10%] top-[-8%] h-24 w-24 rounded-full bg-raycast-blue/40 blur-3xl" aria-hidden />
                    <div className="absolute right-[4%] top-[20%] h-28 w-28 rounded-full bg-raycast-red/35 blur-3xl" aria-hidden />
                    <motion.div
                        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 via-white/2 to-[#0B0B0F] shadow-2xl shadow-black/30"
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="absolute left-4 top-4 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold text-white/80 backdrop-blur">
                            Gem 3.1 Pro · AI render
                        </div>
                        <div className="relative flex h-[360px] items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 hero-gradient opacity-70" aria-hidden />
                            <div className="grain-overlay" aria-hidden />
                            <motion.div
                                className="relative grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur"
                                animate={{ rotateX: [0, 10, 0], rotateY: [0, -8, 0] }}
                                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="flex items-center justify-between text-xs text-white/70">
                                    <span className="rounded-full bg-white/10 px-3 py-1">Live agent</span>
                                    <span className="text-lime-200">Streaming...</span>
                                </div>
                                <div className="space-y-3 rounded-xl border border-white/5 bg-black/50 p-4 text-sm text-white/80">
                                    <p className="text-white">“Hi! I noticed your billing cycle resets next week. Want me to add analytics for your new region?”</p>
                                    <div className="flex items-center gap-3 text-xs text-white/60">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">🎙️</span>
                                        <div>
                                            <p className="font-semibold text-white">Vani Voice</p>
                                            <p>LLM-guided · Real-time</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-xs text-white/70">
                                    {["Sentiment: +0.82", "Live ASR", "Latency: 220ms", "Callbacks: On"]
                                        .map((item) => (
                                            <div key={item} className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                                                {item}
                                            </div>
                                        ))}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </ScrollReveal>
            </div>
        </section>
    );
}
