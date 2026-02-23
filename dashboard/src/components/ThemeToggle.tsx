"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const [theme, setTheme] = useState("light"); // Default light mode
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Sync with document on mount
        if (document.documentElement.classList.contains("dark")) {
            setTheme("dark");
        } else {
            // Default to light
            document.documentElement.classList.remove("dark");
            document.documentElement.style.colorScheme = "light";
        }
    }, []);

    const toggleTheme = () => {
        if (theme === "dark") {
            setTheme("light");
            document.documentElement.classList.remove("dark");
            document.documentElement.style.colorScheme = "light";
        } else {
            setTheme("dark");
            document.documentElement.classList.add("dark");
            document.documentElement.style.colorScheme = "dark";
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
