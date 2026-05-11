import { Question } from "@/domain/questions/types";

export interface TestSession {
  id: string;
  userId: string;
  testType: string;
  subjects: unknown;
  totalQuestions: number;
  correctAnswers: number;
  skippedAnswers: number;
  wrongAnswers: number;
  score: number;
  completed: boolean;
  results: Record<string, { correct: number; total: number; skipped: number; wrong: number }> | null;
  aiRecommendations: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

export interface TestAnswer {
  id: number;
  sessionId: string;
  questionId: number;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  isSkipped: boolean;
  timeSpent: number | null;
}

export interface AnswerInput {
  questionId: number;
  selectedAnswer: number | null; // null = "I don't know"
  timeSpent?: number;
}

export interface StartTestResponse {
  sessionId: string;
  questions: Omit<Question, "correctAnswer" | "imageUrl" | "optionImages" | "difficulty">[];
  totalQuestions: number;
}

export interface SubmitTestResponse {
  score: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  totalQuestions: number;
  subjectResults: Record<string, { correct: number; total: number; skipped: number; wrong: number }>;
  recommendations: string;
}

export interface SessionHistoryDTO {
  id: string;
  testType: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  score: number;
  startedAt: Date;
  subjects: { id: number; slug?: string; nameRu?: string; nameKz?: string; nameEn?: string; type?: string }[];
}
