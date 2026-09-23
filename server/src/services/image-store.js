import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

// uploads/ lives at the server root, one level up from src/. It is only used
// when Cloudinary is not configured — on a host with an ephemeral filesystem
// (Render's free tier, most PaaS) these files vanish on every restart, which
// leaves the catalogue pointing at images that 404.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const usingCloudinary = env.cloudinary.enabled;

if (usingCloudinary) {
  // With CLOUDINARY_URL set, the SDK reads it from the environment itself.
  if (env.cloudinary.url) {
    cloudinary.config({ secure: true });
  } else {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
      secure: true,
    });
  }
} else if (env.isProduction) {
  console.warn(
    "[images] Cloudinary is not configured, so uploaded product photos are " +
      "written to local disk. On a host with an ephemeral filesystem they " +
      "will disappear on the next restart. Set CLOUDINARY_URL to fix this.",
  );
}

function toCloudinary(file, id) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "aas-leathers/products",
        public_id: id,
        resource_type: "image",
        overwrite: false,
      },
      (err, result) =>
        err ? reject(err) : resolve(result.secure_url),
    );
    stream.end(file.buffer);
  });
}

async function toDisk(file, id, baseUrl) {
  const filename = `${id}${file.ext}`;
  await fs.promises.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
  return `${baseUrl}/uploads/${filename}`;
}

/**
 * Stores uploaded images and returns their public URLs — on Cloudinary when it
 * is configured, otherwise on the API's own disk. `baseUrl` is only consulted
 * for the disk fallback.
 */
export async function storeImages(files, baseUrl) {
  return Promise.all(
    files.map((file) => {
      const id = crypto.randomUUID();
      return usingCloudinary
        ? toCloudinary(file, id)
        : toDisk(file, id, baseUrl);
    }),
  );
}
