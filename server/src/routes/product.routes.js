import { Router } from "express";
import { ApiError, asyncHandler } from "../utils/api-error.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { CATEGORIES, Product } from "../models/product.js";

const router = Router();

const SORTS = {
  featured: { featured: -1, createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  newest: { createdAt: -1 },
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, collection, search, sort = "featured" } = req.query;

    // Coerce every filter to a string — query-string parsing can otherwise
    // yield objects/arrays (e.g. ?collection[$ne]=x), which would reach the
    // database as query operators (NoSQL injection).
    const query = { status: "published" };
    if (category) {
      const c = String(category);
      if (!CATEGORIES.includes(c)) throw new ApiError(400, "Unknown category.");
      query.category = c;
    }
    if (collection) query.collectionSlug = String(collection);
    if (search) query.$text = { $search: String(search) };

    const products = await Product.find(query)
      .sort(SORTS[sort] ?? SORTS.featured)
      .limit(100);

    res.json({ products: products.map((p) => p.toClientJSON()) });
  }),
);

// Full catalog including drafts/archived and raw stock — staff only.
// Registered before "/:slug" so "admin" is never read as a product slug.
router.get(
  "/admin/list",
  requireAuth,
  requireRole("admin", "super-admin", "inventory-manager"),
  asyncHandler(async (_req, res) => {
    const products = await Product.find().sort({ name: 1 });
    res.json({
      products: products.map((p) => ({
        slug: p.slug,
        name: p.name,
        price: p.price,
        category: p.category,
        stock: p.stock,
        status: p.status,
        image: p.images[0],
      })),
    });
  }),
);

// Single product for the admin editor — unlike the public route, this
// returns drafts and archived pieces too. Registered before "/:slug".
router.get(
  "/admin/item/:slug",
  requireAuth,
  requireRole("admin", "super-admin", "inventory-manager"),
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) throw new ApiError(404, "Product not found.");
    res.json({ product: adminProductJSON(product) });
  }),
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: "published",
    });
    if (!product) throw new ApiError(404, "That piece isn't in the ledger.");
    res.json({ product: product.toClientJSON() });
  }),
);

// ——— Admin ———

// Only these fields may be written through the API — identity (_id) and
// timestamps can never be overwritten.
const EDITABLE_FIELDS = [
  "name", "tagline", "price", "category", "collectionSlug", "images",
  "leather", "hardware", "lining", "dimensions", "story", "details",
  "care", "stock", "featured", "status",
];

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Guarantees a unique slug by appending -2, -3… if the base is taken.
async function uniqueSlug(base) {
  const root = slugify(base) || "piece";
  let candidate = root;
  let n = 2;
  while (await Product.exists({ slug: candidate })) {
    candidate = `${root}-${n++}`;
  }
  return candidate;
}

router.post(
  "/",
  requireAuth,
  requireRole("admin", "super-admin", "inventory-manager"),
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};

    if (!body.name || String(body.name).trim().length < 2) {
      throw new ApiError(400, "A product needs a name.");
    }
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      throw new ApiError(400, "A product needs a valid price.");
    }
    if (!CATEGORIES.includes(body.category)) {
      throw new ApiError(400, "Choose a valid category.");
    }

    const doc = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in body) doc[field] = body[field];
    }
    // Slug is generated server-side — from a supplied slug or the name —
    // and made unique, so admins never have to think about it.
    doc.slug = await uniqueSlug(body.slug || body.name);
    if (!doc.collectionSlug) doc.collectionSlug = "everyday";

    const product = await Product.create(doc);
    res.status(201).json({ product: adminProductJSON(product) });
  }),
);

router.patch(
  "/:slug",
  requireAuth,
  requireRole("admin", "super-admin", "inventory-manager"),
  asyncHandler(async (req, res) => {
    const update = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in (req.body ?? {})) update[field] = req.body[field];
    }
    if (Object.keys(update).length === 0) {
      throw new ApiError(400, "Nothing to update.");
    }
    const product = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      update,
      { new: true, runValidators: true },
    );
    if (!product) throw new ApiError(404, "Product not found.");
    res.json({ product: product.toClientJSON() });
  }),
);

router.delete(
  "/:slug",
  requireAuth,
  requireRole("admin", "super-admin"),
  asyncHandler(async (req, res) => {
    // Default is a soft delete (archive) so orders keep their history.
    // ?hard=true removes the record permanently — super-admin only.
    if (req.query.hard === "true") {
      if (req.user.role !== "super-admin") {
        throw new ApiError(403, "Only a super-admin can permanently delete a product.");
      }
      const result = await Product.deleteOne({ slug: req.params.slug });
      if (result.deletedCount === 0) throw new ApiError(404, "Product not found.");
      return res.json({ ok: true, deleted: "permanent" });
    }

    const product = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      { status: "archived" },
      { new: true },
    );
    if (!product) throw new ApiError(404, "Product not found.");
    res.json({ ok: true, deleted: "archived" });
  }),
);

// Full editable shape for the admin editor.
function adminProductJSON(p) {
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    price: p.price,
    category: p.category,
    collection: p.collectionSlug,
    images: p.images,
    leather: p.leather,
    hardware: p.hardware,
    lining: p.lining,
    dimensions: p.dimensions,
    story: p.story,
    details: p.details,
    care: p.care,
    stock: p.stock,
    featured: p.featured,
    status: p.status,
  };
}

export default router;
