import { User } from "@/domain/users/types";

export const MANDATORY_SUBJECTS = [
  "math_literacy",
  "reading_literacy",
  "history_kz",
] as const;

export const PROFILE_SUBJECTS = [
  "math",
  "physics",
  "chemistry",
  "biology",
  "geography",
  "world_history",
  "english",
  "informatics",
  "literature",
] as const;

export const ENT_QUESTION_COUNTS: Record<string, number> = {
  math_literacy: 15,
  reading_literacy: 15,
  history_kz: 20,
  profile: 45, // each profile subject
};

export interface TestConfiguration {
  subjectsList: string[];
  questionsPerSubject: Record<string, number>;
  totalQuestions: number;
}

/**
 * Legacy configuration generator. 
 * Mock and Diagnostic exams now use the unified engine in /api/mock/start.
 * This is kept primarily for the Practice mode or as a reference.
 */
export function generateTestConfiguration(testType: string, user: User | any): TestConfiguration {
  const subjectsList: string[] = [];
  const questionsPerSubject: Record<string, number> = {};
  
  // Mandatory subjects
  subjectsList.push("math_literacy", "reading_literacy", "history_kz");
  
  if (testType === "full") {
    questionsPerSubject["math_literacy"] = ENT_QUESTION_COUNTS.math_literacy;
    questionsPerSubject["reading_literacy"] = ENT_QUESTION_COUNTS.reading_literacy;
    questionsPerSubject["history_kz"] = ENT_QUESTION_COUNTS.history_kz;
  } else {
    // Default/Practice counts
    questionsPerSubject["math_literacy"] = 5;
    questionsPerSubject["reading_literacy"] = 5;
    questionsPerSubject["history_kz"] = 5;
  }

  if (user?.profileSubject1) {
    subjectsList.push(user.profileSubject1);
    questionsPerSubject[user.profileSubject1] = testType === "full" ? ENT_QUESTION_COUNTS.profile : 5;
  }
  if (user?.profileSubject2) {
    subjectsList.push(user.profileSubject2);
    questionsPerSubject[user.profileSubject2] = testType === "full" ? ENT_QUESTION_COUNTS.profile : 5;
  }

  const totalQuestions = Object.values(questionsPerSubject).reduce((acc, count) => acc + count, 0);

  return {
    subjectsList,
    questionsPerSubject,
    totalQuestions,
  };
}
