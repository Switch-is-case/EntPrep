import { NextResponse } from "next/server";
import { db } from "@/db";
import { testSessions, testAnswers, questions, subjects, subjectCombinations, users } from "@/db/schema";
import { eq, sql, and, inArray } from "drizzle-orm";
import { getServerSession } from "@/lib/auth"; // Assuming auth exists

export async function POST(req: Request) {
  try {
    const { userId } = await req.json(); // Simple for now, ideally from auth session
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

    for (const subject of allRelevantSubjects) {
      const limit = counts[subject.slug] || 0;
      const subQuestions = await db.query.questions.findMany({
        where: eq(questions.subjectId, subject.id),
        orderBy: sql`RANDOM()`,
        limit: limit,
      });
      mockQuestions.push(...subQuestions);
    }

    if (mockQuestions.length < 140) {
      // For development, if we don't have enough real questions, we might reuse some or warn
      console.warn(`Only ${mockQuestions.length} questions found for mock exam. Need 140.`);
    }

    // 4. Create Session
    const session = await db.insert(testSessions).values({
      userId: user.id,
      testType: "mock",
      subjects: JSON.stringify(allRelevantSubjects),
      totalQuestions: mockQuestions.length,
      startedAt: new Date(),
      // 240 minutes = 4 hours
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
