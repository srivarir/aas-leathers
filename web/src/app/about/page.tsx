import type { Metadata } from "next";
import Image from "next/image";
import { Reveal, RevealLines } from "@/components/motion";
import { ButtonLink } from "@/components/ui/button";
import { IMAGES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "AAS Leathers began at a single bench in 1987. Three generations later, we still make fewer things, more slowly, from better leather.",
};

const beliefs = [
  {
    title: "Buy once",
    body: "A bag replaced every three years is not cheap, whatever it costs. We build for the other arithmetic — decades of carry, one purchase.",
  },
  {
    title: "Material honesty",
    body: "Full-grain hide, vegetable tannage, solid brass, linen thread. Nothing coated, nothing laminated, nothing pretending.",
  },
  {
    title: "Repair over replace",
    body: "Our repairs bench sees every bag eventually — usually decades in, usually for a new zip and a story. That bench is our proudest department.",
  },
];

export default function AboutPage() {
  return (
    <div className="pb-32 pt-36">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <div className="max-w-3xl">
          <Reveal>
            <p className="eyebrow text-muted">Our story</p>
          </Reveal>
          <RevealLines
            as="h1"
            className="font-display mt-6 text-[clamp(2.4rem,5.5vw,5rem)] leading-[1.06] tracking-tight"
            lines={["One bench, 1987.", "Three generations since."]}
          />
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-5 lg:gap-20">
          <Reveal className="lg:col-span-3">
            <div className="relative aspect-[4/3] overflow-hidden bg-bone-soft">
              <Image
                src={IMAGES.workshopTools}
                alt="The original tools of the first AAS workbench"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <div className="lg:col-span-2">
            <Reveal delay={0.1}>
              <p className="leading-relaxed text-foreground/80">
                AAS Leathers began when a saddler&apos;s son set up a single
                bench in Madras and took a commission for a bookseller&apos;s
                bag. The brief was one sentence: it should outlive the shop.
              </p>
              <p className="mt-6 leading-relaxed text-foreground/80">
                That bag still carries. The bench has grown into a workshop of
                fourteen makers, but the brief has never changed. We do not
                release seasons. We do not chase trends. A new piece joins the
                ledger only when it has earned its place.
              </p>
              <p className="mt-6 leading-relaxed text-foreground/80">
                Everything we make is cut, stitched and finished by hand in
                India, from hides tanned with bark in pits our founder would
                recognise.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-28 grid gap-10 border-t border-line pt-16 md:grid-cols-3">
          {beliefs.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.1}>
              <p className="font-display text-4xl text-line">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="font-display mt-4 text-2xl tracking-tight">{b.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">{b.body}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-28 bg-espresso px-8 py-20 text-center text-bone lg:py-28">
          <RevealLines
            as="h2"
            className="font-display text-[clamp(1.8rem,3.5vw,3rem)] leading-[1.15] tracking-tight"
            lines={["The workshop door is open.", "So is the ledger."]}
          />
          <Reveal delay={0.25}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/craftsmanship" variant="light">
                See the Craft
              </ButtonLink>
              <ButtonLink href="/contact" variant="light">
                Write to Us
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
