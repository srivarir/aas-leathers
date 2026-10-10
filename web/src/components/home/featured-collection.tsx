import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { ProductCard } from "@/components/product-card";
import { fetchCatalogServer } from "@/lib/server-catalog";

/**
 * Rendered on the server from the live catalogue, not from the seed.
 *
 * Reading it on the client meant the HTML shipped with whatever the seed
 * happened to contain and then swapped — so visitors saw pieces the shop does
 * not sell, clicking one in that moment landed on a 404, and search engines
 * indexed them.
 */
export async function FeaturedCollection() {
  const catalog = await fetchCatalogServer();
  const featured = catalog
    .slice()
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    .slice(0, 8);

  if (featured.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1500px] px-6 py-20 lg:px-12 lg:py-28">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-5">
        <Reveal>
          <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight tracking-tight">
            The pieces
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <Link href="/shop" className="link-underline eyebrow inline-flex items-center gap-3">
            Shop all <ArrowRightIcon width={16} height={16} />
          </Link>
        </Reveal>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
        {featured.map((product, i) => (
          <ProductCard key={product.slug} product={product} delay={(i % 4) * 0.06} />
        ))}
      </div>
    </section>
  );
}
