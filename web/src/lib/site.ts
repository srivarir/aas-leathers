/**
 * The storefront's public origin, used for canonical URLs, Open Graph tags,
 * robots.txt and the sitemap. Set NEXT_PUBLIC_SITE_URL at build time; the
 * fallback is the live domain, so a build with no env still emits correct
 * absolute URLs rather than localhost ones.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aas-leather-craft-bags.com"
).replace(/\/$/, "");
