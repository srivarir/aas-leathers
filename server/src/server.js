import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { createApp } from "./app.js";
import { Product } from "./models/product.js";
import { User } from "./models/user.js";
import { seedProducts } from "./data/seed-products.js";

/**
 * Ensures a staff account exists. Production requires explicit
 * ADMIN_EMAIL/ADMIN_PASSWORD env vars; development falls back to a
 * well-known local account and says so in the log.
 */
async function ensureAdmin() {
  const email =
    process.env.ADMIN_EMAIL ?? (env.isProduction ? null : "admin@aasleathers.in");
  const password =
    process.env.ADMIN_PASSWORD ?? (env.isProduction ? null : "workshop-admin");
  if (!email || !password) return;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return;

  await User.create({
    name: "The Workshop",
    email: email.toLowerCase(),
    passwordHash: await User.hashPassword(password),
    role: "super-admin",
  });
  console.log(
    `[seed] admin account ${email}${process.env.ADMIN_EMAIL ? "" : " (dev password: workshop-admin)"}`,
  );
}

async function main() {
  await connectDb();

  // Seed the catalog on an empty database so the API is useful immediately.
  const count = await Product.estimatedDocumentCount();
  if (count === 0) {
    await Product.insertMany(seedProducts);
    console.log(`[seed] inserted ${seedProducts.length} products`);
  }
  await ensureAdmin();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[api] AAS Leathers API listening on http://localhost:${env.port}`);
  });

  // A clear message instead of a raw stack trace when the port is taken —
  // usually means another copy of the API is already running.
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\n[api] Port ${env.port} is already in use.\n` +
          `      Another copy of the API is probably running.\n` +
          `      Close it first, or start this one on a different port, e.g.:\n` +
          `        Windows PowerShell:  $env:PORT=5001; npm start\n`,
      );
      process.exit(1);
    }
    console.error("[api] server error:", err);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
