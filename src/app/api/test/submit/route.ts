import { NextResponse } from "next/server";
import { db } from "@/db";
import { testSessions, testAnswers, questions, users, subjects } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    const session = await db.query.testSessions.findFirst({
      where: eq(testSessions.id, sessionId),
    });

    if (!session || session.completed) {
      return NextResponse.json({ error: "Invalid or completed session" }, { status: 400 });
    }

    const answers = await db.query.testAnswers.findMany({
      where: eq(testAnswers.sessionId, sessionId),
      with: {
        question: true,
      }
    });

    // 1. Calculate scores
    let totalScore = 0;
    let correctCount = 0;
    const subjectBreakdown: Record<string, { score: number, total: number, name: string }> = {};

    const subjectsData = session.subjects as any[];
    subjectsData.forEach((s: any) => {
      subjectBreakdown[s.id] = { score: 0, total: 0, name: s.nameRu };
    });

    for (const ans of answers) {
      const sId = ans.question.subjectId!;
      if (subjectBreakdown[sId]) {
        subjectBreakdown[sId].total++;
        if (ans.isCorrect) {
          subjectBreakdown[sId].score++;
          correctCount++;
          totalScore++; // Simplified: 1 point per question
        }
      }
    }

    // 2. Update Session
    await db.update(testSessions)
      .set({
        completed: true,
        completedAt: new Date(),
        score: totalScore,
        correctAnswers: correctCount,
        results: { subjectBreakdown },
      })
      .where(eq(testSessions.id, sessionId));

    // 3. Update User's Predicted Score
    await db.update(users)
      .set({
        currentPredictedScore: totalScore, // Mock exam is a strong predictor
        lastPredictionAt: new Date(),
      })
      .where(eq(users.id, session.userId));

    return NextResponse.json({ success: true, score: totalScore, breakdown: subjectBreakdown });

  } catch (error) {
    console.error("Submit Error:", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
