import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopClient } from "./shop-client";

export const metadata: Metadata = {
  title: "Shop All Pieces",
  description:
    "Every AAS Leathers piece — bags, briefcases, travel and small goods in full-grain, vegetable-tanned leather.",
};

// Filters live in the query string and are applied client-side, so this
// page prerenders once and works from any static host.
export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <ShopClient />
    </Suspense>
  );
}
