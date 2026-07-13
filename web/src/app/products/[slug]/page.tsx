import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { ProductCard } from "@/components/product-card";
import { Reveal, RevealLines } from "@/components/motion";
import { categoryLabels, getCollection, relatedProducts } from "@/lib/data";
import { fetchProductServer } from "@/lib/server-catalog";
import { formatINR } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductServer(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.tagline}. ${product.leather}. ${formatINR(product.price)}.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductServer(slug);
  if (!product) notFound();

  const collection = getCollection(product.collection);
  const related = relatedProducts(product);

  const specs = [
    ["Leather", product.leather],
    ["Hardware", product.hardware],
    ["Lining", product.lining],
    ["Dimensions", product.dimensions],
  ];

  return (
    <div className="pb-32 pt-28 lg:pt-32">
      <div className="mx-auto grid max-w-[1500px] gap-12 px-6 lg:grid-cols-11 lg:gap-20 lg:px-12">
        <div className="lg:col-span-6">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="lg:col-span-5 lg:pt-8">
          <Reveal>
            <p className="eyebrow text-muted">
              {collection?.name} · {categoryLabels[product.category]}
            </p>
            <h1 className="font-display mt-4 text-[clamp(2.2rem,4vw,3.6rem)] leading-[1.08] tracking-tight">
              {product.name}
            </h1>
            <p className="font-display mt-3 text-xl italic text-muted">
              {product.tagline}
            </p>
            <p className="mt-6 text-2xl tabular-nums">{formatINR(product.price)}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <PurchasePanel product={product} />
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-12 leading-relaxed text-foreground/80">{product.story}</p>
          </Reveal>

          <Reveal delay={0.2}>
            <ul className="mt-10 space-y-3 border-t border-line pt-8">
              {product.details.map((d) => (
                <li key={d} className="flex gap-3 text-sm leading-relaxed text-foreground/75">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cognac" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.25}>
            <dl className="mt-10 divide-y divide-line border-y border-line">
              {specs.map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-4 py-4">
                  <dt className="eyebrow text-muted">{label}</dt>
                  <dd className="col-span-2 text-sm leading-relaxed">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-10">
              <p className="eyebrow text-muted">Care</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">{product.care}</p>
            </div>
            <div className="mt-8">
              <p className="eyebrow text-muted">In the box</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                Dust bag, leather care balm, and a hand-signed card from the
                maker. A lifetime repair promise — our bench sees every bag
                back, eventually.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* The material, up close */}
      <section className="mx-auto mt-28 max-w-[1500px] px-6 lg:mt-40 lg:px-12">
        <div className="grid items-center gap-12 bg-espresso text-bone lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:self-stretch">
            <Image
              src={product.images[1] ?? product.images[0]}
              alt={`${product.name} — leather detail`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="px-8 pb-14 lg:px-16 lg:py-20">
            <p className="eyebrow text-bone/50">Why it deserves its price</p>
            <RevealLines
              as="h2"
              className="font-display mt-6 text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.15] tracking-tight"
              lines={["Cost per year,", "not cost per bag."]}
            />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-bone/70">
              Divide the price by twenty years of daily carry and this becomes
              the least expensive bag you will own. Everything about its
              construction — the stitch, the hide, the brass — exists to make
              that arithmetic honest.
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto mt-28 max-w-[1500px] px-6 lg:mt-40 lg:px-12">
          <Reveal>
            <p className="eyebrow text-muted">Kept in the same company</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight lg:text-4xl">
              You may also carry
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.slug} product={p} delay={i * 0.08} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
