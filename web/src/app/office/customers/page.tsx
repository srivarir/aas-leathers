"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatINR } from "@/lib/format";

interface Customer {
  name: string;
  email: string;
  emailVerified: boolean;
  joinedAt: string | null;
  hasAccount: boolean;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

interface Totals {
  customers: number;
  accounts: number;
  verified: number;
  buyers: number;
  repeatBuyers: number;
  revenue: number;
  averagePerBuyer: number;
}

const shortDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      })
    : "—";

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border border-line p-5">
      <p className="eyebrow text-muted">{label}</p>
      <p className="font-display mt-3 text-2xl tabular-nums">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}

interface Subscriber {
  email: string;
  subscribedAt: string;
}

export default function OfficeCustomers() {
  const [data, setData] = useState<{ totals: Totals; customers: Customer[] } | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ totals: Totals; customers: Customer[] }>("/stats/customers")
      .then(setData)
      .catch((e) => setError(e.message));
    apiFetch<{ subscribers: Subscriber[] }>("/subscribers")
      .then((d) => setSubscribers(d.subscribers))
      .catch(() => setSubscribers([]));
  }, []);

  if (error) return <p className="text-cognac-deep">{error}</p>;
  if (!data) return <div className="h-64 animate-pulse border border-line bg-bone-soft/60" />;

  const { totals, customers } = data;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="People"
          value={String(totals.customers)}
          note={`${totals.accounts} with an account`}
        />
        <Stat
          label="Have bought"
          value={String(totals.buyers)}
          note={`${totals.repeatBuyers} came back`}
        />
        <Stat label="Spent with you" value={formatINR(totals.revenue)} />
        <Stat
          label="Average per buyer"
          value={formatINR(totals.averagePerBuyer)}
          note={`${totals.verified} verified email${totals.verified === 1 ? "" : "s"}`}
        />
      </div>

      {customers.length === 0 ? (
        <p className="mt-12 text-muted">No customers yet.</p>
      ) : (
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                {["Customer", "Orders", "Spent", "Last order", "Joined"].map((h) => (
                  <th key={h} className="eyebrow py-3 pr-6 font-medium text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((c) => (
                <tr key={c.email}>
                  <td className="py-4 pr-6">
                    <span className="font-display block">{c.name}</span>
                    <a
                      href={`mailto:${c.email}`}
                      className="link-underline text-xs text-muted"
                    >
                      {c.email}
                    </a>
                    {!c.hasAccount && (
                      <span className="eyebrow ml-2 text-[10px] text-muted">guest</span>
                    )}
                    {c.hasAccount && !c.emailVerified && (
                      <span className="eyebrow ml-2 text-[10px] text-cognac">
                        unverified
                      </span>
                    )}
                  </td>
                  <td className="py-4 pr-6 tabular-nums">{c.orderCount}</td>
                  <td className="py-4 pr-6 tabular-nums">
                    {c.totalSpent > 0 ? formatINR(c.totalSpent) : "—"}
                  </td>
                  <td className="py-4 pr-6 text-muted">{shortDate(c.lastOrderAt)}</td>
                  <td className="py-4 text-muted">{shortDate(c.joinedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-16 border-t border-line pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl tracking-tight">The Ledger list</h2>
          <p className="text-sm text-muted">
            {subscribers === null
              ? "Loading…"
              : `${subscribers.length} ${subscribers.length === 1 ? "person" : "people"} subscribed from the footer`}
          </p>
        </div>
        {subscribers && subscribers.length > 0 && (
          <>
            <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {subscribers.map((s) => (
                <li key={s.email} className="flex justify-between gap-4 text-sm">
                  <a href={`mailto:${s.email}`} className="link-underline truncate">
                    {s.email}
                  </a>
                  <span className="shrink-0 text-xs text-muted">
                    {shortDate(s.subscribedAt)}
                  </span>
                </li>
              ))}
            </ul>
            <button
              className="link-underline eyebrow mt-6 cursor-pointer text-muted"
              onClick={() =>
                navigator.clipboard.writeText(subscribers.map((s) => s.email).join(", "))
              }
            >
              Copy all addresses
            </button>
          </>
        )}
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted">
          These addresses are collected and stored, nothing more — no letter is
          sent automatically. Copy them into a mailing tool when you are ready
          to write one.
        </p>
      </div>

      <p className="mt-12 max-w-3xl text-xs leading-relaxed text-muted">
        Sorted by how much each person has spent. Orders are matched by email,
        so anything ordered as a guest before sign-in was required still counts
        against the person who bought it.{" "}
        <strong className="font-medium text-foreground">Spent</strong> excludes
        cancelled, refunded and failed orders — those still show in the order
        count.
      </p>
    </div>
  );
}
