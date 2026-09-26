"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface AdminCollection {
  slug: string;
  name: string;
  description: string;
  image: string;
  position: number;
  status: "published" | "archived";
  productCount: number;
}

export default function AdminCollections() {
  const [collections, setCollections] = useState<AdminCollection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const reload = useCallback(
    () =>
      apiFetch<{ collections: AdminCollection[] }>("/collections/office/list")
        .then((d) => setCollections(d.collections))
        .catch((e) => setError(e.message)),
    [],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  const toggle = async (c: AdminCollection) => {
    const status = c.status === "published" ? "archived" : "published";
    setBusySlug(c.slug);
    setError(null);
    try {
      await apiFetch(`/collections/${c.slug}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setCollections((cs) =>
        cs!.map((x) => (x.slug === c.slug ? { ...x, status } : x)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusySlug(null);
    }
  };

  const remove = async (c: AdminCollection) => {
    if (
      !window.confirm(
        `Permanently delete the "${c.name}" collection? This cannot be undone.`,
      )
    )
      return;
    setBusySlug(c.slug);
    setError(null);
    try {
      await apiFetch(`/collections/${c.slug}`, { method: "DELETE" });
      setCollections((cs) => cs!.filter((x) => x.slug !== c.slug));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete.");
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {collections ? `${collections.length} collections` : "Loading…"}
        </p>
        <Link
          href="/office/collections/new"
          className="eyebrow inline-flex cursor-pointer items-center gap-2 border border-espresso bg-espresso px-6 py-3 text-bone transition-colors duration-300 hover:bg-cognac-deep"
        >
          + Add Collection
        </Link>
      </div>

      {error && <p className="mb-6 text-sm text-cognac-deep">{error}</p>}

      {!collections ? (
        <div className="h-64 animate-pulse border border-line bg-bone-soft/60" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                {["Collection", "Pieces", "Order", "Visibility", "Actions"].map((h) => (
                  <th key={h} className="eyebrow py-3 pr-6 font-medium text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {collections.map((c) => (
                <tr key={c.slug} className={c.status === "archived" ? "opacity-50" : ""}>
                  <td className="py-4 pr-6">
                    <span className="flex items-center gap-4">
                      {c.image && (
                        <span className="relative block h-12 w-16 shrink-0 overflow-hidden bg-bone-soft">
                          <Image src={c.image} alt="" fill sizes="64px" className="object-cover" />
                        </span>
                      )}
                      <Link
                        href={`/office/collections/edit?slug=${c.slug}`}
                        className="font-display link-underline"
                      >
                        {c.name}
                      </Link>
                    </span>
                  </td>
                  <td className="py-4 pr-6 tabular-nums text-muted">{c.productCount}</td>
                  <td className="py-4 pr-6 tabular-nums text-muted">{c.position}</td>
                  <td className="py-4 pr-6">
                    <button
                      className={`link-underline eyebrow cursor-pointer disabled:opacity-40 ${
                        c.status === "published" ? "text-cognac" : "text-muted"
                      }`}
                      disabled={busySlug === c.slug}
                      onClick={() => toggle(c)}
                    >
                      {c.status}
                    </button>
                  </td>
                  <td className="py-4">
                    <span className="flex items-center gap-4">
                      <Link
                        href={`/office/collections/edit?slug=${c.slug}`}
                        className="link-underline eyebrow"
                      >
                        Edit
                      </Link>
                      <button
                        className="link-underline eyebrow cursor-pointer text-cognac-deep disabled:opacity-40"
                        disabled={busySlug === c.slug}
                        onClick={() => remove(c)}
                      >
                        Delete
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted">
        <strong className="font-medium text-foreground">Order</strong> sets the
        sequence on the storefront — lower numbers come first.{" "}
        <strong className="font-medium text-foreground">Archived</strong>{" "}
        collections disappear from the store but keep their pieces.{" "}
        <strong className="font-medium text-foreground">Delete</strong> is
        refused while a collection still holds pieces — move them to another
        collection first.
      </p>
    </div>
  );
}
