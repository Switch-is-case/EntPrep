export interface Question {
  id: number;
  subject: string;
  questionTextRu: string;
  questionTextKz: string;
  questionTextEn: string;
  optionsRu: string[];
  optionsKz: string[];
  optionsEn: string[];
  correctAnswer: number;
  difficulty: string;
  topic: string | null;
  imageUrl: string | null;
  optionImages: (string | null)[] | null;
}

export interface CreateQuestionDTO {
  subject: string;
  questionTextRu: string;
  questionTextKz?: string;
  questionTextEn?: string;
  optionsRu: string[];
  optionsKz?: string[];
  optionsEn?: string[];
  correctAnswer: number;
  difficulty?: string;
  topic?: string | null;
  imageUrl?: string | null;
  optionImages?: (string | null)[] | null;
}

export interface UpdateQuestionDTO extends Partial<CreateQuestionDTO> {}

export interface QuestionQueryParams {
  page?: number;
  limit?: number;
  subject?: string;
  search?: string;
}

export interface PaginatedQuestions {
  questions: Question[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
