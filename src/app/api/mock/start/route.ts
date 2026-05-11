import { NextResponse } from "next/server";
import { db } from "@/db";
import { testSessions, testAnswers, questions, subjects, subjectCombinations, users } from "@/db/schema";
import { eq, sql, and, inArray } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    if (!user || !user.targetCombinationId) {
      return NextResponse.json({ error: "Please complete Career Wizard first" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "diagnostic" ? "diagnostic" : "mock";

    // 1. Define required subject slugs
    const mandatorySlugs = ["history_kz", "math_literacy", "reading_literacy"];
    const profileSlugs = [
      user.targetCombination.subject1.slug,
      user.targetCombination.subject2.slug
    ];

    // 2. Fetch all relevant subjects
    const allRelevantSubjects = await db.query.subjects.findMany({
      where: inArray(subjects.slug, [...mandatorySlugs, ...profileSlugs])
    });

    // 3. Select questions for each subject (Randomized)
    const mockQuestions: any[] = [];
    
    // Distribution based on mode
    const counts: Record<string, number> = mode === "diagnostic" 
      ? {
          "history_kz": 5,
          "math_literacy": 5,
          "reading_literacy": 5,
          [profileSlugs[0]]: 5,
          [profileSlugs[1]]: 5
        }
      : {
          "history_kz": 20,
          "math_literacy": 15,
          "reading_literacy": 15,
          [profileSlugs[0]]: 45,
          [profileSlugs[1]]: 45
        };

    const targetTotal = mode === "diagnostic" ? 25 : 140;

    console.log(`=== MOCK START DEBUG (${mode.toUpperCase()}) ===`);
    console.log("Required subjects:", Object.keys(counts));
    console.time("MockStart");

    const questionsPromises = allRelevantSubjects.map(async (subject: any) => {
      const limit = counts[subject.slug] || 0;
      const subQuestions = await db.query.questions.findMany({
        where: eq(questions.subjectId, subject.id),
        orderBy: sql`RANDOM()`,
        limit: limit,
      });
      console.log(`- Subject: ${subject.slug}, Found: ${subQuestions.length}, Needed: ${limit}`);
      return subQuestions;
    });

    const results = await Promise.all(questionsPromises);
    results.forEach(subQs => mockQuestions.push(...subQs));

    console.log("Total questions collected:", mockQuestions.length);
    console.timeEnd("MockStart");

    if (mockQuestions.length < targetTotal) {
      console.error(`NOT ENOUGH QUESTIONS FOR ${mode.toUpperCase()}. Total:`, mockQuestions.length);
      return NextResponse.json({ 
        error: "Insufficient questions in database", 
        details: `Found only ${mockQuestions.length} questions. Need ${targetTotal} for ${mode}. Please contact support or add more questions.`
      }, { status: 400 });
    }

    // 4. Create Session
    const session = await db.insert(testSessions).values({
      userId: user.id,
      testType: mode,
      subjects: allRelevantSubjects,
      totalQuestions: mockQuestions.length,
      startedAt: new Date(),
      completed: false,
    }).returning();

    const sessionId = session[0].id;

    // 5. Create empty answers placeholders
    const answerEntries = mockQuestions.map(q => ({
      sessionId: sessionId,
      questionId: q.id,
      isSkipped: true,
    }));
    
    await db.insert(testAnswers).values(answerEntries);

    const durationMinutes = mode === "diagnostic" ? 45 : 240;

    return NextResponse.json({ 
      sessionId, 
      totalQuestions: mockQuestions.length,
      endTime: new Date(Date.now() + durationMinutes * 60000).toISOString()
    });

  } catch (error) {
    console.error("Mock Start Error:", error);
    return NextResponse.json({ error: "Failed to start mock exam" }, { status: 500 });
  }
}
