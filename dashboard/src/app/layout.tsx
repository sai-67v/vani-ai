import type { Metadata } from "next";
import "../app/globals.css";

export const metadata: Metadata = {
    title: "Voice AI Dashboard",
    description: "Real-time call analytics and callback management for Vapi voice agents",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <div className="app-shell">
                    <header className="header">
                        <div className="header-logo">🎙</div>
                        <span className="header-title">VoiceAI Dashboard</span>
                        <div className="flex items-center gap-2">
                            <div className="status-dot" />
                            <span className="header-subtitle" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                Live · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                        </div>
                    </header>
                    {children}
                </div>
            </body>
        </html>
    );
}
