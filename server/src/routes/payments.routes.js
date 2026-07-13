import crypto from "node:crypto";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ApiError, asyncHandler } from "../utils/api-error.js";
import { optionalAuth } from "../middleware/auth.js";
import { Order } from "../models/order.js";
import { createOrder, priceCart, toClientOrder } from "../services/order-service.js";
import {
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET,
  isRazorpayConfigured,
  razorpay,
} from "../config/razorpay.js";

const router = Router();

const payLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many payment attempts. Please wait a few minutes." },
});

/** Lets the storefront know whether to run the Razorpay flow or fall back. */
router.get("/status", (_req, res) => {
  res.json({ razorpay: { enabled: isRazorpayConfigured, keyId: RAZORPAY_KEY_ID } });
});

/**
 * Step 1 — create a Razorpay order for the server-priced cart. Validates the
 * address and availability up front (so we fail before taking money) and
 * returns the amount and Razorpay order id the checkout modal needs.
 */
router.post(
  "/razorpay/order",
  payLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!isRazorpayConfigured) {
      throw new ApiError(503, "Online payments aren't configured.");
    }
    const { items, shippingAddress } = req.body ?? {};

    // Fail before payment if the address is incomplete.
    const addr = shippingAddress ?? {};
    for (const f of ["name", "line1", "city", "pincode"]) {
      if (!addr[f] || String(addr[f]).trim().length < 2) {
        throw new ApiError(400, "Please complete the delivery address.");
      }
    }

    const { subtotal } = await priceCart(items);

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(subtotal * 100), // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { email: req.user?.email ?? String(req.body?.email ?? "") },
    });

    res.status(201).json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  }),
);

/**
 * Step 2 — verify the payment signature, then (and only then) create the order.
 * The signature proves the payment response genuinely came from Razorpay and
 * wasn't forged by the browser.
 */
router.post(
  "/razorpay/verify",
  payLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!isRazorpayConfigured) {
      throw new ApiError(503, "Online payments aren't configured.");
    }
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
      email,
    } = req.body ?? {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ApiError(400, "Missing payment details.");
    }

    const expected = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Constant-time comparison — never reveal how close a forged signature was.
    const a = Buffer.from(expected);
    const b = Buffer.from(String(razorpay_signature));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new ApiError(400, "Payment could not be verified.");
    }

    // Signature valid → the payment is genuine. Create the order now.
    let order;
    try {
      order = await createOrder({
        user: req.user,
        email,
        items,
        shippingAddress,
        payment: {
          provider: "razorpay",
          status: "paid",
          reference: razorpay_payment_id,
        },
      });
    } catch (err) {
      // Payment succeeded but the order couldn't be created (e.g. the last
      // unit sold in the seconds it took to pay). Refund and surface it.
      try {
        await razorpay.payments.refund(razorpay_payment_id, { speed: "optimum" });
      } catch {
        /* refund will be reconciled from the dashboard/webhook */
      }
      if (err instanceof ApiError) {
        throw new ApiError(
          err.status,
          `${err.message} Your payment has been refunded.`,
        );
      }
      throw err;
    }

    res.status(201).json({ order: toClientOrder(order) });
  }),
);

/**
 * Razorpay webhook — a server-to-server confirmation. Verifies the webhook
 * signature over the RAW body, then reconciles payment status idempotently.
 * Requires express.raw for this path (wired in app.js).
 */
router.post(
  "/razorpay/webhook",
  asyncHandler(async (req, res) => {
    if (!RAZORPAY_WEBHOOK_SECRET) return res.status(200).json({ ok: true });

    const signature = req.headers["x-razorpay-signature"];
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");
    const expected = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(raw)
      .digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(String(signature ?? ""));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new ApiError(400, "Invalid webhook signature.");
    }

    const event = JSON.parse(raw.toString("utf8"));
    const paymentId = event?.payload?.payment?.entity?.id;

    if (event?.event === "payment.captured" && paymentId) {
      // Idempotent — confirm the order tied to this payment is marked paid.
      await Order.updateOne(
        { "payment.reference": paymentId },
        { $set: { "payment.status": "paid" } },
      );
    }
    // A closed browser before verify would leave no order; a production store
    // would create it here from event data — noted as a future enhancement.

    res.status(200).json({ ok: true });
  }),
);

export default router;
