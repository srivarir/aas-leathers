"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatINR } from "@/lib/format";

interface AdminProduct {
  slug: string;
  name: string;
  price: number;
  colors?: { name: string; hex: string }[];
  status: "draft" | "published" | "archived";
  image?: string;
}

const statusStyle: Record<AdminProduct["status"], string> = {
  published: "text-cognac",
  draft: "text-muted",
  archived: "text-muted",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const reload = useCallback(() => {
    return apiFetch<{ products: AdminProduct[] }>("/products/admin/list")
      .then((d) => setProducts(d.products))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const patch = async (slug: string, body: Partial<AdminProduct>) => {
    setBusySlug(slug);
    setError(null);
    try {
      await apiFetch(`/products/${slug}`, { method: "PATCH", body: JSON.stringify(body) });
      setProducts((ps) => ps!.map((p) => (p.slug === slug ? { ...p, ...body } : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusySlug(null);
    }
  };

  const duplicate = async (p: AdminProduct) => {
    setBusySlug(p.slug);
    setError(null);
    try {
      const { product } = await apiFetch<{ product: Record<string, unknown> }>(
        `/products/admin/item/${p.slug}`,
      );
      await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify({
          ...product,
          collectionSlug: product.collection,
          name: `${p.name} (copy)`,
          status: "draft",
          featured: false,
        }),
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not duplicate.");
    } finally {
      setBusySlug(null);
    }
  };

  const remove = async (p: AdminProduct) => {
    if (
      !window.confirm(
        `Permanently delete "${p.name}"? Past orders keep their record, but the product is removed from the catalog. This cannot be undone.`,
      )
    )
      return;
    setBusySlug(p.slug);
    setError(null);
    try {
      await apiFetch(`/products/${p.slug}?hard=true`, { method: "DELETE" });
      setProducts((ps) => ps!.filter((x) => x.slug !== p.slug));
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
          {products ? `${products.length} pieces in the catalog` : "Loading…"}
        </p>
        <Link
          href="/office/products/new"
          className="eyebrow inline-flex cursor-pointer items-center gap-2 border border-espresso bg-espresso px-6 py-3 text-bone transition-colors duration-300 hover:bg-cognac-deep"
        >
          + Add Product
        </Link>
      </div>

      {error && <p className="mb-6 text-sm text-cognac-deep">{error}</p>}

      {!products ? (
        <div className="h-64 animate-pulse border border-line bg-bone-soft/60" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                {["Piece", "Colours", "Price", "Visibility", "Actions"].map((h) => (
                  <th key={h} className="eyebrow py-3 pr-6 font-medium text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p.slug} className={p.status === "archived" ? "opacity-50" : ""}>
                  <td className="py-4 pr-6">
                    <span className="flex items-center gap-4">
                      {p.image && (
                        <span className="relative block h-12 w-10 shrink-0 overflow-hidden bg-bone-soft">
                          <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />
                        </span>
                      )}
                      <Link
                        href={`/office/products/edit?slug=${p.slug}`}
                        className="font-display link-underline"
                      >
                        {p.name}
                      </Link>
                    </span>
                  </td>
                  <td className="py-4 pr-6">
                    <span className="flex items-center gap-1.5">
                      {(p.colors ?? []).length === 0 ? (
                        <span className="text-xs text-muted">—</span>
                      ) : (
                        p.colors!.map((c) => (
                          <span
                            key={c.name}
                            title={c.name}
                            className="block h-3 w-3 rounded-full ring-1 ring-line"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))
                      )}
                    </span>
                  </td>
                  <td className="py-4 pr-6 tabular-nums">{formatINR(p.price)}</td>
                  <td className="py-4 pr-6">
                    <button
                      className={`link-underline eyebrow cursor-pointer disabled:opacity-40 ${statusStyle[p.status]}`}
                      disabled={busySlug === p.slug}
                      onClick={() =>
                        patch(p.slug, {
                          status: p.status === "published" ? "archived" : "published",
                        })
                      }
                    >
                      {p.status}
                    </button>
                  </td>
                  <td className="py-4">
                    <span className="flex items-center gap-4">
                      <Link
                        href={`/office/products/edit?slug=${p.slug}`}
                        className="link-underline eyebrow text-muted"
                      >
                        Edit
                      </Link>
                      <button
                        className="link-underline eyebrow cursor-pointer text-muted disabled:opacity-40"
                        disabled={busySlug === p.slug}
                        onClick={() => duplicate(p)}
                      >
                        Duplicate
                      </button>
                      <button
                        className="link-underline eyebrow cursor-pointer text-cognac-deep disabled:opacity-40"
                        disabled={busySlug === p.slug}
                        onClick={() => remove(p)}
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

      <p className="mt-6 text-xs leading-relaxed text-muted">
        <strong className="font-medium text-foreground">Add Product</strong> creates a
        draft you can publish when ready. <strong className="font-medium text-foreground">Edit</strong> opens
        the full editor. <strong className="font-medium text-foreground">Duplicate</strong> copies a piece as
        a new draft. <strong className="font-medium text-foreground">Delete</strong> removes it permanently —
        past orders keep their own record. Visibility can be changed inline.
      </p>
    </div>
  );
}
