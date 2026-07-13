"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE } from "@/components/motion";
import { ButtonLink } from "@/components/ui/button";
import { IMAGES } from "@/lib/data";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // The image recedes slower than the scroll — a slow camera pull-back.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] overflow-hidden bg-espresso">
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src={IMAGES.heroBag}
          alt="A full-grain leather tote in warm afternoon light"
          fill
          priority
          sizes="100vw"
          className="animate-drift object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/75 via-espresso/25 to-espresso/35" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-end pb-24 text-center text-bone lg:pb-32"
      >
        <motion.p
          className="eyebrow text-bone/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          Full-grain · Vegetable-tanned · Saddle-stitched
        </motion.p>
        <h1 className="font-display mt-6 text-[clamp(2.8rem,8vw,7.5rem)] leading-[1.02] tracking-tight">
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.3, ease: EASE, delay: 0.15 }}
            >
              Leather that keeps
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block italic"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.3, ease: EASE, delay: 0.3 }}
            >
              your years.
            </motion.span>
          </span>
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.8 }}
          className="mt-10"
        >
          <ButtonLink href="/collections" variant="light">
            Explore the Collections
          </ButtonLink>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        aria-hidden="true"
      >
        <motion.div
          className="h-12 w-px bg-bone/40"
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
      </motion.div>
    </section>
  );
}
