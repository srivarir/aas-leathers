"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { categoryLabels } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { useWishlist } from "@/lib/store";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  delay = 0,
  priority = false,
}: {
  product: Product;
  delay?: number;
  priority?: boolean;
}) {
  const { slugs, toggle } = useWishlist();
  const wished = slugs.includes(product.slug);
  const hoverImage = product.images[1] ?? product.images[0];

  return (
    <Reveal delay={delay} className="group relative">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-bone-soft">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-hover:opacity-0"
          />
          <Image
            src={hoverImage}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover opacity-0 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-hover:opacity-100"
          />
          {!product.inStock && (
            <span className="eyebrow absolute left-4 top-4 bg-espresso/85 px-3 py-1.5 text-[10px] text-bone">
              This season sold out
            </span>
          )}
        </div>
        <div className="mt-5 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl leading-snug">{product.name}</h3>
          <p className="shrink-0 text-sm tabular-nums text-foreground/80">
            {formatINR(product.price)}
          </p>
        </div>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
          {categoryLabels[product.category]}
        </p>
      </Link>
      <button
        className={`absolute right-3 top-3 cursor-pointer rounded-full bg-surface/80 p-2.5 backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
          wished ? "text-cognac opacity-100" : "text-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        }`}
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={wished}
        onClick={() => toggle(product.slug)}
      >
        <HeartIcon filled={wished} width={18} height={18} />
      </button>
    </Reveal>
  );
}
