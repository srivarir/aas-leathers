"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/motion";
import { useCatalog } from "@/lib/use-catalog";
import type { Product } from "@/lib/types";

const sorts: Record<string, { label: string; fn: (a: Product, b: Product) => number }> = {
  featured: { label: "Featured", fn: (a, b) => Number(!!b.featured) - Number(!!a.featured) },
  "price-asc": { label: "Price, low to high", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Price, high to low", fn: (a, b) => b.price - a.price },
  name: { label: "A – Z", fn: (a, b) => a.name.localeCompare(b.name) },
};

export function ShopClient() {
  const products = useCatalog();
  const params = useSearchParams();
  const router = useRouter();

  const raw = params.get("sort");
  const sort = raw && raw in sorts ? raw : "featured";
  const list = products.slice().sort(sorts[sort].fn);

  const onSort = (value: string) => {
    router.replace(value === "featured" ? "/shop" : `/shop?sort=${value}`, {
      scroll: false,
    });
  };

  return (
    <div className="mx-auto max-w-[1500px] px-6 pb-32 pt-32 lg:px-12">
      <Reveal>
        <h1 className="font-display text-[clamp(2rem,4vw,3.4rem)] leading-tight tracking-tight">
          Shop
        </h1>
      </Reveal>

      {/* Count on the left, sort on the right — the bar every shop has. */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
        <p className="text-sm text-muted">
          {list.length} {list.length === 1 ? "piece" : "pieces"}
        </p>
        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="eyebrow text-muted">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="cursor-pointer border border-line bg-surface px-3 py-2 text-sm focus:border-foreground focus:outline-none"
          >
            {Object.entries(sorts).map(([key, s]) => (
              <option key={key} value={key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="py-32 text-center">
          <p className="font-display text-3xl">The bench is empty — for now.</p>
          <p className="mt-4 text-muted">
            New pieces arrive as they are finished, never before.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((product, i) => (
            <ProductCard
              key={product.slug}
              product={product}
              delay={(i % 4) * 0.05}
              priority={i < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}
