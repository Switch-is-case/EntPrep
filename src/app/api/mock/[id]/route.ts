import { NextResponse } from "next/server";
import { db } from "@/db";
import { testSessions, testAnswers, questions, subjects } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: sessionId } = await params;

    const session = await db.query.testSessions.findFirst({
      where: and(
        eq(testSessions.id, sessionId),
        eq(testSessions.userId, userId)
      ),
    });

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const answers = await db.query.testAnswers.findMany({
      where: eq(testAnswers.sessionId, sessionId),
      with: {
        question: true,
      },
      orderBy: [asc(testAnswers.id)],
    });

    // Group by subject for the UI
    const subjectsList = session.subjects as any[];
    const questionsBySubject = subjectsList.map((sub: any) => ({
      ...sub,
      questions: answers
        .filter((a: any) => a.question.subjectId === sub.id)
        .map((a: any) => ({
          ...a.question,
          answerId: a.id,
          selectedAnswer: a.selectedAnswer,
          isSkipped: a.isSkipped,
        }))
    }));

    // Calculate remaining time based on test type
    const startTime = new Date(session.startedAt).getTime();
    const isDiagnostic = session.testType === "diagnostic";
    const durationMs = (isDiagnostic ? 45 : 240) * 60 * 1000;
    const remainingMs = Math.max(0, startTime + durationMs - Date.now());

    return NextResponse.json({
      session,
      subjects: questionsBySubject,
      remainingMs,
    });

  } catch (error) {
    console.error("Mock Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
