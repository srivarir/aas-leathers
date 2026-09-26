import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ApiError, asyncHandler } from "../utils/api-error.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Subscriber } from "../models/subscriber.js";

const router = Router();

const STAFF = ["admin", "super-admin", "customer-support", "content-manager"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many signups from here. Please try again later." },
});

/**
 * Public newsletter signup. Re-subscribing an address that already exists is
 * treated as success rather than an error — telling a stranger which addresses
 * are already on the list would leak them.
 */
router.post(
  "/",
  signupLimiter,
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email ?? "").toLowerCase().trim();
    if (!EMAIL_RE.test(email)) {
      throw new ApiError(400, "That doesn't look like an email address.");
    }
    await Subscriber.findOneAndUpdate(
      { email },
      { $set: { status: "subscribed" }, $setOnInsert: { email, source: "footer" } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.status(201).json({ ok: true });
  }),
);

router.get(
  "/",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (_req, res) => {
    const list = await Subscriber.find({ status: "subscribed" })
      .sort({ createdAt: -1 })
      .limit(2000);
    res.json({
      count: list.length,
      subscribers: list.map((s) => ({
        email: s.email,
        source: s.source,
        subscribedAt: s.createdAt,
      })),
    });
  }),
);

export default router;
