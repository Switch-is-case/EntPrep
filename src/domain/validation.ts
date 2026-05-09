import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  passwordRaw: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  passwordRaw: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  language: z.enum(["kz", "ru", "en"]).optional().default("ru"),
});

export const createUniversitySchema = z.object({
  nameRu: z.string().min(1, "Name (RU) is required"),
  nameKz: z.string().min(1, "Name (KZ) is required"),
  nameEn: z.string().min(1, "Name (EN) is required"),
  cityRu: z.string().min(1, "City (RU) is required"),
  cityKz: z.string().min(1, "City (KZ) is required"),
  cityEn: z.string().min(1, "City (EN) is required"),
  logoUrl: z.string().optional().nullable(),
  descriptionRu: z.string().optional().nullable(),
  descriptionKz: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
});

export const createQuestionSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  questionTextRu: z.string().min(1, "Question text (RU) is required"),
  questionTextKz: z.string().optional(),
  questionTextEn: z.string().optional(),
  optionsRu: z.array(z.string()).min(2, "optionsRu must have at least 2 items"),
  optionsKz: z.array(z.string()).optional(),
  optionsEn: z.array(z.string()).optional(),
  correctAnswer: z.number().int().min(0),
  difficulty: z.string().optional(),
  topic: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  optionImages: z.array(z.string().nullable()).optional().nullable(),
});
