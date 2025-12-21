# 🎨 Animations & Styling Guide

This guide explains all the animations, colors, and visual effects in your Emscale website.

---

## 🌈 Color Palette

### Primary Colors

```css
/* Electric Blue - Main brand color */
--primary: 220 90% 56% (hsl format)
Primary use: Buttons, links, accents

/* Purple Accent - Secondary color */
--secondary: 270 60% 55%
Secondary use: Gradients, hover states

/* Cyan Accent - Tertiary color */
--accent: 190 90% 50%
Accent use: Highlights, call-to-actions
```

### Background Colors

```css
--background: 220 17% 97%      /* Light gray-blue */
--foreground: 220 15% 10%       /* Dark text */
--muted: 220 17% 92%           /* Subtle backgrounds */
--card: 0 0% 100%              /* White cards */
```

### Using Colors in Components

```jsx
// Tailwind classes
<div className="bg-primary text-primary-foreground">Primary Button</div>
<div className="bg-secondary text-secondary-foreground">Secondary</div>
<div className="bg-accent text-accent-foreground">Accent</div>

// Gradient text
<h1 className="gradient-text">Beautiful Gradient Text</h1>

// Gradient backgrounds
<div className="gradient-bg">Subtle gradient background</div>
```

---

## ✨ Scroll Reveal Animations

### Available Components

Import from `@/components/ui/scroll-reveal`:

```jsx
import {
  ScrollReveal, // Base component with direction control
  FadeIn, // Fade in from opacity 0
  SlideUp, // Slide up from bottom
  SlideLeft, // Slide from right to left
  SlideRight, // Slide from left to right
} from "@/components/ui/scroll-reveal";
```

### Usage Examples

```jsx
// Fade in effect
<FadeIn delay={0.2}>
  <p>This text fades in when scrolled into view</p>
</FadeIn>

// Slide up effect
<SlideUp delay={0.3}>
  <h2>This heading slides up</h2>
</SlideUp>

// Slide from sides
<SlideLeft delay={0.4}>
  <div>Slides from right to left</div>
</SlideLeft>

<SlideRight delay={0.5}>
  <div>Slides from left to right</div>
</SlideRight>

// Custom direction and timing
<ScrollReveal direction="down" delay={0.6} duration={0.8}>
  <div>Custom animation</div>
</ScrollReveal>
```

### Stagger Animations

Create stagger effects by increasing delay:

```jsx
<SlideUp delay={0.1}>
  <h1>First element</h1>
</SlideUp>
<SlideUp delay={0.2}>
  <p>Second element (0.1s later)</p>
</SlideUp>
<SlideUp delay={0.3}>
  <button>Third element (0.2s later)</button>
</SlideUp>
```

---

## 🎭 Motion Effects

### Animated Components

Import from `@/components/ui/animated-gradient`:

```jsx
import {
  AnimatedGradient, // Animated gradient background
  FloatingElement, // Subtle floating animation
  PulseGlow, // Pulsing glow effect
} from "@/components/ui/animated-gradient";
```

### Usage Examples

```jsx
// Animated gradient background
<AnimatedGradient className="rounded-lg p-8">
  <div>Content with animated gradient</div>
</AnimatedGradient>

// Floating effect (great for images/cards)
<FloatingElement delay={0.5}>
  <img src="/image.jpg" alt="Floating image" />
</FloatingElement>

// Pulsing glow effect (great for CTAs)
<PulseGlow>
  <Button>Glowing Button</Button>
</PulseGlow>
```

---

## 🎨 Utility Classes

### Gradient Effects

```jsx
// Gradient text
<h1 className="gradient-text">
  Colorful Gradient Text
</h1>

// Gradient backgrounds
<div className="gradient-bg">Light gradient</div>
<div className="gradient-bg-dark">Darker gradient</div>
```

### Glass Morphism

```jsx
<div className="glass rounded-xl p-6">Glassmorphic card with blur</div>
```

### Hover Effects

```jsx
// Lift on hover
<div className="hover-lift">
  Card that lifts on hover
</div>

// Animated underline
<a href="#" className="animated-underline">
  Link with animated underline
</a>

// Gradient border
<div className="gradient-border rounded-lg p-4">
  Gradient border box
</div>
```

### Framer Motion Utilities

```jsx
import { motion } from "framer-motion";

// Scale on hover
<motion.div whileHover={{ scale: 1.05 }}>
  Hover to scale
</motion.div>

// Rotate on tap
<motion.button whileTap={{ rotate: 5 }}>
  Tap to rotate
</motion.button>

// Continuous animation
<motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{ duration: 2, repeat: Infinity }}
>
  Continuous floating
</motion.div>
```

---

## 🖼️ Image Best Practices

### Using the Image Library

```jsx
import { images } from "@/lib/images";

// Hero images
<img src={images.hero.workspace} alt="Workspace" />

// Team photos
<img src={images.team.ceo} alt="CEO" />

// Service images
<img src={images.services.aiConsulting} alt="AI Consulting" />
```

### Adding Your Own Images

1. Place images in `public/images/`
2. Reference them:

```jsx
<img src="/images/your-image.jpg" alt="Description" />
```

3. Or use Next.js Image for optimization:

```jsx
import Image from "next/image";

<Image
  src="/images/your-image.jpg"
  alt="Description"
  width={1200}
  height={630}
  className="rounded-lg"
/>;
```

---

## 🎬 Animation Timing

### Standard Delays

```jsx
delay={0.1}   // Very fast - instant feedback
delay={0.2}   // Fast - first element
delay={0.3}   // Medium - second element
delay={0.4}   // Medium - third element
delay={0.5}   // Slow - final elements
delay={0.6}   // Very slow - special effects
```

### Duration Guidelines

```jsx
duration={0.3}   // Quick - micro-interactions
duration={0.5}   // Standard - most animations
duration={0.8}   // Slow - dramatic effects
duration={1.0}   // Very slow - hero elements
```

---

## 🎨 Custom Animations

### Creating Custom Scroll Reveals

```jsx
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

function CustomAnimation() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={
        isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
      }
      transition={{ duration: 0.6 }}
    >
      Custom animated content
    </motion.div>
  );
}
```

### Stagger Children

```jsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }}
>
  <motion.div variants={{ hidden: { y: 20 }, visible: { y: 0 } }}>
    Child 1
  </motion.div>
  <motion.div variants={{ hidden: { y: 20 }, visible: { y: 0 } }}>
    Child 2
  </motion.div>
</motion.div>
```

---

## 🚀 Performance Tips

### Optimize Animations

1. **Use transform over position**

   ```jsx
   // ✅ Good - GPU accelerated
   animate={{ translateY: 0 }}

   // ❌ Avoid - CPU intensive
   animate={{ top: 0 }}
   ```

2. **Reduce motion for accessibility**

   ```jsx
   const prefersReducedMotion = window.matchMedia(
     "(prefers-reduced-motion: reduce)"
   ).matches;

   <motion.div animate={!prefersReducedMotion && { y: [0, -10, 0] }}>
     Content
   </motion.div>;
   ```

3. **Lazy load animations**
   - Use `threshold` in `useScrollReveal` to trigger animations earlier/later
   - Set `once` to `false` to re-trigger animations

---

## 📝 Quick Reference

### Most Common Patterns

```jsx
// Hero section - dramatic entrance
<SlideUp delay={0.1}>
  <h1 className="gradient-text">Hero Title</h1>
</SlideUp>

// Feature cards - stagger effect
{features.map((feature, i) => (
  <SlideUp key={i} delay={i * 0.1}>
    <FeatureCard {...feature} />
  </SlideUp>
))}

// CTA section - attention grabber
<PulseGlow>
  <Button size="lg" className="gradient-text">
    Get Started
  </Button>
</PulseGlow>

// Images - subtle float
<FloatingElement>
  <img src={images.hero.workspace} alt="Hero" />
</FloatingElement>

// Glass cards - modern look
<div className="glass hover-lift rounded-xl p-6">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

---

**Need more examples?** Check the homepage components in `components/sections/home/` to see these animations in action!




