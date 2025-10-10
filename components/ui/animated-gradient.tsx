"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function AnimatedGradient({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            className={`relative ${className}`}
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{
                backgroundSize: "200% 200%",
                backgroundImage: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--accent)) 100%)",
            }}
        >
            {children}
        </motion.div>
    );
}

export function FloatingElement({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
    return (
        <motion.div
            animate={{
                y: [0, -10, 0],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
            }}
        >
            {children}
        </motion.div>
    );
}

export function PulseGlow({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            className={className}
            animate={{
                boxShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 40px rgba(147, 51, 234, 0.5)",
                    "0 0 20px rgba(6, 182, 212, 0.3)",
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                ],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            {children}
        </motion.div>
    );
}



