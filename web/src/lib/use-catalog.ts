"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import { products as seedProducts } from "./data";
import type { Product } from "./types";

/**
 * The live product catalog, with the static seed as the initial value.
 *
 * The storefront is a static export, so it ships with the seed baked in and
 * renders instantly. On mount it fetches the published catalog from the API
 * and upgrades to live data — new products, price and featured changes appear
 * without a rebuild. If the API is unreachable, the seed simply stays, so the
 * store is never empty.
 */
export function useCatalog(): Product[] {
  const [catalog, setCatalog] = useState<Product[]>(seedProducts);

  useEffect(() => {
    let active = true;
    apiFetch<{ products: Product[] }>("/products")
      .then((d) => {
        if (active && Array.isArray(d.products) && d.products.length > 0) {
          setCatalog(d.products);
        }
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
