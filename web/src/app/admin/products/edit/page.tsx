"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ProductForm, type ProductDraft } from "../product-form";

function EditProduct() {
  const slug = useSearchParams().get("slug");
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("No product specified.");
      return;
    }
    apiFetch<{ product: ProductDraft & { collection: string } }>(
      `/products/admin/item/${slug}`,
    )
      .then((d) => setDraft({ ...d.product, slug }))
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) {
    return (
      <div>
        <p className="text-cognac-deep">{error}</p>
        <Link href="/admin/products" className="link-underline eyebrow mt-6 inline-block text-muted">
          ← Back to inventory
        </Link>
      </div>
    );
  }
  if (!draft) {
    return <div className="h-96 max-w-3xl animate-pulse border border-line bg-bone-soft/60" />;
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/products" className="link-underline eyebrow text-muted">
          ← Back to inventory
        </Link>
        <h2 className="font-display mt-4 text-3xl tracking-tight">{draft.name}</h2>
        <p className="mt-2 text-sm text-muted">Editing — changes go live on save.</p>
      </div>
      <ProductForm mode="edit" initial={draft} />
    </div>
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<div className="h-96 max-w-3xl animate-pulse border border-line bg-bone-soft/60" />}>
      <EditProduct />
    </Suspense>
  );
}
