import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export const notFound = (_req, _res, next) => {
  next(new ApiError(404, "Not found."));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  // Mongoose validation / cast / duplicate-key errors become clean 4xx
  // responses instead of a 500 (a bad id or malformed value is client error).
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)[0]?.message ?? "Invalid input.";
    return res.status(400).json({ error: message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ error: "That value isn't valid." });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "That already exists." });
  }

  const status = err.isOperational ? err.status : 500;
  const message = err.isOperational
    ? err.message
    : "Something went wrong on our side. Please try again.";

  if (!err.isOperational) {
    console.error("[error]", err);
  }
  res.status(status).json({
    error: message,
    ...(env.isProduction ? {} : { detail: err.message }),
  });
};
