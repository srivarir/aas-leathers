"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { CollectionForm, type CollectionDraft } from "../collection-form";

interface AdminCollection extends CollectionDraft {
  slug: string;
  productCount: number;
}

function EditCollection() {
  const slug = useSearchParams().get("slug");
  const [draft, setDraft] = useState<AdminCollection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("No collection specified.");
      return;
    }
    // There is no single-collection admin endpoint; the list is small enough
    // that picking the one we need out of it is cheaper than adding a route.
    apiFetch<{ collections: AdminCollection[] }>("/collections/office/list")
      .then((d) => {
        const found = d.collections.find((c) => c.slug === slug);
        if (!found) throw new Error("That collection no longer exists.");
        setDraft(found);
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) {
    return (
      <div>
        <p className="text-cognac-deep">{error}</p>
        <Link
          href="/office/collections"
          className="link-underline eyebrow mt-6 inline-block text-muted"
        >
          ← Back to collections
        </Link>
      </div>
    );
  }
  if (!draft) {
    return <div className="h-96 max-w-2xl animate-pulse border border-line bg-bone-soft/60" />;
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/office/collections" className="link-underline eyebrow text-muted">
          ← Back to collections
        </Link>
        <h2 className="font-display mt-4 text-3xl tracking-tight">{draft.name}</h2>
        <p className="mt-2 text-sm text-muted">
          {draft.productCount} {draft.productCount === 1 ? "piece" : "pieces"} in
          this collection — changes go live on save.
        </p>
      </div>
      <CollectionForm mode="edit" initial={draft} />
    </div>
  );
}

export default function EditCollectionPage() {
  return (
    <Suspense
      fallback={<div className="h-96 max-w-2xl animate-pulse border border-line bg-bone-soft/60" />}
    >
      <EditCollection />
    </Suspense>
  );
}
