import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

/* ── SEO & Social metadata ───────────────────────────────────────────────── */
export const metadata: Metadata = {
    metadataBase: new URL("https://vaani.ai"),
    title: {
        default: "Vaani AI — Voice Intelligence Platform",
        template: "%s | Vaani AI",
    },
    description:
        "Vaani AI is a production-grade voice AI platform. Automate inbound and outbound calls with low-latency, human-like conversational agents that understand context, emotion, and intent.",
    keywords: [
        "voice AI",
        "voice agent",
        "call automation",
        "Sarvam AI",
        "Twilio",
        "multilingual voice",
        "speech analytics",
        "lead scoring",
    ],
    authors: [{ name: "Vaani AI Team" }],
    creator: "Vaani AI",
    publisher: "Vaani AI",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://vaani.ai",
        siteName: "Vaani AI",
        title: "Vaani AI — Voice Intelligence Platform",
        description:
            "Automate inbound and outbound calls with human-like conversational AI. Powered by Sarvam AI and Twilio.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Vaani AI — Voice Intelligence Platform",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Vaani AI — Voice Intelligence Platform",
        description:
            "Automate inbound and outbound calls with human-like conversational AI.",
        images: ["/og-image.png"],
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
};

/* ── Viewport ────────────────────────────────────────────────────────────── */
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#0b0b12",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
            <head>
                {/* Preconnect to critical third-party origins */}
                <link rel="preconnect" href="https://cdn.jsdelivr.net" />
                <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
            </head>
            <body className="bg-background text-text antialiased font-sans">
                <ThemeToggle />
                {children}
            </body>
        </html>
    );
}
