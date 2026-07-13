import mongoose from "mongoose";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "in-transit",
  "out-for-delivery",
  "delivered",
  "completed",
  "cancelled",
  "returned",
  "refunded",
  "failed",
];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    slug: { type: String, required: true },
    // Snapshots — an order's history must not change when the catalog does.
    name: { type: String, required: true },
    image: String,
    unitPrice: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1, max: 9 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true },
    // Guest orders have no user until an account with the same email
    // registers or signs in, at which point they are claimed.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, default: null },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, "Order must contain at least one item"],
    },
    amounts: {
      subtotal: { type: Number, required: true, min: 0 },
      shipping: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    shippingAddress: {
      name: { type: String, required: true },
      line1: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: String,
    },
    status: { type: String, enum: ORDER_STATUSES, default: "confirmed", index: true },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        at: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    payment: {
      provider: { type: String, default: "razorpay" },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      reference: String,
    },
  },
  { timestamps: true },
);

orderSchema.statics.generateNumber = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AAS-${stamp}-${rand}`;
};

export const Order = mongoose.model("Order", orderSchema);
