"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/motion";
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/icons";
import { cartCount, useCart, useUI } from "@/lib/store";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/craftsmanship", label: "Craftsmanship" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = useCart((s) => s.items);
  const { setCartOpen, setSearchOpen, menuOpen, setMenuOpen } = useUI();

  // Cart badge only renders after mount so persisted state can't mismatch SSR.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  const onHome = pathname === "/";
  const transparent = onHome && !scrolled && !menuOpen;
  const count = mounted ? cartCount(items) : 0;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-700 ${
          transparent
            ? "bg-transparent text-bone"
            : "border-b border-line bg-background/90 text-foreground backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 lg:px-12">
          <button
            className="cursor-pointer p-1 lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {nav.slice(0, 3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`eyebrow link-underline ${
                  pathname.startsWith(item.href) ? "opacity-100" : "opacity-70 hover:opacity-100"
                } transition-opacity duration-300`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-center"
            aria-label="AAS Leathers — home"
          >
            <span className="font-display text-2xl tracking-[0.08em]">AAS</span>
            <span className="eyebrow ml-2 hidden align-middle sm:inline">Leathers</span>
          </Link>

          <div className="flex items-center gap-5 lg:gap-7">
            <nav className="hidden items-center gap-9 lg:flex" aria-label="Secondary">
              {nav.slice(3).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`eyebrow link-underline ${
                    pathname.startsWith(item.href) ? "opacity-100" : "opacity-70 hover:opacity-100"
                  } transition-opacity duration-300`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <button
              className="cursor-pointer p-1 transition-opacity duration-300 hover:opacity-60"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon />
            </button>
            <Link
              href="/wishlist"
              className="hidden p-1 transition-opacity duration-300 hover:opacity-60 sm:block"
              aria-label="Wishlist"
            >
              <HeartIcon />
            </Link>
            <Link
              href="/account"
              className="hidden p-1 transition-opacity duration-300 hover:opacity-60 sm:block"
              aria-label="Account"
            >
              <UserIcon />
            </Link>
            <button
              className="relative cursor-pointer p-1 transition-opacity duration-300 hover:opacity-60"
              aria-label={`Cart, ${count} items`}
              onClick={() => setCartOpen(true)}
            >
              <BagIcon />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cognac text-[10px] font-medium text-bone">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-30 flex flex-col justify-center bg-background px-8 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile">
              {nav.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.06 }}
                >
                  <Link
                    href={item.href}
                    className="font-display block py-3 text-4xl text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="mt-10 flex gap-8"
              >
                <Link href="/wishlist" className="eyebrow link-underline" onClick={() => setMenuOpen(false)}>
                  Wishlist
                </Link>
                <Link href="/login" className="eyebrow link-underline" onClick={() => setMenuOpen(false)}>
                  Account
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
