import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { questions, testSessions, testAnswers, progress } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

interface AnswerInput {
  questionId: number;
  selectedAnswer: number | null; // null = "I don't know"
  timeSpent?: number;
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, answers } = (await request.json()) as {
      sessionId: string;
      answers: AnswerInput[];
    };

    // Verify session belongs to user
    const [session] = await db
      .select()
      .from(testSessions)
      .where(
        and(eq(testSessions.id, sessionId), eq(testSessions.userId, userId))
      )
      .limit(1);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    let totalCorrect = 0;
    let totalSkipped = 0;
    let totalWrong = 0;
    const subjectResults: Record<
      string,
      { correct: number; total: number; skipped: number; wrong: number }
    > = {};

    // Process each answer
    for (const answer of answers) {
      const [question] = await db
        .select()
        .from(questions)
        .where(eq(questions.id, answer.questionId))
        .limit(1);

      if (!question) continue;

      const isSkipped = answer.selectedAnswer === null;
      const isCorrect = !isSkipped && answer.selectedAnswer === question.correctAnswer;

      if (!subjectResults[question.subject]) {
        subjectResults[question.subject] = {
          correct: 0,
          total: 0,
          skipped: 0,
          wrong: 0,
        };
      }

      subjectResults[question.subject].total++;

      if (isSkipped) {
        totalSkipped++;
        subjectResults[question.subject].skipped++;
      } else if (isCorrect) {
        totalCorrect++;
        subjectResults[question.subject].correct++;
      } else {
        totalWrong++;
        subjectResults[question.subject].wrong++;
      }

      // Save individual answer
      await db.insert(testAnswers).values({
        sessionId,
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: isCorrect,
        isSkipped,
        timeSpent: answer.timeSpent || 0,
      });
    }

    const score = Math.round(
      (totalCorrect / Math.max(answers.length, 1)) * 100
    );

    // Generate AI recommendations based on results
    const recommendations = generateRecommendations(subjectResults);

    // Update session
    await db
      .update(testSessions)
      .set({
        correctAnswers: totalCorrect,
        skippedAnswers: totalSkipped,
        wrongAnswers: totalWrong,
        score,
        completed: true,
        results: subjectResults,
        aiRecommendations: recommendations,
        completedAt: new Date(),
      })
      .where(eq(testSessions.id, sessionId));

    // Update progress for each subject
    for (const [subject, result] of Object.entries(subjectResults)) {
      const [existing] = await db
        .select()
        .from(progress)
        .where(
          and(eq(progress.userId, userId), eq(progress.subject, subject))
        )
        .limit(1);

      const subjectScore = Math.round(
        (result.correct / Math.max(result.total, 1)) * 100
      );

      if (existing) {
        await db
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
        await db.insert(progress).values({
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

    return NextResponse.json({
      score,
      totalCorrect,
      totalWrong,
      totalSkipped,
      totalQuestions: answers.length,
      subjectResults,
      recommendations,
    });
  } catch (error) {
    console.error("Test submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 }
    );
  }
}

function generateRecommendations(
  subjectResults: Record<
    string,
    { correct: number; total: number; skipped: number; wrong: number }
  >
): string {
  const lines: string[] = [];
  lines.push("📊 Анализ результатов / Results Analysis:\n");

  for (const [subject, result] of Object.entries(subjectResults)) {
    const pct = Math.round(
      (result.correct / Math.max(result.total, 1)) * 100
    );

    if (pct >= 80) {
      lines.push(
        `✅ ${subject}: ${pct}% — Отличный уровень! Продолжайте закреплять знания.`
      );
    } else if (pct >= 60) {
      lines.push(
        `⚠️ ${subject}: ${pct}% — Хороший уровень, но есть пробелы. Рекомендуется дополнительная практика.`
      );
    } else if (pct >= 40) {
      lines.push(
        `🔶 ${subject}: ${pct}% — Средний уровень. Необходимо систематически изучать материал.`
      );
    } else {
      lines.push(
        `🔴 ${subject}: ${pct}% — Требуется серьезная подготовка. Начните с базовых тем.`
      );
    }

    if (result.skipped > 0) {
      lines.push(
        `   ℹ️ Пропущено ${result.skipped} вопросов — обратите внимание на эти темы.`
      );
    }
  }

  lines.push("\n📝 Рекомендации / Recommendations:");
  lines.push(
    "1. Сосредоточьтесь на предметах с низкими результатами."
  );
  lines.push(
    "2. Практикуйтесь ежедневно по 30-60 минут."
  );
  lines.push(
    "3. Используйте режим практики для отработки слабых тем."
  );
  lines.push(
    "4. Повторите пропущенные вопросы — они указывают на пробелы в знаниях."
  );

  return lines.join("\n");
}
