"use client";

import Link from "next/link";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/motion";
import { categoryLabels } from "@/lib/data";
import { useCatalog } from "@/lib/use-catalog";
import type { Category, Product } from "@/lib/types";

const sorts: Record<string, { label: string; fn: (a: Product, b: Product) => number }> = {
  featured: { label: "Featured", fn: () => 0 },
  "price-asc": { label: "Price, low to high", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Price, high to low", fn: (a, b) => b.price - a.price },
};

export function ShopClient() {
  const products = useCatalog();
  const params = useSearchParams();
  const rawCategory = params.get("category");
  const category = (
    rawCategory && rawCategory in categoryLabels ? rawCategory : null
  ) as Category | null;
  const rawSort = params.get("sort");
  const sort = rawSort && rawSort in sorts ? rawSort : "featured";

  const list = products
    .filter((p) => !category || p.category === category)
    .slice()
    .sort(sorts[sort].fn);

  const categories = Object.keys(categoryLabels) as Category[];
  const href = (c: Category | null, s: string) => {
    const q = new URLSearchParams();
    if (c) q.set("category", c);
    if (s !== "featured") q.set("sort", s);
    const qs = q.toString();
    return (qs ? `/shop?${qs}` : "/shop") as Route;
  };

  return (
    <div className="mx-auto max-w-[1500px] px-6 pb-32 pt-36 lg:px-12">
      <Reveal>
        <p className="eyebrow text-muted">The full ledger</p>
        <h1 className="font-display mt-4 text-[clamp(2.4rem,5vw,4.5rem)] leading-tight tracking-tight">
          All Pieces
        </h1>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-y border-line py-5">
          <nav className="flex flex-wrap gap-6" aria-label="Filter by category">
            <Link
              href={href(null, sort)}
              className={`eyebrow link-underline ${!category ? "" : "text-muted"}`}
              aria-current={!category ? "true" : undefined}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                href={href(c, sort)}
                className={`eyebrow link-underline ${category === c ? "" : "text-muted"}`}
                aria-current={category === c ? "true" : undefined}
              >
                {categoryLabels[c]}
              </Link>
            ))}
          </nav>
          <nav className="flex gap-6" aria-label="Sort">
            {Object.keys(sorts).map((key) => (
              <Link
                key={key}
                href={href(category, key)}
                className={`text-xs ${sort === key ? "text-foreground" : "text-muted"} link-underline`}
                aria-current={sort === key ? "true" : undefined}
              >
                {sorts[key].label}
              </Link>
            ))}
          </nav>
        </div>
      </Reveal>

      {list.length === 0 ? (
        <div className="py-32 text-center">
          <p className="font-display text-3xl">The bench is empty — for now.</p>
          <p className="mt-4 text-muted">
            New pieces arrive as they are finished, never before.
          </p>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((product, i) => (
            <ProductCard
              key={product.slug}
              product={product}
              delay={(i % 4) * 0.06}
              priority={i < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}
