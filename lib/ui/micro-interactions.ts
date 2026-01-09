/**
 * Micro-interactions utilities following Sanity Studio design principles
 * - Duration: 100-200ms
 * - Easing: ease-out (never spring)
 * - Purpose-driven only
 */

export const microInteractions = {
  // Hover transitions
  hover: "transition-colors duration-150 ease-out",
  hoverBackground: "transition-colors duration-150 ease-out hover:bg-[#F9FAFB]",
  hoverText: "transition-colors duration-150 ease-out hover:text-[#111827]",

  // Focus transitions
  focus: "transition-all duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-[#3B82F6]",
  focusRing: "focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-1",

  // Active states
  active: "transition-all duration-100 ease-out active:scale-[0.98]",
  activeBackground: "transition-colors duration-100 ease-out active:bg-[#F3F4F6]",

  // Opacity transitions
  fadeIn: "transition-opacity duration-150 ease-out",
  fadeOut: "transition-opacity duration-150 ease-out opacity-0",

  // Transform transitions
  scale: "transition-transform duration-150 ease-out",
  scaleHover: "transition-transform duration-150 ease-out hover:scale-105",

  // Border transitions
  border: "transition-colors duration-150 ease-out",
  borderHover: "transition-colors duration-150 ease-out hover:border-[#3B82F6]",

  // Combined common patterns
  button: "transition-all duration-150 ease-out hover:bg-opacity-90 active:scale-[0.98]",
  link: "transition-colors duration-150 ease-out hover:text-[#3B82F6]",
  card: "transition-all duration-150 ease-out hover:bg-[#F9FAFB]",
  input: "transition-all duration-150 ease-out focus:ring-1 focus:ring-[#3B82F6]",
};

// Animation variants for Framer Motion (if used)
export const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15, ease: "easeOut" },
  },
  slideIn: {
    initial: { opacity: 0, y: -4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.15, ease: "easeOut" },
  },
  slideInRight: {
    initial: { opacity: 0, x: 8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 8 },
    transition: { duration: 0.15, ease: "easeOut" },
  },
};







