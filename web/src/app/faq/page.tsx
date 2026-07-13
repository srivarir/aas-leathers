"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE, Reveal } from "@/components/motion";
import { ChevronDownIcon } from "@/components/icons";

const faqs = [
  {
    q: "How long will my bag actually last?",
    a: "Carried daily and conditioned once or twice a year, a full-grain vegetable-tanned bag comfortably outlives twenty years. Our repairs bench regularly services bags older than the people bringing them in.",
  },
  {
    q: "The leather arrived firm. Is that right?",
    a: "Yes. Vegetable-tanned leather leaves the workshop deliberately firm and breaks in over four to eight weeks of use, moulding to how you carry it. That break-in is what chrome-tanned bags skip — and why they never truly fit their owners.",
  },
  {
    q: "What does the lifetime repair promise cover?",
    a: "Stitching, edges, hardware and structural repairs on every piece we have ever made, for as long as we exist. You pay shipping to the workshop; the bench work is ours. Damage from neglect we will still repair, honestly priced.",
  },
  {
    q: "Do you take returns?",
    a: "Unused pieces in their original packaging return freely within 30 days for a full refund. Once leather has begun taking your patina, it is yours — which is why we describe every piece so thoroughly before you buy.",
  },
  {
    q: "How should I care for the leather?",
    a: "Little and rarely: a dry cloth when dusty, our balm twice a year, natural drying if it meets rain. Keep it stuffed in its dust bag during long storage. Avoid radiators, car boots in summer, and silicone sprays.",
  },
  {
    q: "Where are the bags made?",
    a: "Every piece is cut, stitched and finished in our own workshop in India, by makers who sign the ledger against each bag's number. Nothing is outsourced; nothing is assembled elsewhere.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl px-6 pb-32 pt-36">
      <Reveal>
        <p className="eyebrow text-muted">Questions, answered plainly</p>
        <h1 className="font-display mt-4 text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.08] tracking-tight">
          FAQ
        </h1>
      </Reveal>

      <div className="mt-16 divide-y divide-line border-y border-line">
        {faqs.map((faq, i) => (
          <div key={faq.q}>
            <button
              className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span className="font-display text-xl leading-snug">{faq.q}</span>
              <motion.span
                animate={{ rotate: open === i ? 180 : 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="shrink-0 text-muted"
              >
                <ChevronDownIcon />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="pb-7 pr-10 text-sm leading-relaxed text-muted">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <Reveal delay={0.1}>
        <p className="mt-12 text-sm text-muted">
          Something else on your mind?{" "}
          <a href="/contact" className="link-underline text-foreground">
            Write to the workshop
          </a>
          . A person answers, within a working day.
        </p>
      </Reveal>
    </div>
  );
}
