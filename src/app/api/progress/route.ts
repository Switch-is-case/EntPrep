import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { progress, testSessions } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subjectProgress = await db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId));

    const recentSessions = await db
      .select()
      .from(testSessions)
      .where(eq(testSessions.userId, userId))
      .orderBy(desc(testSessions.startedAt))
      .limit(10);

    return NextResponse.json({
      subjectProgress,
      recentSessions: recentSessions.map((s) => ({
        id: s.id,
        testType: s.testType,
        subjects: s.subjects,
        totalQuestions: s.totalQuestions,
        correctAnswers: s.correctAnswers,
        skippedAnswers: s.skippedAnswers,
        wrongAnswers: s.wrongAnswers,
        score: s.score,
        completed: s.completed,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
      })),
    });
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json(
      { error: "Failed to load progress" },
      { status: 500 }
    );
  }
}
