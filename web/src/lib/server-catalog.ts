import { getProduct } from "./data";
import type { Product } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/**
 * Server-side product lookup for the detail page. Reads the live catalogue
 * from the API (source of truth for every product, seed or admin-added). If
 * the API is unreachable, falls back to the baked-in seed so the original
 * pieces still render. Returns null when the product does not exist or is not
 * published (the API only returns published products).
 */
export async function fetchProductServer(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/products/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { product: Product };
      return data.product;
    }
    // A 404 from the API means "not a published product" — don't fall back
    // to seed, or an unpublished/edited product could leak.
    if (res.status === 404) return null;
  } catch {
    // API unreachable — fall back to the seed for the original pieces.
    return getProduct(slug) ?? null;
  }
  return getProduct(slug) ?? null;
}
