"use client";
import dynamic from "next/dynamic";
import { FloatingShape } from "./FloatingShape";
import { ScrollReveal } from "./ScrollReveal";
import { CallCard } from "@/components/ui/CallCard";

// Lazy-load the heavy animated card — it is below the LCP element, defer its JS
const HeroCard = dynamic(() => import("./HeroCard"), {
    ssr: false,
    loading: () => (
        <div className="h-[360px] w-full rounded-3xl border border-white/10 bg-white/5 animate-pulse" />
    ),
});

const STATS = [
    { label: "Latency",     value: "220 ms",      desc: "avg response to first token" },
    { label: "Coverage",    value: "32 languages", desc: "global-ready voice"          },
    { label: "Reliability", value: "99.9%",        desc: "uptime SLA for prod"         },
] as const;

export function Hero() {
    return (
        <section id="hero" aria-label="Hero" className="relative overflow-hidden px-6 pb-20 pt-16 sm:pb-28 sm:pt-20">
            {/* Decorative blobs — hidden from AT */}
            <div className="absolute inset-0 blur-3xl opacity-70" aria-hidden="true">
                <FloatingShape className="left-[-6%] top-[-8%]" />
                <FloatingShape className="right-[-8%] top-[24%] opacity-70" />
            </div>
            <div className="grain-overlay" aria-hidden="true" />

            <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 md:flex-row md:items-center">
                {/* ── Left column ─────────────────────────────────────────── */}
                <div className="flex-1 space-y-6">
                    <ScrollReveal className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 type-overline text-white/70">
                        <span className="h-2 w-2 rounded-full bg-raycast-red shadow-[0_0_0_6px_rgba(255,99,99,0.25)]" aria-hidden="true" />
                        Realtime voice · Analytics · Routing
                    </ScrollReveal>

                    {/*
                     * LCP ELEMENT — static h1, no JS required.
                     * Do NOT wrap in motion.h1; it delays hydration and hurts LCP.
                     */}
                    <div className="space-y-4">
                        <h1 className="type-display1 text-white leading-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-mint to-cyan-400 font-extrabold tracking-tight filter drop-shadow-[0_0_12px_rgba(20,184,166,0.5)]">
                                VAANI AI
                            </span>
                            <br />
                            The ultimate voice agent engine for modern teams.
                        </h1>
                        <p className="type-body-base max-w-2xl text-white/70">
                            Capture every customer signal, route the perfect response, and ship AI-first voice products faster with a production-ready platform.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <a
                            href="/dashboard"
                            className="hover-lift cta-glow-pulse inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-glow-cta"
                        >
                            Launch live demo
                            <span className="text-base" aria-hidden="true">→</span>
                        </a>
                        <a
                            href="#pricing"
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 hover:border-white/30 hover:text-white hover-lift"
                        >
                            See pricing
                        </a>
                    </div>

                    {/* Live number CTA */}
                    <div className="pt-1">
                        <CallCard compact />
                    </div>

                    {/* Stats grid */}
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {STATS.map((stat) => (
                            <ScrollReveal
                                key={stat.label}
                                className="rounded-2xl border border-white/10 bg-white/5 p-4 hover-lift"
                            >
                                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-white/50">{stat.label}</dt>
                                <dd className="mt-1 text-2xl font-semibold text-white">{stat.value}</dd>
                                <p className="text-sm text-white/60">{stat.desc}</p>
                            </ScrollReveal>
                        ))}
                    </dl>
                </div>

                {/* ── Right column: lazy 3D card ───────────────────────── */}
                <ScrollReveal className="relative flex-1">
                    <div className="absolute left-[10%] top-[-8%] h-24 w-24 rounded-full bg-raycast-blue/40 blur-3xl" aria-hidden="true" />
                    <div className="absolute right-[4%] top-[20%] h-28 w-28 rounded-full bg-raycast-red/35 blur-3xl" aria-hidden="true" />
                    <HeroCard />
                </ScrollReveal>
            </div>
        </section>
    );
}
