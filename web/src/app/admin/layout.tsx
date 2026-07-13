"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-store";

const STAFF_ROLES = [
  "admin",
  "super-admin",
  "customer-support",
  "inventory-manager",
  "content-manager",
];

const tabs = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Inventory" },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, status, restore } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    restore();
  }, [restore]);

  useEffect(() => {
    if (status === "guest") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated" || !user) {
    return <div className="min-h-svh" />;
  }

  if (!STAFF_ROLES.includes(user.role)) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <p className="eyebrow text-muted">Access denied</p>
        <h1 className="font-display mt-6 max-w-xl text-4xl leading-tight tracking-tight">
          The workshop office is staff only.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          You're signed in as {user.email}, which doesn't carry workshop keys.
        </p>
        <div className="mt-10">
          <ButtonLink href="/" variant="outline">
            Back to the Storefront
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px] px-6 pb-32 pt-32 lg:px-12">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="eyebrow text-muted">The workshop office</p>
          <h1 className="font-display mt-2 text-3xl tracking-tight">Administration</h1>
        </div>
        <nav className="flex gap-7" aria-label="Admin">
          {tabs.map((tab) => {
            const active =
              tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`eyebrow link-underline ${active ? "" : "text-muted"}`}
                aria-current={active ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-10">{children}</div>
    </div>
  );
}
