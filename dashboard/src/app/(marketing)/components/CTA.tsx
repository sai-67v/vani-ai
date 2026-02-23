"use client";
import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

export function CTA() {
    return (
        <section id="cta" className="px-6 pb-20">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-raycast-blue/25 via-white/10 to-raycast-red/25 p-8 shadow-2xl shadow-black/40">
                <div className="grain-overlay" aria-hidden />
                <div className="relative grid gap-6 md:grid-cols-[2fr_1fr] md:items-center">
                    <ScrollReveal className="space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Let’s ship</p>
                        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Ready to launch a production-ready voice AI?</h2>
                        <p className="text-sm text-white/70">Get a guided walkthrough, wire up your first callback, and watch the demo environment route live audio in seconds.</p>
                    </ScrollReveal>
                    <div className="flex flex-col gap-3 md:items-end">
                        <motion.a
                            href="/dashboard"
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-black shadow-glow-cta cta-glow-pulse hover-lift md:w-auto"
                        >
                            Launch live demo
                        </motion.a>
                        <motion.a
                            href="#developer"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full rounded-full border border-white/15 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-white/80 hover-lift md:w-auto"
                        >
                            View docs & SDKs
                        </motion.a>
                    </div>
                </div>
            </div>
        </section>
    );
}
