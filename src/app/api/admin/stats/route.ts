import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, questions, testSessions, testAnswers } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get counts
    const [usersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [questionsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions);

    const [sessionsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(testSessions);

    const [answersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(testAnswers);

    // Questions by subject
    const questionsBySubject = await db
      .select({
        subject: questions.subject,
        count: sql<number>`count(*)`,
      })
      .from(questions)
      .groupBy(questions.subject)
      .orderBy(desc(sql`count(*)`));

    // Recent sessions
    const recentSessions = await db
      .select({
        id: testSessions.id,
        userId: testSessions.userId,
        testType: testSessions.testType,
        score: testSessions.score,
        completed: testSessions.completed,
        startedAt: testSessions.startedAt,
      })
      .from(testSessions)
      .orderBy(desc(testSessions.startedAt))
      .limit(10);

    // Recent users
    const recentUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        isAdmin: users.isAdmin,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);

    return NextResponse.json({
      stats: {
        totalUsers: Number(usersCount.count),
        totalQuestions: Number(questionsCount.count),
        totalSessions: Number(sessionsCount.count),
        totalAnswers: Number(answersCount.count),
      },
      questionsBySubject: questionsBySubject.map((q) => ({
        subject: q.subject,
        count: Number(q.count),
      })),
      recentSessions,
      recentUsers,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
