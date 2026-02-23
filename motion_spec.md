# Motion & Interaction Specification (calories.framer.website)

This document provides a detailed breakdown of the motion behaviors observed on the target Framer template, structured as a design specification with equivalent React / Framer Motion implementation snippets.

---

## 1. Sticky Navbar & Scroll Blur

The navigation bar dynamically adapts to the user's scroll position, creating a glassy "frost" effect when leaving the hero section.

*   **Trigger**: `scrollY > 50px` (or when intersecting past the top hero section).
*   **Behavior**:
    *   **Background**: Transitions from solid/transparent to a translucent fill (e.g., `rgba(255, 255, 255, 0.7)` or dark equivalent).
    *   **Blur Threshold**: Injects `backdrop-filter: blur(12px)`.
    *   **Border**: Often adds a subtle `1px solid rgba(255,255,255,0.1)` bottom border.
*   **Duration/Easing**: ~0.3s `easeOut`.

### Framer Motion Snippet:
```tsx
import { motion, useScroll, useTransform } from "framer-motion";

export const StickyNavbar = () => {
  const { scrollY } = useScroll();
  
  // Transform background and blur based on scroll depth
  const bg = useTransform(scrollY, [0, 50], ["rgba(0,0,0,0)", "rgba(20,20,20,0.8)"]);
  const blur = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(12px)"]);

  return (
    <motion.nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        backgroundColor: bg,
        backdropFilter: blur,
        WebkitBackdropFilter: blur,
        zIndex: 50,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Nav Items */}
    </motion.nav>
  );
};
```

---

## 2. Reveal-on-Scroll Patterns

Content blocks (text, images, feature cards) enter the viewport with a subtle upward movement and fade-in, avoiding harsh static loads.

*   **Trigger**: Element enters viewport (typically with a `-50px` to `-100px` root margin to trigger slightly *after* entering).
*   **Pattern**: "Fade Up" (Translate Y + Opacity).
*   **Transform Values**: `opacity: 0 -> 1`, `translateY: 40px -> 0px`.
*   **Frequency**: `once: true` (the animation only plays the first time you scroll past, it does not hide and re-reveal when scrolling up).
*   **Duration/Easing**: ~0.6s to 0.8s. Easing uses a gentle spring or soft curve (e.g., `cubic-bezier(0.16, 1, 0.3, 1)` or `spring(stiffness: 100, damping: 20)`).

### Framer Motion Snippet:
```tsx
const revealVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20, duration: 0.6 }
  }
};

export const RevealSection = ({ children }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={revealVariants}
  >
    {children}
  </motion.div>
);
```

---

## 3. Grid Staggering

When a grid of feature cards or items comes into view, they do not appear simultaneously. Instead, they cascade sequentially.

*   **Trigger**: Parent container enters viewport.
*   **Behavior**: Children inherit the "visible" state with an incremental delay.
*   **Delay**: Usually `0.1s` to `0.15s` between each child card.

### Framer Motion Snippet:
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Delay between each card
      delayChildren: 0.1,    // Initial delay before first child
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } }
};

export const StaggerGrid = ({ items }) => (
  <motion.div 
    initial="hidden" 
    whileInView="visible" 
    viewport={{ once: true, margin: "-50px" }}
    variants={containerVariants}
    style={{ display: "grid", gap: "20px" }}
  >
    {items.map(item => (
      <motion.div key={item.id} variants={cardVariants}>
        {/* Card Content */}
      </motion.div>
    ))}
  </motion.div>
);
```

---

## 4. Hover Micro-Interactions

Buttons (e.g., "Download for iOS", "Try now") and interactive cards possess subtle tactile responses.

*   **Trigger**: Mouse `mouseenter` / `mouseleave`.
*   **Transform Values**: `scale: 1 -> 1.02` to `1.05`. Occasionally a slight translation like `translateY: -2px`.
*   **Effects**: Some cards introduce a subtle `box-shadow` or internal layer opacity shift (glow).
*   **Duration/Easing**: Very fast and responsive. `0.2s` with `easeOut`, or a stiff spring.

### Framer Motion Snippet:
```tsx
export const PrimaryButton = ({ label }) => (
  <motion.button
    whileHover={{ 
      scale: 1.03, 
      y: -2,
      boxShadow: "0px 8px 20px rgba(0,0,0,0.15)"
    }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    style={{ transition: "background-color 0.2s ease" }}
  >
    {label}
  </motion.button>
);
```

---

## 5. Parallax Background / Floating Elements

Some hero sections feature subtle background device mockups or gradient blobs that shift at a different rate than the scroll speed.

*   **Trigger**: General window scroll distance (`scrollY`).
*   **Transform**: Move an element negatively relative to the scroll vector. E.g., user scrolls `100px` down, element moves `30px` up.

### Framer Motion Snippet:
```tsx
export const ParallaxDevice = () => {
  const { scrollY } = useScroll();
  // As the user scrolls from 0 to 1000px, move the device from 0 to -150px
  const y = useTransform(scrollY, [0, 1000], [0, -150]);

  return (
    <motion.div style={{ y }}>
      <img src="/phone-mockup.png" alt="Device" />
    </motion.div>
  );
};
```

---

## Summary

The motion aesthetic of `calories.framer.website` relies on **fluid springs**, **delayed staggering**, and **scroll-driven reveals**. The overarching goal is to avoid staggered, jerky JS animations in favor of hardware-accelerated transforms (`y` and `scale`) and `opacity` fades that trigger exactly once when naturally engaging the content.
