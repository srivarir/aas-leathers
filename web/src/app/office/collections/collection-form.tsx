"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, apiUpload } from "@/lib/api";

export interface CollectionDraft {
  slug?: string;
  name: string;
  description: string;
  image: string;
  position: number | "";
  status: "published" | "archived";
}

export const emptyCollection: CollectionDraft = {
  name: "",
  description: "",
  image: "",
  position: 0,
  status: "published",
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

export function CollectionForm({
  initial,
  mode,
}: {
  initial: CollectionDraft;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<CollectionDraft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof CollectionDraft>(key: K, value: CollectionDraft[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const [url] = await apiUpload([files[0]]);
      if (url) set("image", url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const body = {
      name: form.name,
      description: form.description,
      image: form.image,
      position: form.position === "" ? 0 : form.position,
      status: form.status,
    };
    try {
      if (mode === "create") {
        await apiFetch("/collections", { method: "POST", body: JSON.stringify(body) });
      } else {
        await apiFetch(`/collections/${form.slug}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      }
      router.push("/office/collections");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-10">
      <fieldset className="space-y-5">
        <legend className="eyebrow text-foreground">The collection</legend>
        <div>
          <Label htmlFor="name">Name</Label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
          />
          {mode === "edit" && (
            <p className="mt-2 text-xs text-muted">
              Web address stays /collections/{form.slug} — renaming is safe for
              anyone who bookmarked it.
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="position">Order on the site</Label>
            <input
              id="position"
              type="number"
              value={form.position}
              onChange={(e) =>
                set("position", e.target.value === "" ? "" : Number(e.target.value))
              }
              className={inputClass}
            />
            <p className="mt-2 text-xs text-muted">Lower numbers come first.</p>
          </div>
          <div>
            <Label htmlFor="status">Visibility</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => set("status", e.target.value as CollectionDraft["status"])}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="published">Published</option>
              <option value="archived">Archived — hidden from the store</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="eyebrow text-foreground">Photography</legend>
        {form.image && (
          <span className="relative block aspect-[16/10] w-full max-w-sm overflow-hidden bg-bone-soft">
            <Image src={form.image} alt="" fill sizes="384px" className="object-cover" />
          </span>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files)}
            className="text-sm text-muted file:mr-4 file:cursor-pointer file:border file:border-line file:bg-surface file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.18em]"
          />
          {uploading && <span className="text-xs text-muted">Uploading…</span>}
          {form.image && (
            <button
              type="button"
              className="link-underline eyebrow cursor-pointer text-muted"
              onClick={() => set("image", "")}
            >
              Remove
            </button>
          )}
        </div>
        <div>
          <Label htmlFor="image">…or paste an image address</Label>
          <input
            id="image"
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
            className={inputClass}
          />
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="border-l-2 border-cognac pl-4 text-sm text-cognac-deep">
          {error}
        </p>
      )}

      <div className="flex items-center gap-6">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Saving…" : mode === "create" ? "Create Collection" : "Save Changes"}
        </Button>
        <button
          type="button"
          className="link-underline eyebrow cursor-pointer text-muted"
          onClick={() => router.push("/office/collections")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
