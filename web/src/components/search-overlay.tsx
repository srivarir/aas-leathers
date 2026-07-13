"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/motion";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { categoryLabels, products } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { useUI } from "@/lib/store";

const popular = ["Tote", "Briefcase", "Wallet", "Weekender"];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQuery("");
      // Focus after the enter transition begins.
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.category.includes(q) ||
          p.leather.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [query]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto bg-background/97 backdrop-blur-md"
          role="dialog"
          aria-label="Search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="mx-auto max-w-4xl px-6 pb-24 pt-28">
            <button
              className="absolute right-6 top-6 cursor-pointer p-2 transition-opacity hover:opacity-60 lg:right-12"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            >
              <CloseIcon width={26} height={26} />
            </button>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            >
              <div className="flex items-center gap-5 border-b border-foreground/30 pb-5">
                <SearchIcon width={26} height={26} className="shrink-0 opacity-50" />
                <label htmlFor="site-search" className="sr-only">
                  Search products
                </label>
                <input
                  id="site-search"
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the collection…"
                  className="font-display w-full bg-transparent text-3xl placeholder:text-muted/60 focus:outline-none lg:text-4xl"
                />
              </div>
            </motion.div>

            {query.trim() === "" ? (
              <motion.div
                className="mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.25 }}
              >
                <p className="eyebrow text-muted">Often sought</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {popular.map((term) => (
                    <button
                      key={term}
                      className="cursor-pointer border border-line px-5 py-2.5 text-sm transition-colors duration-300 hover:border-foreground"
                      onClick={() => setQuery(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : results.length === 0 ? (
              <div className="mt-16 text-center">
                <p className="font-display text-2xl">Nothing yet answers to “{query}”</p>
                <p className="mt-3 text-sm text-muted">
                  Try a material, a silhouette — “bridle”, “tote”, “travel”.
                </p>
              </div>
            ) : (
              <ul className="mt-10 divide-y divide-line" aria-label="Search results">
                {results.map((p, i) => (
                  <motion.li
                    key={p.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
                  >
                    <Link
                      href={`/products/${p.slug}`}
                      className="group flex items-center gap-6 py-5"
                      onClick={() => setSearchOpen(false)}
                    >
                      <span className="relative block h-20 w-16 shrink-0 overflow-hidden bg-bone-soft">
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="64px"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </span>
                      <span className="flex-1">
                        <span className="font-display block text-xl">{p.name}</span>
                        <span className="mt-1 block text-xs text-muted">
                          {categoryLabels[p.category]}
                        </span>
                      </span>
                      <span className="text-sm tabular-nums">{formatINR(p.price)}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
