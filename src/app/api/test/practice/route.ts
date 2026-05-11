import { NextResponse } from "next/server";
import { db } from "@/db";
import { testSessions, testAnswers, questions, subjects } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { subjectSlug, count = 20 } = body;

    const sub = await db.query.subjects.findFirst({
      where: eq(subjects.slug, subjectSlug),
    });

    if (!sub) return NextResponse.json({ error: "Subject not found" }, { status: 404 });

    // Fetch questions (using the same logic as the new unified engine for consistency)
    const pool = await db.query.questions.findMany({
      where: eq(questions.subjectId, sub.id),
      limit: count * 2,
      orderBy: sql`RANDOM()`,
    });

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const [session] = await db.insert(testSessions).values({
      userId,
      testType: "practice",
      subjects: [sub],
      totalQuestions: selected.length,
      startedAt: new Date(),
      completed: false,
    }).returning();

    const answerEntries = selected.map(q => ({
      sessionId: session.id,
      questionId: q.id,
      isSkipped: true,
    }));
    
    await db.insert(testAnswers).values(answerEntries);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Practice Start Error:", error);
    return NextResponse.json({ error: "Failed to start practice" }, { status: 500 });
  }
}
