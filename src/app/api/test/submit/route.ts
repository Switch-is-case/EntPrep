import { NextResponse } from "next/server";
import { db } from "@/db";
import { testSessions, testAnswers, questions, users, subjects, progress } from "@/db/schema";
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
    const subjectBreakdown: Record<string, { score: number, total: number, skipped: number, name: string }> = {};

    const subjectsData = session.subjects as any[];
    subjectsData.forEach((s: any) => {
      subjectBreakdown[s.id] = { score: 0, total: 0, skipped: 0, name: s.nameRu };
    });

    for (const ans of answers) {
      const sId = ans.question.subjectId!;
      if (subjectBreakdown[sId]) {
        subjectBreakdown[sId].total++;
        if (ans.isCorrect) {
          subjectBreakdown[sId].score++;
          correctCount++;
          totalScore++; // Simplified: 1 point per question
        } else if (ans.isSkipped) {
          subjectBreakdown[sId].skipped++;
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

    // 3. Update Progress Table (Fix: Stats were missing)
    for (const [sIdStr, result] of Object.entries(subjectBreakdown)) {
      const sId = parseInt(sIdStr);
      
      const [existing] = await db
        .select()
        .from(progress)
        .where(and(eq(progress.userId, session.userId), eq(progress.subjectId, sId)))
        .limit(1);

      const subjectScore = Math.round((result.score / Math.max(result.total, 1)) * 100);

      if (existing) {
        await db.update(progress)
          .set({
            totalAttempted: existing.totalAttempted + result.total,
            totalCorrect: existing.totalCorrect + result.score,
            totalSkipped: existing.totalSkipped + result.skipped,
            lastScore: subjectScore,
            bestScore: Math.max(existing.bestScore, subjectScore),
            updatedAt: new Date(),
          })
          .where(eq(progress.id, existing.id));
      } else {
        await db.insert(progress).values({
          userId: session.userId,
          subjectId: sId,
          subject: result.name,
          totalAttempted: result.total,
          totalCorrect: result.score,
          totalSkipped: result.skipped,
          lastScore: subjectScore,
          bestScore: subjectScore,
        });
      }

    }

    // 4. Update User's Predicted Score
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
