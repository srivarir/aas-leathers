"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./types";
import { getProduct } from "./data";

/** The details snapshotted into the cart when a product is added. */
export interface CartAddInput {
  slug: string;
  name: string;
  price: number;
  image?: string;
  color?: string;
}

/**
 * A cart line is a piece *in a finish* — the same bag in cognac and in
 * espresso are two lines, so this, not the slug, is what identifies one.
 */
export const lineKey = (item: { slug: string; color?: string }) =>
  `${item.slug}::${item.color ?? ""}`;

interface CartState {
  items: CartItem[];
  add: (product: CartAddInput, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (product, qty = 1) =>
        set((s) => {
          const key = lineKey(product);
          if (s.items.some((i) => lineKey(i) === key)) {
            return {
              items: s.items.map((i) =>
                lineKey(i) === key ? { ...i, qty: Math.min(i.qty + qty, 9) } : i,
              ),
            };
          }
          return {
            items: [
              ...s.items,
              {
                slug: product.slug,
                qty,
                name: product.name,
                price: product.price,
                image: product.image,
                color: product.color,
              },
            ],
          };
        }),
      remove: (key) =>
        set((s) => ({ items: s.items.filter((i) => lineKey(i) !== key) })),
      setQty: (key, qty) =>
        set((s) => ({
          items:
            qty < 1
              ? s.items.filter((i) => lineKey(i) !== key)
              : s.items.map((i) =>
                  lineKey(i) === key ? { ...i, qty: Math.min(qty, 9) } : i,
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "aas-cart" },
  ),
);

export const cartCount = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.qty, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce(
    // Prefer the snapshotted price; fall back to seed data for older carts.
    (sum, i) => sum + (i.price ?? getProduct(i.slug)?.price ?? 0) * i.qty,
    0,
  );

interface WishlistState {
  slugs: string[];
  toggle: (slug: string) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      slugs: [],
      toggle: (slug) =>
        set((s) => ({
          slugs: s.slugs.includes(slug)
            ? s.slugs.filter((x) => x !== slug)
            : [...s.slugs, slug],
        })),
    }),
    { name: "aas-wishlist" },
  ),
);

interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}));
