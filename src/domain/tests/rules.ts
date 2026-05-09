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

export function generateTestConfiguration(testType: string, user: User | any): TestConfiguration {
  const subjectsList: string[] = [];
  const questionsPerSubject: Record<string, number> = {};
  
  if (testType === "full" || testType === "diagnostic") {
    subjectsList.push("math_literacy", "reading_literacy", "history_kz");
    questionsPerSubject["math_literacy"] = testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.math_literacy;
    questionsPerSubject["reading_literacy"] = testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.reading_literacy;
    questionsPerSubject["history_kz"] = testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.history_kz;

    if (user?.profileSubject1) {
      subjectsList.push(user.profileSubject1);
      questionsPerSubject[user.profileSubject1] = testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.profile;
    }
    if (user?.profileSubject2) {
      subjectsList.push(user.profileSubject2);
      questionsPerSubject[user.profileSubject2] = testType === "diagnostic" ? 5 : ENT_QUESTION_COUNTS.profile;
    }
  }

  const totalQuestions = Object.values(questionsPerSubject).reduce((acc, count) => acc + count, 0);

  return {
    subjectsList,
    questionsPerSubject,
    totalQuestions,
  };
}
