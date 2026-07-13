import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/motion";
import { collections, getCollection, productsInCollection } from "@/lib/data";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return {};
  return { title: collection.name, description: collection.description };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const list = productsInCollection(slug);

  return (
    <div className="pb-32">
      <section className="relative flex h-[62svh] items-end overflow-hidden bg-espresso">
        <Image
          src={collection.image}
          alt={collection.name}
          fill
          priority
          sizes="100vw"
          className="animate-drift object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 pb-16 text-bone lg:px-12">
          <Reveal>
            <p className="eyebrow text-bone/60">A collection</p>
            <h1 className="font-display mt-4 max-w-3xl text-[clamp(2.4rem,5.5vw,5rem)] leading-[1.05] tracking-tight">
              {collection.name}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-bone/70">
              {collection.description}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto mt-20 max-w-[1500px] px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((product, i) => (
            <ProductCard key={product.slug} product={product} delay={(i % 3) * 0.08} />
          ))}
        </div>
      </div>
    </div>
  );
}
