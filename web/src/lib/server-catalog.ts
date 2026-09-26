import { getProduct } from "./data";
import type { Collection, Product } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/**
 * Server-side product lookup for the detail page. Reads the live catalogue
 * from the API (source of truth for every product, seed or admin-added). If
 * the API is unreachable, falls back to the baked-in seed so the original
 * pieces still render. Returns null when the product does not exist or is not
 * published (the API only returns published products).
 */
/**
 * The published collections, in the order the admin arranged them. Like the
 * catalogue, there is no seed fallback: a collection link that 404s is worse
 * than a collection that is briefly missing.
 */
export async function fetchCollectionsServer(): Promise<Collection[]> {
  try {
    const res = await fetch(`${API}/collections`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { collections?: Collection[] };
    return data.collections ?? [];
  } catch {
    return [];
  }
}

export async function fetchCollectionServer(
  slug: string,
): Promise<Collection | null> {
  const all = await fetchCollectionsServer();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function fetchCatalogServer(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { products?: Product[] };
    return data.products ?? [];
  } catch {
    return [];
  }
}

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
