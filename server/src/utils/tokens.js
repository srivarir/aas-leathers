import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessTtl,
  });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString(), jti: crypto.randomUUID() }, env.jwt.refreshSecret, {
    expiresIn: `${env.jwt.refreshTtlDays}d`,
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

/** Refresh tokens are stored hashed — a DB leak must not leak sessions. */
export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const REFRESH_COOKIE = "aas_refresh";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  // In production the storefront and API may sit on different domains (e.g.
  // a Vercel frontend + a Render API), so the cookie must be SameSite=None to
  // be sent cross-site. That requires Secure (HTTPS), which production has.
  // Cross-site read of the refresh response is still blocked by the CORS lock.
  // Locally everything is same-site, so Lax keeps things simple.
  sameSite: env.isProduction ? "none" : "lax",
  path: "/api/auth",
  maxAge: env.jwt.refreshTtlDays * 24 * 60 * 60 * 1000,
};
