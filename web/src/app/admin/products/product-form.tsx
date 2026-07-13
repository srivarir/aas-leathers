"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, apiUpload } from "@/lib/api";
import { categoryLabels, collections } from "@/lib/data";

export interface ProductDraft {
  slug?: string;
  name: string;
  tagline: string;
  price: number | "";
  category: string;
  collection: string;
  stock: number | "";
  status: "draft" | "published" | "archived";
  featured: boolean;
  images: string[];
  leather: string;
  hardware: string;
  lining: string;
  dimensions: string;
  story: string;
  details: string[];
  care: string;
}

export const emptyDraft: ProductDraft = {
  name: "",
  tagline: "",
  price: "",
  category: "bags",
  collection: "everyday",
  stock: 0,
  status: "draft",
  featured: false,
  images: [],
  leather: "",
  hardware: "",
  lining: "",
  dimensions: "",
  story: "",
  details: [],
  care: "",
};

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="eyebrow block text-muted">
      {children}
    </label>
  );
}

const inputClass =
  "mt-2 w-full border border-line bg-surface px-3 py-2.5 text-sm focus:border-foreground focus:outline-none";

export function ProductForm({
  initial,
  mode,
}: {
  initial: ProductDraft;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductDraft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addImages = (urls: string[]) =>
    setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
  const removeImage = (index: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);
    try {
      addImages(await apiUpload(Array.from(files)));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      price: Number(form.price) || 0,
      category: form.category,
      collectionSlug: form.collection,
      stock: Number(form.stock) || 0,
      status: form.status,
      featured: form.featured,
      images: form.images.map((s) => s.trim()).filter(Boolean),
      leather: form.leather.trim(),
      hardware: form.hardware.trim(),
      lining: form.lining.trim(),
      dimensions: form.dimensions.trim(),
      story: form.story.trim(),
      details: form.details.map((s) => s.trim()).filter(Boolean),
      care: form.care.trim(),
    };

    try {
      if (mode === "create") {
        await apiFetch("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`/products/${initial.slug}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the product.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-10">
      {/* Essentials */}
      <fieldset className="space-y-6">
        <legend className="eyebrow text-foreground">Essentials</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Product name</Label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="tagline">Tagline</Label>
            <input
              id="tagline"
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              className={inputClass}
              placeholder="A carryall that ages into an heirloom"
            />
          </div>
          <div>
            <Label htmlFor="price">Price (₹)</Label>
            <input
              id="price"
              type="number"
              min={0}
              required
              value={form.price}
              onChange={(e) =>
                set("price", e.target.value === "" ? "" : Number(e.target.value))
              }
              className={inputClass}
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock quantity</Label>
            <input
              id="stock"
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) =>
                set("stock", e.target.value === "" ? "" : Number(e.target.value))
              }
              className={inputClass}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="collection">Collection</Label>
            <select
              id="collection"
              value={form.collection}
              onChange={(e) => set("collection", e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              {collections.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Media */}
      <fieldset className="space-y-5">
        <legend className="eyebrow text-foreground">Photography</legend>

        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {form.images.map((src, i) => (
              <div
                key={src + i}
                className="group relative h-28 w-24 overflow-hidden border border-line bg-bone-soft"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Product image ${i + 1}`} className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="eyebrow absolute left-0 top-0 bg-espresso/85 px-2 py-0.5 text-[9px] text-bone">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label={`Remove image ${i + 1}`}
                  className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-espresso/85 text-lg leading-none text-bone opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="eyebrow inline-flex cursor-pointer items-center gap-2 border border-foreground/40 px-6 py-3 transition-colors duration-300 hover:border-foreground disabled:opacity-40"
          >
            {uploading ? "Uploading…" : "Upload Images"}
          </button>
          <span className="text-xs text-muted">
            JPG, PNG, WebP, GIF or AVIF · up to 5 MB each
          </span>
        </div>
        {uploadError && <p className="text-sm text-cognac-deep">{uploadError}</p>}

        <div className="flex items-center gap-3">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="…or paste an image URL"
            className="w-full border border-line bg-surface px-3 py-2.5 text-sm focus:border-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (urlDraft.trim()) {
                addImages([urlDraft.trim()]);
                setUrlDraft("");
              }
            }}
            className="link-underline eyebrow shrink-0 cursor-pointer text-muted"
          >
            Add URL
          </button>
        </div>
        <p className="text-xs text-muted">
          The first image is the cover shown on the store. Drag to reorder isn&apos;t
          in yet — remove and re-add to change the cover.
        </p>
      </fieldset>

      {/* Story & specification */}
      <fieldset className="space-y-6">
        <legend className="eyebrow text-foreground">Story & specification</legend>
        <div>
          <Label htmlFor="story">Story</Label>
          <textarea
            id="story"
            rows={4}
            value={form.story}
            onChange={(e) => set("story", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <Label htmlFor="details">Details — one per line</Label>
          <textarea
            id="details"
            rows={4}
            value={form.details.join("\n")}
            onChange={(e) => set("details", e.target.value.split("\n"))}
            className={inputClass}
            placeholder={"Saddle-stitched by hand\nBurnished edges"}
          />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="leather">Leather</Label>
            <input id="leather" value={form.leather} onChange={(e) => set("leather", e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label htmlFor="hardware">Hardware</Label>
            <input id="hardware" value={form.hardware} onChange={(e) => set("hardware", e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label htmlFor="lining">Lining</Label>
            <input id="lining" value={form.lining} onChange={(e) => set("lining", e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label htmlFor="dimensions">Dimensions</Label>
            <input id="dimensions" value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <Label htmlFor="care">Care</Label>
          <textarea id="care" rows={2} value={form.care} onChange={(e) => set("care", e.target.value)} className={inputClass} />
        </div>
      </fieldset>

      {/* Publishing */}
      <fieldset className="space-y-6">
        <legend className="eyebrow text-foreground">Publishing</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => set("status", e.target.value as ProductDraft["status"])}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="draft">Draft — hidden from the store</option>
              <option value="published">Published — live on the store</option>
              <option value="archived">Archived — retired</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-3 self-end pb-2.5 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-cognac"
            />
            Feature on the home page
          </label>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="border-l-2 border-cognac pl-4 text-sm text-cognac-deep">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4 border-t border-line pt-8">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="link-underline eyebrow cursor-pointer text-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
