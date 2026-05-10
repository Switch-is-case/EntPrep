import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, testSessions } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const testType = searchParams.get("testType") || "";

  try {
    let query = db
      .select({
        id: testSessions.id,
        userId: testSessions.userId,
        testType: testSessions.testType,
        subjects: testSessions.subjects,
        totalQuestions: testSessions.totalQuestions,
        correctAnswers: testSessions.correctAnswers,
        skippedAnswers: testSessions.skippedAnswers,
        wrongAnswers: testSessions.wrongAnswers,
        score: testSessions.score,
        completed: testSessions.completed,
        startedAt: testSessions.startedAt,
        completedAt: testSessions.completedAt,
      })
      .from(testSessions);

    if (testType) {
      query = query.where(eq(testSessions.testType, testType)) as typeof query;
    }

    const sessions = await query
      .orderBy(desc(testSessions.startedAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(testSessions);

    // Get user info for sessions
    const userIds = [...new Set(sessions.map((s: any) => s.userId))];
    const usersData =
      userIds.length > 0
        ? await db
            .select({ id: users.id, name: users.name, email: users.email })
            .from(users)
            .where(sql`${users.id} = ANY(${userIds})`)
        : [];

    const usersMap = new Map(usersData.map((u: any) => [u.id, u]));

    const sessionsWithUsers = sessions.map((s: any) => ({
      ...s,
      user: usersMap.get(s.userId) || null,
    }));

    return NextResponse.json({
      sessions: sessionsWithUsers,
      total: Number(totalCount.count),
      page,
      limit,
      totalPages: Math.ceil(Number(totalCount.count) / limit),
    });
  } catch (error) {
    console.error("Admin sessions error:", error);
    return NextResponse.json(
      { error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}
