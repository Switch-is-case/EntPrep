export interface SubjectProgress {
  id: number;
  userId: string;
  subject: string;
  totalAttempted: number;
  totalCorrect: number;
  totalSkipped: number;
  lastScore: number;
  bestScore: number;
  updatedAt: Date;
}

export interface RecentSession {
  id: string;
  testType: string;
  subjects: unknown;
  totalQuestions: number;
  correctAnswers: number;
  skippedAnswers: number;
  wrongAnswers: number;
  score: number;
  completed: boolean;
  startedAt: Date;
  completedAt: Date | null;
}

export interface UserProgressDTO {
  subjectProgress: SubjectProgress[];
  recentSessions: RecentSession[];
}

export interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalSessions: number;
  totalAnswers: number;
}

export interface QuestionsBySubject {
  subject: string;
  count: number;
}

export interface AdminDashboardDTO {
  stats: AdminStats;
  questionsBySubject: QuestionsBySubject[];
  recentSessions: {
    id: string;
    userId: string;
    testType: string;
    score: number;
    completed: boolean;
    startedAt: Date;
  }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    isAdmin: boolean;
  }[];
}
