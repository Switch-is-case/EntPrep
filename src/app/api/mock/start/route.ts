import { NextResponse } from "next/server";
import { db } from "@/db";
import { testSessions, testAnswers, questions, subjects, subjectCombinations, users } from "@/db/schema";
import { eq, sql, and, inArray, type InferSelectModel } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/auth";
import { requireVerifiedEmail } from "@/lib/auth-server";

type Question = InferSelectModel<typeof questions>;
type Subject = InferSelectModel<typeof subjects>;

interface MockStartRequest {
  mode: "diagnostic" | "mock" | "practice";
  combinationId?: number;
  subjectSlug?: string;
  count?: number;
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const verification = await requireVerifiedEmail(userId);
    if (!verification.ok) {
      return NextResponse.json(
        { error: "EMAIL_NOT_VERIFIED", message: "Please verify your email to use this feature" },
        { status: 403 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        targetCombination: {
          with: {
            subject1: true,
            subject2: true,
          }
        }
      }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let body: MockStartRequest;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid request body. Expected valid JSON." }, { status: 400 });
    }
    
    const mode = body.mode;

    // 1. Determine subjects to fetch
    let targetSubjects: { id: number; slug: string; nameRu: string; nameKz: string }[] = [];
    let questionCounts: Record<string, number> = {};

    if (mode === "practice") {
      if (!body.subjectSlug) return NextResponse.json({ error: "Subject slug is required for practice" }, { status: 400 });
      const sub = await db.query.subjects.findFirst({
        where: eq(subjects.slug, body.subjectSlug),
      });
      if (!sub) return NextResponse.json({ error: "Subject not found" }, { status: 404 });
      targetSubjects = [sub];
      questionCounts[sub.slug] = body.count || 20;
    } else {
      // Diagnostic or Mock
      let combination = user.targetCombination;
      if (body.combinationId) {
        const overrideCombo = await db.query.subjectCombinations.findFirst({
          where: eq(subjectCombinations.id, body.combinationId),
          with: {
            subject1: true,
            subject2: true,
          }
        });
        if (overrideCombo) combination = overrideCombo as any;
      }

      if (!combination) return NextResponse.json({ error: "Please complete Career Wizard first" }, { status: 400 });

      const mandatorySlugs = ["history_kz", "math_literacy", "reading_literacy"];
      const profileSlugs = [combination.subject1.slug, combination.subject2.slug];
      const allSlugs = [...mandatorySlugs, ...profileSlugs];

      targetSubjects = await db.query.subjects.findMany({
        where: inArray(subjects.slug, allSlugs),
      });

      const isDiagnostic = mode === "diagnostic";
      mandatorySlugs.forEach(slug => questionCounts[slug] = isDiagnostic ? 5 : (slug === "history_kz" ? 20 : 15));
      profileSlugs.forEach(slug => questionCounts[slug] = isDiagnostic ? 5 : 45);
    }

    const targetTotal = Object.values(questionCounts).reduce((a, b) => a + b, 0);

    // 2. Fetch and shuffle questions
    const mockQuestions: Question[] = [];
    for (const sub of targetSubjects) {
      const requiredCount = questionCounts[sub.slug] || 0;
      const pool = await db.query.questions.findMany({
        where: eq(questions.subjectId, sub.id),
        limit: requiredCount * 2,
        orderBy: sql`RANDOM()`,
      });

      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      mockQuestions.push(...shuffled.slice(0, requiredCount));
    }

    if (mockQuestions.length < targetTotal) {
      return NextResponse.json({ 
        error: "Insufficient questions in database", 
        details: `Found only ${mockQuestions.length} questions. Need ${targetTotal}.`
      }, { status: 400 });
    }

    // 3. Create Session
    const [session] = await db.insert(testSessions).values({
      userId,
      testType: mode,
      subjects: targetSubjects,
      totalQuestions: mockQuestions.length,
      startedAt: new Date(),
      completed: false,
    }).returning();

    // 4. Create Answers
    const answerEntries = mockQuestions.map(q => ({
      sessionId: session.id,
      questionId: q.id,
      isSkipped: true,
    }));
    
    await db.insert(testAnswers).values(answerEntries);

    return NextResponse.json({ 
      sessionId: session.id, 
      totalQuestions: mockQuestions.length,
    });

  } catch (error) {
    console.error("Mock Start Error:", error);
    return NextResponse.json({ error: "Failed to start test session" }, { status: 500 });
  }
}
