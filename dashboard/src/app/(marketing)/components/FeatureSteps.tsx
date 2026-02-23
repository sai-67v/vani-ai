"use client";
import { motion } from "framer-motion";
import { Brain, Workflow, Sparkles } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const steps = [
    {
        title: "Listen & understand",
        description: "ASR tuned for messy real-world calls with semantic enrichment and diarization baked in.",
        icon: Sparkles,
    },
    {
        title: "Reason & route",
        description: "LLM-driven call flows with guardrails, confidence bands, and policy-aware decisioning.",
        icon: Brain,
    },
    {
        title: "Act in real time",
        description: "Trigger webhooks, callbacks, and downstream APIs with sub-second latency SLAs.",
        icon: Workflow,
    },
];

export function FeatureSteps() {
    return (
        <section id="features" className="px-6 py-16">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-3">
                    <ScrollReveal className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Feature stack</ScrollReveal>
                    <ScrollReveal className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
                        Three steps to ship a production-ready voice AI flow
                    </ScrollReveal>
                </div>
                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <ScrollReveal key={step.title} delay={idx * 0.08} className="group h-full rounded-2xl border border-white/10 bg-white/5 p-6 hover-lift">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                                        <Icon size={22} />
                                    </div>
                                    <motion.span
                                        className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70"
                                        whileHover={{ x: 4 }}
                                    >
                                        Step {idx + 1}
                                    </motion.span>
                                </div>
                                <h3 className="mt-5 text-xl font-semibold text-white">{step.title}</h3>
                                <p className="mt-3 text-sm text-white/70">{step.description}</p>
                            </ScrollReveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
