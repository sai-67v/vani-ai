import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    experimental: {
        // Disable inlineCss — this experiment causes webpack chunk hydration
        // errors in Next.js 15.5.x when mixing Server and Client Components.
        inlineCss: false,
    },
};

export default nextConfig;
