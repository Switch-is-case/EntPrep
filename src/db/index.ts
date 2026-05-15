import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { Pool as NodePgPool } from "pg";
import { Pool as NeonPool } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config();

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is missing. Please check your .env file or deployment settings.");
}

const isProduction = process.env.NODE_ENV === "production" || databaseUrl.includes("neon.tech");

const globalForDb = globalThis as unknown as {
  __db?: any;
};

export const db = (() => {
  if (isProduction) {
    const pool = new NeonPool({ connectionString: databaseUrl });
    return drizzleNeon(pool, { schema });
  }

  // Local development with node-postgres
  if (!globalForDb.__db) {
    const pool = new NodePgPool({ connectionString: databaseUrl });
    globalForDb.__db = drizzlePg(pool, { schema });
  }
  return globalForDb.__db;
})() as any;
