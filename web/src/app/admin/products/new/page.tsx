"use client";

import Link from "next/link";
import { ProductForm, emptyDraft } from "../product-form";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/products" className="link-underline eyebrow text-muted">
          ← Back to inventory
        </Link>
        <h2 className="font-display mt-4 text-3xl tracking-tight">Add a product</h2>
        <p className="mt-2 text-sm text-muted">
          It saves as a draft by default — set it to Published when you&apos;re ready
          for it to appear on the store.
        </p>
      </div>
      <ProductForm mode="create" initial={emptyDraft} />
    </div>
  );
}
