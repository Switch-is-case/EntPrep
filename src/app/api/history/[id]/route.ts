import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { testSessions, testAnswers, questions } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;

    // 1. Fetch the session
    const [session] = await db
      .select()
      .from(testSessions)
      .where(eq(testSessions.id, id))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Fetch the answers
    const answers = await db
      .select()
      .from(testAnswers)
      .where(eq(testAnswers.sessionId, id));

    if (answers.length === 0) {
      return NextResponse.json({ session, questions: [] });
    }

    // 3. Fetch the questions
    const questionIds = answers.map((a) => a.questionId);
    const qs = await db
      .select()
      .from(questions)
      .where(inArray(questions.id, questionIds));

    // 4. Combine them
    const questionsWithAnswers = answers.map((ans) => {
      const q = qs.find((qItem) => qItem.id === ans.questionId);
      return {
        ...q,
        userAnswer: ans.selectedAnswer,
        isCorrect: ans.isCorrect,
        isSkipped: ans.isSkipped,
      };
    });

    return NextResponse.json({ session, questions: questionsWithAnswers });
  } catch (error) {
    console.error("Failed to load session details:", error);
    return NextResponse.json({ error: "Failed to load session details" }, { status: 500 });
  }
}
