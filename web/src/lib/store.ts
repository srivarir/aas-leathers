"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./types";
import { getProduct } from "./data";

interface CartState {
  items: CartItem[];
  add: (slug: string, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (slug, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.slug === slug);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.slug === slug ? { ...i, qty: Math.min(i.qty + qty, 9) } : i,
              ),
            };
          }
          return { items: [...s.items, { slug, qty }] };
        }),
      remove: (slug) =>
        set((s) => ({ items: s.items.filter((i) => i.slug !== slug) })),
      setQty: (slug, qty) =>
        set((s) => ({
          items:
            qty < 1
              ? s.items.filter((i) => i.slug !== slug)
              : s.items.map((i) =>
                  i.slug === slug ? { ...i, qty: Math.min(qty, 9) } : i,
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
  items.reduce((sum, i) => sum + (getProduct(i.slug)?.price ?? 0) * i.qty, 0);

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
