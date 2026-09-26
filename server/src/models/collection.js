import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    image: { type: String, default: "" },
    // Controls the order collections appear in on the storefront.
    position: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ["published", "archived"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true },
);

collectionSchema.methods.toClientJSON = function () {
  return {
    slug: this.slug,
    name: this.name,
    description: this.description,
    image: this.image,
  };
};

export const Collection = mongoose.model("Collection", collectionSchema);
