import nodemailer from "nodemailer";

/**
 * Real email is sent when SMTP is configured, either as discrete host/user/
 * pass vars (friendliest — no URL encoding) or a single SMTP_URL. With neither,
 * a JSON transport just logs the message, so development never needs
 * credentials and never accidentally emails real people.
 */
function buildTransport() {
  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // SSL on 465; STARTTLS on 587/others
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  if (process.env.SMTP_URL) {
    return nodemailer.createTransport(process.env.SMTP_URL);
  }
  return nodemailer.createTransport({ jsonTransport: true });
}

const transport = buildTransport();
const SENDING_REAL_MAIL = Boolean(process.env.SMTP_HOST || process.env.SMTP_URL);
const FROM =
  process.env.MAIL_FROM ??
  process.env.SMTP_USER ??
  "AAS Leathers <workshop@aasleathers.in>";
const DEV = !SENDING_REAL_MAIL;

/**
 * Sends the email-verification link. In development (no SMTP configured) the
 * link is logged to the server console so the flow can be tested without a
 * real mailbox.
 */
export async function sendVerificationEmail(user, verifyUrl) {
  const html = `
  <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#1d1915;background:#f4efe7;padding:40px">
    <p style="letter-spacing:.25em;font-size:11px;font-family:Arial,sans-serif">AAS LEATHERS</p>
    <h1 style="font-weight:normal;font-size:24px">Confirm your email</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#4a443c">
      Welcome, ${escapeHtml(user.name)}. Please confirm this is your email so we
      can attach your orders and keep your account secure.
    </p>
    <p style="margin:28px 0">
      <a href="${verifyUrl}" style="background:#171310;color:#f4efe7;font-family:Arial,sans-serif;
         font-size:12px;letter-spacing:.15em;text-transform:uppercase;text-decoration:none;
         padding:14px 28px;display:inline-block">Confirm Email</a>
    </p>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#857b6f">
      This link expires in 24 hours. If you didn't create an account, you can ignore this email.
    </p>
  </div>`;

  try {
    await transport.sendMail({
      from: FROM,
      to: user.email,
      subject: "Confirm your email — AAS Leathers",
      html,
    });
    if (DEV) {
      console.log(`\n[mail] (dev) email verification for ${user.email}`);
      console.log(`[mail] (dev) verify link: ${verifyUrl}\n`);
    }
  } catch (err) {
    console.error("[mail] failed to send verification email:", err.message);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export async function sendOrderConfirmation(order) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0">${i.name} × ${i.qty}</td>` +
        `<td style="padding:8px 0;text-align:right">${currency.format(i.unitPrice * i.qty)}</td></tr>`,
    )
    .join("");

  const html = `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1d1915;background:#f4efe7;padding:40px">
    <p style="letter-spacing:.25em;font-size:11px;font-family:Arial,sans-serif">AAS LEATHERS</p>
    <h1 style="font-weight:normal;font-size:26px">The bench has your order.</h1>
    <p style="font-family:Arial,sans-serif;font-size:13px;color:#857b6f">
      Order ${order.number} — your pieces will be inspected, wrapped in their
      dust bags and boxed for the courier within two working days.
    </p>
    <table style="width:100%;border-top:1px solid #ddd4c6;font-family:Arial,sans-serif;font-size:14px">${rows}
      <tr><td style="padding:12px 0;border-top:1px solid #ddd4c6"><strong>Total</strong></td>
      <td style="padding:12px 0;border-top:1px solid #ddd4c6;text-align:right"><strong>${currency.format(order.amounts.total)}</strong></td></tr>
    </table>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#857b6f">
      Delivering to ${order.shippingAddress.name}, ${order.shippingAddress.city} ${order.shippingAddress.pincode}.
    </p>
  </div>`;

  try {
    const info = await transport.sendMail({
      from: FROM,
      to: order.email,
      subject: `Order ${order.number} — the bench has it`,
      html,
    });
    if (!process.env.SMTP_URL) {
      console.log(`[mail] (dev) order confirmation for ${order.number} → ${order.email}`);
    }
    return info;
  } catch (err) {
    // Email must never break checkout — log and move on.
    console.error("[mail] failed to send order confirmation:", err.message);
    return null;
  }
}
