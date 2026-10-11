"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, HeartIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useCart, useUI, useWishlist } from "@/lib/store";
import type { Product } from "@/lib/types";
import { useProductColor } from "@/components/product/color-context";

export function PurchasePanel({ product }: { product: Product }) {
  const ctx = useProductColor();
  const colors = ctx?.colors ?? product.colors ?? [];
  const color = ctx?.selected?.name;
  const setColor = (name: string) => ctx?.select(name);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const { slugs, toggle } = useWishlist();
  const wished = slugs.includes(product.slug);

  const handleAdd = () => {
    add(
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: ctx?.images[0] ?? product.images[0],
        color,
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
      {colors.length > 0 && (
        <fieldset className="mb-8">
          <legend className="eyebrow text-muted">
            Finish{color ? <span className="ml-2 text-foreground">{color}</span> : null}
          </legend>
          <div className="mt-4 flex flex-wrap gap-3">
            {colors.map((c) => {
              const active = c.name === color;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  aria-pressed={active}
                  aria-label={c.name}
                  title={c.name}
                  className={`h-9 w-9 cursor-pointer rounded-full ring-offset-2 ring-offset-background transition-all duration-200 ${
                    active ? "ring-2 ring-foreground" : "ring-1 ring-line hover:ring-foreground/40"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
          </div>
        </fieldset>
      )}
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
          disabled={added}
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
                Add to Cart
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

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Each piece is made to order on the bench. Allow two to three weeks
        before it ships.
      </p>
    </div>
  );
}
