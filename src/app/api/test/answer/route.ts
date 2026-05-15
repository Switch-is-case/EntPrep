import { NextResponse } from "next/server";
import { db } from "@/db";
import { testAnswers, questions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request) {
  try {
    const { answerId, selectedAnswer, isSkipped } = await req.json();

    const answerRecord = await db.query.testAnswers.findFirst({
      where: eq(testAnswers.id, answerId),
      with: {
        question: true,
      }
    });

    if (!answerRecord) return NextResponse.json({ error: "Answer not found" }, { status: 404 });

    const isCorrect = isSkipped || selectedAnswer === null ? false : answerRecord.question.correctAnswer === selectedAnswer;

    await db.update(testAnswers)
      .set({
        selectedAnswer,
        isCorrect,
        isSkipped: !!isSkipped,
        timeSpent: 0, // Placeholder
      })
      .where(eq(testAnswers.id, answerId));

    return NextResponse.json({ success: true, isCorrect });
  } catch (error) {
    console.error("Answer Save Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
