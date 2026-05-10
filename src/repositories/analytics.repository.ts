import { db } from "@/db";
import { users, questions, testSessions, testAnswers } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { AdminDashboardDTO } from "@/domain/analytics/types";

export class AnalyticsRepository {
  async getAdminDashboard(): Promise<AdminDashboardDTO> {
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

    const questionsBySubject = await db
      .select({
        subject: questions.subject,
        count: sql<number>`count(*)`,
      })
      .from(questions)
      .groupBy(questions.subject)
      .orderBy(desc(sql`count(*)`));

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

    return {
      stats: {
        totalUsers: Number(usersCount.count),
        totalQuestions: Number(questionsCount.count),
        totalSessions: Number(sessionsCount.count),
        totalAnswers: Number(answersCount.count),
      },
      questionsBySubject: questionsBySubject.map((q: any) => ({
        subject: q.subject,
        count: Number(q.count),
      })),
      recentSessions,
      recentUsers,
    };
  }
}

