"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE, Reveal } from "@/components/motion";
import { CheckIcon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { getProduct } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { loadRazorpay, openRazorpay, type RazorpaySuccess } from "@/lib/razorpay";
import { cartSubtotal, useCart } from "@/lib/store";

const steps = ["Details", "Delivery", "Payment"] as const;

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  className = "",
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow block text-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-line bg-transparent py-3 transition-colors duration-300 focus:border-foreground focus:outline-none"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const { user, status, restore } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    setMounted(true);
    restore();
    // Discover whether real online payment is available.
    apiFetch<{ razorpay: { enabled: boolean } }>("/payments/status")
      .then((d) => setRazorpayEnabled(d.razorpay.enabled))
      .catch(() => {});
  }, [restore]);

  // Signed-in customers shouldn't retype what we already know.
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        email: f.email || user.email,
        name: f.name || user.name,
      }));
    }
  }, [user]);

  const subtotal = cartSubtotal(items);
  const set = (key: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const authed = status === "authenticated";

  // The order payload — items and address. Guests include their email; it's
  // used to attach the order to an account they create later.
  const buildPayload = () => ({
    ...(authed ? {} : { email: form.email }),
    items: items.map((i) => ({ slug: i.slug, qty: i.qty })),
    shippingAddress: {
      name: form.name,
      line1: form.address,
      city: form.city,
      pincode: form.pincode,
      phone: form.phone,
    },
  });

  const friendlyError = (err: unknown, fallback: string) =>
    err instanceof Error && err.message !== "Failed to fetch" ? err.message : fallback;

  const onOrderCreated = (number: string) => {
    setOrderNumber(number);
    setPlaced(true);
    clear();
  };

  // No online payment configured — create the order directly (pending payment).
  const placeMockOrder = async () => {
    setError(null);
    setPlacing(true);
    try {
      const data = await apiFetch<{ order: { number: string } }>("/orders", {
        method: "POST",
        body: JSON.stringify(buildPayload()),
      });
      onOrderCreated(data.order.number);
    } catch (err) {
      setError(friendlyError(err, "We couldn't reach the workshop. Please try again."));
    } finally {
      setPlacing(false);
    }
  };

  // Real payment: create a Razorpay order, open the modal, and create the
  // store order only after the server verifies the payment signature.
  const placeRazorpayOrder = async () => {
    setError(null);
    setPlacing(true);
    const payload = buildPayload();
    try {
      const rzpOrder = await apiFetch<{
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId: string;
      }>("/payments/razorpay/order", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const loaded = await loadRazorpay();
      const instance = loaded
        ? openRazorpay({
            key: rzpOrder.keyId,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            order_id: rzpOrder.razorpayOrderId,
            name: "AAS Leathers",
            description: "Leather goods, made slowly.",
            prefill: {
              name: form.name,
              email: authed ? user?.email : form.email,
              contact: form.phone,
            },
            theme: { color: "#171310" },
            handler: async (resp: RazorpaySuccess) => {
              try {
                const data = await apiFetch<{ order: { number: string } }>(
                  "/payments/razorpay/verify",
                  {
                    method: "POST",
                    body: JSON.stringify({ ...payload, ...resp }),
                  },
                );
                onOrderCreated(data.order.number);
              } catch (err) {
                setError(friendlyError(err, "We couldn't confirm your payment."));
              } finally {
                setPlacing(false);
              }
            },
            modal: { ondismiss: () => setPlacing(false) },
          })
        : null;

      if (!instance) throw new Error("Could not open the payment window.");
      instance.on("payment.failed", () => {
        setError("The payment didn't go through. No money was taken — please try again.");
        setPlacing(false);
      });
      instance.open();
    } catch (err) {
      setError(friendlyError(err, "We couldn't start the payment. Please try again."));
      setPlacing(false);
    }
  };

  const placeOrder = () =>
    razorpayEnabled ? placeRazorpayOrder() : placeMockOrder();

  if (!mounted) return <div className="min-h-svh" />;

  if (placed) {
    return (
      <div className="mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-cognac text-cognac"
        >
          <CheckIcon width={28} height={28} />
        </motion.div>
        <h1 className="font-display mt-8 text-4xl tracking-tight">The bench has your order.</h1>
        {orderNumber && (
          <p className="eyebrow mt-4 text-cognac">{orderNumber}</p>
        )}
        <p className="mt-4 leading-relaxed text-muted">
          A confirmation is on its way to {form.email || "your inbox"}. Your
          pieces will be inspected, wrapped in their dust bags and boxed for
          the courier within two working days.
        </p>
        {!authed && (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Create an account with this email at any time — this order will be
            waiting in it.
          </p>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {authed ? (
            <ButtonLink href="/account">View Your Orders</ButtonLink>
          ) : (
            <ButtonLink href="/register">Create an Account</ButtonLink>
          )}
          <ButtonLink href="/" variant="outline">
            Return to the House
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-4xl tracking-tight">Your cart is empty.</h1>
        <p className="mt-4 text-muted">Checkout begins with a piece worth keeping.</p>
        <div className="mt-10">
          <ButtonLink href="/shop" variant="outline">
            Browse the Pieces
          </ButtonLink>
        </div>
      </div>
    );
  }

  const canContinue =
    step === 0
      ? authed || (form.email.includes("@") && form.name.length > 1)
      : step === 1
        ? form.address.length > 4 && form.city.length > 1 && form.pincode.length >= 6
        : true;

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-32 pt-36 lg:px-12">
      <Reveal>
        <p className="eyebrow text-muted">Checkout</p>
        <h1 className="font-display mt-4 text-4xl tracking-tight lg:text-5xl">
          Almost in your hands.
        </h1>
      </Reveal>

      <div className="mt-14 grid gap-16 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ol className="flex gap-8 border-b border-line pb-5" aria-label="Checkout progress">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] tabular-nums transition-colors duration-500 ${
                    i < step
                      ? "border-cognac bg-cognac text-bone"
                      : i === step
                        ? "border-foreground"
                        : "border-line text-muted"
                  }`}
                >
                  {i < step ? <CheckIcon width={12} height={12} /> : i + 1}
                </span>
                <span className={`eyebrow ${i === step ? "" : "text-muted"}`}>{s}</span>
              </li>
            ))}
          </ol>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-10"
            >
              {step === 0 &&
                (authed && user ? (
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="border border-line p-6 sm:col-span-2">
                      <p className="eyebrow text-muted">Ordering as</p>
                      <p className="font-display mt-2 text-xl">{user.name}</p>
                      <p className="mt-1 text-sm text-muted">{user.email}</p>
                    </div>
                    <Field id="phone" label="Phone (for the courier)" type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} />
                  </div>
                ) : (
                  <div className="grid gap-8 sm:grid-cols-2">
                    <Field id="email" label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} className="sm:col-span-2" />
                    <Field id="name" label="Full name" autoComplete="name" value={form.name} onChange={set("name")} />
                    <Field id="phone" label="Phone" type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} />
                  </div>
                ))}
              {step === 1 && (
                <div className="grid gap-8 sm:grid-cols-2">
                  <Field id="address" label="Address" autoComplete="street-address" value={form.address} onChange={set("address")} className="sm:col-span-2" />
                  <Field id="city" label="City" autoComplete="address-level2" value={form.city} onChange={set("city")} />
                  <Field id="pincode" label="PIN code" autoComplete="postal-code" value={form.pincode} onChange={set("pincode")} />
                  <p className="text-xs leading-relaxed text-muted sm:col-span-2">
                    Every order ships insured and gift-boxed, with the dust bag
                    and care balm inside. Complimentary, always.
                  </p>
                </div>
              )}
              {step === 2 && (
                <div>
                  <div className="border border-line p-6">
                    <p className="eyebrow">
                      {razorpayEnabled
                        ? "Pay securely with Razorpay"
                        : "Confirm your order"}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {razorpayEnabled
                        ? "UPI, cards, net banking and EMI — handled by Razorpay's encrypted checkout. We never see or store your payment details; your order is confirmed only once the payment is verified."
                        : "Online payment isn't enabled on this environment, so your order is placed directly with payment marked pending. Connect Razorpay keys to take real payments."}
                    </p>
                  </div>
                  <p className="mt-6 text-xs text-muted">
                    By placing this order you agree to our terms and refund policy.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center gap-6">
            {step > 0 && (
              <button
                className="link-underline eyebrow cursor-pointer text-muted"
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </button>
            )}
            {step < 2 ? (
              <Button disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button onClick={placeOrder} disabled={placing}>
                {placing
                  ? razorpayEnabled
                    ? "Opening payment…"
                    : "Placing your order…"
                  : `${razorpayEnabled ? "Pay" : "Place Order"} · ${formatINR(subtotal)}`}
              </Button>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-6 border-l-2 border-cognac pl-4 text-sm text-cognac-deep">
              {error}
            </p>
          )}

          {mounted && status !== "authenticated" && (
            <p className="mt-6 text-xs leading-relaxed text-muted">
              <Link href="/login" className="link-underline text-foreground">
                Sign in
              </Link>{" "}
              to keep this order in your account and track it from bench to
              doorstep.
            </p>
          )}
        </div>

        <aside className="lg:col-span-2">
          <div className="border border-line p-7">
            <p className="eyebrow text-muted">Your order</p>
            <ul className="mt-6 divide-y divide-line">
              {items.map((item) => {
                const product = getProduct(item.slug);
                if (!product) return null;
                return (
                  <li key={item.slug} className="flex items-center gap-4 py-4">
                    <span className="relative block h-16 w-14 shrink-0 overflow-hidden bg-bone-soft">
                      <Image src={product.images[0]} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                    <span className="flex-1">
                      <span className="font-display block leading-tight">{product.name}</span>
                      <span className="text-xs text-muted">Qty {item.qty}</span>
                    </span>
                    <span className="text-sm tabular-nums">
                      {formatINR(product.price * item.qty)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span>Complimentary</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Gift packaging</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between pt-2 text-base">
                <span className="eyebrow">Total</span>
                <span className="font-display text-xl tabular-nums">{formatINR(subtotal)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
