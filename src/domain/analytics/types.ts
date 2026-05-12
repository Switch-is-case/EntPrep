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
  newUsersThisPeriod?: number;
  newSessionsThisPeriod?: number;
}

export interface QuestionsBySubject {
  subject: string;
  count: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
}

export interface SubjectPerformance {
  subject: string;
  avgScore: number;
  totalSessions: number;
}

export interface UserEngagementStats {
  totalUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  deletedUsers: number;
  activeThisWeek: number;
}

export interface TestCompletionRate {
  testType: string;
  total: number;
  completed: number;
  rate: number;
}

export interface AdminDashboardDTO {
  stats: AdminStats;
  questionsBySubject: QuestionsBySubject[];
  userRegistrations: TimeSeriesData[];
  testSessions: TimeSeriesData[];
  subjectPerformance: SubjectPerformance[];
  engagement: UserEngagementStats;
  completionRates: TestCompletionRate[];
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
    emailVerified: boolean;
    bannedAt: Date | null;
  }[];
}
export type Period = "7d" | "30d" | "90d";
