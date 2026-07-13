import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ApiError, asyncHandler } from "../utils/api-error.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";
import { Order, ORDER_STATUSES } from "../models/order.js";
import { streamInvoice } from "../services/invoice.js";
import { createOrder, toClientOrder } from "../services/order-service.js";

const router = Router();

const STAFF = ["admin", "super-admin", "customer-support"];

const guestOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many orders. Please wait a few minutes." },
});

/**
 * Create an order directly (no online payment) — used when Razorpay isn't
 * configured, so the store still works. Payment is recorded as pending.
 * The real online path is /api/payments/razorpay/verify.
 */
router.post(
  "/",
  guestOrderLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const order = await createOrder({
      user: req.user,
      email: req.body?.email,
      items: req.body?.items,
      shippingAddress: req.body?.shippingAddress,
      payment: { provider: "manual", status: "pending" },
    });
    res.status(201).json({ order: toClientOrder(order) });
  }),
);

router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    // Orders explicitly linked to this account, plus — only once the email is
    // verified — any still-unclaimed guest orders on that email. Without the
    // verification gate, an unverified account could read another person's
    // guest orders by registering their email.
    const filter = req.user.emailVerified
      ? { $or: [{ user: req.user._id }, { user: null, email: req.user.email }] }
      : { user: req.user._id };
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ orders: orders.map(toClientOrder) });
  }),
);

router.get(
  "/:id/invoice",
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await findAccessibleOrder(req);
    streamInvoice(order, res);
  }),
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await findAccessibleOrder(req);
    res.json({ order: toClientOrder(order) });
  }),
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const { status } = req.body ?? {};
    if (!ORDER_STATUSES.includes(status)) {
      throw new ApiError(400, "Unknown order status.");
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, $push: { statusHistory: { status } } },
      { new: true },
    ).catch(() => null);
    if (!order) throw new ApiError(404, "Order not found.");
    res.json({ order: toClientOrder(order) });
  }),
);

router.get(
  "/",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
    res.json({ orders: orders.map(toClientOrder) });
  }),
);

async function findAccessibleOrder(req) {
  const order = await Order.findById(req.params.id).catch(() => null);
  if (!order) throw new ApiError(404, "Order not found.");

  const isOwner =
    order.user?.toString() === req.user._id.toString() ||
    // A guest order is only accessible by email match once that email is verified.
    (req.user.emailVerified && !order.user && order.email === req.user.email);
  const isStaff = STAFF.includes(req.user.role);
  if (!isOwner && !isStaff) throw new ApiError(403, "That order isn't yours.");
  return order;
}

export default router;
