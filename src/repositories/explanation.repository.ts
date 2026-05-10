import { db } from "@/db";
import { explanations } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export interface ExplanationCacheKey {
  questionId: number;
  userAnswer: number | null;
  lang: string;
}

export interface ExplanationRecord {
  explanationText: string;
}

export class ExplanationRepository {
  async findCached(key: ExplanationCacheKey): Promise<ExplanationRecord | null> {
    const condition =
      key.userAnswer === null
        ? isNull(explanations.userAnswer)
        : eq(explanations.userAnswer, key.userAnswer);

    const [cached] = await db
      .select()
      .from(explanations)
      .where(
        and(
          eq(explanations.questionId, key.questionId),
          eq(explanations.lang, key.lang),
          condition
        )
      )
      .limit(1);

    return cached ? { explanationText: cached.explanationText } : null;
  }

  async save(key: ExplanationCacheKey, explanationText: string): Promise<void> {
    await db.insert(explanations).values({
      questionId: key.questionId,
      userAnswer: key.userAnswer,
      lang: key.lang,
      explanationText,
    });
  }
}
