"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/motion";
import { ButtonLink } from "@/components/ui/button";
import { getProduct } from "@/lib/data";
import { useWishlist } from "@/lib/store";

export default function WishlistPage() {
  const slugs = useWishlist((s) => s.slugs);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const list = mounted
    ? slugs.map(getProduct).filter((p) => p !== undefined)
    : [];

  return (
    <div className="mx-auto max-w-[1500px] px-6 pb-32 pt-36 lg:px-12">
      <Reveal>
        <p className="eyebrow text-muted">Kept in mind</p>
        <h1 className="font-display mt-4 text-[clamp(2.4rem,5vw,4.5rem)] leading-tight tracking-tight">
          Wishlist
        </h1>
      </Reveal>

      {mounted && list.length === 0 ? (
        <div className="py-28 text-center">
          <p className="font-display text-3xl">Nothing kept aside yet.</p>
          <p className="mx-auto mt-4 max-w-md text-muted">
            When a piece stays on your mind, keep it here. Good decisions
            deserve a little time.
          </p>
          <div className="mt-10">
            <ButtonLink href="/shop" variant="outline">
              Browse the Pieces
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((product, i) => (
            <ProductCard key={product.slug} product={product} delay={(i % 4) * 0.06} />
          ))}
        </div>
      )}
    </div>
  );
}
