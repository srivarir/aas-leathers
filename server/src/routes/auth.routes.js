import crypto from "node:crypto";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ApiError, asyncHandler } from "../utils/api-error.js";
import { requireAuth } from "../middleware/auth.js";
import { env } from "../config/env.js";
import { User } from "../models/user.js";
import { Order } from "../models/order.js";
import { sendVerificationEmail } from "../services/mailer.js";
import {
  REFRESH_COOKIE,
  hashToken,
  refreshCookieOptions,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait a few minutes." },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SESSIONS = 5;
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generates a one-time email-verification token, stores only its hash + an
 * expiry on the user, and emails the raw token as a link. The raw token
 * never touches the database.
 */
async function issueVerification(user) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  await User.updateOne(
    { _id: user._id },
    {
      emailVerifyTokenHash: hashToken(rawToken),
      emailVerifyExpires: new Date(Date.now() + VERIFY_TTL_MS),
    },
  );
  const url = `${env.clientUrl}/verify-email?token=${rawToken}`;
  await sendVerificationEmail(user, url);
  return url;
}

// In development (no real email is sent) the verification link is returned to
// the client so it can be clicked without watching the server console. This is
// NEVER exposed in production, where the link only ever arrives by email.
const devVerify = (url) => (env.isProduction ? {} : { devVerifyUrl: url });

/**
 * Attaches guest orders placed with this email to the account.
 * Runs on register and login so order history follows the customer.
 */
async function claimGuestOrders(user) {
  const { modifiedCount } = await Order.updateMany(
    { user: null, email: user.email },
    { $set: { user: user._id } },
  );
  if (modifiedCount > 0) {
    console.log(`[orders] claimed ${modifiedCount} guest order(s) for ${user.email}`);
  }
}

async function issueTokens(res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  // Atomic push+trim — concurrent refreshes (two tabs waking together)
  // must never race a load-modify-save cycle into a version conflict.
  await User.updateOne(
    { _id: user._id },
    {
      $push: {
        refreshTokenHashes: {
          $each: [hashToken(refreshToken)],
          $slice: -MAX_SESSIONS,
        },
      },
    },
  );

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  return accessToken;
}

router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body ?? {};

    if (!name || String(name).trim().length < 2) {
      throw new ApiError(400, "Please tell us your name.");
    }
    if (!EMAIL_RE.test(String(email ?? ""))) {
      throw new ApiError(400, "That email address doesn't look right.");
    }
    const pw = String(password ?? "");
    if (pw.length < 8) {
      throw new ApiError(400, "Passwords need at least 8 characters.");
    }
    if (pw.length > 200) {
      throw new ApiError(400, "That password is too long.");
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      throw new ApiError(409, "An account with that email already exists. Try signing in.");
    }

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase(),
      passwordHash: await User.hashPassword(String(password)),
    });
    // Reload with the select:false fields needed by issueTokens.
    const fullUser = await User.findById(user._id).select("+refreshTokenHashes");
    const accessToken = await issueTokens(res, fullUser);
    // Send the verification email. Guest orders are NOT claimed yet — that
    // happens only once the email is confirmed, so an account can never
    // inherit another person's guest-order details.
    const verifyUrl = await issueVerification(user);

    res
      .status(201)
      .json({ user: user.toSafeJSON(), accessToken, ...devVerify(verifyUrl) });
  }),
);

router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    const user = await User.findOne({ email: String(email ?? "").toLowerCase() }).select(
      "+passwordHash +refreshTokenHashes",
    );

    // Same message for both failures — don't reveal which emails exist.
    if (!user || !(await user.comparePassword(String(password ?? "")))) {
      throw new ApiError(401, "Email or password is incorrect.");
    }

    const accessToken = await issueTokens(res, user);
    // Only a verified account may inherit guest orders on its email.
    if (user.emailVerified) await claimGuestOrders(user);
    res.json({ user: user.toSafeJSON(), accessToken });
  }),
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw new ApiError(401, "No session.");

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new ApiError(401, "Session expired. Please sign in again.");
    }

    const user = await User.findById(payload.sub).select("+refreshTokenHashes");
    const tokenHash = hashToken(token);
    if (!user || !user.refreshTokenHashes.includes(tokenHash)) {
      // Token reuse or revoked session — refuse and clear the cookie.
      res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions, maxAge: 0 });
      throw new ApiError(401, "Session expired. Please sign in again.");
    }

    // Rotate: atomically invalidate the presented token, issue a fresh pair.
    await User.updateOne({ _id: user._id }, { $pull: { refreshTokenHashes: tokenHash } });
    const accessToken = await issueTokens(res, user);

    res.json({ user: user.toSafeJSON(), accessToken });
  }),
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        await User.updateOne(
          { _id: payload.sub },
          { $pull: { refreshTokenHashes: hashToken(token) } },
        );
      } catch {
        // Expired/invalid token — nothing to revoke.
      }
    }
    res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions, maxAge: 0 });
    res.json({ ok: true });
  }),
);

router.post(
  "/verify-email",
  authLimiter,
  asyncHandler(async (req, res) => {
    const token = String(req.body?.token ?? "");
    if (!token) throw new ApiError(400, "Verification token missing.");

    const user = await User.findOne({
      emailVerifyTokenHash: hashToken(token),
      emailVerifyExpires: { $gt: new Date() },
    });
    if (!user) {
      throw new ApiError(400, "This verification link is invalid or has expired.");
    }

    // Mark verified, burn the token, then attach any guest orders on this
    // email — this is the moment ownership of the email is proven.
    await User.updateOne(
      { _id: user._id },
      {
        $set: { emailVerified: true },
        $unset: { emailVerifyTokenHash: "", emailVerifyExpires: "" },
      },
    );
    user.emailVerified = true;
    await claimGuestOrders(user);

    res.json({ ok: true, user: user.toSafeJSON() });
  }),
);

router.post(
  "/resend-verification",
  authLimiter,
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.user.emailVerified) {
      return res.json({ ok: true, alreadyVerified: true });
    }
    const verifyUrl = await issueVerification(req.user);
    res.json({ ok: true, ...devVerify(verifyUrl) });
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user.toSafeJSON() });
  }),
);

export default router;
