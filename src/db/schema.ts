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
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── CORE SUBJECTS & RULES ──────────────────────────────────────────

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull(), // 'mandatory' | 'profile' | 'language'
  nameRu: text("name_ru").notNull(),
  nameKz: text("name_kz").notNull(),
  nameEn: text("name_en").notNull(),
});

export const entDirections = pgTable("ent_directions", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  nameRu: text("name_ru").notNull(),
  nameKz: text("name_kz").notNull(),
  nameEn: text("name_en").notNull(),
  icon: text("icon"),
  color: varchar("color", { length: 50 }),
});

export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  directionId: integer("direction_id").notNull().references(() => entDirections.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 20 }).notNull().unique(),
  nameRu: text("name_ru").notNull(),
  nameKz: text("name_kz").notNull(),
  nameEn: text("name_en").notNull(),
});

export const subjectCombinations = pgTable("subject_combinations", {
  id: serial("id").primaryKey(),
  subject1Id: integer("subject1_id").notNull().references(() => subjects.id),
  subject2Id: integer("subject2_id").notNull().references(() => subjects.id),
  entYear: integer("ent_year").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const directionCombinations = pgTable("direction_combinations", {
  directionId: integer("direction_id").notNull().references(() => entDirections.id, { onDelete: "cascade" }),
  combinationId: integer("combination_id").notNull().references(() => subjectCombinations.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.directionId, t.combinationId] }),
}));

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  parentTopicId: integer("parent_topic_id"), // for recursive sub-topics
  code: varchar("code", { length: 50 }),
  nameRu: text("name_ru").notNull(),
  nameKz: text("name_kz").notNull(),
  nameEn: text("name_en").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).default("medium").notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
});

// ─── UNIVERSITIES & PROGRAMS ────────────────────────────────────────

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
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const universityPrograms = pgTable("university_programs", {
  id: serial("id").primaryKey(),
  universityId: integer("university_id").notNull().references(() => universities.id, { onDelete: "cascade" }),
  specialtyId: integer("specialty_id").references(() => specialties.id, { onDelete: "set null" }),
  combinationId: integer("combination_id").references(() => subjectCombinations.id),
  nameRu: varchar("name_ru", { length: 255 }).notNull(),
  nameKz: varchar("name_kz", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  language: varchar("language", { length: 20 }).default("kz_ru").notNull(), // kz | ru | en | kz_ru | kz_en
  durationYears: integer("duration_years").default(4),
  isActive: boolean("is_active").default(true).notNull(),
  passingScore: integer("passing_score"), // nullable legacy
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const programScoreHistory = pgTable("program_score_history", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull().references(() => universityPrograms.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  grantScore: integer("grant_score"),
  paidScore: integer("paid_score"),
  quotaScore: integer("quota_score"),
  minScore: integer("min_score").notNull(),
  applicantsCount: integer("applicants_count"),
  source: varchar("source", { length: 20 }).default("official"), // 'official' | 'estimated'
});

// ─── USERS & PROGRESS ───────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  language: varchar("language", { length: 5 }).default("ru").notNull(),
  examLanguage: varchar("exam_language", { length: 5 }).default("ru").notNull(), // kz | ru | en
  examYear: integer("exam_year").default(2025),
  examDate: timestamp("exam_date"),
  
  // Legacy fields (kept for migration)
  profileSubject1: varchar("profile_subject_1", { length: 100 }),
  profileSubject2: varchar("profile_subject_2", { length: 100 }),
  
  // New target fields
  targetCombinationId: integer("target_combination_id").references(() => subjectCombinations.id),
  targetSpecialtyId: integer("target_specialty_id").references(() => specialties.id),
  targetUniversityId: integer("target_university_id").references(() => universities.id),
  targetScore: integer("target_score"),
  
  currentPredictedScore: integer("current_predicted_score"),
  lastPredictionAt: timestamp("last_prediction_at"),
  
  city: varchar("city", { length: 100 }),
  school: varchar("school", { length: 255 }),
  grade: integer("grade"),
  
  isAdmin: boolean("is_admin").default(false).notNull(),
  needsReonboarding: boolean("needs_reonboarding").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studyRoadmaps = pgTable("study_roadmaps", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  currentScore: integer("current_score"),
  targetScore: integer("target_score"),
  daysUntilExam: integer("days_until_exam"),
  roadmapData: jsonb("roadmap_data").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  modelVersion: varchar("model_version", { length: 50 }).notNull(),
});

// ─── QUESTIONS & EXAMS ─────────────────────────────────────────────

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").references(() => subjects.id),
  topicId: integer("topic_id").references(() => topics.id),
  subject: varchar("subject", { length: 100 }).notNull(), // keeping for compatibility
  questionTextRu: text("question_text_ru").notNull(),
  questionTextKz: text("question_text_kz").notNull(),
  questionTextEn: text("question_text_en").notNull(),
  optionsRu: jsonb("options_ru").notNull(),
  optionsKz: jsonb("options_kz").notNull(),
  optionsEn: jsonb("options_en").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).default("medium").notNull(),
  topic: varchar("topic", { length: 255 }), // keeping for compatibility
  imageUrl: text("image_url"),
  optionImages: jsonb("option_images").$type<(string | null)[]>(),
});

export const testSessions = pgTable("test_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  testType: varchar("test_type", { length: 50 }).notNull(), // 'diagnostic' | 'practice' | 'mock'
  subjects: jsonb("subjects").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  skippedAnswers: integer("skipped_answers").default(0).notNull(),
  wrongAnswers: integer("wrong_answers").default(0).notNull(),
  score: integer("score").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  results: jsonb("results"),
  aiRecommendations: text("ai_recommendations"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const testAnswers = pgTable("test_answers", {
  id: serial("id").primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => testSessions.id),
  questionId: integer("question_id").notNull().references(() => questions.id),
  selectedAnswer: integer("selected_answer"),
  isCorrect: boolean("is_correct"),
  isSkipped: boolean("is_skipped").default(false).notNull(),
  timeSpent: integer("time_spent"),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  subject: varchar("subject", { length: 100 }).notNull(), // compatibility
  totalAttempted: integer("total_attempted").default(0).notNull(),
  totalCorrect: integer("total_correct").default(0).notNull(),
  totalSkipped: integer("total_skipped").default(0).notNull(),
  lastScore: integer("last_score").default(0).notNull(),
  bestScore: integer("best_score").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const explanations = pgTable("explanations", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  userAnswer: integer("user_answer"),
  lang: varchar("lang", { length: 5 }).notNull(),
  explanationText: text("explanation_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── RELATIONS ─────────────────────────────────────────────────────

export const universitiesRelations = relations(universities, ({ many }) => ({
  programs: many(universityPrograms),
}));

export const entDirectionsRelations = relations(entDirections, ({ many }) => ({
  specialties: many(specialties),
  combinations: many(directionCombinations),
}));

export const specialtiesRelations = relations(specialties, ({ one, many }) => ({
  direction: one(entDirections, { fields: [specialties.directionId], references: [entDirections.id] }),
  programs: many(universityPrograms),
}));

export const subjectCombinationsRelations = relations(subjectCombinations, ({ one, many }) => ({
  subject1: one(subjects, { fields: [subjectCombinations.subject1Id], references: [subjects.id] }),
  subject2: one(subjects, { fields: [subjectCombinations.subject2Id], references: [subjects.id] }),
  directions: many(directionCombinations),
  programs: many(universityPrograms),
}));

export const directionCombinationsRelations = relations(directionCombinations, ({ one }) => ({
  direction: one(entDirections, { fields: [directionCombinations.directionId], references: [entDirections.id] }),
  combination: one(subjectCombinations, { fields: [directionCombinations.combinationId], references: [subjectCombinations.id] }),
}));

export const universityProgramsRelations = relations(universityPrograms, ({ one, many }) => ({
  university: one(universities, { fields: [universityPrograms.universityId], references: [universities.id] }),
  specialty: one(specialties, { fields: [universityPrograms.specialtyId], references: [specialties.id] }),
  combination: one(subjectCombinations, { fields: [universityPrograms.combinationId], references: [subjectCombinations.id] }),
  scoreHistory: many(programScoreHistory),
}));

export const programScoreHistoryRelations = relations(programScoreHistory, ({ one }) => ({
  program: one(universityPrograms, { fields: [programScoreHistory.programId], references: [universityPrograms.id] }),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  subject: one(subjects, { fields: [topics.subjectId], references: [subjects.id] }),
  parent: one(topics, { fields: [topics.parentTopicId], references: [topics.id], relationName: "subtopics" }),
  subtopics: many(topics, { relationName: "subtopics" }),
}));
