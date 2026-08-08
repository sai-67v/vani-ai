import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: path.join(__dirname),

    // ── Compiler optimizations ───────────────────────────────────────────
    compiler: {
        // Remove console.log in production builds (keep console.error/warn)
        removeConsole:
            process.env.NODE_ENV === "production"
                ? { exclude: ["error", "warn"] }
                : false,
    },

    // ── Image optimization ────────────────────────────────────────────────
    images: {
        formats: ["image/avif", "image/webp"],   // serve AVIF first, fall back to WebP
        minimumCacheTTL: 60 * 60 * 24 * 30,     // 30-day browser cache
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // ── HTTP security & performance headers ──────────────────────────────
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "X-XSS-Protection",
                        value: "1; mode=block",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(self), geolocation=()",
                    },
                ],
            },
            {
                // Long-lived cache for static assets — content-hashed by Next.js
                source: "/_next/static/(.*)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
            {
                // Media files: 1-hour cache
                source: "/(.*\\.(?:png|jpg|jpeg|gif|svg|ico|mp4|webm|avif|webp))",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=3600, stale-while-revalidate=86400",
                    },
                ],
            },
        ];
    },

    // ── API rewrites (proxy to Express voice engine on port 3001) ────────
    async rewrites() {
        return [
            {
                source: "/api/twilio/:path((?!token|outbound).*)*",
                destination: "http://localhost:3001/api/twilio/:path*",
            },
            {
                source: "/api/vapi/:path*",
                destination: "http://localhost:3001/api/vapi/:path*",
            },
            {
                source: "/api/transcript/:path*",
                destination: "http://localhost:3001/api/transcript/:path*",
            },
            {
                source: "/api/analyze/:path*",
                destination: "http://localhost:3001/api/analyze/:path*",
            },
        ];
    },

    // ── Experimental optimizations ───────────────────────────────────────
    experimental: {
        // Opt into the React compiler for automatic memoization (React 19+)
        reactCompiler: false,
        // Partial pre-rendering: static shell + streaming dynamic content
        ppr: false,
        // Inline CSS for the critical path (eliminates render-blocking stylesheet round-trips)
        inlineCss: true,
        // Turbopack is enabled via `next dev --turbo`; this enables it in build too (opt-in)
        turbo: {
            rules: {
                "*.svg": {
                    loaders: ["@svgr/webpack"],
                    as: "*.js",
                },
            },
        },
    },
};

export default nextConfig;

