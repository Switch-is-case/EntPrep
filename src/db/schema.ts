import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  jsonb,
  varchar,
  serial,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  language: varchar("language", { length: 5 }).default("ru").notNull(),
  profileSubject1: varchar("profile_subject_1", { length: 100 }),
  profileSubject2: varchar("profile_subject_2", { length: 100 }),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  subject: varchar("subject", { length: 100 }).notNull(),
  questionTextRu: text("question_text_ru").notNull(),
  questionTextKz: text("question_text_kz").notNull(),
  questionTextEn: text("question_text_en").notNull(),
  optionsRu: jsonb("options_ru").notNull(),
  optionsKz: jsonb("options_kz").notNull(),
  optionsEn: jsonb("options_en").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).default("medium").notNull(),
  topic: varchar("topic", { length: 255 }),
  imageUrl: text("image_url"),
  optionImages: jsonb("option_images").$type<(string | null)[]>(),
});

export const testSessions = pgTable("test_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  testType: varchar("test_type", { length: 50 }).notNull(), // 'diagnostic' | 'practice' | 'full'
  subjects: jsonb("subjects").notNull(), // array of subjects
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  skippedAnswers: integer("skipped_answers").default(0).notNull(),
  wrongAnswers: integer("wrong_answers").default(0).notNull(),
  score: integer("score").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  results: jsonb("results"), // detailed results per subject
  aiRecommendations: text("ai_recommendations"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const testAnswers = pgTable("test_answers", {
  id: serial("id").primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => testSessions.id),
  questionId: integer("question_id").notNull().references(() => questions.id),
  selectedAnswer: integer("selected_answer"), // null = skipped ("I don't know")
  isCorrect: boolean("is_correct"),
  isSkipped: boolean("is_skipped").default(false).notNull(),
  timeSpent: integer("time_spent"), // seconds
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 100 }).notNull(),
  totalAttempted: integer("total_attempted").default(0).notNull(),
  totalCorrect: integer("total_correct").default(0).notNull(),
  totalSkipped: integer("total_skipped").default(0).notNull(),
  lastScore: integer("last_score").default(0).notNull(),
  bestScore: integer("best_score").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  nameRu: varchar("name_ru", { length: 255 }).notNull(),
  nameKz: varchar("name_kz", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  cityRu: varchar("city_ru", { length: 100 }).notNull(),
  cityKz: varchar("city_kz", { length: 100 }).notNull(),
  cityEn: varchar("city_en", { length: 100 }).notNull(),
  descriptionRu: text("description_ru"),
  descriptionKz: text("description_kz"),
  descriptionEn: text("description_en"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const universityPrograms = pgTable("university_programs", {
  id: serial("id").primaryKey(),
  universityId: integer("university_id").notNull().references(() => universities.id, { onDelete: "cascade" }),
  nameRu: varchar("name_ru", { length: 255 }).notNull(),
  nameKz: varchar("name_kz", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  passingScore: integer("passing_score").notNull(),
  descriptionRu: text("description_ru"),
  descriptionKz: text("description_kz"),
  descriptionEn: text("description_en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const explanations = pgTable("explanations", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  userAnswer: integer("user_answer"), // null = skipped
  lang: varchar("lang", { length: 5 }).notNull(),
  explanationText: text("explanation_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
