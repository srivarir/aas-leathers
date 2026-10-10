import mongoose from "mongoose";

/** A colour a piece can be ordered in. Stock is held on the piece, not per
  * colour — the workshop dyes to order rather than keeping parallel runs. */
const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true, lowercase: true },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    collectionSlug: { type: String, required: true, index: true },
    images: { type: [String], default: [] },
    colors: { type: [colorSchema], default: [] },
    leather: String,
    hardware: String,
    lining: String,
    dimensions: String,
    story: String,
    details: { type: [String], default: [] },
    care: String,
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", tagline: "text", leather: "text" });

productSchema.methods.toClientJSON = function () {
  return {
    slug: this.slug,
    name: this.name,
    tagline: this.tagline,
    price: this.price,
    collection: this.collectionSlug,
    images: this.images,
    colors: this.colors.map((c) => ({ name: c.name, hex: c.hex })),
    leather: this.leather,
    hardware: this.hardware,
    lining: this.lining,
    dimensions: this.dimensions,
    story: this.story,
    details: this.details,
    care: this.care,
    // Everything is made to order, so nothing is ever out of stock.
    inStock: true,
    featured: this.featured,
  };
};

export const Product = mongoose.model("Product", productSchema);
