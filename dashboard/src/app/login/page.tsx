"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pick up error forwarded from the callback route
    useEffect(() => {
        const err = searchParams.get("error");
        if (err) setError(decodeURIComponent(err));
    }, [searchParams]);

    // If already signed in, go straight to dashboard
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) router.replace("/dashboard");
        });
    }, [router]);

    async function handleGoogleLogin() {
        setError(null);
        setLoading(true);
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (authError) {
            setError(authError.message);
            setLoading(false);
        }
        // On success, browser navigates away — no need to setLoading(false)
    }

    return (
        <main
            className="min-h-screen flex items-center justify-center"
            style={{ background: "var(--bg)", padding: "24px" }}
        >
            {/* Card */}
            <div
                className="flex flex-col items-center gap-8"
                style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-lg)",
                    padding: "48px 40px",
                    maxWidth: 400,
                    width: "100%",
                    boxShadow: "0 0 40px rgba(0,0,0,0.4)",
                }}
            >
                {/* Logo */}
                <div
                    className="header-logo flex items-center justify-center font-bold"
                    style={{ width: 64, height: 64, fontSize: 24, borderRadius: "var(--r-md)" }}
                >
                    ▼
                </div>

                {/* Heading */}
                <div className="text-center">
                    <h1
                        style={{
                            fontSize: 26,
                            fontWeight: 700,
                            letterSpacing: "-0.04em",
                            color: "var(--text)",
                            marginBottom: 8,
                        }}
                    >
                        Welcome to Vani AI
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--muted-text)", lineHeight: 1.5 }}>
                        Sign in to access your voice analytics dashboard
                    </p>
                </div>

                {/* Error banner */}
                {error && (
                    <div
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: "var(--r-sm)",
                            background: "rgba(255,80,80,0.1)",
                            border: "1px solid rgba(255,80,80,0.3)",
                            color: "#ff6b6b",
                            fontSize: 13,
                            textAlign: "center",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Google Sign-in Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 12,
                        width: "100%",
                        padding: "13px 20px",
                        borderRadius: "var(--r-sm)",
                        border: "1px solid var(--border)",
                        background: loading ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)",
                        color: "var(--text)",
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        opacity: loading ? 0.7 : 1,
                    }}
                    onMouseEnter={e => {
                        if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
                    }}
                    onMouseLeave={e => {
                        if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                    }}
                >
                    {loading ? (
                        <>
                            {/* Spinner */}
                            <svg
                                width={18}
                                height={18}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                style={{ animation: "spin 0.8s linear infinite" }}
                            >
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                            Connecting…
                        </>
                    ) : (
                        <>
                            {/* Google icon */}
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </>
                    )}
                </button>

                <p style={{ fontSize: 12, color: "var(--muted-text)", textAlign: "center", lineHeight: 1.6 }}>
                    By signing in you agree to the Vani AI Terms of Service
                </p>
            </div>

            {/* Spinner keyframe */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    );
}
