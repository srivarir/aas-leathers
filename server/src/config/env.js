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
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
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
