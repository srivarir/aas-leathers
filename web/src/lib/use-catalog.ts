"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import { products as seedProducts } from "./data";
import type { Product } from "./types";

/**
 * The live product catalog, with the static seed as the initial value.
 *
 * The seed renders instantly on first paint. On mount the published catalog
 * is fetched from the API and replaces it, so products added, edited or
 * deleted in the admin appear without a rebuild — including the case where
 * every product has been deleted, which must show an empty shop rather than
 * resurrect the seed. Only a failed request keeps the seed, so the store is
 * never blank because the API blinked.
 */
export function useCatalog(): Product[] {
  const [catalog, setCatalog] = useState<Product[]>(seedProducts);

  useEffect(() => {
    let active = true;
    apiFetch<{ products: Product[] }>("/products")
      .then((d) => {
        if (active && Array.isArray(d.products)) setCatalog(d.products);
      })
      .catch(() => {
        /* API offline — keep the seed catalog. */
      });
    return () => {
      active = false;
    };
  }, []);

  return catalog;
}
