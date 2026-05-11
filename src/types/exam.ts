export interface Question {
  id: number;
  subjectId: number | null;
  topicId: number | null;
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
  
  // Runtime properties for sessions/history
  answerId?: number;
  selectedAnswer?: number | null;
  userAnswer?: number | null;
  isCorrect?: boolean | null;
  isSkipped?: boolean;
}

export interface TestSession {
  id: string;
  testType: "diagnostic" | "practice" | "mock";
  subjects: any;
  score: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string | null;
}
