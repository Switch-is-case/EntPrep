import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./src/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runDiag() {
  const db = drizzle(pool, { schema });
  console.log("=== MOCK EXAM DIAGNOSTICS ===\n");

  // 1. Check all subjects and their question counts
  console.log("--- SUBJECTS & QUESTIONS ---");
  const allSubjects = await db.query.subjects.findMany();
  for (const s of allSubjects) {
    const qCount = await db.select({ count: sql<number>`count(*)` })
      .from(schema.questions)
      .where(eq(schema.questions.subjectId, s.id));
    
    // Also check old 'subject' field count
    const oldQCount = await db.select({ count: sql<number>`count(*)` })
      .from(schema.questions)
      .where(eq(schema.questions.subject, s.slug));

    console.log(`[${s.slug}] (ID: ${s.id}): New field: ${qCount[0].count}, Old field: ${oldQCount[0].count}`);
  }

  // 2. Check User and Combination
  console.log("\n--- USER DATA ---");
  const user = await db.query.users.findFirst({
    with: {
      targetCombination: {
        with: {
          subject1: true,
          subject2: true,
        }
      }
    }
  });

  if (!user) {
    console.log("No user found!");
  } else {
    console.log(`User: ${user.name}`);
    console.log(`Combo ID: ${user.targetCombinationId}`);
    if (user.targetCombination) {
      console.log(`Sub1: ${user.targetCombination.subject1.slug} (ID: ${user.targetCombination.subject1.id})`);
      console.log(`Sub2: ${user.targetCombination.subject2.slug} (ID: ${user.targetCombination.subject2.id})`);
    } else {
      console.log("User has NO target combination linked correctly!");
    }
  }

  // 3. Test the exact logic from the API
  console.log("\n--- API LOGIC EMULATION ---");
  const mandatorySlugs = ["history_kz", "math_literacy", "reading_literacy"];
  if (user?.targetCombination) {
    const profileSlugs = [user.targetCombination.subject1.slug, user.targetCombination.subject2.slug];
    const allSlugs = [...mandatorySlugs, ...profileSlugs];
    console.log("Looking for slugs:", allSlugs);

    const foundSubjects = await db.query.subjects.findMany({
      where: inArray(schema.subjects.slug, allSlugs)
    });
    console.log("Found subjects in DB:", foundSubjects.map(s => s.slug));

    for (const slug of allSlugs) {
        if (!foundSubjects.find(s => s.slug === slug)) {
            console.error(`ERROR: Subject with slug '${slug}' NOT FOUND in DB!`);
        }
    }
  }

  await pool.end();
}

runDiag().catch(console.error);
