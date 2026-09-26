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

/**
 * Per-customer figures for the office. Orders are grouped by email rather than
 * by account id, so guest orders placed before sign-in was required are still
 * counted against the person who made them. Cancelled, refunded and failed
 * orders count as orders but not as money spent.
 */
router.get(
  "/customers",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (_req, res) => {
    const [users, grouped] = await Promise.all([
      User.find({ role: "customer" })
        .select("name email emailVerified createdAt")
        .sort({ createdAt: -1 })
        .limit(2000),
      Order.aggregate([
        {
          $group: {
            _id: "$email",
            orderCount: { $sum: 1 },
            totalSpent: {
              $sum: {
                $cond: [
                  { $in: ["$status", DEAD_STATUSES] },
                  0,
                  "$amounts.total",
                ],
              },
            },
            lastOrderAt: { $max: "$createdAt" },
            name: { $last: "$shippingAddress.name" },
          },
        },
      ]),
    ]);

    const byEmail = new Map(grouped.map((g) => [g._id, g]));

    const customers = users.map((u) => {
      const g = byEmail.get(u.email);
      byEmail.delete(u.email);
      return {
        name: u.name,
        email: u.email,
        emailVerified: u.emailVerified,
        joinedAt: u.createdAt,
        hasAccount: true,
        orderCount: g?.orderCount ?? 0,
        totalSpent: g?.totalSpent ?? 0,
        lastOrderAt: g?.lastOrderAt ?? null,
      };
    });

    // Anything left ordered without ever registering an account.
    for (const g of byEmail.values()) {
      customers.push({
        name: g.name ?? "Guest",
        email: g._id,
        emailVerified: false,
        joinedAt: null,
        hasAccount: false,
        orderCount: g.orderCount,
        totalSpent: g.totalSpent,
        lastOrderAt: g.lastOrderAt,
      });
    }

    customers.sort((a, b) => b.totalSpent - a.totalSpent);

    const buyers = customers.filter((c) => c.orderCount > 0);
    const revenue = buyers.reduce((sum, c) => sum + c.totalSpent, 0);

    res.json({
      totals: {
        customers: customers.length,
        accounts: users.length,
        verified: customers.filter((c) => c.emailVerified).length,
        buyers: buyers.length,
        repeatBuyers: buyers.filter((c) => c.orderCount > 1).length,
        revenue,
        averagePerBuyer: buyers.length ? Math.round(revenue / buyers.length) : 0,
      },
      customers,
    });
  }),
);

export default router;
