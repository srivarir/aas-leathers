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
 * Prices a cart against the live catalogue WITHOUT touching stock. Used to
 * compute the amount for a payment before the customer pays. Throws ApiError
 * if anything is unavailable.
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
    if (!product || product.stock < qty) {
      const name = product?.name ?? "That piece";
      throw new ApiError(
        409,
        product && product.stock > 0
          ? `Only ${product.stock} of ${name} remain — please adjust the quantity.`
          : `${name} has sold out. Remove it from the cart to continue.`,
      );
    }
    subtotal += product.price * qty;
  }
  return { subtotal };
}

/**
 * Creates an order: prices the cart from the DB, atomically decrements stock
 * (never oversells), persists the order, and sends the confirmation email.
 * On any unavailable item it rolls back the stock it already reserved and
 * throws — so a partial order is never created.
 */
export async function createOrder({ user, email, items, shippingAddress, payment }) {
  const resolvedEmail = user ? user.email : String(email ?? "").toLowerCase().trim();
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

    const product = await Product.findOneAndUpdate(
      { slug, status: "published", stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true },
    );
    if (!product) {
      await Promise.all(
        orderItems.map((oi) =>
          Product.updateOne({ _id: oi.product }, { $inc: { stock: oi.qty } }),
        ),
      );
      const existing = await Product.findOne({ slug });
      const name = existing?.name ?? "That piece";
      throw new ApiError(
        409,
        existing && existing.status === "published" && existing.stock > 0
          ? `Only ${existing.stock} of ${name} remain — please adjust the quantity.`
          : `${name} has sold out. Remove it from the cart to continue.`,
      );
    }

    orderItems.push({
      product: product._id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
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
