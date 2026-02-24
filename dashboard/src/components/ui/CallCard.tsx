"use client";

import { useEffect, useMemo, useState } from "react";
import { Phone, Copy, Check } from "lucide-react";

export function CallCard({ compact = false }: { compact?: boolean }) {
    const [copied, setCopied] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">("loading");

    useEffect(() => {
        let active = true;
        const load = async () => {
            setStatus("loading");
            try {
                const res = await fetch("/api/twilio/number", { cache: "no-store" });
                if (!res.ok) throw new Error(`status_${res.status}`);
                const data = await res.json();
                const value = typeof data?.number === "string" ? data.number.trim() : "";
                if (!active) return;
                if (value) {
                    setPhoneNumber(value);
                    setStatus("ready");
                } else {
                    setStatus("empty");
                }
            } catch (err) {
                if (!active) return;
                console.error("[CallCard] failed to load number", err);
                setStatus("error");
            }
        };
        load();
        return () => {
            active = false;
        };
    }, []);

    const rawNumber = phoneNumber || "";
    const displayNumber = useMemo(() => formatPhone(rawNumber), [rawNumber]);
    const canCopy = Boolean(rawNumber) && status === "ready";

    const handleCopy = () => {
        if (!canCopy) return;
        navigator.clipboard.writeText(rawNumber).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch((err) => {
            console.error("[CallCard] copy failed", err);
        });
    };

    const isLoading = status === "loading";
    const isUnavailable = status === "empty" || status === "error";
    const numberLabel = isLoading
        ? "Loading number..."
        : isUnavailable
            ? "Number unavailable"
            : displayNumber;

    if (compact) {
        return (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                <Phone size={14} className="text-lime-300" />
                {canCopy ? (
                    <a href={`tel:${rawNumber}`} className="font-mono font-semibold hover:text-white transition-colors">
                        {numberLabel}
                    </a>
                ) : (
                    <span className={`font-mono font-semibold ${isLoading ? "animate-pulse text-white/60" : "text-white/50"}`}>
                        {numberLabel}
                    </span>
                )}
                <button
                    onClick={handleCopy}
                    title="Copy number"
                    className={`text-white/40 transition-colors ${canCopy ? "hover:text-white" : "cursor-not-allowed opacity-50"}`}
                    disabled={!canCopy}
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

            {canCopy ? (
                <a
                    href={`tel:${rawNumber}`}
                    className="block font-mono text-xl font-bold text-white hover:text-lime-200 transition-colors mb-3"
                >
                    {numberLabel}
                </a>
            ) : (
                <div className={`mb-3 font-mono text-xl font-bold ${isLoading ? "animate-pulse text-white/60" : "text-white/40"}`}>
                    {numberLabel}
                </div>
            )}

            <div className="flex items-center gap-2">
                {canCopy ? (
                    <a
                        href={`tel:${rawNumber}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-white text-black text-xs font-semibold py-2 hover:bg-lime-100 transition-colors"
                    >
                        <Phone size={13} /> Call now
                    </a>
                ) : (
                    <span className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-white/10 text-white/60 text-xs font-semibold py-2">
                        <Phone size={13} /> Call now
                    </span>
                )}
                <button
                    onClick={handleCopy}
                    title="Copy number"
                    className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 transition-all ${canCopy ? "hover:bg-white/10 hover:text-white" : "cursor-not-allowed opacity-60"}`}
                    disabled={!canCopy}
                >
                    {copied ? <><Check size={13} className="text-lime-300" /> Copied!</> : <><Copy size={13} /> Copy</>}
                </button>
            </div>
        </div>
    );
}

function formatPhone(value: string) {
    if (!value) return "";
    const cleaned = value.replace(/\s+/g, "");
    if (/^\+1\d{10}$/.test(cleaned)) {
        const area = cleaned.slice(2, 5);
        const mid = cleaned.slice(5, 8);
        const last = cleaned.slice(8);
        return `+1 (${area}) ${mid}-${last}`;
    }
    return value;
}
