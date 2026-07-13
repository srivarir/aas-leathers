import mongoose from "mongoose";

export const CATEGORIES = ["bags", "briefcases", "travel", "small-goods"];

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    collectionSlug: { type: String, required: true, index: true },
    images: { type: [String], default: [] },
    leather: String,
    hardware: String,
    lining: String,
    dimensions: String,
    story: String,
    details: { type: [String], default: [] },
    care: String,
    stock: { type: Number, default: 0, min: 0 },
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
    category: this.category,
    collection: this.collectionSlug,
    images: this.images,
    leather: this.leather,
    hardware: this.hardware,
    lining: this.lining,
    dimensions: this.dimensions,
    story: this.story,
    details: this.details,
    care: this.care,
    inStock: this.stock > 0,
    featured: this.featured,
  };
};

export const Product = mongoose.model("Product", productSchema);
