"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatINR } from "@/lib/format";

interface Piece {
  slug: string;
  name: string;
  units?: number;
  revenue?: number;
  stock?: number;
  tiedUp?: number;
  unitsSold?: number;
}

interface Insights {
  attention: {
    awaitingDispatch: number;
    oldestWaitingDays: number | null;
    oldestWaitingNumber: string | null;
    inTransit: number;
    outOfStock: number;
    runningOut: Piece[];
  };
  trade: {
    revenue: number;
    revenueChange: number | null;
    orders: number;
    ordersChange: number | null;
    averageOrder: number;
    averageOrderChange: number | null;
  };
  earning: Piece[];
  neverSold: Piece[];
  neverSoldTotal: number;
  capitalIdle: number;
  people: { accounts: number; buyers: number; repeat: number; neverBought: number };
}

/** A percentage change, or a quiet note when there is nothing to compare against. */
function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-muted">no prior month</span>;
  if (value === 0) return <span className="text-xs text-muted">level</span>;
  const up = value > 0;
  return (
    <span className={`text-xs ${up ? "text-cognac" : "text-cognac-deep"}`}>
      {up ? "▲" : "▼"} {Math.abs(value)}% on the month before
    </span>
  );
}

function Card({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border border-line p-5">
      <p className="eyebrow text-muted">{label}</p>
      <p className="font-display mt-3 text-2xl tabular-nums">{value}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl tracking-tight">{title}</h2>
      {note && <p className="mt-2 max-w-2xl text-sm text-muted">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function OfficeInsights() {
  const [d, setD] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Insights>("/stats/insights")
      .then(setD)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-cognac-deep">{error}</p>;
  if (!d) return <div className="h-64 animate-pulse border border-line bg-bone-soft/60" />;

  const { attention, trade, people } = d;
  const waiting = attention.awaitingDispatch;
  const late = (attention.oldestWaitingDays ?? 0) >= 2;

  return (
    <div>
      {/* What the workshop owes people right now. */}
      <section>
        <h2 className="font-display text-2xl tracking-tight">On the bench today</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card label="Waiting to go out" value={String(waiting)}>
            {waiting === 0 ? (
              <span className="text-xs text-muted">nothing owed</span>
            ) : (
              <span className={`text-xs ${late ? "text-cognac-deep" : "text-muted"}`}>
                oldest {attention.oldestWaitingNumber} &middot;{" "}
                {attention.oldestWaitingDays === 0
                  ? "today"
                  : `${attention.oldestWaitingDays} days`}
              </span>
            )}
          </Card>
          <Card label="With the courier" value={String(attention.inTransit)} />
          <Card label="Sold out" value={String(attention.outOfStock)}>
            <span className="text-xs text-muted">published, nothing left</span>
          </Card>
          <Card label="Needs making" value={String(attention.runningOut.length)}>
            <span className="text-xs text-muted">selling, 3 or fewer left</span>
          </Card>
        </div>
        {attention.runningOut.length > 0 && (
          <ul className="mt-6 space-y-2 text-sm">
            {attention.runningOut.map((p) => (
              <li key={p.slug} className="flex flex-wrap items-baseline gap-x-3">
                <Link
                  href={`/office/products/edit?slug=${p.slug}`}
                  className="font-display link-underline"
                >
                  {p.name}
                </Link>
                <span className="text-cognac-deep">{p.stock} left</span>
                <span className="text-xs text-muted">{p.unitsSold} sold so far</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Section
        title="Trade"
        note="The last 30 days against the 30 before them. Cancelled, refunded and failed orders are left out."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Card label="Taken" value={formatINR(trade.revenue)}>
            <Delta value={trade.revenueChange} />
          </Card>
          <Card label="Orders" value={String(trade.orders)}>
            <Delta value={trade.ordersChange} />
          </Card>
          <Card label="Average order" value={formatINR(trade.averageOrder)}>
            <Delta value={trade.averageOrderChange} />
          </Card>
        </div>
      </Section>

      <Section
        title="Earning its bench space"
        note="Every piece that has sold, by what it has brought in."
      >
        {d.earning.length === 0 ? (
          <p className="text-sm text-muted">Nothing has sold yet.</p>
        ) : (
          <table className="w-full max-w-2xl text-sm">
            <tbody className="divide-y divide-line">
              {d.earning.map((p) => (
                <tr key={p.slug}>
                  <td className="py-3 pr-6">
                    <Link
                      href={`/office/products/edit?slug=${p.slug}`}
                      className="font-display link-underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-6 tabular-nums text-muted">{p.units} sold</td>
                  <td className="py-3 text-right tabular-nums">
                    {formatINR(p.revenue ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section
        title="Not earning it"
        note={
          d.neverSoldTotal === 0
            ? "Every published piece has sold at least once."
            : `${d.neverSoldTotal} published ${
                d.neverSoldTotal === 1 ? "piece has" : "pieces have"
              } never sold — ${formatINR(d.capitalIdle)} of leather sitting still.`
        }
      >
        {d.neverSold.length > 0 && (
          <ul className="max-w-2xl space-y-2 text-sm">
            {d.neverSold.map((p) => (
              <li
                key={p.slug}
                className="flex flex-wrap items-baseline justify-between gap-x-4"
              >
                <Link
                  href={`/office/products/edit?slug=${p.slug}`}
                  className="font-display link-underline"
                >
                  {p.name}
                </Link>
                <span className="text-xs text-muted">
                  {p.stock} in stock &middot; {formatINR(p.tiedUp ?? 0)} tied up
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="People"
        note="Only the part worth acting on — who came back, and who signed up but never bought."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Card label="Bought at least once" value={String(people.buyers)} />
          <Card label="Came back" value={String(people.repeat)}>
            <span className="text-xs text-muted">
              {people.buyers
                ? `${Math.round((people.repeat / people.buyers) * 100)}% of buyers`
                : "no buyers yet"}
            </span>
          </Card>
          <Card label="Signed up, never bought" value={String(people.neverBought)}>
            <span className="text-xs text-muted">of {people.accounts} accounts</span>
          </Card>
        </div>
      </Section>
    </div>
  );
}
