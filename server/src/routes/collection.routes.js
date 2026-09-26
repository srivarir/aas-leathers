import { Router } from "express";
import { ApiError, asyncHandler } from "../utils/api-error.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Collection } from "../models/collection.js";
import { Product } from "../models/product.js";

const router = Router();

const EDITORS = ["admin", "super-admin", "inventory-manager", "content-manager"];

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Guarantees a unique slug by appending -2, -3… if the base is taken.
async function uniqueSlug(base) {
  const root = slugify(base) || "collection";
  let candidate = root;
  let n = 2;
  while (await Collection.exists({ slug: candidate })) {
    candidate = `${root}-${n++}`;
  }
  return candidate;
}

/** Only these fields may be written — never the slug, status or timestamps. */
function readBody(body) {
  const out = {};
  if (body.name !== undefined) out.name = String(body.name).trim();
  if (body.description !== undefined) out.description = String(body.description).trim();
  if (body.image !== undefined) out.image = String(body.image).trim();
  if (body.position !== undefined) {
    const n = Number(body.position);
    if (Number.isFinite(n)) out.position = n;
  }
  return out;
}

/** Published collections, in display order. */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const list = await Collection.find({ status: "published" }).sort({
      position: 1,
      createdAt: 1,
    });
    res.json({ collections: list.map((c) => c.toClientJSON()) });
  }),
);

/** Every collection, including archived ones, with how many pieces each holds. */
router.get(
  "/admin/list",
  requireAuth,
  requireRole(...EDITORS),
  asyncHandler(async (_req, res) => {
    const list = await Collection.find().sort({ position: 1, createdAt: 1 });
    const counts = await Product.aggregate([
      { $match: { status: { $ne: "archived" } } },
      { $group: { _id: "$collectionSlug", n: { $sum: 1 } } },
    ]);
    const bySlug = Object.fromEntries(counts.map((c) => [c._id, c.n]));
    res.json({
      collections: list.map((c) => ({
        ...c.toClientJSON(),
        position: c.position,
        status: c.status,
        productCount: bySlug[c.slug] ?? 0,
      })),
    });
  }),
);

router.post(
  "/",
  requireAuth,
  requireRole(...EDITORS),
  asyncHandler(async (req, res) => {
    const fields = readBody(req.body ?? {});
    if (!fields.name || fields.name.length < 2) {
      throw new ApiError(400, "A collection needs a name.");
    }
    const collection = await Collection.create({
      ...fields,
      slug: await uniqueSlug(fields.name),
    });
    res.status(201).json({ collection: collection.toClientJSON() });
  }),
);

router.patch(
  "/:slug",
  requireAuth,
  requireRole(...EDITORS),
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const fields = readBody(body);
    if (fields.name !== undefined && fields.name.length < 2) {
      throw new ApiError(400, "A collection needs a name.");
    }
    if (body.status !== undefined) {
      if (!["published", "archived"].includes(body.status)) {
        throw new ApiError(400, "Unknown collection status.");
      }
      fields.status = body.status;
    }
    const collection = await Collection.findOneAndUpdate(
      { slug: String(req.params.slug) },
      fields,
      { new: true, runValidators: true },
    );
    if (!collection) throw new ApiError(404, "Collection not found.");
    res.json({ collection: collection.toClientJSON() });
  }),
);

/**
 * Deleting a collection that still holds pieces would leave those products
 * pointing at nothing, so it is refused until they have been moved.
 */
router.delete(
  "/:slug",
  requireAuth,
  requireRole("admin", "super-admin"),
  asyncHandler(async (req, res) => {
    const slug = String(req.params.slug);
    const inUse = await Product.countDocuments({
      collectionSlug: slug,
      status: { $ne: "archived" },
    });
    if (inUse > 0) {
      throw new ApiError(
        409,
        `${inUse} ${inUse === 1 ? "piece is" : "pieces are"} still in this collection. Move them to another collection first.`,
      );
    }
    const removed = await Collection.findOneAndDelete({ slug });
    if (!removed) throw new ApiError(404, "Collection not found.");
    res.json({ ok: true });
  }),
);

export default router;
