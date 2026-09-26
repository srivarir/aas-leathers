import type { MetadataRoute } from "next";
import { journalPosts, products as seedProducts } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { fetchCollectionsServer } from "@/lib/server-catalog";
import type { Product } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

const STATIC_PATHS = [
  "",
  "/shop",
  "/collections",
  "/craftsmanship",
  "/journal",
  "/about",
  "/contact",
  "/faq",
  "/terms",
  "/privacy-policy",
  "/refund-policy",
  "/data-compliance",
];

/** Live catalogue, so admin-added pieces are listed too; seed if the API is down. */
async function catalogue(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products`, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { products: Product[] };
      if (data.products?.length) return data.products;
    }
  } catch {
    // fall through to the seed
  }
  return seedProducts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [live, collections] = await Promise.all([
    catalogue(),
    fetchCollectionsServer(),
  ]);

  return [
    ...STATIC_PATHS.map((p) => ({
      url: `${SITE_URL}${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...live.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...collections.map((c) => ({
      url: `${SITE_URL}/collections/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...journalPosts.map((j) => ({
      url: `${SITE_URL}/journal/${j.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];
}
