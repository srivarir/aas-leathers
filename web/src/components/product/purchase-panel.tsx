"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, HeartIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useCart, useUI, useWishlist } from "@/lib/store";
import type { Product } from "@/lib/types";

export function PurchasePanel({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  // The page is statically built, so availability starts from build time and
  // is corrected against the live catalog on mount. If the API is offline we
  // quietly keep the build-time value — the server re-checks at checkout.
  const [inStock, setInStock] = useState(product.inStock);
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const { slugs, toggle } = useWishlist();
  const wished = slugs.includes(product.slug);

  useEffect(() => {
    apiFetch<{ product: { inStock: boolean } }>(`/products/${product.slug}`)
      .then((d) => setInStock(d.product.inStock))
      .catch(() => {});
  }, [product.slug]);

  const handleAdd = () => {
    add(
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0],
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setCartOpen(true);
    }, 900);
  };

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-stretch gap-4">
        <div className="flex items-center border border-line">
          <button
            className="cursor-pointer px-4 py-4 transition-opacity hover:opacity-60"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <MinusIcon width={14} height={14} />
          </button>
          <span className="w-8 text-center tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button
            className="cursor-pointer px-4 py-4 transition-opacity hover:opacity-60"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(9, q + 1))}
          >
            <PlusIcon width={14} height={14} />
          </button>
        </div>

        <Button
          onClick={handleAdd}
          disabled={!inStock || added}
          className="min-w-56 flex-1"
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="added"
                className="inline-flex items-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <CheckIcon width={16} height={16} /> Set aside for you
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {inStock ? "Add to Cart" : "Sold out this season"}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        <button
          className={`cursor-pointer border px-5 transition-colors duration-300 ${
            wished
              ? "border-cognac text-cognac"
              : "border-line text-foreground hover:border-foreground"
          }`}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          onClick={() => toggle(product.slug)}
        >
          <HeartIcon filled={wished} />
        </button>
      </div>

      {!inStock && (
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Twelve are made each season. Write to us and we will reserve one
          from the next bench.
        </p>
      )}
    </div>
  );
}
