import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./src/db/schema";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fix() {
  const db = drizzle(pool, { schema });
  console.log("🚀 Running DB Fix: Linking questions to subjects...");
  
  try {
    const result = await db.execute(sql`
      UPDATE questions q
      SET subject_id = s.id
      FROM subjects s
      WHERE q.subject = s.slug AND q.subject_id IS NULL
    `);
    console.log("✅ Fix applied successfully!");
    
    // Verify
    const counts = await db.execute(sql`
      SELECT s.slug, COUNT(q.id) 
      FROM subjects s 
      JOIN questions q ON q.subject_id = s.id 
      GROUP BY s.slug
    `);
    console.log("Updated counts:", counts.rows);
    
  } catch (err) {
    console.error("❌ Fix failed:", err);
  } finally {
    await pool.end();
  }
}

fix();
