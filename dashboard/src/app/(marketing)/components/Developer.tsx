"use client";
import { ScrollReveal } from "./ScrollReveal";
import { motion } from "framer-motion";
import { FileCode, BookOpen, TerminalSquare } from "lucide-react";

export function Developer() {
    return (
        <section id="developer" className="px-6 py-16">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-3">
                    <ScrollReveal className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Developers</ScrollReveal>
                    <ScrollReveal className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
                        Docs, SDKs, and APIs that feel modern
                    </ScrollReveal>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                    <ScrollReveal className="rounded-2xl border border-white/10 bg-white/5 p-6 hover-lift">
                        <div className="flex items-center gap-3 text-white">
                            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">
                                <TerminalSquare size={20} />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">Quickstart</p>
                                <p className="text-sm text-white/70">Add the SDK and stream a call in minutes.</p>
                            </div>
                        </div>
                        <div className="mt-4 rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-sm text-white/80">
{`npm i @vani/sdk

import { VaniClient } from "@vani/sdk";

const client = new VaniClient({ apiKey: process.env.VANI_KEY });

await client.calls.create({
  caller: "+1 415 555 0132",
  intent: "upgrade_plan",
  callbackUrl: "https://api.yourapp.com/callbacks",
});`}
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
                            <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">TypeScript</span>
                            <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">REST & Webhooks</span>
                        </div>
                    </ScrollReveal>

                    <div className="space-y-4">
                        <ScrollReveal className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 hover-lift">
                            <div>
                                <p className="text-lg font-semibold text-white">API Reference</p>
                                <p className="text-sm text-white/70">Versioned docs with OpenAPI, examples, and SDK snippets.</p>
                            </div>
                            <motion.div whileHover={{ x: 6 }} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                                <BookOpen size={16} />
                            </motion.div>
                        </ScrollReveal>
                        <ScrollReveal className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 hover-lift">
                            <div>
                                <p className="text-lg font-semibold text-white">Cookbooks</p>
                                <p className="text-sm text-white/70">Samples for concierge, collections, and support flows.</p>
                            </div>
                            <motion.div whileHover={{ x: 6 }} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                                <FileCode size={16} />
                            </motion.div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>
    );
}
