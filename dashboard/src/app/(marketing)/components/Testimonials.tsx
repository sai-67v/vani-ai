"use client";
import { ScrollReveal } from "./ScrollReveal";
import { motion } from "framer-motion";

const quotes = [
    {
        name: "Evelyn Shaw",
        role: "Head of CX, Atlas Solar",
        quote: "We launched a voice agent in 10 days. Latency, QA, and routing were all handled out of the box.",
    },
    {
        name: "Kiran Patel",
        role: "CTO, FreightLine",
        quote: "The developer ergonomics feel like using Framer for voice. Our team ships flows before lunch.",
    },
    {
        name: "Marcos Diaz",
        role: "Product, Helio Health",
        quote: "Sentiment and escalation rules made compliance simple. The analytics are the best we've seen.",
    },
];

export function Testimonials() {
    return (
        <section id="testimonials" className="px-6 py-16">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-3">
                    <ScrollReveal className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Testimonials</ScrollReveal>
                    <ScrollReveal className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
                        Loved by builders shipping AI voice
                    </ScrollReveal>
                </div>
                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    {quotes.map((item, idx) => (
                        <ScrollReveal key={item.name} delay={idx * 0.08} className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 hover-lift">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
                            <motion.div className="relative space-y-4" whileHover={{ y: -2 }}>
                                <p className="text-sm text-white/70">“{item.quote}”</p>
                                <div className="text-sm font-semibold text-white">{item.name}</div>
                                <div className="text-xs text-white/60">{item.role}</div>
                            </motion.div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
