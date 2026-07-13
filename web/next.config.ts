import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server mode (not static export) so the catalogue is fully dynamic:
  // products added or edited in the admin get live detail pages with no
  // rebuild. Deploys as a Node app (next build + next start), like the API.
  images: {
    // Left unoptimized so product images from any host — Unsplash today,
    // uploaded images served from the API domain — load without needing
    // every hostname whitelisted here.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
