"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatINR } from "@/lib/format";

const STATUSES = [
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "in-transit",
  "out-for-delivery",
  "delivered",
  "completed",
  "cancelled",
  "returned",
  "refunded",
];

interface AdminOrder {
  id: string;
  number: string;
  items: { name: string; qty: number }[];
  amounts: { total: number };
  shippingAddress: { name: string; city: string };
  status: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ orders: AdminOrder[] }>("/orders")
      .then((d) => setOrders(d.orders))
      .catch((e) => setError(e.message));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setSavingId(id);
    const previous = orders;
    setOrders((os) => os!.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await apiFetch(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      setOrders(previous ?? null);
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setSavingId(null);
    }
  };

  if (error) return <p className="text-cognac-deep">{error}</p>;
  if (!orders) {
    return <div className="h-64 animate-pulse border border-line bg-bone-soft/60" />;
  }
  if (orders.length === 0) {
    return <p className="text-muted">No orders yet — the ledger is open.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            {["Order", "Customer", "Items", "Total", "Placed", "Status"].map((h) => (
              <th key={h} className="eyebrow py-3 pr-6 font-medium text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="font-display py-4 pr-6">{o.number}</td>
              <td className="py-4 pr-6">
                {o.shippingAddress.name}
                <span className="block text-xs text-muted">{o.shippingAddress.city}</span>
              </td>
              <td className="py-4 pr-6 text-muted">
                {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
              </td>
              <td className="py-4 pr-6 tabular-nums">{formatINR(o.amounts.total)}</td>
              <td className="py-4 pr-6 text-muted">
                {new Date(o.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </td>
              <td className="py-4">
                <label className="sr-only" htmlFor={`status-${o.id}`}>
                  Status for {o.number}
                </label>
                <select
                  id={`status-${o.id}`}
                  value={o.status}
                  disabled={savingId === o.id}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="cursor-pointer border border-line bg-surface px-3 py-2 text-xs uppercase tracking-wider focus:border-foreground focus:outline-none disabled:opacity-50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
