"use client";
import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { Check } from "lucide-react";

const tiers = [
    {
        name: "Starter",
        price: "$0",
        cadence: "/month",
        highlight: false,
        features: ["500 minutes included", "Webhook callbacks", "Email support"],
    },
    {
        name: "Pro",
        price: "$89",
        cadence: "/month",
        highlight: true,
        features: ["Unlimited minutes", "LLM guardrails", "Live analytics", "Priority support"],
    },
    {
        name: "Enterprise",
        price: "Custom",
        cadence: "",
        highlight: false,
        features: ["Dedicated cluster", "SAML/SSO", "Custom SLAs", "On-call AM"],
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="px-6 py-16">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-3">
                    <ScrollReveal className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Pricing</ScrollReveal>
                    <ScrollReveal className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
                        Start free, scale with production SLAs
                    </ScrollReveal>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {tiers.map((tier, idx) => (
                        <ScrollReveal key={tier.name} delay={idx * 0.06} className={`relative rounded-2xl border border-white/10 bg-white/5 p-6 hover-lift ${tier.highlight ? "shadow-glow-cta" : ""}`}>
                            {tier.highlight && (
                                <div className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                                    Most popular
                                </div>
                            )}
                            <div className="space-y-2">
                                <p className="text-lg font-semibold text-white">{tier.name}</p>
                                <p className="text-3xl font-bold text-white">{tier.price}<span className="text-base font-medium text-white/70">{tier.cadence}</span></p>
                                <p className="text-sm text-white/60">Everything you need to ship reliable voice experiences.</p>
                            </div>
                            <ul className="mt-5 space-y-2 text-sm text-white/75">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <span className="text-calories-lime"><Check size={16} /></span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <motion.a
                                href="#cta"
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold hover-lift ${
                                    tier.highlight
                                        ? "bg-white text-black shadow-glow-cta cta-glow-pulse"
                                        : "border border-white/15 bg-white/5 text-white"
                                }`}
                            >
                                {tier.highlight ? "Start Pro" : "Talk to us"}
                            </motion.a>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
