import "dotenv/config";

const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  mongoUri: process.env.MONGODB_URI ?? null,
  // CLIENT_URL may list several origins, comma-separated, so the storefront
  // can be moved between hosts without breaking the one already live.
  // The first is canonical (used for links inside emails).
  clientUrls: (process.env.CLIENT_URL ?? "http://localhost:3000")
    .split(",")
    .map((u) => u.trim().replace(/\/$/, ""))
    .filter(Boolean),
  get clientUrl() {
    return this.clientUrls[0];
  },
  // Uploaded product photos go to Cloudinary when configured. Either paste the
  // single CLOUDINARY_URL from the dashboard, or set the three parts.
  cloudinary: {
    url: process.env.CLOUDINARY_URL ?? null,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? null,
    apiKey: process.env.CLOUDINARY_API_KEY ?? null,
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? null,
    get enabled() {
      return Boolean(
        this.url || (this.cloudName && this.apiKey && this.apiSecret),
      );
    },
  },
  // "lax" once the storefront and API share a registrable domain (the store
  // on example.com, the API on api.example.com) — that keeps the refresh
  // cookie first-party, so Safari and any browser blocking third-party
  // cookies still keep people signed in. "none" is required only while the
  // two sit on genuinely different domains.
  cookieSameSite: (process.env.COOKIE_SAMESITE ?? "").toLowerCase() === "lax"
    ? "lax"
    : "none",
  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET", "dev-access-secret-change-me"),
    refreshSecret: required("JWT_REFRESH_SECRET", "dev-refresh-secret-change-me"),
    accessTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
    refreshTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30),
  },
};

if (env.isProduction) {
  // Neither token secret may be a development default in production...
  if (
    env.jwt.accessSecret.startsWith("dev-") ||
    env.jwt.refreshSecret.startsWith("dev-")
  ) {
    throw new Error(
      "Refusing to start in production with default JWT secrets. " +
        "Set strong, random JWT_ACCESS_SECRET and JWT_REFRESH_SECRET.",
    );
  }
  // ...and they must be distinct, so an access token can never be replayed
  // as a refresh token or vice versa.
  if (env.jwt.accessSecret === env.jwt.refreshSecret) {
    throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different.");
  }
}
