import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, count = 10 } = await request.json();

    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    const practiceQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.subject, subject))
      .orderBy(sql`RANDOM()`)
      .limit(count);

    return NextResponse.json({
      questions: practiceQuestions.map((q) => ({
        id: q.id,
        subject: q.subject,
        questionTextRu: q.questionTextRu,
        questionTextKz: q.questionTextKz,
        questionTextEn: q.questionTextEn,
        optionsRu: q.optionsRu,
        optionsKz: q.optionsKz,
        optionsEn: q.optionsEn,
        correctAnswer: q.correctAnswer,
        topic: q.topic,
      })),
      totalQuestions: practiceQuestions.length,
    });
  } catch (error) {
    console.error("Practice error:", error);
    return NextResponse.json(
      { error: "Failed to load practice questions" },
      { status: 500 }
    );
  }
}
