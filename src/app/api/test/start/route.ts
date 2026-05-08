import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { questions, testSessions, users } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { ENT_QUESTION_COUNTS } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { testType } = await request.json(); // 'diagnostic' | 'full' | 'practice'

    // Get user profile subjects
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subjectsList: string[] = [];
    const questionsPerSubject: Record<string, number> = {};

    if (testType === "full" || testType === "diagnostic") {
      // Mandatory subjects
      subjectsList.push("math_literacy", "reading_literacy", "history_kz");
      questionsPerSubject["math_literacy"] =
        testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.math_literacy;
      questionsPerSubject["reading_literacy"] =
        testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.reading_literacy;
      questionsPerSubject["history_kz"] =
        testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.history_kz;

      // Profile subjects
      if (user.profileSubject1) {
        subjectsList.push(user.profileSubject1);
        questionsPerSubject[user.profileSubject1] =
          testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.profile;
      }
      if (user.profileSubject2) {
        subjectsList.push(user.profileSubject2);
        questionsPerSubject[user.profileSubject2] =
          testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.profile;
      }
    }

    // Fetch questions for each subject
    const allQuestions: Array<{
      id: number;
      subject: string;
      questionTextRu: string;
      questionTextKz: string;
      questionTextEn: string;
      optionsRu: unknown;
      optionsKz: unknown;
      optionsEn: unknown;
      correctAnswer: number;
      difficulty: string;
      topic: string | null;
    }> = [];

    for (const subject of subjectsList) {
      const count = questionsPerSubject[subject] || 5;
      const subjectQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.subject, subject))
        .orderBy(sql`RANDOM()`)
        .limit(count);

      allQuestions.push(...subjectQuestions);
    }

    const totalQuestions = allQuestions.length;

    // Create test session
    const [session] = await db
      .insert(testSessions)
      .values({
        userId,
        testType,
        subjects: subjectsList,
        totalQuestions,
      })
      .returning();

    return NextResponse.json({
      sessionId: session.id,
      questions: allQuestions.map((q) => ({
        id: q.id,
        subject: q.subject,
        questionTextRu: q.questionTextRu,
        questionTextKz: q.questionTextKz,
        questionTextEn: q.questionTextEn,
        optionsRu: q.optionsRu,
        optionsKz: q.optionsKz,
        optionsEn: q.optionsEn,
        topic: q.topic,
      })),
      totalQuestions,
    });
  } catch (error) {
    console.error("Test start error:", error);
    return NextResponse.json(
      { error: "Failed to start test" },
      { status: 500 }
    );
  }
}
