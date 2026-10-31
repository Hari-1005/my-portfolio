"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Applies the user's OS-level "reduce motion" preference to every motion
 * component: transform and layout animations are disabled when it is set.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
