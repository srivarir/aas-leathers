import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing here is secret — these pages are simply useless to a crawler,
      // and the account and admin areas are guarded server-side regardless.
      disallow: ["/admin", "/account", "/checkout", "/wishlist", "/verify-email"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
