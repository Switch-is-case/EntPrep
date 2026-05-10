import { UsersRepository } from "@/repositories/users.repository";
import { UniversitiesRepository } from "@/repositories/universities.repository";
import { TestsRepository } from "@/repositories/tests.repository";
import { QuestionsRepository } from "@/repositories/questions.repository";
import { ProgressRepository } from "@/repositories/progress.repository";
import { AnalyticsRepository } from "@/repositories/analytics.repository";
import { ExplanationRepository } from "@/repositories/explanation.repository";

import { AiGeneratorService } from "@/services/ai-generator.service";
import { AnalyticsService } from "@/services/analytics.service";
import { AuthService } from "@/services/auth.service";
import { ExplanationService } from "@/services/explanation.service";
import { ProgressService } from "@/services/progress.service";
import { QuestionsService } from "@/services/questions.service";
import { TestService } from "@/services/test.service";
import { UniversitiesService } from "@/services/universities.service";
import { UsersService } from "@/services/users.service";

// Instantiate repositories
export const usersRepository = new UsersRepository();
export const universitiesRepository = new UniversitiesRepository();
export const testsRepository = new TestsRepository();
export const questionsRepository = new QuestionsRepository();
export const progressRepository = new ProgressRepository();
export const analyticsRepository = new AnalyticsRepository();
export const explanationRepository = new ExplanationRepository();

// Instantiate services and inject dependencies
export const aiGeneratorService = new AiGeneratorService();
export const analyticsService = new AnalyticsService(analyticsRepository);
export const explanationService = new ExplanationService(explanationRepository);
export const usersService = new UsersService(usersRepository);
export const authService = new AuthService(usersRepository);
export const progressService = new ProgressService(progressRepository);
export const questionsService = new QuestionsService(questionsRepository);
export const testService = new TestService(testsRepository, usersRepository);
export const universitiesService = new UniversitiesService(universitiesRepository);
