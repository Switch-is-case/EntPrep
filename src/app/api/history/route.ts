import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { testSessions } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sessions = await db
      .select({
        id: testSessions.id,
        testType: testSessions.testType,
        totalQuestions: testSessions.totalQuestions,
        correctAnswers: testSessions.correctAnswers,
        wrongAnswers: testSessions.wrongAnswers,
        skippedAnswers: testSessions.skippedAnswers,
        score: testSessions.score,
        startedAt: testSessions.startedAt,
      })
      .from(testSessions)
      .where(eq(testSessions.userId, userId))
      .orderBy(desc(testSessions.startedAt));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Failed to load history:", error);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }
}
