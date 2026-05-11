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
    const counts: Record<string, number> = {
      "history_kz": 20,
      "math_literacy": 15,
      "reading_literacy": 15,
      [profileSlugs[0]]: 45,
      [profileSlugs[1]]: 45
    };

    console.log("=== MOCK START DEBUG ===");
    console.log("Required subjects:", Object.keys(counts));

    for (const subject of allRelevantSubjects) {
      const limit = counts[subject.slug] || 0;
      const subQuestions = await db.query.questions.findMany({
        where: eq(questions.subjectId, subject.id),
        orderBy: sql`RANDOM()`,
        limit: limit,
      });
      console.log(`- Subject: ${subject.slug}, Found: ${subQuestions.length}, Needed: ${limit}`);
      mockQuestions.push(...subQuestions);
    }

    console.log("Total questions collected:", mockQuestions.length);

    if (mockQuestions.length < 140) {
      console.error("NOT ENOUGH QUESTIONS. Total:", mockQuestions.length);
      return NextResponse.json({ 
        error: "Insufficient questions in database", 
        details: `Found only ${mockQuestions.length} questions. Need 140 for a full mock exam. Please contact support or add more questions.`
      }, { status: 400 });
    }

    // 4. Create Session
    const session = await db.insert(testSessions).values({
      userId: user.id,
      testType: "mock",
      subjects: allRelevantSubjects, // Drizzle handles jsonb mapping
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

    return NextResponse.json({ 
      sessionId, 
      totalQuestions: mockQuestions.length,
      endTime: new Date(Date.now() + 240 * 60000).toISOString()
    });

  } catch (error) {
    console.error("Mock Start Error:", error);
    return NextResponse.json({ error: "Failed to start mock exam" }, { status: 500 });
  }
}
