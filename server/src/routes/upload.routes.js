import { Router } from "express";
import multer from "multer";
import { ApiError } from "../utils/api-error.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { storeImages, UPLOAD_DIR } from "../services/image-store.js";

export { UPLOAD_DIR };

const router = Router();

const ALLOWED = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

const upload = multer({
  // Held in memory so the same buffer can go either to Cloudinary or to disk.
  // Bounded by the limits below: at most 8 x 5 MB.
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
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
    upload.array("files", 8)(req, res, async (err) => {
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
      try {
        // Absolute URLs, so the storefront (a different domain) can load them.
        const base = `${req.protocol}://${req.get("host")}`;
        const urls = await storeImages(
          req.files.map((f) => ({
            buffer: f.buffer,
            ext: ALLOWED[f.mimetype] ?? "",
          })),
          base,
        );
        res.status(201).json({ urls });
      } catch (storeErr) {
        next(
          new ApiError(
            502,
            "The image could not be stored. Please try again in a moment.",
          ),
        );
      }
    });
  },
);

export default router;
