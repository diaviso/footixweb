import type { Variants, Transition } from 'framer-motion';

/* ============================================
   FOOTIX — FRAMER MOTION PRESETS
   Reusable animation variants for the football game UI
   ============================================ */

// --- Entrance animations ---

export const matchCardEntrance: Variants = {
  hidden: { opacity: 0, y: 24, rotateX: 8, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
};

export const scoreReveal: Variants = {
  hidden: { opacity: 0, scale: 0.5, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 300, damping: 18 },
  },
};

export const podiumRise = (delay: number = 0): Variants => ({
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20, delay },
  },
});

// --- Container / stagger ---

export const staggerContainer = (stagger: number = 0.08): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren: 0.05 },
  },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// --- Continuous animations ---

export const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

export const pulseGlow = {
  boxShadow: [
    '0 0 0 0 rgba(231, 76, 94, 0)',
    '0 0 20px 4px rgba(231, 76, 94, 0.3)',
    '0 0 0 0 rgba(231, 76, 94, 0)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

// --- Interactive animations ---

export const hoverLift = {
  y: -6,
  scale: 1.02,
  boxShadow: '0 12px 32px rgba(231, 76, 94, 0.15)',
  transition: { type: 'spring', stiffness: 300, damping: 20 } as Transition,
};

export const tapShrink = {
  scale: 0.97,
  transition: { type: 'spring', stiffness: 400, damping: 25 } as Transition,
};

// --- Page transitions ---

export const pageSlideIn: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

// --- Countdown animations ---

export const countdownPulse: Variants = {
  initial: { scale: 2, opacity: 0, filter: 'blur(8px)' },
  animate: {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 300, damping: 15 },
  },
  exit: {
    scale: 0.5,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// --- Card flip ---

export const cardFlipFront: Variants = {
  front: { rotateY: 0, transition: { duration: 0.5 } },
  back: { rotateY: 180, transition: { duration: 0.5 } },
};

export const cardFlipBack: Variants = {
  front: { rotateY: -180, transition: { duration: 0.5 } },
  back: { rotateY: 0, transition: { duration: 0.5 } },
};

// --- Scoreboard ticker ---

export const tickerSlide: Variants = {
  enter: { y: -20, opacity: 0 },
  center: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { y: 20, opacity: 0, transition: { duration: 0.15 } },
};

// --- Confetti burst direction ---

export const confettiBurst: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: [0, 1.3, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};
