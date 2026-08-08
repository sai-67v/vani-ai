"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = typeof window !== "undefined" ? localStorage.getItem("vani_theme") : null;
        const preferred = stored === "light" ? "light" : "dark";
        setTheme(preferred);
        document.documentElement.classList.toggle("dark", preferred === "dark");
        document.documentElement.style.colorScheme = preferred === "dark" ? "dark" : "light";
    }, []);

    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.classList.toggle("dark", next === "dark");
        document.documentElement.style.colorScheme = next === "dark" ? "dark" : "light";
        try {
            localStorage.setItem("vani_theme", next);
        } catch {
            // ignore storage errors
        }
    };

    if (!mounted) return null;

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="fixed top-6 right-6 z-[999] flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-text shadow-raycast-float transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title="Toggle Theme"
        >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
    );
}
