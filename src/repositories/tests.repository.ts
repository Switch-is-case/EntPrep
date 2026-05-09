import { db } from "@/db";
import { testSessions, testAnswers, questions, progress } from "@/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { Question } from "@/domain/questions/types";
import { TestSession, TestAnswer, SessionHistoryDTO } from "@/domain/tests/types";

export class TestsRepository {
  async createSession(
    userId: string,
    testType: string,
    subjects: string[],
    totalQuestions: number
  ): Promise<TestSession> {
    const [session] = await db
      .insert(testSessions)
      .values({
        userId,
        testType,
        subjects,
        totalQuestions,
      })
      .returning();

    return session as TestSession;
  }

  async getSessionById(sessionId: string, userId: string): Promise<TestSession | null> {
    const [session] = await db
      .select()
      .from(testSessions)
      .where(and(eq(testSessions.id, sessionId), eq(testSessions.userId, userId)))
      .limit(1);

    return (session as TestSession) || null;
  }

  async getQuestionsBySubject(subject: string, count: number): Promise<Question[]> {
    const subjectQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.subject, subject))
      .orderBy(sql`RANDOM()`)
      .limit(count);

    return subjectQuestions as Question[];
  }

  async getQuestionById(questionId: number): Promise<Question | null> {
    const [q] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);
    return (q as Question) || null;
  }

  async saveTestResults(
    userId: string,
    sessionId: string,
    answersToInsert: any[],
    sessionUpdates: any,
    subjectResults: Record<string, { correct: number; total: number; skipped: number; wrong: number }>
  ): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Save answers
      if (answersToInsert.length > 0) {
        await tx.insert(testAnswers).values(answersToInsert);
      }

      // 2. Update session
      await tx
        .update(testSessions)
        .set(sessionUpdates)
        .where(eq(testSessions.id, sessionId));

      // 3. Update progress for each subject
      for (const [subject, result] of Object.entries(subjectResults)) {
        const [existing] = await tx
          .select()
          .from(progress)
          .where(and(eq(progress.userId, userId), eq(progress.subject, subject)))
          .limit(1);

        const subjectScore = Math.round((result.correct / Math.max(result.total, 1)) * 100);

        if (existing) {
          await tx
            .update(progress)
            .set({
              totalAttempted: existing.totalAttempted + result.total,
              totalCorrect: existing.totalCorrect + result.correct,
              totalSkipped: existing.totalSkipped + result.skipped,
              lastScore: subjectScore,
              bestScore: Math.max(existing.bestScore, subjectScore),
              updatedAt: new Date(),
            })
            .where(eq(progress.id, existing.id));
        } else {
          await tx.insert(progress).values({
            userId,
            subject,
            totalAttempted: result.total,
            totalCorrect: result.correct,
            totalSkipped: result.skipped,
            lastScore: subjectScore,
            bestScore: subjectScore,
          });
        }
      }
    });
  }

  async findHistoryByUserId(userId: string): Promise<SessionHistoryDTO[]> {
    const sessions = await db
      .select({
        id: testSessions.id,
        testType: testSessions.testType,
        totalQuestions: testSessions.totalQuestions,
        correctAnswers: testSessions.correctAnswers,
        wrongAnswers: testSessions.wrongAnswers,
        skippedAnswers: testSessions.skippedAnswers,
        score: testSessions.score,
        startedAt: testSessions.startedAt,
      })
      .from(testSessions)
      .where(eq(testSessions.userId, userId))
      .orderBy(desc(testSessions.startedAt));

    return sessions;
  }

  async getSessionWithDetails(sessionId: string, userId: string) {
    const session = await this.getSessionById(sessionId, userId);
    if (!session) return null;

    const answers = await db
      .select()
      .from(testAnswers)
      .where(eq(testAnswers.sessionId, sessionId));

    if (answers.length === 0) {
      return { session, questions: [] };
    }

    const questionIds = answers.map((a) => a.questionId);
    const qs = await db
      .select()
      .from(questions)
      .where(inArray(questions.id, questionIds));

    const questionsWithAnswers = answers.map((ans) => {
      const q = qs.find((qItem) => qItem.id === ans.questionId);
      return {
        ...q,
        userAnswer: ans.selectedAnswer,
        isCorrect: ans.isCorrect,
        isSkipped: ans.isSkipped,
      };
    });

    return { session, questions: questionsWithAnswers };
  }
}

