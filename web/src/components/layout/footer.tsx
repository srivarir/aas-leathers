"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { ArrowRightIcon } from "@/components/icons";

const columns: { title: string; links: { href: Route; label: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All Pieces" },
      { href: "/collections", label: "Collections" },
      { href: "/shop?category=bags", label: "Bags" },
      { href: "/shop?category=travel", label: "Travel" },
      { href: "/shop?category=small-goods", label: "Small Goods" },
    ],
  },
  {
    title: "House",
    links: [
      { href: "/about", label: "Our Story" },
      { href: "/craftsmanship", label: "Craftsmanship" },
      { href: "/journal", label: "Journal" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Care",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/account", label: "Orders" },
      { href: "/refund-policy", label: "Returns & Refunds" },
      { href: "/privacy-policy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/data-compliance", label: "Data & Compliance" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="bg-espresso text-bone">
      <div className="mx-auto max-w-[1500px] px-6 py-20 lg:px-12 lg:py-28">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-bone/50">The Ledger — our letter</p>
            <h2 className="font-display mt-6 max-w-md text-3xl leading-snug lg:text-4xl">
              Notes from the workshop, once a month. Nothing else.
            </h2>
            {subscribed ? (
              <p className="mt-8 text-bone/70">
                Welcome. The next letter reaches you at the start of the month.
              </p>
            ) : (
              <form
                className="mt-8 flex max-w-md items-end gap-4 border-b border-bone/30 pb-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.includes("@")) setSubscribed(true);
                }}
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-bone placeholder:text-bone/40 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="cursor-pointer p-1 transition-transform duration-500 hover:translate-x-1"
                >
                  <ArrowRightIcon />
                </button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-bone/50">{col.title}</p>
                <ul className="mt-6 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="link-underline text-sm text-bone/80 transition-colors duration-300 hover:text-bone"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 border-t border-bone/15 pt-10">
          <p className="font-display text-[clamp(3rem,10vw,9rem)] leading-none tracking-tight text-bone/90">
            AAS Leathers
          </p>
          <div className="mt-8 flex flex-col justify-between gap-4 text-xs text-bone/50 sm:flex-row">
            <p>Made slowly in India. Carried everywhere.</p>
            <p>© {new Date().getFullYear()} AAS Leathers. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
