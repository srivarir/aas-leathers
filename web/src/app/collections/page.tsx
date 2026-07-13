import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealLines } from "@/components/motion";
import { ArrowRightIcon } from "@/components/icons";
import { collections, productsInCollection } from "@/lib/data";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Four small collections, each with a reason to exist — Heritage, Voyage, Atelier Small Goods and Everyday Carry.",
};

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-6 pb-32 pt-36 lg:px-12">
      <div className="max-w-2xl">
        <Reveal>
          <p className="eyebrow text-muted">The Collections</p>
        </Reveal>
        <RevealLines
          as="h1"
          className="font-display mt-4 text-[clamp(2.4rem,5vw,4.5rem)] leading-[1.08] tracking-tight"
          lines={["Four families.", "No filler."]}
        />
        <Reveal delay={0.25}>
          <p className="mt-8 leading-relaxed text-muted">
            We do not release seasons. A collection grows by one piece only
            when that piece has earned its place on the bench.
          </p>
        </Reveal>
      </div>

      <div className="mt-20 space-y-24 lg:space-y-32">
        {collections.map((collection, i) => {
          const count = productsInCollection(collection.slug).length;
          const even = i % 2 === 0;
          return (
            <Reveal key={collection.slug}>
              <Link
                href={`/collections/${collection.slug}`}
                className={`group grid items-center gap-10 lg:grid-cols-5 lg:gap-16 ${
                  even ? "" : ""
                }`}
              >
                <div
                  className={`relative aspect-[16/10] overflow-hidden bg-bone-soft lg:col-span-3 ${
                    even ? "" : "lg:order-2"
                  }`}
                >
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  />
                </div>
                <div className={`lg:col-span-2 ${even ? "" : "lg:order-1 lg:text-right"}`}>
                  <p className="eyebrow text-muted">
                    {count} {count === 1 ? "piece" : "pieces"}
                  </p>
                  <h2 className="font-display mt-4 text-3xl leading-snug tracking-tight lg:text-4xl">
                    {collection.name}
                  </h2>
                  <p className="mt-5 text-sm leading-relaxed text-muted">
                    {collection.description}
                  </p>
                  <span
                    className={`link-underline eyebrow mt-8 inline-flex items-center gap-3 ${
                      even ? "" : "lg:flex-row-reverse"
                    }`}
                  >
                    Enter the collection <ArrowRightIcon width={16} height={16} />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
