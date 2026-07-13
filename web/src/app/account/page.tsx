"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion";
import { Button, ButtonLink } from "@/components/ui/button";
import { OrderTimeline, type StatusEntry } from "@/components/order-timeline";
import { VerifyBanner } from "@/components/verify-banner";
import { apiDownload, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { formatINR } from "@/lib/format";

interface OrderItem {
  slug: string;
  name: string;
  image?: string;
  unitPrice: number;
  qty: number;
}

interface ClientOrder {
  id: string;
  number: string;
  items: OrderItem[];
  amounts: { subtotal: number; shipping: number; total: number };
  status: string;
  statusHistory: StatusEntry[];
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed — at the bench",
  processing: "In the making",
  packed: "Packed",
  shipped: "Shipped",
  "in-transit": "In transit",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  returned: "Returned",
  refunded: "Refunded",
  failed: "Failed",
};

export default function AccountPage() {
  const router = useRouter();
  const { user, status, restore, logout } = useAuth();
  const [orders, setOrders] = useState<ClientOrder[] | null>(null);

  useEffect(() => {
    restore();
  }, [restore]);

  useEffect(() => {
    if (status === "guest") router.replace("/login");
    if (status === "authenticated") {
      apiFetch<{ orders: ClientOrder[] }>("/orders/mine")
        .then((d) => setOrders(d.orders))
        .catch(() => setOrders([]));
    }
  }, [status, router]);

  if (status !== "authenticated" || !user) {
    return <div className="min-h-svh" />;
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-32 pt-36 lg:px-12">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-muted">The quiet back room</p>
            <h1 className="font-display mt-4 text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.08] tracking-tight">
              Welcome, {user.name.split(" ")[0]}.
            </h1>
            <p className="mt-3 text-sm text-muted">{user.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
          >
            Sign Out
          </Button>
        </div>
        <VerifyBanner />
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-16">
          <p className="eyebrow text-muted">Your orders</p>

          {orders === null ? (
            <div className="mt-6 space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="h-28 animate-pulse border border-line bg-bone-soft/60" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-6 border border-line px-8 py-16 text-center">
              <p className="font-display text-2xl">No orders yet.</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                When you place your first order, its journey from bench to
                doorstep will be recorded here.
              </p>
              <div className="mt-8">
                <ButtonLink href="/shop" variant="outline">
                  Browse the Pieces
                </ButtonLink>
              </div>
            </div>
          ) : (
            <ul className="mt-6 space-y-6">
              {orders.map((order) => (
                <li key={order.id} className="border border-line p-6 lg:p-8">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="font-display text-xl">{order.number}</p>
                    <p className="eyebrow text-cognac">
                      {statusLabels[order.status] ?? order.status}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <div className="mt-5 grid gap-8 border-t border-line pt-5 lg:grid-cols-5">
                    <ul className="divide-y divide-line lg:col-span-3">
                      {order.items.map((item) => (
                        <li key={item.slug} className="flex items-center gap-4 py-4 first:pt-0">
                          {item.image && (
                            <span className="relative block h-14 w-12 shrink-0 overflow-hidden bg-bone-soft">
                              <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                            </span>
                          )}
                          <span className="flex-1 text-sm">
                            {item.name}
                            <span className="text-muted"> · Qty {item.qty}</span>
                          </span>
                          <span className="text-sm tabular-nums">
                            {formatINR(item.unitPrice * item.qty)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="lg:col-span-2 lg:border-l lg:border-line lg:pl-8">
                      <p className="eyebrow mb-4 text-muted">Where it is</p>
                      <OrderTimeline
                        status={order.status}
                        history={order.statusHistory ?? []}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                    <button
                      className="link-underline eyebrow cursor-pointer text-muted"
                      onClick={() =>
                        apiDownload(
                          `/orders/${order.id}/invoice`,
                          `invoice-${order.number}.pdf`,
                        ).catch(() => {})
                      }
                    >
                      Download Invoice
                    </button>
                    <span className="font-display tabular-nums">
                      {formatINR(order.amounts.total)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </div>
  );
}
