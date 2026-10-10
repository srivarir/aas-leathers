"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { MailCheck } from "./mail-check";

interface Stats {
  revenue: number;
  orderCount: number;
  customerCount: number;
  averageOrderValue: number;
  statusCounts: Record<string, number>;
  recentOrders: {
    id: string;
    number: string;
    email: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Stats>("/stats").then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-cognac-deep">{error}</p>;
  if (!stats) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse border border-line bg-bone-soft/60" />
        ))}
      </div>
    );
  }

  const cards = [
    ["Revenue", formatINR(stats.revenue)],
    ["Orders", String(stats.orderCount)],
    ["Customers", String(stats.customerCount)],
    ["Avg. order value", formatINR(stats.averageOrderValue)],
  ];

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="border border-line p-6">
            <p className="eyebrow text-muted">{label}</p>
            <p className="font-display mt-3 text-3xl tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="eyebrow text-muted">Recent orders</p>
          {stats.recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No orders yet — the ledger is open.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {stats.recentOrders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-baseline justify-between gap-2 py-4">
                  <div>
                    <p className="font-display">{o.number}</p>
                    <p className="text-xs text-muted">{o.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums">{formatINR(o.total)}</p>
                    <p className="eyebrow text-cognac">{o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      <div className="mt-16">
        <MailCheck />
      </div>
    </div>
  );
}
