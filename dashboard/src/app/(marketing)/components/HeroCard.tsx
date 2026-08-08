"use client";

import { motion } from "framer-motion";

/**
 * HeroCard — the heavy 3D-animated mockup panel on the right side of the Hero.
 *
 * This is dynamically imported (ssr: false) from Hero.tsx so that Framer Motion's
 * JS bundle does NOT block the LCP element (the h1 heading) from rendering.
 * It only starts loading after the main thread is idle.
 */
export default function HeroCard() {
    return (
        <motion.div
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 via-white/2 to-[#0B0B0F] shadow-2xl shadow-black/30"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="absolute left-4 top-4 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold text-white/80 backdrop-blur">
                Gem 3.1 Pro · AI render
            </div>
            <div className="relative flex h-[360px] items-center justify-center overflow-hidden">
                <div className="absolute inset-0 hero-gradient opacity-70" aria-hidden="true" />
                <div className="grain-overlay" aria-hidden="true" />
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
                        <p className="text-white">
                            "Hi! I noticed your billing cycle resets next week. Want me to add analytics for your new region?"
                        </p>
                        <div className="flex items-center gap-3 text-xs text-white/60">
                            <span
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
                                aria-hidden="true"
                            >
                                🎙️
                            </span>
                            <div>
                                <p className="font-semibold text-white">Vani Voice</p>
                                <p>LLM-guided · Real-time</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-white/70" aria-label="Live metrics">
                        {["Sentiment: +0.82", "Live ASR", "Latency: 220ms", "Callbacks: On"].map(
                            (item) => (
                                <div key={item} className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                                    {item}
                                </div>
                            )
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
