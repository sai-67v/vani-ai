import type { ReactNode } from "react";
import Link from "next/link";

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative isolate min-h-screen w-full overflow-hidden bg-[#03040B] text-white">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#020309] via-[#04040C] to-[#08080F]" aria-hidden />
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
                <div className="absolute inset-0 hero-gradient opacity-80" />
                <div className="grain-overlay" />
            </div>
            <div className="relative z-10 flex min-h-screen flex-col">
                <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0B0B0F]/80 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div
                                className="flex items-center justify-center font-bold"
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "14px",
                                    background: "var(--brand-mint)",
                                    color: "#0B0B0F",
                                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)"
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 5l7 14 7-14" />
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <p className="text-sm font-semibold text-white">Vani AI</p>
                                <p className="text-xs text-white/60">Voice intelligence cloud</p>
                            </div>
                        </div>
                        <nav className="hidden items-center gap-6 text-sm font-medium text-white/80 md:flex">
                            <a className="hover:text-white transition" href="#features">Features</a>
                            <a className="hover:text-white transition" href="#innovation">Innovation</a>
                            <a className="hover:text-white transition" href="#demo">Demo</a>
                            <a className="hover:text-white transition" href="#pricing">Pricing</a>
                            <a className="hover:text-white transition" href="#developer">Developers</a>
                        </nav>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover-lift md:inline-flex"
                            >
                                View dashboard
                            </Link>
                            <a
                                href="#cta"
                                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-glow-cta hover-lift cta-glow-pulse"
                            >
                                Get started
                            </a>
                        </div>
                    </div>
                </header>
                <main className="flex-1">
                    {children}
                </main>
                <footer className="border-t border-white/5 bg-[#0B0B0F]/80">
                    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="flex items-center justify-center font-bold"
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: "8px",
                                    background: "var(--brand-mint)",
                                    color: "#0B0B0F"
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 5l7 14 7-14" />
                                </svg>
                            </div>
                            <span>Vani AI • Voice, analytics, and dev platform</span>
                        </div>
                        <div className="flex gap-4">
                            <a href="#developer" className="hover:text-white">Docs</a>
                            <a href="#pricing" className="hover:text-white">Pricing</a>
                            <a href="mailto:hello@vani.ai" className="hover:text-white">Contact</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
