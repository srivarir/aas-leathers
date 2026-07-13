"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/motion";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { getProduct } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { cartSubtotal, useCart, useUI } from "@/lib/store";

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUI();
  const { items, setQty, remove } = useCart();
  const subtotal = cartSubtotal(items);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.button
            className="fixed inset-0 z-50 cursor-pointer bg-espresso/50"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl"
            role="dialog"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-line px-7 py-6">
              <p className="eyebrow">Your Cart</p>
              <button
                className="cursor-pointer p-1 transition-opacity hover:opacity-60"
                aria-label="Close cart"
                onClick={() => setCartOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
                <p className="font-display text-2xl">Your cart is empty</p>
                <p className="mt-3 text-sm text-muted">
                  Good leather waits patiently. Begin with the collections.
                </p>
                <button
                  className="eyebrow link-underline mt-8 cursor-pointer"
                  onClick={() => setCartOpen(false)}
                >
                  Continue exploring
                </button>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-7">
                  {items.map((item) => {
                    const product = getProduct(item.slug);
                    if (!product) return null;
                    return (
                      <li key={item.slug} className="flex gap-5 py-6">
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="relative block h-28 w-24 shrink-0 overflow-hidden bg-bone-soft"
                        >
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <Link
                              href={`/products/${product.slug}`}
                              onClick={() => setCartOpen(false)}
                              className="font-display text-lg leading-tight"
                            >
                              {product.name}
                            </Link>
                            <p className="text-sm">{formatINR(product.price)}</p>
                          </div>
                          <p className="mt-1 text-xs text-muted">{product.leather.split(",")[0]}</p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center border border-line">
                              <button
                                className="cursor-pointer p-2 transition-opacity hover:opacity-60"
                                aria-label={`Decrease quantity of ${product.name}`}
                                onClick={() => setQty(item.slug, item.qty - 1)}
                              >
                                <MinusIcon width={14} height={14} />
                              </button>
                              <span className="w-8 text-center text-sm tabular-nums">{item.qty}</span>
                              <button
                                className="cursor-pointer p-2 transition-opacity hover:opacity-60"
                                aria-label={`Increase quantity of ${product.name}`}
                                onClick={() => setQty(item.slug, item.qty + 1)}
                              >
                                <PlusIcon width={14} height={14} />
                              </button>
                            </div>
                            <button
                              className="link-underline cursor-pointer text-xs text-muted"
                              onClick={() => remove(item.slug)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="border-t border-line px-7 py-6">
                  <div className="flex items-center justify-between">
                    <p className="eyebrow">Subtotal</p>
                    <p className="font-display text-xl tabular-nums">{formatINR(subtotal)}</p>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Complimentary shipping and gift packaging on every order.
                  </p>
                  <div onClick={() => setCartOpen(false)} className="mt-6">
                    <ButtonLink href="/checkout" className="w-full">
                      Proceed to Checkout
                    </ButtonLink>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
