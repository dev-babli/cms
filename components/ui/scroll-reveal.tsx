"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface ScrollRevealProps {
    children: ReactNode;
    direction?: "up" | "down" | "left" | "right" | "none";
    delay?: number;
    duration?: number;
    className?: string;
}

const directionVariants = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: 50, opacity: 0 },
    right: { x: -50, opacity: 0 },
    none: { opacity: 0 },
};

export function ScrollReveal({
    children,
    direction = "up",
    delay = 0,
    duration = 0.6,
    className = "",
}: ScrollRevealProps) {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

    return (
        <motion.div
            ref={ref}
            initial={directionVariants[direction]}
            animate={
                isVisible
                    ? { x: 0, y: 0, opacity: 1 }
                    : directionVariants[direction]
            }
            transition={{
                duration,
                delay,
                ease: [0.25, 0.4, 0.25, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function FadeIn({
    children,
    delay = 0,
    className = "",
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <ScrollReveal direction="none" delay={delay} className={className}>
            {children}
        </ScrollReveal>
    );
}

export function SlideUp({
    children,
    delay = 0,
    className = "",
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <ScrollReveal direction="up" delay={delay} className={className}>
            {children}
        </ScrollReveal>
    );
}

export function SlideLeft({
    children,
    delay = 0,
    className = "",
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <ScrollReveal direction="right" delay={delay} className={className}>
            {children}
        </ScrollReveal>
    );
}

export function SlideRight({
    children,
    delay = 0,
    className = "",
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <ScrollReveal direction="left" delay={delay} className={className}>
            {children}
        </ScrollReveal>
    );
}





