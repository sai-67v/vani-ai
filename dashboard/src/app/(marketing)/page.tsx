import type { Metadata } from "next";
import { DemoCallForm } from "./DemoCallForm";

export const metadata: Metadata = {
    title: "Vani AI — Voice AI for Indian Businesses",
    description:
        "Deploy a production-grade outbound voice agent in seconds. Vani AI speaks the language of your customer — English, Hindi, Tamil — and qualifies leads around the clock.",
    alternates: { canonical: "/" },
};

// ── Trust badges ──────────────────────────────────────────────────────────
const BADGES = ["Sarvam LLM", "Vapi infra", "E.164 validated", "≤ 2 s latency"];

export default function LandingPage() {
    return (
        <section
            className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center px-4 py-16"
            aria-labelledby="landing-heading"
        >
            {/* ── Hero copy ──────────────────────────────────────────── */}
            <div className="mb-10 text-center">
                <div className="mb-5 inline-flex items-center gap-3">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <rect width="40" height="40" rx="12" fill="#00e5c4" />
                        <path
                            d="M8 20h2M12 14v12M16 17v6M20 10v20M24 16v8M28 14v12M32 18v4"
                            stroke="#0B0B0F"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="text-2xl font-black tracking-tight text-white">Vani AI</span>
                </div>

                <h1
                    id="landing-heading"
                    className="text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl"
                >
                    Voice AI for{" "}
                    <span
                        className="bg-clip-text text-transparent"
                        style={{ backgroundImage: "linear-gradient(90deg, #00e5c4, #9be8ff, #8ca8ff)" }}
                    >
                        Indian Businesses
                    </span>
                </h1>

                <p className="mt-4 max-w-lg mx-auto text-base text-white/65 leading-relaxed">
                    Deploy a production-grade outbound voice agent in seconds.
                    Vani AI speaks the language of your customer — English,
                    Hindi, Tamil — and qualifies leads around the clock.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {BADGES.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/40"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <DemoCallForm />

            <p className="mt-8 text-xs text-white/35">
                Already using Vani AI?{" "}
                <a
                    href="/dashboard"
                    className="font-semibold text-white/60 underline underline-offset-2 hover:text-white transition"
                >
                    Open the operator dashboard →
                </a>
            </p>
        </section>
    );
}
