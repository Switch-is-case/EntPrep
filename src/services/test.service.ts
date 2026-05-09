import { AnswerInput, StartTestResponse, SubmitTestResponse, SessionHistoryDTO } from "@/domain/tests/types";
import { TestsRepository } from "@/repositories/tests.repository";
import { UsersRepository } from "@/repositories/users.repository";
import { ENT_QUESTION_COUNTS } from "@/lib/i18n";
import { Question } from "@/domain/questions/types";
import { NotFoundError } from "@/lib/errors";

export class TestService {
  constructor(
    private readonly testsRepository: TestsRepository,
    private readonly usersRepository: UsersRepository
  ) {}
  async startTest(userId: string, testType: string): Promise<StartTestResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const subjectsList: string[] = [];
    const questionsPerSubject: Record<string, number> = {};

    if (testType === "full" || testType === "diagnostic") {
      subjectsList.push("math_literacy", "reading_literacy", "history_kz");
      questionsPerSubject["math_literacy"] = testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.math_literacy;
      questionsPerSubject["reading_literacy"] = testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.reading_literacy;
      questionsPerSubject["history_kz"] = testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.history_kz;

      if (user.profileSubject1) {
        subjectsList.push(user.profileSubject1);
        questionsPerSubject[user.profileSubject1] = testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.profile;
      }
      if (user.profileSubject2) {
        subjectsList.push(user.profileSubject2);
        questionsPerSubject[user.profileSubject2] = testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.profile;
      }
    }

    const allQuestions: Question[] = [];
    for (const subject of subjectsList) {
      const count = questionsPerSubject[subject] || 5;
      const subjectQuestions = await this.testsRepository.getQuestionsBySubject(subject, count);
      allQuestions.push(...subjectQuestions);
    }

    const totalQuestions = allQuestions.length;

    const session = await this.testsRepository.createSession(userId, testType, subjectsList, totalQuestions);

    return {
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
    };
  }

  async submitTest(userId: string, sessionId: string, answers: AnswerInput[]): Promise<SubmitTestResponse> {
    const session = await this.testsRepository.getSessionById(sessionId, userId);
    if (!session) throw new NotFoundError("Session not found");

    let totalCorrect = 0;
    let totalSkipped = 0;
    let totalWrong = 0;
    const subjectResults: Record<string, { correct: number; total: number; skipped: number; wrong: number }> = {};
    const answersToInsert = [];

    for (const answer of answers) {
      const question = await this.testsRepository.getQuestionById(answer.questionId);
      if (!question) continue;

      const isSkipped = answer.selectedAnswer === null;
      const isCorrect = !isSkipped && answer.selectedAnswer === question.correctAnswer;

      if (!subjectResults[question.subject]) {
        subjectResults[question.subject] = { correct: 0, total: 0, skipped: 0, wrong: 0 };
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

      answersToInsert.push({
        sessionId,
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        isSkipped,
        timeSpent: answer.timeSpent || 0,
      });
    }

    const score = Math.round((totalCorrect / Math.max(answers.length, 1)) * 100);
    const recommendations = this.generateRecommendations(subjectResults);

    const sessionUpdates = {
      correctAnswers: totalCorrect,
      skippedAnswers: totalSkipped,
      wrongAnswers: totalWrong,
      score,
      completed: true,
      results: subjectResults,
      aiRecommendations: recommendations,
      completedAt: new Date(),
    };

    await this.testsRepository.saveTestResults(userId, sessionId, answersToInsert, sessionUpdates, subjectResults);

    return {
      score,
      totalCorrect,
      totalWrong,
      totalSkipped,
      totalQuestions: answers.length,
      subjectResults,
      recommendations,
    };
  }

  async startPractice(subject: string, count: number) {
    const questions = await this.testsRepository.getQuestionsBySubject(subject, count);
    return {
      questions: questions.map((q) => ({
        id: q.id,
        subject: q.subject,
        questionTextRu: q.questionTextRu,
        questionTextKz: q.questionTextKz,
        questionTextEn: q.questionTextEn,
        optionsRu: q.optionsRu,
        optionsKz: q.optionsKz,
        optionsEn: q.optionsEn,
        correctAnswer: q.correctAnswer,
        topic: q.topic,
      })),
      totalQuestions: questions.length,
    };
  }

  async getUserHistory(userId: string): Promise<SessionHistoryDTO[]> {
    return this.testsRepository.findHistoryByUserId(userId);
  }

  async getSessionDetails(userId: string, sessionId: string) {
    return this.testsRepository.getSessionWithDetails(sessionId, userId);
  }

  private generateRecommendations(
    subjectResults: Record<string, { correct: number; total: number; skipped: number; wrong: number }>
  ): string {
    const lines: string[] = [];
    lines.push("📊 Анализ результатов / Results Analysis:\n");

    for (const [subject, result] of Object.entries(subjectResults)) {
      const pct = Math.round((result.correct / Math.max(result.total, 1)) * 100);

      if (pct >= 80) {
        lines.push(`✅ ${subject}: ${pct}% — Отличный уровень! Продолжайте закреплять знания.`);
      } else if (pct >= 60) {
        lines.push(`⚠️ ${subject}: ${pct}% — Хороший уровень, но есть пробелы. Рекомендуется дополнительная практика.`);
      } else if (pct >= 40) {
        lines.push(`🔶 ${subject}: ${pct}% — Средний уровень. Необходимо систематически изучать материал.`);
      } else {
        lines.push(`🔴 ${subject}: ${pct}% — Требуется серьезная подготовка. Начните с базовых тем.`);
      }

      if (result.skipped > 0) {
        lines.push(`   ℹ️ Пропущено ${result.skipped} вопросов — обратите внимание на эти темы.`);
      }
    }

    lines.push("\n📝 Рекомендации / Recommendations:");
    lines.push("1. Сосредоточьтесь на предметах с низкими результатами.");
    lines.push("2. Практикуйтесь ежедневно по 30-60 минут.");
    lines.push("3. Используйте режим практики для отработки слабых тем.");
    lines.push("4. Повторите пропущенные вопросы — они указывают на пробелы в знаниях.");

    return lines.join("\n");
  }
}

