"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type FloatingShapeProps = {
    className?: string;
};

export function FloatingShape({ className }: FloatingShapeProps) {
    return (
        <motion.div
            className={cn(
                "absolute aspect-square w-64 sm:w-80 rounded-full blur-3xl",
                "bg-[radial-gradient(circle_at_30%_30%,rgba(255,99,99,0.28),transparent_35%),radial-gradient(circle_at_70%_30%,rgba(76,158,235,0.32),transparent_36%),radial-gradient(circle_at_50%_70%,rgba(223,255,0,0.2),transparent_40%)]",
                className,
            )}
            animate={{
                y: [0, -20, 0],
                rotate: [0, 6, -4, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
        />
    );
}
