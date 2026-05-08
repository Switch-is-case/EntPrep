import { NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { questionSeeds } from "@/lib/questions-data";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    // Check if questions already exist
    const existing = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions);

    if (Number(existing[0].count) > 0) {
      return NextResponse.json({
        message: "Questions already seeded",
        count: Number(existing[0].count),
      });
    }

    // Insert all questions
    for (const q of questionSeeds) {
      await db.insert(questions).values({
        subject: q.subject,
        questionTextRu: q.questionTextRu,
        questionTextKz: q.questionTextKz,
        questionTextEn: q.questionTextEn,
        optionsRu: q.optionsRu,
        optionsKz: q.optionsKz,
        optionsEn: q.optionsEn,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        topic: q.topic,
      });
    }

    return NextResponse.json({
      message: "Questions seeded successfully",
      count: questionSeeds.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed questions" },
      { status: 500 }
    );
  }
}
