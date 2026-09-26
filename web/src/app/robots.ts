import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // These pages are useless to a crawler. The staff area is deliberately
      // absent: robots.txt is public, so listing a path here announces it.
      // It is kept out of search by a noindex header on the page itself.
      disallow: ["/account", "/checkout", "/wishlist", "/verify-email"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
