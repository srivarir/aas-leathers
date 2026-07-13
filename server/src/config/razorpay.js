import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

/**
 * The Razorpay client, or null when keys aren't configured. When null, the
 * store falls back to a mock/pending checkout so it still runs without keys.
 */
export const razorpay =
  keyId && keySecret ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null;

export const isRazorpayConfigured = Boolean(razorpay);
export const RAZORPAY_KEY_ID = keyId ?? null;
export const RAZORPAY_KEY_SECRET = keySecret ?? null;
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? null;
