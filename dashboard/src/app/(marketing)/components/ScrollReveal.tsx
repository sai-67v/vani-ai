"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
    children: ReactNode;
    className?: string;
    delay?: number;
    once?: boolean;
};

export function ScrollReveal({ children, className, delay = 0, once = true }: ScrollRevealProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={cn(className)}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.2, 0.9, 0.3, 1], delay }}
        >
            {children}
        </motion.div>
    );
}
