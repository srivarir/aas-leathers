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

const AWAITING = ["pending", "confirmed", "processing", "packed"];
const TRANSIT = ["shipped", "in-transit", "out-for-delivery"];
const DAY = 24 * 60 * 60 * 1000;

const change = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : null; // null = no basis to compare
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * The figures worth acting on, rather than a roll-call of customers: what is
 * waiting on the workshop today, whether trade is moving, which pieces earn
 * their bench space and which are only taking it up.
 */
router.get(
  "/insights",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (_req, res) => {
    const now = Date.now();
    const d30 = new Date(now - 30 * DAY);
    const d60 = new Date(now - 60 * DAY);

    const [published, awaiting, inTransit, recent, sold, buyers, accounts] =
      await Promise.all([
        Product.find({ status: "published" }).select("slug name price stock"),
        Order.find({ status: { $in: AWAITING } })
          .select("number createdAt")
          .sort({ createdAt: 1 })
          .limit(200),
        Order.countDocuments({ status: { $in: TRANSIT } }),
        Order.find({
          createdAt: { $gte: d60 },
          status: { $nin: DEAD_STATUSES },
        }).select("amounts.total createdAt"),
        Order.aggregate([
          { $match: { status: { $nin: DEAD_STATUSES } } },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.slug",
              name: { $last: "$items.name" },
              units: { $sum: "$items.qty" },
              revenue: {
                $sum: { $multiply: ["$items.unitPrice", "$items.qty"] },
              },
            },
          },
          { $sort: { revenue: -1 } },
        ]),
        Order.aggregate([
          { $match: { status: { $nin: DEAD_STATUSES } } },
          { $group: { _id: "$email", n: { $sum: 1 } } },
        ]),
        User.countDocuments({ role: "customer" }),
      ]);

    // Trade: the last 30 days against the 30 before them.
    const thisMonth = recent.filter((o) => o.createdAt >= d30);
    const lastMonth = recent.filter((o) => o.createdAt < d30);
    const sum = (list) => list.reduce((t, o) => t + o.amounts.total, 0);
    const revenueNow = sum(thisMonth);
    const revenueThen = sum(lastMonth);
    const aov = (list) =>
      list.length ? Math.round(sum(list) / list.length) : 0;

    const soldBySlug = new Map(sold.map((s) => [s._id, s]));

    // Pieces on sale that have never been bought, and the money sitting in
    // them. Ones with no stock are excluded: nothing is tied up in an empty
    // shelf, and the sold-out count above already covers them.
    const neverSold = published
      .filter((p) => !soldBySlug.has(p.slug) && p.stock > 0)
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        stock: p.stock,
        tiedUp: p.stock * p.price,
      }))
      .sort((a, b) => b.tiedUp - a.tiedUp);

    // Pieces that sell and are about to run out — the reorder list.
    const runningOut = published
      .filter((p) => p.stock <= 3 && soldBySlug.has(p.slug))
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        stock: p.stock,
        unitsSold: soldBySlug.get(p.slug).units,
      }))
      .sort((a, b) => a.stock - b.stock);

    const repeat = buyers.filter((b) => b.n > 1).length;

    res.json({
      attention: {
        awaitingDispatch: awaiting.length,
        oldestWaitingDays: awaiting.length
          ? Math.floor((now - awaiting[0].createdAt.getTime()) / DAY)
          : null,
        oldestWaitingNumber: awaiting.length ? awaiting[0].number : null,
        inTransit,
        outOfStock: published.filter((p) => p.stock === 0).length,
        runningOut,
      },
      trade: {
        revenue: revenueNow,
        revenueChange: change(revenueNow, revenueThen),
        orders: thisMonth.length,
        ordersChange: change(thisMonth.length, lastMonth.length),
        averageOrder: aov(thisMonth),
        averageOrderChange: change(aov(thisMonth), aov(lastMonth)),
      },
      earning: sold.slice(0, 6).map((s) => ({
        slug: s._id,
        name: s.name,
        units: s.units,
        revenue: s.revenue,
      })),
      neverSold: neverSold.slice(0, 8),
      neverSoldTotal: neverSold.length,
      capitalIdle: neverSold.reduce((t, p) => t + p.tiedUp, 0),
      people: {
        accounts,
        buyers: buyers.length,
        repeat,
        neverBought: Math.max(accounts - buyers.length, 0),
      },
    });
  }),
);

export default router;
