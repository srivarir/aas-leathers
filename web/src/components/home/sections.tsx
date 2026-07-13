"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal, RevealLines } from "@/components/motion";
import { ArrowRightIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { IMAGES, journalPosts } from "@/lib/data";
import { useCatalog } from "@/lib/use-catalog";

/* ————— A quiet manifesto, set large ————— */
export function Statement() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-28 text-center lg:py-44">
      <Reveal>
        <p className="eyebrow text-muted">The house position</p>
      </Reveal>
      <RevealLines
        as="h2"
        className="font-display mt-10 text-[clamp(1.9rem,4.5vw,3.8rem)] leading-[1.15] tracking-tight"
        lines={[
          "We make fewer things,",
          "more slowly, from better leather —",
          "and we expect you to keep them.",
        ]}
      />
      <Reveal delay={0.4}>
        <p className="mx-auto mt-10 max-w-xl text-base leading-relaxed text-muted">
          Every AAS piece is cut from full-grain, vegetable-tanned hide and
          saddle-stitched by hand. Not because it is romantic, but because it
          is the only construction we trust for twenty years of carrying.
        </p>
      </Reveal>
    </section>
  );
}

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

/* ————— Featured pieces ————— */
export function FeaturedCollection() {
  const catalog = useCatalog();
  // Featured pieces if any are flagged; otherwise the first four, so the
  // section is never empty.
  const flagged = catalog.filter((p) => p.featured);
  const featured = (flagged.length > 0 ? flagged : catalog).slice(0, 4);
  return (
    <section className="mx-auto max-w-[1500px] px-6 pb-28 lg:px-12 lg:pb-44">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <p className="eyebrow text-muted">The Heritage Collection</p>
          </Reveal>
          <RevealLines
            as="h2"
            className="font-display mt-6 text-[clamp(2rem,3.5vw,3.2rem)] leading-tight tracking-tight"
            lines={["Carried first,", "inherited later."]}
          />
        </div>
        <Reveal delay={0.2}>
          <Link href="/shop" className="link-underline eyebrow inline-flex items-center gap-3">
            View all pieces <ArrowRightIcon width={16} height={16} />
          </Link>
        </Reveal>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((product, i) => (
          <ProductCard key={product.slug} product={product} delay={i * 0.08} />
        ))}
      </div>
    </section>
  );
}

/* ————— The leather itself — dark, close, material ————— */
export function LeatherStory() {
  return (
    <section className="bg-espresso text-bone">
      <div className="mx-auto grid max-w-[1500px] items-center gap-14 px-6 py-28 lg:grid-cols-2 lg:gap-24 lg:px-12 lg:py-44">
        <div className="order-2 lg:order-1 lg:pl-12">
          <Reveal>
            <p className="eyebrow text-bone/50">The material</p>
          </Reveal>
          <RevealLines
            as="h2"
            className="font-display mt-8 text-[clamp(2rem,3.5vw,3.2rem)] leading-[1.12] tracking-tight"
            lines={["Tanned by bark.", "Finished by you."]}
          />
          <Reveal delay={0.3}>
            <p className="mt-8 max-w-md leading-relaxed text-bone/70">
              Our hides spend six weeks in pits of oak and myrobalan bark — a
              method older than the industry that replaced it. The leather
              leaves us firm and pale. Your hands, your weather and your years
              do the rest, darkening it into a patina no factory can imitate.
            </p>
          </Reveal>
          <Reveal delay={0.45}>
            <div className="mt-12 grid max-w-md grid-cols-3 gap-8 border-t border-bone/15 pt-8">
              {[
                ["6", "weeks in the tanning pit"],
                ["1", "hide per Madras Tote"],
                ["20+", "years of expected carry"],
              ].map(([n, label]) => (
                <div key={label}>
                  <p className="font-display text-4xl">{n}</p>
                  <p className="mt-2 text-xs leading-relaxed text-bone/50">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal className="order-1 lg:order-2">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={IMAGES.grainMacro}
              alt="Macro photograph of full-grain leather texture"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
            />
          </div>
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

/* ————— One voice, set large ————— */
export function Testimonial() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-28 text-center lg:py-44">
      <Reveal>
        <p className="eyebrow text-muted">From a letter we keep</p>
      </Reveal>
      <Reveal delay={0.15}>
        <blockquote className="font-display mt-10 text-[clamp(1.6rem,3.2vw,2.8rem)] leading-[1.3] tracking-tight">
          “My father bought his Cathedral in the year I was born. He handed it
          to me when I passed the bar. I intend to be equally dramatic about
          it with my own daughter.”
        </blockquote>
      </Reveal>
      <Reveal delay={0.3}>
        <cite className="eyebrow mt-10 block not-italic text-muted">
          Adv. N. Raghavan · Madras
        </cite>
      </Reveal>
    </section>
  );
}

/* ————— Journal preview ————— */
export function JournalPreview() {
  return (
    <section className="mx-auto max-w-[1500px] border-t border-line px-6 py-28 lg:px-12 lg:py-36">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <p className="eyebrow text-muted">The Journal</p>
          </Reveal>
          <RevealLines
            as="h2"
            className="font-display mt-6 text-[clamp(2rem,3.5vw,3.2rem)] leading-tight tracking-tight"
            lines={["Notes on leather,", "and the long life of things."]}
          />
        </div>
        <Reveal delay={0.2}>
          <Link href="/journal" className="link-underline eyebrow inline-flex items-center gap-3">
            Read the journal <ArrowRightIcon width={16} height={16} />
          </Link>
        </Reveal>
      </div>
      <div className="grid gap-12 md:grid-cols-3">
        {journalPosts.map((post, i) => (
          <Reveal key={post.slug} delay={i * 0.1}>
            <Link href={`/journal/${post.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden bg-bone-soft">
                <Image
                  src={post.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
              </div>
              <p className="eyebrow mt-6 text-muted">
                {post.category} · {post.readingTime}
              </p>
              <h3 className="font-display mt-3 text-2xl leading-snug">{post.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
            </Link>
          </Reveal>
        ))}
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
              See How They're Made
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
