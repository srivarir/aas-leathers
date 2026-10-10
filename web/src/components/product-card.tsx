"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@/components/icons";
import { Reveal } from "@/components/motion";
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
        </div>
        {/* Stacked, not side by side: in a two-up grid a long name and the
            price cannot share a line without pushing past the card. */}
        <div className="mt-4">
          <h3 className="font-display text-lg leading-snug sm:text-xl">{product.name}</h3>
          <p className="mt-1 text-sm tabular-nums text-foreground/80">
            {formatINR(product.price)}
          </p>
        </div>
        {product.colors && product.colors.length > 0 && (
          <span className="mt-2 flex items-center gap-1.5" aria-label={`Available in ${product.colors.map((c) => c.name).join(", ")}`}>
            {product.colors.slice(0, 5).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="block h-2.5 w-2.5 rounded-full ring-1 ring-line"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </span>
        )}
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
