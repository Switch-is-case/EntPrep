import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { Pool } from "pg";
import { neon } from "@neondatabase/serverless";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is missing. Please check your .env file or deployment settings.");
}

const isProduction = process.env.NODE_ENV === "production" || databaseUrl.includes("neon.tech");

const globalForDb = globalThis as typeof globalThis & {
  __db?: any;
};

export const db = (() => {
  if (isProduction) {
    const sql = neon(databaseUrl);
    return drizzleNeon(sql, { schema });
  }

  // Local development with node-postgres
  if (!globalForDb.__db) {
    const pool = new Pool({ connectionString: databaseUrl });
    globalForDb.__db = drizzlePg(pool, { schema });
  }
  return globalForDb.__db;
})();
