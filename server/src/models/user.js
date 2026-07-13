import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const ROLES = [
  "customer",
  "admin",
  "super-admin",
  "inventory-manager",
  "content-manager",
  "customer-support",
];

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Home" },
    line1: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "customer" },
    addresses: [addressSchema],
    // Hashes of currently-valid refresh tokens (supports rotation + multi-device).
    refreshTokenHashes: { type: [String], default: [], select: false },
    // Email verification. Guest orders are only claimed once verified, so an
    // account can never inherit another person's guest-order details.
    emailVerified: { type: Boolean, default: false },
    emailVerifyTokenHash: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    emailVerified: this.emailVerified,
    addresses: this.addresses,
    createdAt: this.createdAt,
  };
};

userSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, 12);

export const User = mongoose.model("User", userSchema);
