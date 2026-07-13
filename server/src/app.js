import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import uploadRoutes, { UPLOAD_DIR } from "./routes/upload.routes.js";
import paymentRoutes from "./routes/payments.routes.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  // crossOriginResourcePolicy is relaxed so the storefront (served from a
  // different domain than the API) can display uploaded product images.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );
  // The Razorpay webhook must see the RAW body to verify its signature, so it
  // is parsed as a Buffer BEFORE the JSON parser runs on everything else.
  app.use(
    "/api/payments/razorpay/webhook",
    express.raw({ type: "*/*", limit: "1mb" }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  // Global safety-net limiter; auth routes carry a stricter one of their own.
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );

  app.get("/api/health", (_req, res) =>
    res.json({ ok: true, service: "aas-leathers-api" }),
  );

  // Uploaded product images, served as long-cached static files.
  app.use(
    "/uploads",
    express.static(UPLOAD_DIR, {
      maxAge: "30d",
      immutable: true,
    }),
  );

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/uploads", uploadRoutes);
  app.use("/api/payments", paymentRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
