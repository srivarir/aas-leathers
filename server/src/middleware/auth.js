import { ApiError, asyncHandler } from "../utils/api-error.js";
import { verifyAccessToken } from "../utils/tokens.js";
import { User } from "../models/user.js";

/** Requires a valid Bearer access token; attaches req.user. */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError(401, "Authentication required.");

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, "Account no longer exists.");

  req.user = user;
  next();
});

/**
 * Attaches req.user when a valid Bearer token is present; a present-but-
 * expired token still 401s so the client knows to refresh. No header = guest.
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  if (!req.headers.authorization) return next();
  return requireAuth(req, res, next);
});

/** Restricts a route to the given roles. Use after requireAuth. */
export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission to do that."));
  }
  next();
};
