import type { Metadata } from "next";
import Image from "next/image";
import { Reveal, RevealLines } from "@/components/motion";
import { ButtonLink } from "@/components/ui/button";
import { IMAGES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Craftsmanship",
  description:
    "Leather selection, cutting, saddle stitching, edge finishing, hardware and inspection — the seven slow stages behind every AAS piece.",
};

const stages = [
  {
    n: "01",
    title: "Reading the hide",
    body: "Every hide is unrolled and read before it is cut. Tight back grain becomes structure; the softer belly becomes movement. Scars stay if they carry character; weaknesses never pass the table.",
    image: IMAGES.hideCraft,
  },
  {
    n: "02",
    title: "Cutting",
    body: "Panels are cut by knife against brass templates worn smooth by years of use. A single Madras Tote comes from one hide, so the grain flows unbroken around the body.",
    image: IMAGES.workshopTools,
  },
  {
    n: "03",
    title: "Skiving & assembly",
    body: "Edges are thinned by hand where panels meet, so seams fold without bulk. Nothing is glued that is not also stitched.",
    image: IMAGES.workshopHands,
  },
  {
    n: "04",
    title: "Saddle stitching",
    body: "Two needles cross inside every awl hole. Cut any single stitch and the seam holds. Eleven metres of waxed linen thread go into our largest bag — every metre set by hand.",
    image: IMAGES.grainMacro,
  },
  {
    n: "05",
    title: "Edge finishing",
    body: "Edges are sanded, dyed, waxed and burnished — then the cycle repeats, five times. A finished edge should feel like polished stone.",
    image: IMAGES.wallet,
  },
  {
    n: "06",
    title: "Hardware",
    body: "Solid cast brass only, fastened through leather with saddler's rivets or stitching. New brass is polished, then deliberately dulled one grade. It should whisper.",
    image: IMAGES.satchel,
  },
  {
    n: "07",
    title: "Inspection & signature",
    body: "The maker who finishes a piece signs against its number in the workshop ledger. If it isn't worth signing, it doesn't leave.",
    image: IMAGES.heroBag,
  },
];

export default function CraftsmanshipPage() {
  return (
    <div className="pb-32">
      <section className="relative flex h-[70svh] items-end overflow-hidden bg-espresso">
        <Image
          src={IMAGES.workshopHands}
          alt="Hands stitching leather at the workshop bench"
          fill
          priority
          sizes="100vw"
          className="animate-drift object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 pb-16 text-bone lg:px-12">
          <Reveal>
            <p className="eyebrow text-bone/60">Craftsmanship</p>
          </Reveal>
          <RevealLines
            as="h1"
            className="font-display mt-4 text-[clamp(2.6rem,6vw,5.5rem)] leading-[1.05] tracking-tight"
            lines={["Seven stages.", "No hurry in any of them."]}
          />
        </div>
      </section>

      <div className="mx-auto mt-24 max-w-[1500px] px-6 lg:px-12">
        <div className="space-y-24 lg:space-y-36">
          {stages.map((stage, i) => {
            const even = i % 2 === 0;
            return (
              <div
                key={stage.n}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20"
              >
                <Reveal className={even ? "" : "lg:order-2"}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-bone-soft">
                    <Image
                      src={stage.image}
                      alt={stage.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
                <div className={even ? "lg:pl-8" : "lg:order-1 lg:pr-8"}>
                  <Reveal delay={0.1}>
                    <p className="font-display text-6xl text-line lg:text-7xl">{stage.n}</p>
                    <h2 className="font-display mt-4 text-3xl tracking-tight lg:text-4xl">
                      {stage.title}
                    </h2>
                    <p className="mt-5 max-w-md leading-relaxed text-muted">{stage.body}</p>
                  </Reveal>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-32 border-t border-line pt-20 text-center">
          <RevealLines
            as="h2"
            className="font-display text-[clamp(1.8rem,3.5vw,3rem)] leading-[1.15] tracking-tight"
            lines={["The result of all this patience", "is waiting on the shelf."]}
          />
          <Reveal delay={0.25}>
            <div className="mt-10">
              <ButtonLink href="/shop">Shop the Pieces</ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
