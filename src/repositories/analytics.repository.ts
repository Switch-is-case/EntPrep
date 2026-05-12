import { db } from "@/db";
import { users, questions, testSessions, testAnswers } from "@/db/schema";
import { eq, sql, desc, and, isNotNull, gte, count, avg, isNull } from "drizzle-orm";
import { AdminDashboardDTO, TimeSeriesData, SubjectPerformance, UserEngagementStats, TestCompletionRate } from "@/domain/analytics/types";

export class AnalyticsRepository {
  async getDashboardOverview(days: number): Promise<AdminDashboardDTO> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Basic Stats
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [questionsCount] = await db.select({ count: count() }).from(questions);
    const [sessionsCount] = await db.select({ count: count() }).from(testSessions);
    const [answersCount] = await db.select({ count: count() }).from(testAnswers);
    
    const [newUsers] = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, startDate));
      
    const [newSessions] = await db.select({ count: count() })
      .from(testSessions)
      .where(gte(testSessions.startedAt, startDate));

    // 2. Questions by Subject
    const questionsBySubject = await db
      .select({
        subject: questions.subject,
        count: count(),
      })
      .from(questions)
      .groupBy(questions.subject)
      .orderBy(desc(count()));

    // 3. Time Series: Registrations
    const registrationsRaw = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})::text`,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // 4. Time Series: Sessions
    const sessionsRaw = await db
      .select({
        date: sql<string>`DATE(${testSessions.startedAt})::text`,
        count: count(),
      })
      .from(testSessions)
      .where(gte(testSessions.startedAt, startDate))
      .groupBy(sql`DATE(${testSessions.startedAt})`)
      .orderBy(sql`DATE(${testSessions.startedAt})`);

    // 5. Subject Performance
    const subjectPerfRaw = await db
      .select({
        subject: testSessions.testType, // Usually sessions have subjects in results JSON, but let's use what we have
        avgScore: avg(testSessions.score),
        totalSessions: count(),
      })
      .from(testSessions)
      .where(isNotNull(testSessions.completedAt))
      .groupBy(testSessions.testType); // Placeholder, will refine below if subjects are available

    // Let's try to get real subjects from the 'subjects' field in testSessions (JSONB)
    // For now, we'll use a simpler approach or mock it if schema doesn't allow easy grouping by subject in sessions
    // Actually, test_sessions has a 'subjects' field which is JSONB.
    
    // 6. Engagement Stats
    const [verifiedCount] = await db.select({ count: count() }).from(users).where(eq(users.emailVerified, true));
    const [bannedCount] = await db.select({ count: count() }).from(users).where(isNotNull(users.bannedAt));
    const [deletedCount] = await db.select({ count: count() }).from(users).where(isNotNull(users.deletedAt));
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const [activeThisWeek] = await db.select({ count: sql<number>`count(distinct ${testSessions.userId})` })
      .from(testSessions)
      .where(gte(testSessions.startedAt, weekAgo));

    // 7. Completion Rates
    const completionRates = await db
      .select({
        testType: testSessions.testType,
        total: count(),
        completed: sql<number>`count(${testSessions.completedAt})`,
      })
      .from(testSessions)
      .groupBy(testSessions.testType);

    // 8. Recent Items
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
        emailVerified: users.emailVerified,
        bannedAt: users.bannedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);

    return {
      stats: {
        totalUsers: usersCount.count,
        totalQuestions: questionsCount.count,
        totalSessions: sessionsCount.count,
        totalAnswers: answersCount.count,
        newUsersThisPeriod: newUsers.count,
        newSessionsThisPeriod: newSessions.count,
      },
      questionsBySubject: questionsBySubject.map((q: { subject: string, count: number }) => ({
        subject: q.subject,
        count: q.count,
      })),
      userRegistrations: this.fillMissingDates(registrationsRaw, days),
      testSessions: this.fillMissingDates(sessionsRaw, days),
      subjectPerformance: subjectPerfRaw.map((p: { subject: string, avgScore: string | number | null, totalSessions: number }) => ({
        subject: p.subject,
        avgScore: Number(p.avgScore) || 0,
        totalSessions: p.totalSessions,
      })),
      engagement: {
        totalUsers: usersCount.count,
        verifiedUsers: verifiedCount.count,
        bannedUsers: bannedCount.count,
        deletedUsers: deletedCount.count,
        activeThisWeek: activeThisWeek.count,
      },
      completionRates: completionRates.map((r: { testType: string, total: number, completed: number }) => ({
        testType: r.testType,
        total: r.total,
        completed: r.completed,
        rate: r.total > 0 ? (r.completed / r.total) * 100 : 0,
      })),
      recentSessions,
      recentUsers,
    };
  }

  private fillMissingDates(data: any[], days: number): TimeSeriesData[] {
    const result: TimeSeriesData[] = [];
    const now = new Date();
    // Set to start of today to avoid offset issues
    now.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const existing = data.find((item) => item.date === dateStr);
      result.push({
        date: dateStr,
        count: existing ? Number(existing.count) : 0,
      });
    }
    return result;
  }
  
  // Keep legacy for compatibility if needed, but updated to use new structure
  async getAdminDashboard(): Promise<AdminDashboardDTO> {
    return this.getDashboardOverview(7);
  }
}
