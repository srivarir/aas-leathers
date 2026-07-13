import { Router } from "express";
import { asyncHandler } from "../utils/api-error.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";

const router = Router();

const STAFF = [
  "admin",
  "super-admin",
  "customer-support",
  "inventory-manager",
  "content-manager",
];

const DEAD_STATUSES = ["cancelled", "refunded", "failed"];

router.get(
  "/",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (_req, res) => {
    const [orders, customerCount, lowStock] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(500),
      User.countDocuments({ role: "customer" }),
      Product.find({ status: "published", stock: { $lte: 3 } }).sort({ stock: 1 }),
    ]);

    const live = orders.filter((o) => !DEAD_STATUSES.includes(o.status));
    const revenue = live.reduce((sum, o) => sum + o.amounts.total, 0);

    const statusCounts = {};
    for (const o of orders) {
      statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
    }

    res.json({
      revenue,
      orderCount: orders.length,
      customerCount,
      averageOrderValue: live.length ? Math.round(revenue / live.length) : 0,
      statusCounts,
      lowStock: lowStock.map((p) => ({
        slug: p.slug,
        name: p.name,
        stock: p.stock,
      })),
      recentOrders: orders.slice(0, 6).map((o) => ({
        id: o._id,
        number: o.number,
        email: o.email,
        total: o.amounts.total,
        status: o.status,
        createdAt: o.createdAt,
      })),
    });
  }),
);

export default router;
