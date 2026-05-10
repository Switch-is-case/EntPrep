import { db } from "@/db";
import { progress, testSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { SubjectProgress, RecentSession } from "@/domain/analytics/types";

export class ProgressRepository {
  async findByUserId(userId: string): Promise<SubjectProgress[]> {
    const results = await db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId));

    return results as SubjectProgress[];
  }

  async findRecentSessionsByUserId(userId: string, limit = 10): Promise<RecentSession[]> {
    const sessions = await db
      .select()
      .from(testSessions)
      .where(eq(testSessions.userId, userId))
      .orderBy(desc(testSessions.startedAt))
      .limit(limit);

    return sessions.map((s: any) => ({
      id: s.id,
      testType: s.testType,
      subjects: s.subjects,
      totalQuestions: s.totalQuestions,
      correctAnswers: s.correctAnswers,
      skippedAnswers: s.skippedAnswers,
      wrongAnswers: s.wrongAnswers,
      score: s.score,
      completed: s.completed,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
    }));
  }
}

