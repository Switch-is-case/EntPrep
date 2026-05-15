import { db } from "@/db";
import { questions } from "@/db/schema";
import { eq, desc, ilike, or, sql, inArray } from "drizzle-orm";
import {
  Question,
  CreateQuestionDTO,
  UpdateQuestionDTO,
  QuestionQueryParams,
  PaginatedQuestions,
} from "@/domain/questions/types";

export class QuestionsRepository {
  async findAll(params: QuestionQueryParams): Promise<PaginatedQuestions> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const { subject, search } = params;

    let query = db.select().from(questions);
    const conditions = [];

    if (subject) {
      conditions.push(eq(questions.subject, subject));
    }

    if (search) {
      conditions.push(
        or(
          ilike(questions.questionTextRu, `%${search}%`),
          ilike(questions.questionTextKz, `%${search}%`),
          ilike(questions.questionTextEn, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      if (conditions.length === 1) {
        query = query.where(conditions[0]) as typeof query;
      } else {
        query = query.where(sql`${conditions[0]} AND ${conditions[1]}`) as typeof query;
      }
    }

    const items = await query
      .orderBy(desc(questions.id))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions);

    return {
      questions: items as Question[],
      total: Number(totalCount.count),
      page,
      limit,
      totalPages: Math.ceil(Number(totalCount.count) / limit),
    };
  }

  async findById(id: number): Promise<Question | null> {
    const [q] = await db.select().from(questions).where(eq(questions.id, id));
    return (q as Question) || null;
  }

  async create(data: CreateQuestionDTO): Promise<Question> {
    const [newQuestion] = await db
      .insert(questions)
      .values({
        subject: data.subject,
        questionTextRu: data.questionTextRu,
        questionTextKz: data.questionTextKz || data.questionTextRu,
        questionTextEn: data.questionTextEn || data.questionTextRu,
        optionsRu: data.optionsRu,
        optionsKz: data.optionsKz || data.optionsRu,
        optionsEn: data.optionsEn || data.optionsRu,
        correctAnswer: data.correctAnswer,
        difficulty: data.difficulty || "medium",
        topic: data.topic || null,
        imageUrl: data.imageUrl || null,
        optionImages: data.optionImages || null,
      })
      .returning();
    
    return newQuestion as Question;
  }

  async update(id: number, data: UpdateQuestionDTO): Promise<Question | null> {
    const [updated] = await db
      .update(questions)
      .set({
        ...data,
      })
      .where(eq(questions.id, id))
      .returning();

    return (updated as Question) || null;
  }

  async delete(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(questions)
      .where(eq(questions.id, id))
      .returning({ id: questions.id });
      
    return !!deleted;
  }

  async bulkDelete(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const deleted = await db
      .delete(questions)
      .where(inArray(questions.id, ids))
      .returning({ id: questions.id });
    return deleted.length;
  }

  async bulkCreate(dataArray: CreateQuestionDTO[]): Promise<number> {
    const inserted = await db
      .insert(questions)
      .values(
        dataArray.map((q) => ({
          subject: q.subject,
          questionTextRu: q.questionTextRu,
          questionTextKz: q.questionTextKz || q.questionTextRu,
          questionTextEn: q.questionTextEn || q.questionTextRu,
          optionsRu: q.optionsRu,
          optionsKz: q.optionsKz || q.optionsRu,
          optionsEn: q.optionsEn || q.optionsRu,
          correctAnswer: Number(q.correctAnswer),
          difficulty: q.difficulty || "medium",
          topic: q.topic || null,
          imageUrl: q.imageUrl || null,
          optionImages: q.optionImages || null,
        }))
      )
      .returning({ id: questions.id });
      
    return inserted.length;
  }
}

