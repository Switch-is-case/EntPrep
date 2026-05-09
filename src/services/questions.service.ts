import {
  Question,
  CreateQuestionDTO,
  UpdateQuestionDTO,
  QuestionQueryParams,
  PaginatedQuestions,
} from "@/domain/questions/types";
import { questionsRepository } from "@/repositories/questions.repository";

export class QuestionsService {
  async getQuestions(params: QuestionQueryParams): Promise<PaginatedQuestions> {
    return questionsRepository.findAll(params);
  }

  async getQuestionById(id: number): Promise<Question | null> {
    return questionsRepository.findById(id);
  }

  async createQuestion(data: CreateQuestionDTO): Promise<Question> {
    this.validateQuestionData(data);
    return questionsRepository.create(data);
  }

  async updateQuestion(id: number, data: UpdateQuestionDTO): Promise<Question | null> {
    if (Object.keys(data).length > 0) {
      // Basic validation if keys are present
      if (data.optionsRu && data.optionsRu.length < 2) {
        throw new Error("optionsRu must have at least 2 items");
      }
    }
    return questionsRepository.update(id, data);
  }

  async deleteQuestion(id: number): Promise<boolean> {
    return questionsRepository.delete(id);
  }

  async bulkImport(dataArray: any[]): Promise<{ imported: number; message: string }> {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error("Expected a non-empty array of questions");
    }

    if (dataArray.length > 500) {
      throw new Error("Maximum 500 questions per import");
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
      const error: any = new Error("Validation errors");
      error.details = errors;
      throw error;
    }

    const importedCount = await questionsRepository.bulkCreate(validRows);
    
    return {
      imported: importedCount,
      message: `Successfully imported ${importedCount} questions`,
    };
  }

  private validateQuestionData(data: CreateQuestionDTO) {
    if (!data.subject || !data.questionTextRu || !data.optionsRu || data.correctAnswer === undefined) {
      throw new Error("Missing required fields");
    }
    if (data.optionsRu.length < 2) {
      throw new Error("optionsRu must have at least 2 items");
    }
  }
}

export const questionsService = new QuestionsService();
