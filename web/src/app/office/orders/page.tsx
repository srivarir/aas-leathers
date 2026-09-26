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

  const remove = async (o: AdminOrder) => {
    const pieces = o.items.map((i) => `${i.name} x${i.qty}`).join(", ");
    if (
      !window.confirm(
        `Permanently delete order ${o.number}?

${pieces}

` +
          "The stock it used will be returned to inventory. This cannot be " +
          "undone — to cancel a real order, set its status to cancelled instead.",
      )
    )
      return;
    setSavingId(o.id);
    setError(null);
    try {
      await apiFetch(`/orders/${o.id}`, { method: "DELETE" });
      setOrders((os) => os!.filter((x) => x.id !== o.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete the order.");
    } finally {
      setSavingId(null);
    }
  };

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

  if (error && !orders) return <p className="text-cognac-deep">{error}</p>;
  if (!orders) {
    return <div className="h-64 animate-pulse border border-line bg-bone-soft/60" />;
  }
  if (orders.length === 0) {
    return <p className="text-muted">No orders yet — the ledger is open.</p>;
  }

  return (
    <div>
      {error && <p className="mb-6 text-sm text-cognac-deep">{error}</p>}
      <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            {["Order", "Customer", "Items", "Total", "Placed", "Status", ""].map((h) => (
              <th key={h || "actions"} className="eyebrow py-3 pr-6 font-medium text-muted">
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
              <td className="py-4">
                <button
                  className="link-underline eyebrow cursor-pointer text-cognac-deep disabled:opacity-40"
                  disabled={savingId === o.id}
                  onClick={() => remove(o)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted">
        <strong className="font-medium text-foreground">Delete</strong> removes
        an order for good and returns its stock to inventory — it is for
        clearing test orders. A real order a customer changed their mind about
        should be set to <em>cancelled</em>, which keeps the record.
      </p>
    </div>
  );
}
