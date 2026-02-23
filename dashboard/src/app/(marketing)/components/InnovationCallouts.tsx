"use client";
import { ScrollReveal } from "./ScrollReveal";
import { motion } from "framer-motion";
import { Sparkle, ShieldCheck, GitBranch, Gauge } from "lucide-react";

const callouts = [
    {
        title: "Trust-grade safety",
        body: "Policy-aware LLM responses, profanity filters, and automated redaction keep every transcript compliant.",
        icon: ShieldCheck,
        accent: "from-raycast-blue/30 via-white/5 to-transparent",
    },
    {
        title: "Observability by default",
        body: "Frame-level metrics, latency histograms, and live traces for every call session.",
        icon: Gauge,
        accent: "from-raycast-red/30 via-white/5 to-transparent",
    },
    {
        title: "Adaptive orchestration",
        body: "Switch models mid-call, fail over providers, and route callbacks based on intent or sentiment.",
        icon: GitBranch,
        accent: "from-calories-lime/30 via-white/5 to-transparent",
    },
    {
        title: "Production-minded UX",
        body: "Command Palette controls, keyboard-first navigation, and programmable hotkeys inspired by Raycast.",
        icon: Sparkle,
        accent: "from-white/30 via-white/5 to-transparent",
    },
];

export function InnovationCallouts() {
    return (
        <section id="innovation" className="px-6 py-16">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-3">
                    <ScrollReveal className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Innovation</ScrollReveal>
                    <ScrollReveal className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
                        Built with the same craft as the best Framer launches
                    </ScrollReveal>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    {callouts.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <ScrollReveal
                                key={item.title}
                                delay={idx * 0.06}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 hover-lift"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-60`} aria-hidden />
                                <div className="relative flex items-start gap-4">
                                    <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-black/40 text-white">
                                        <Icon size={22} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                        <p className="text-sm text-white/70">{item.body}</p>
                                    </div>
                                    <motion.div
                                        className="ml-auto h-9 rounded-full border border-white/10 px-3 text-xs font-semibold text-white/70"
                                        whileHover={{ x: 4 }}
                                    >
                                        Scroll reveal
                                    </motion.div>
                                </div>
                            </ScrollReveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
