import type { Metadata } from "next";
import { OfficeShell } from "./office-shell";

/**
 * The office is deliberately not at /admin and deliberately not in robots.txt
 * — naming a path in robots.txt is the fastest way to advertise it. This keeps
 * it out of search results. It is obscurity, not security: the real guard is
 * the role check the API enforces on every request.
 */
export const metadata: Metadata = {
  title: "Office",
  robots: { index: false, follow: false, nocache: true },
};

export default function OfficeLayout({ children }: { children: React.ReactNode }) {
  return <OfficeShell>{children}</OfficeShell>;
}
