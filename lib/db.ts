import { Pool } from "pg";

const globalForDb = globalThis as unknown as {
  dataRegisterPool?: Pool;
};

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!globalForDb.dataRegisterPool) {
    globalForDb.dataRegisterPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    });
  }

  return globalForDb.dataRegisterPool;
}
