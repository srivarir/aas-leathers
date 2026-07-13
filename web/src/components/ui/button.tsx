import Link from "next/link";
import type { Route } from "next";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "solid" | "outline" | "light";

const styles: Record<Variant, string> = {
  solid:
    "bg-espresso text-bone hover:bg-cognac-deep border border-espresso hover:border-cognac-deep",
  outline:
    "border border-foreground/40 text-foreground hover:border-foreground hover:bg-foreground hover:text-bone",
  light:
    "border border-bone/50 text-bone hover:bg-bone hover:text-espresso",
};

const baseClass =
  "eyebrow inline-flex cursor-pointer items-center justify-center gap-3 px-9 py-4 transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-40";

export function Button({
  variant = "solid",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button className={`${baseClass} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "solid",
  className = "",
  children,
}: {
  href: Route;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${baseClass} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}
