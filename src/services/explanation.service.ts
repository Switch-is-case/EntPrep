import { ExplanationRepository } from "@/repositories/explanation.repository";
import { AppError } from "@/lib/errors";

interface GenerateExplanationParams {
  questionId: number | null;
  questionText: string;
  options: string[];
  correctAnswer: number;
  userAnswer: number | null;
  subject: string;
  lang: string;
  difyUser: string;
}

export class ExplanationService {
  constructor(private readonly explanationRepository: ExplanationRepository) {}

  /**
   * Возвращает объяснение: сначала ищет в кэше БД,
   * при отсутствии — генерирует через Dify и сохраняет в кэш.
   */
  async getOrGenerate(params: GenerateExplanationParams): Promise<string> {
    const {
      questionId,
      questionText,
      options,
      correctAnswer,
      userAnswer,
      subject,
      lang,
      difyUser,
    } = params;

    const langCode = lang || "ru";
    const isSkipped = userAnswer === null || userAnswer === undefined;
    const cacheKey = {
      questionId: questionId ?? 0,
      userAnswer: isSkipped ? null : userAnswer,
      lang: langCode,
    };

    // 1. Проверяем кэш
    if (questionId) {
      try {
        const cached = await this.explanationRepository.findCached(cacheKey);
        if (cached) return cached.explanationText;
      } catch (err) {
        console.error("[ExplanationService] Cache read error:", err);
      }
    }

    // 2. Генерируем через Dify
    const explanation = await this.callDify(params, isSkipped, langCode, difyUser);

    // 3. Сохраняем в кэш
    if (questionId && explanation) {
      try {
        await this.explanationRepository.save(cacheKey, explanation);
      } catch (err) {
        console.error("[ExplanationService] Cache write error:", err);
      }
    }

    return explanation;
  }

  private async callDify(
    params: GenerateExplanationParams,
    isSkipped: boolean,
    langCode: string,
    difyUser: string
  ): Promise<string> {
    const difyKey = process.env.DIFY_API_KEY;
    const difyUrl = process.env.DIFY_API_URL || "https://api.dify.ai/v1";

    if (!difyKey) {
      throw new AppError("DIFY_API_KEY is missing in environment variables.", 500);
    }

    const { questionText, options, correctAnswer, userAnswer, subject } = params;
    const langLabel =
      langCode === "kz" ? "Kazakh" : langCode === "en" ? "English" : "Russian";
    const correctOption = options[correctAnswer] ?? "";
    const userOption = isSkipped ? null : options[userAnswer!] ?? "—";

    const prompt = `You are an educational AI tutor for the Kazakhstani UNT exam. 
A student is reviewing a test question and needs a clear explanation.

Subject: ${subject}
Question: ${questionText}
Options: ${options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join("; ")}
Correct answer: ${String.fromCharCode(65 + Number(correctAnswer))}) ${correctOption}
Student's answer: ${isSkipped ? "Skipped (I don't know)" : `${String.fromCharCode(65 + Number(userAnswer))}) ${userOption}`}

Write a concise explanation (3-5 sentences) in ${langLabel}:
1. Why the correct answer is right
2. If the student answered incorrectly or skipped, gently explain the mistake
3. Add a short helpful tip or memory trick if applicable

Keep it friendly, encouraging, and educational. Do NOT use markdown headers.`;

    const response = await fetch(`${difyUrl}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${difyKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query: prompt,
        response_mode: "blocking",
        user: difyUser,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ExplanationService] Dify API error:", response.status, errorText);
      throw new AppError("AI is overloaded. Please wait.", 503);
    }

    const data = await response.json();
    return data.answer ?? "";
  }
}
