import { ApiError } from "../utils/api-error.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";
import { sendOrderConfirmation } from "./mailer.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateAddress(addr) {
  const a = addr ?? {};
  for (const f of ["name", "line1", "city", "pincode"]) {
    if (!a[f] || String(a[f]).trim().length < 2) {
      throw new ApiError(400, "Please complete the delivery address.");
    }
  }
  return {
    name: String(a.name),
    line1: String(a.line1),
    city: String(a.city),
    pincode: String(a.pincode),
    phone: a.phone ? String(a.phone) : undefined,
  };
}

/**
 * Prices a cart against the live catalogue. Used to compute the amount for a
 * payment before the customer pays. Throws ApiError if a piece has since been
 * withdrawn from sale.
 */
export async function priceCart(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Your cart is empty.");
  }
  if (items.length > 20) throw new ApiError(400, "Too many line items.");

  let subtotal = 0;
  for (const item of items) {
    const slug = String(item?.slug ?? "");
    if (!slug) throw new ApiError(400, "Each item needs a product.");
    const qty = Number(item?.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 9) {
      throw new ApiError(400, "Quantities must be between 1 and 9.");
    }
    const product = await Product.findOne({ slug, status: "published" });
    if (!product) {
      throw new ApiError(409, "That piece is no longer available. Remove it from the cart to continue.");
    }
    subtotal += product.price * qty;
  }
  return { subtotal };
}

/**
 * Creates an order: prices the cart from the DB, persists the order and sends
 * the confirmation email. Every piece is made to order, so there is no stock
 * to reserve and nothing to oversell.
 */
export async function createOrder({ user, items, shippingAddress, payment }) {
  // Every order belongs to an account. Orders placed against a bare email
  // could not be reunited with that account later, so checkout requires a
  // signed-in customer and the address comes from the session, not the body.
  if (!user) throw new ApiError(401, "Please sign in to place your order.");
  const resolvedEmail = String(user.email ?? "").toLowerCase().trim();
  if (!EMAIL_RE.test(resolvedEmail)) {
    throw new ApiError(400, "A valid email is needed to confirm the order.");
  }
  const address = validateAddress(shippingAddress);

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Your cart is empty.");
  }
  if (items.length > 20) throw new ApiError(400, "Too many line items.");

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const slug = String(item?.slug ?? "");
    if (!slug) throw new ApiError(400, "Each item needs a product.");
    const qty = Number(item?.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 9) {
      throw new ApiError(400, "Quantities must be between 1 and 9.");
    }

    const product = await Product.findOne({ slug, status: "published" });
    if (!product) {
      throw new ApiError(400, "That piece is no longer available.");
    }

    // The colour is the customer's choice, so it is validated against what
    // the piece is actually offered in rather than taken on trust.
    const wanted = item?.color ? String(item.color) : null;
    const color = wanted
      ? (product.colors ?? []).find((c) => c.name === wanted)?.name
      : undefined;
    if (wanted && !color) {
      throw new ApiError(400, `${product.name} isn't offered in ${wanted}.`);
    }

    orderItems.push({
      product: product._id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      color,
      unitPrice: product.price,
      qty,
    });
    subtotal += product.price * qty;
  }

  const order = await Order.create({
    number: Order.generateNumber(),
    user: user?._id ?? null,
    email: resolvedEmail,
    items: orderItems,
    amounts: { subtotal, shipping: 0, total: subtotal },
    shippingAddress: address,
    status: "confirmed",
    statusHistory: [{ status: "confirmed" }],
    payment: payment ?? { provider: "manual", status: "pending" },
  });

  // Fire-and-forget — email failures must never fail a checkout.
  sendOrderConfirmation(order);
  return order;
}

/** The client-safe shape of an order. Shared by the order and payment routes. */
export function toClientOrder(order) {
  return {
    id: order._id,
    number: order.number,
    email: order.email,
    items: order.items.map((i) => ({
      slug: i.slug,
      name: i.name,
      image: i.image,
      color: i.color,
      unitPrice: i.unitPrice,
      qty: i.qty,
    })),
    amounts: order.amounts,
    shippingAddress: order.shippingAddress,
    status: order.status,
    statusHistory: order.statusHistory,
    payment: { status: order.payment.status, provider: order.payment.provider },
    createdAt: order.createdAt,
  };
}
