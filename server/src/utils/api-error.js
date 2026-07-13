/** Operational error with an HTTP status — safe to expose its message. */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.isOperational = true;
  }
}

/** Wraps async route handlers so rejections reach the error middleware. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
