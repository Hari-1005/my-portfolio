"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Slides content up into place once it enters the viewport.
 *
 * Only `transform` is animated, never opacity: server-rendered HTML is always
 * fully visible (no-JS visitors, LCP, contrast checks), and MotionConfig's
 * reducedMotion="user" disables transform animations entirely, so visitors who
 * prefer reduced motion see content in its final position with no movement.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ y: 16 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
