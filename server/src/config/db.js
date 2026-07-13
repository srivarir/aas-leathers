import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * Connects to MongoDB. In development without MONGODB_URI, falls back to an
 * in-memory MongoDB so the API runs anywhere; data resets on restart.
 */
export async function connectDb() {
  let uri = env.mongoUri;

  if (!uri) {
    if (env.isProduction) {
      throw new Error("MONGODB_URI is required in production.");
    }
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri("aas-leathers");
    console.log("[db] MONGODB_URI not set — using in-memory MongoDB (dev only, data resets on restart)");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log(`[db] connected (${mongoose.connection.name})`);
}
