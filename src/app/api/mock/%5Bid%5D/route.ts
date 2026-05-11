import { NextResponse } from "next/server";
import { db } from "@/db";
import { testSessions, testAnswers, questions, subjects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id;

    const session = await db.query.testSessions.findFirst({
      where: eq(testSessions.id, sessionId),
    });

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const answers = await db.query.testAnswers.findMany({
      where: eq(testAnswers.sessionId, sessionId),
      with: {
        question: true,
      },
      orderBy: (a, { asc }) => [asc(a.id)],
    });

    // Group by subject for the UI
    const subjectsList = JSON.parse(session.subjects as string);
    const questionsBySubject = subjectsList.map((sub: any) => ({
      ...sub,
      questions: answers
        .filter(a => a.question.subjectId === sub.id)
        .map(a => ({
          ...a.question,
          answerId: a.id,
          selectedAnswer: a.selectedAnswer,
          isSkipped: a.isSkipped,
        }))
    }));

    // Calculate remaining time
    const startTime = new Date(session.startedAt).getTime();
    const durationMs = 240 * 60 * 1000;
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
