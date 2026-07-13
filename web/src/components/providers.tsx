"use client";

import { MotionConfig } from "framer-motion";
import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root options={{ lerp: 0.09, wheelMultiplier: 0.9 }}>
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}
