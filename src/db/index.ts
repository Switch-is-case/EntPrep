import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { Pool } from "pg";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const isProduction = process.env.NODE_ENV === "production" || databaseUrl.includes("neon.tech");

const globalForDb = globalThis as typeof globalThis & {
  __db?: any;
};

export const db = (() => {
  if (isProduction) {
    const sql = neon(databaseUrl);
    return drizzleNeon(sql);
  }

  // Local development with node-postgres
  if (!globalForDb.__db) {
    const pool = new Pool({ connectionString: databaseUrl });
    globalForDb.__db = drizzlePg(pool);
  }
  return globalForDb.__db;
})();
