import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import multer from "multer";
import { ApiError } from "../utils/api-error.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// uploads/ lives at the server root, one level up from src/.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  // Random filename — never trust the client's, which prevents path
  // traversal and collisions.
  filename: (_req, file, cb) =>
    cb(null, `${crypto.randomUUID()}${ALLOWED[file.mimetype] ?? ""}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 }, // 5 MB each, 8 at a time
  fileFilter: (_req, file, cb) => {
    if (ALLOWED[file.mimetype]) return cb(null, true);
    cb(new ApiError(400, "Only JPG, PNG, WebP, GIF or AVIF images are allowed."));
  },
});

router.post(
  "/",
  requireAuth,
  requireRole("admin", "super-admin", "inventory-manager", "content-manager"),
  (req, res, next) => {
    upload.array("files", 8)(req, res, (err) => {
      if (err) {
        // Multer's own errors (size/count) arrive here as generic errors.
        const message =
          err instanceof ApiError
            ? err.message
            : err.code === "LIMIT_FILE_SIZE"
              ? "Each image must be 5 MB or smaller."
              : "Upload failed. Please try again.";
        return next(new ApiError(err.status ?? 400, message));
      }
      if (!req.files || req.files.length === 0) {
        return next(new ApiError(400, "No image was uploaded."));
      }
      // Absolute URLs so the storefront (a different domain) can load them.
      const base = `${req.protocol}://${req.get("host")}`;
      const urls = req.files.map((f) => `${base}/uploads/${f.filename}`);
      res.status(201).json({ urls });
    });
  },
);

export default router;
