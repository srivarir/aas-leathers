"use client";

import { CollectionForm, emptyCollection } from "../collection-form";

export default function NewCollectionPage() {
  return (
    <div>
      <h2 className="font-display mb-8 text-2xl tracking-tight">A new collection</h2>
      <CollectionForm initial={emptyCollection} mode="create" />
    </div>
  );
}
