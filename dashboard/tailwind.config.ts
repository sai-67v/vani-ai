import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--bg)",
                surface: "var(--surface)",
                text: "var(--text)",
                muted: "var(--muted)",
                card: {
                    bg: "var(--card-bg)",
                    hover: "var(--card-hover)",
                },
                border: {
                    DEFAULT: "var(--border-color)",
                    strong: "var(--border-strong)",
                },
                primary: {
                    DEFAULT: "var(--theme-primary)",
                    hover: "var(--theme-primary-hover)",
                },
                accent: "var(--theme-accent)",
                raycast: {
                    red: "#FF6363",
                    blue: "#4C9EEB",
                    purple: "#BA80F9",
                },
                calories: {
                    lime: "#DFFF00",
                },
                ds: {
                    background: "var(--bg)",
                    surface: "var(--surface)",
                    text_primary: "var(--text)",
                    text_muted: "var(--muted-text)",
                    primary_action: "var(--theme-primary)",
                    accent_raycast_red: "#FF6363",
                    accent_raycast_blue: "#4C9EEB",
                    calories_vibrant_lime: "#DFFF00",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
                mono: ["JetBrains Mono", "Menlo", "Monaco", "Courier New", "monospace"],
            },
            boxShadow: {
                glass: "0 4px 30px rgba(0, 0, 0, 0.1)",
                "raycast-float": "0 12px 32px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0,0,0,0.1)",
                "glow-cta": "0 0 32px rgba(255, 255, 255, 0.22), 0 10px 40px rgba(0, 0, 0, 0.45)",
            },
            backdropBlur: {
                glass: "16px",
                heavy: "24px",
            },
            backgroundImage: {
                "hero-gradient": "radial-gradient(circle at 20% 20%, rgba(76, 158, 235, 0.2), transparent 30%), radial-gradient(circle at 80% 0%, rgba(255, 99, 99, 0.18), transparent 28%), radial-gradient(circle at 50% 50%, rgba(223, 255, 0, 0.12), transparent 35%)",
            },
            transitionTimingFunction: {
                "spring-bouncy": "cubic-bezier(0.87, 0, 0.13, 1)",
                "raycast-swift": "cubic-bezier(0.2, 0.9, 0.3, 1)",
            },
            animation: {
                "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.2, 0.9, 0.3, 1) forwards",
                "pulse-subtle": "pulseSubtle 3s infinite",
                "hover-lift": "hoverLift 0.2s ease-out forwards",
                "cta-glow": "ctaGlow 3s ease-in-out infinite",
                "grain-move": "grainMove 18s linear infinite",
            },
            keyframes: {
                fadeInUp: {
                    "0%": { opacity: "0", transform: "translateY(16px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                pulseSubtle: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.85" },
                },
                hoverLift: {
                    "0%": { transform: "translateY(0)" },
                    "100%": { transform: "translateY(-4px)" },
                },
                ctaGlow: {
                    "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,255,255,0.18)" },
                    "50%": { boxShadow: "0 0 32px 8px rgba(255,255,255,0.22)" },
                },
                grainMove: {
                    "0%": { transform: "translate3d(0,0,0)" },
                    "50%": { transform: "translate3d(-3%, -3%, 0)" },
                    "100%": { transform: "translate3d(0,0,0)" },
                },
            },
        },
    },
    plugins: [animatePlugin],
};
export default config;
