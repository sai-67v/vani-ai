"use client";

import type { FormEvent } from "react";
import { useState } from "react";

const SECTORS = [
    { label: "Spa & Wellness", slug: "spa" },
    { label: "Supermarket", slug: "supermarket" },
    { label: "Call Centre", slug: "call-centre" },
    { label: "Insurance", slug: "insurance" },
    { label: "Ticket Booking", slug: "ticket-booking" },
    { label: "General", slug: "general" },
] as const;

type SectorSlug = (typeof SECTORS)[number]["slug"];
type Status = "idle" | "loading" | "success" | "error";

const BACKEND_URL = "http://localhost:3001";

function Spinner() {
    return (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

export function DemoCallForm() {
    const [businessName, setBusinessName] = useState("");
    const [sector, setSector] = useState<SectorSlug>("spa");
    const [phone, setPhone] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch(`${BACKEND_URL}/api/calls/trigger`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone_number: phone, sector }),
            });

            const text = await res.text();
            let data: Record<string, unknown> = {};
            try { data = JSON.parse(text); } catch { data = { message: text }; }

            if (!res.ok) {
                const errMsg = (data.message as string) || (data.error as string) || `Request failed (${res.status})`;
                setStatus("error");
                setMessage(errMsg);
                return;
            }

            setStatus("success");
            setMessage("✅ Your call is on the way! Answer your phone.");
        } catch (err) {
            setStatus("error");
            setMessage(err instanceof Error ? err.message : "Network error — is the backend running on port 3001?");
        }
    }

    return (
        <div
            className="w-full max-w-[480px] rounded-[28px] border border-white/10 bg-white/5 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-md"
        >
            <h2 className="mb-1 text-lg font-bold text-white">Get a Demo Call</h2>
            <p className="mb-6 text-sm text-white/55">
                Fill in your details and Vani AI will call you right now.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Business Name */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="business-name" className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                        Business Name
                    </label>
                    <input
                        id="business-name"
                        type="text"
                        required
                        autoComplete="organization"
                        placeholder="Sunrise Spa, Metro Mart…"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none transition"
                    />
                </div>

                {/* Sector */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="sector" className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                        Sector
                    </label>
                    <select
                        id="sector"
                        required
                        value={sector}
                        onChange={(e) => setSector(e.target.value as SectorSlug)}
                        className="w-full appearance-none rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none transition"
                    >
                        {SECTORS.map((s) => (
                            <option key={s.slug} value={s.slug} style={{ background: "#0b0b12" }}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                        Phone Number
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="+91XXXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none transition"
                    />
                    <p className="text-[11px] text-white/35">E.164 format — e.g. +919876543210</p>
                </div>

                {/* Feedback */}
                {status === "error" && (
                    <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        <span>⚠️</span>
                        <span>{message}</span>
                    </div>
                )}
                {status === "success" && (
                    <div role="status" className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-300">
                        {message}
                    </div>
                )}

                {/* Submit */}
                <button
                    id="demo-call-submit"
                    type="submit"
                    disabled={status === "loading"}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-black shadow-[0_8px_30px_rgba(255,255,255,0.2)] transition hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {status === "loading" ? (
                        <><Spinner /><span>Calling…</span></>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.96 1.18 2 2 0 012.94.96h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121.02 16z" />
                            </svg>
                            <span>Get a Demo Call</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
