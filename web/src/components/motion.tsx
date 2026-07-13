"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** House easing — slow start of settle, no bounce, ever. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}

/** Fades content up as it enters the viewport. The house scroll reveal. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
}: RevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const headlineTags = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
} as const;

/**
 * Headline that reveals line by line, like a title card.
 * The viewport trigger lives on the (unclipped) heading element — a line
 * translated below its overflow-hidden wrapper never intersects the
 * viewport itself, so observing the lines directly would never fire.
 */
export function RevealLines({
  lines,
  className,
  as = "h2",
  delay = 0,
}: {
  lines: string[];
  className?: string;
  as?: keyof typeof headlineTags;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const MotionTag = headlineTags[as];

  if (reduced) {
    const Tag = as;
    return (
      <Tag className={className}>
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.12, delayChildren: delay },
        },
      }}
    >
      {lines.map((line) => (
        <span key={line} className="block overflow-hidden">
          <motion.span
            className="block"
            variants={{
              hidden: { y: "110%" },
              visible: {
                y: 0,
                transition: { duration: 1.1, ease: EASE },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
