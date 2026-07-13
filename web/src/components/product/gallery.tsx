"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/motion";
import { CloseIcon } from "@/components/icons";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const next = useCallback(
    () => setActive((a) => (a + 1) % images.length),
    [images.length],
  );
  const prev = useCallback(
    () => setActive((a) => (a - 1 + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed, next, prev]);

  return (
    <div>
      <button
        className="relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-bone-soft"
        onClick={() => setZoomed(true)}
        aria-label={`View ${name} fullscreen`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Image
              src={images[active]}
              alt={`${name} — view ${active + 1}`}
              fill
              priority={active === 0}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </button>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src + i}
              className={`relative h-24 w-20 cursor-pointer overflow-hidden bg-bone-soft transition-opacity duration-300 ${
                i === active ? "ring-1 ring-foreground" : "opacity-60 hover:opacity-100"
              }`}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${name}`}
              aria-current={i === active}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {zoomed && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            role="dialog"
            aria-label={`${name} fullscreen gallery`}
          >
            <button
              className="absolute right-6 top-6 z-10 cursor-pointer p-2 text-bone transition-opacity hover:opacity-60"
              onClick={() => setZoomed(false)}
              aria-label="Close fullscreen"
            >
              <CloseIcon width={28} height={28} />
            </button>
            <button
              className="absolute inset-y-0 left-0 w-1/4 cursor-w-resize"
              onClick={prev}
              aria-label="Previous image"
            />
            <button
              className="absolute inset-y-0 right-0 w-1/4 cursor-e-resize"
              onClick={next}
              aria-label="Next image"
            />
            <motion.div
              key={active}
              className="relative h-[85svh] w-[90vw]"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <Image
                src={images[active]}
                alt={`${name} — fullscreen view ${active + 1}`}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </motion.div>
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`h-1 w-8 cursor-pointer transition-colors duration-300 ${
                    i === active ? "bg-bone" : "bg-bone/30"
                  }`}
                  onClick={() => setActive(i)}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
