"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ProductColor } from "@/lib/types";

interface ColorState {
  colors: ProductColor[];
  selected: ProductColor | null;
  select: (name: string) => void;
  /** The photographs to show: the selected colour's, or the piece's own. */
  images: string[];
}

const Ctx = createContext<ColorState | null>(null);

/**
 * Shares the chosen finish between the gallery and the buy panel, which sit in
 * separate columns of the product page and so cannot hold the state between
 * them. Both are client components, so they read this even though the page
 * around them is rendered on the server.
 */
export function ProductColorProvider({
  colors,
  fallbackImages,
  children,
}: {
  colors: ProductColor[];
  fallbackImages: string[];
  children: React.ReactNode;
}) {
  const [name, setName] = useState(colors[0]?.name);

  const value = useMemo<ColorState>(() => {
    const selected = colors.find((c) => c.name === name) ?? colors[0] ?? null;
    const own = selected?.images ?? [];
    return {
      colors,
      selected,
      select: setName,
      // A finish that has not been photographed falls back to the piece's
      // own images rather than showing an empty gallery.
      images: own.length > 0 ? own : fallbackImages,
    };
  }, [colors, name, fallbackImages]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Null when the piece is rendered outside a provider, e.g. in a card. */
export function useProductColor() {
  return useContext(Ctx);
}
