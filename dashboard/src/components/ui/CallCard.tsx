"use client";

import { useState } from "react";
import { Phone, Copy, Check } from "lucide-react";

const RAW_NUMBER = "+15822335881"; // E.164
const DISPLAY_NUMBER = "+1 (582) 233-5881";

export function CallCard({ compact = false }: { compact?: boolean }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(RAW_NUMBER).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (compact) {
        return (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                <Phone size={14} className="text-lime-300" />
                <a href={`tel:${RAW_NUMBER}`} className="font-mono font-semibold hover:text-white transition-colors">
                    {DISPLAY_NUMBER}
                </a>
                <button
                    onClick={handleCopy}
                    title="Copy number"
                    className="text-white/40 hover:text-white transition-colors"
                >
                    {copied ? <Check size={13} className="text-lime-300" /> : <Copy size={13} />}
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur hover-lift transition-all">
            <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-300/10 border border-lime-300/20">
                    <Phone size={16} className="text-lime-300" />
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/50">Try it live</p>
                    <p className="text-sm font-semibold text-white">Call our AI</p>
                </div>
            </div>

            <a
                href={`tel:${RAW_NUMBER}`}
                className="block font-mono text-xl font-bold text-white hover:text-lime-200 transition-colors mb-3"
            >
                {DISPLAY_NUMBER}
            </a>

            <div className="flex items-center gap-2">
                <a
                    href={`tel:${RAW_NUMBER}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-white text-black text-xs font-semibold py-2 hover:bg-lime-100 transition-colors"
                >
                    <Phone size={13} /> Call now
                </a>
                <button
                    onClick={handleCopy}
                    title="Copy number"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                    {copied ? <><Check size={13} className="text-lime-300" /> Copied!</> : <><Copy size={13} /> Copy</>}
                </button>
            </div>
        </div>
    );
}
