"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal, RevealLines } from "@/components/motion";
import { ArrowRightIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { IMAGES } from "@/lib/data";

/* ————— Workshop, with a slow parallax ————— */
export function Craftsmanship() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section className="mx-auto grid max-w-[1500px] items-center gap-14 px-6 pb-28 lg:grid-cols-2 lg:gap-24 lg:px-12 lg:pb-44">
      <div ref={ref} className="relative aspect-[4/5] overflow-hidden bg-bone-soft">
        <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0">
          <Image
            src={IMAGES.workshopHands}
            alt="A craftsman saddle-stitching a leather panel by hand"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
      </div>
      <div className="lg:pr-12">
        <Reveal>
          <p className="eyebrow text-muted">Craftsmanship</p>
        </Reveal>
        <RevealLines
          as="h2"
          className="font-display mt-8 text-[clamp(2rem,3.5vw,3.2rem)] leading-[1.12] tracking-tight"
          lines={["Two needles,", "one awl hole,", "no shortcuts."]}
        />
        <Reveal delay={0.3}>
          <p className="mt-8 max-w-md leading-relaxed text-muted">
            A sewing machine locks thread with a loop that unravels when cut.
            A saddle stitch crosses two threads inside every hole — cut one,
            and the seam holds. It is five times slower. It is the only way we
            sew.
          </p>
        </Reveal>
        <Reveal delay={0.45}>
          <Link
            href="/craftsmanship"
            className="link-underline eyebrow mt-10 inline-flex items-center gap-3"
          >
            Inside the workshop <ArrowRightIcon width={16} height={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ————— Lifestyle interlude — full bleed, one line ————— */
export function Lifestyle() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section ref={ref} className="relative h-[80svh] overflow-hidden">
      <motion.div style={{ y }} className="absolute -inset-y-[14%] inset-x-0">
        <Image
          src={IMAGES.bagTravel}
          alt="A leather weekender resting beside a train window"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-espresso/40" />
      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
        <RevealLines
          as="p"
          className="font-display max-w-4xl text-[clamp(1.8rem,4vw,3.6rem)] leading-[1.15] tracking-tight text-bone"
          lines={["Good luggage doesn't retire.", "It just changes cities."]}
        />
      </div>
    </section>
  );
}

/* ————— Closing invitation ————— */
export function ClosingInvitation() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-4xl px-6 py-28 text-center lg:py-40">
        <RevealLines
          as="h2"
          className="font-display text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.12] tracking-tight"
          lines={["Begin with one piece.", "Keep it for a lifetime."]}
        />
        <Reveal delay={0.3}>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/shop">Shop the Pieces</ButtonLink>
            <ButtonLink href="/craftsmanship" variant="outline">
              See How They&apos;re Made
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
