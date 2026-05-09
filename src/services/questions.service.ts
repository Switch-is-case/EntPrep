import {
  Question,
  CreateQuestionDTO,
  UpdateQuestionDTO,
  QuestionQueryParams,
  PaginatedQuestions,
} from "@/domain/questions/types";
import { createQuestionSchema } from "@/domain/validation";
import { QuestionsRepository } from "@/repositories/questions.repository";
import { ValidationError } from "@/lib/errors";

export const MAX_BULK_IMPORT_LIMIT = 500;

export class QuestionsService {
  constructor(private readonly questionsRepository: QuestionsRepository) {}
  async getQuestions(params: QuestionQueryParams): Promise<PaginatedQuestions> {
    return this.questionsRepository.findAll(params);
  }

  async getQuestionById(id: number): Promise<Question | null> {
    return this.questionsRepository.findById(id);
  }

  async createQuestion(data: CreateQuestionDTO): Promise<Question> {
    const validatedData = createQuestionSchema.parse(data);
    return this.questionsRepository.create(validatedData as CreateQuestionDTO);
  }

  async updateQuestion(id: number, data: UpdateQuestionDTO): Promise<Question | null> {
    if (Object.keys(data).length > 0) {
      const validatedData = createQuestionSchema.partial().parse(data);
      return this.questionsRepository.update(id, validatedData as UpdateQuestionDTO);
    }
    return this.questionsRepository.update(id, data);
  }

  async deleteQuestion(id: number): Promise<boolean> {
    return this.questionsRepository.delete(id);
  }

  async bulkImport(dataArray: any[]): Promise<{ imported: number; message: string }> {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new ValidationError("Expected a non-empty array of questions");
    }

    if (dataArray.length > MAX_BULK_IMPORT_LIMIT) {
      throw new ValidationError(`Maximum ${MAX_BULK_IMPORT_LIMIT} questions per import`);
    }

    const errors: string[] = [];
    const validRows: CreateQuestionDTO[] = [];

    for (let i = 0; i < dataArray.length; i++) {
      const q = dataArray[i];
      if (!q.subject) errors.push(`Row ${i + 1}: missing "subject"`);
      else if (!q.questionTextRu) errors.push(`Row ${i + 1}: missing "questionTextRu"`);
      else if (!Array.isArray(q.optionsRu) || q.optionsRu.length < 2)
        errors.push(`Row ${i + 1}: "optionsRu" must be an array with at least 2 items`);
      else if (q.correctAnswer === undefined || q.correctAnswer === null)
        errors.push(`Row ${i + 1}: missing "correctAnswer"`);
      else validRows.push(q as CreateQuestionDTO);
    }

    if (errors.length > 0) {
      throw new ValidationError("Validation errors", errors);
    }

    const importedCount = await this.questionsRepository.bulkCreate(validRows);
    
    return {
      imported: importedCount,
      message: `Successfully imported ${importedCount} questions`,
    };
  }
}
