import { CreateQuestionDTO } from "@/domain/questions/types";
import { AppError } from "@/lib/errors";

export class AiGeneratorService {
  async generateQuestions(
    subject: string,
    topic: string,
    difficulty: string,
    count: number
  ): Promise<CreateQuestionDTO[]> {
    const difyKey = process.env.DIFY_API_KEY;
    const difyUrl = process.env.DIFY_API_URL || "https://api.dify.ai/v1";

    if (!difyKey) {
      throw new AppError("DIFY_API_KEY is missing in environment variables.");
    }

    const prompt = `
      You are an expert educational content creator for the Kazakhstani UNT (Unified National Testing) exam.
      Generate ${count} multiple-choice questions for the subject: "${subject}" on the topic: "${topic}".
      The difficulty level should be ${difficulty}.
      
      Requirements:
      - Each question must be provided in 3 languages: Russian (questionTextRu), Kazakh (questionTextKz), and English (questionTextEn).
      - Each question must have exactly 4 options.
      - Options must also be translated into all 3 languages (optionsRu, optionsKz, optionsEn).
      - 'correctAnswer' must be the index (0, 1, 2, or 3) of the correct option.
      - The generated questions should be highly relevant, accurate, and structured perfectly.
      
      CRITICAL: You MUST return ONLY a valid JSON array of objects. Do not include any markdown formatting, no \`\`\`json wrappers, no intro text, and no outro text. Just the raw JSON array.
      
      Example Object structure:
      {
        "questionTextRu": "...",
        "questionTextKz": "...",
        "questionTextEn": "...",
        "optionsRu": ["...", "...", "...", "..."],
        "optionsKz": ["...", "...", "...", "..."],
        "optionsEn": ["...", "...", "...", "..."],
        "correctAnswer": 0
      }
    `;

    try {
      const response = await fetch(`${difyUrl}/chat-messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${difyKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {},
          query: prompt,
          response_mode: "blocking",
          user: "admin-generator",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Dify API error:", response.status, errorText);
        throw new AppError(`Dify API returned ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.answer ?? "";

      // Очистка от маркдауна, если ИИ все-таки его добавил
      responseText = responseText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

      const parsed = JSON.parse(responseText);
      
      // Ensure constants are mapped
      return parsed.map((q: any) => ({
        ...q,
        subject,
        difficulty,
        topic,
      })) as CreateQuestionDTO[];
    } catch (e: any) {
      console.error("AI generation or JSON parsing error:", e);
      if (e instanceof AppError) throw e;
      throw new AppError("Failed to generate or parse valid JSON from AI");
    }
  }
}

