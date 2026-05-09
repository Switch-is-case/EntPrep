import { GoogleGenAI, Type } from "@google/genai";
import { CreateQuestionDTO } from "@/domain/questions/types";
import { AppError } from "@/lib/errors";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class AiGeneratorService {
  async generateQuestions(
    subject: string,
    topic: string,
    difficulty: string,
    count: number
  ): Promise<CreateQuestionDTO[]> {
    if (!process.env.GEMINI_API_KEY) {
      throw new AppError("GEMINI_API_KEY is missing in environment variables.");
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
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              questionTextRu: { type: Type.STRING },
              questionTextKz: { type: Type.STRING },
              questionTextEn: { type: Type.STRING },
              optionsRu: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              optionsKz: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              optionsEn: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswer: { type: Type.INTEGER },
              difficulty: { type: Type.STRING },
              topic: { type: Type.STRING },
            },
            required: [
              "subject",
              "questionTextRu",
              "questionTextKz",
              "questionTextEn",
              "optionsRu",
              "optionsKz",
              "optionsEn",
              "correctAnswer",
              "difficulty",
              "topic",
            ],
          },
        },
      },
    });

    if (!response.text) {
      throw new AppError("Failed to generate content from AI");
    }

    try {
      const parsed = JSON.parse(response.text);
      // Ensure 'subject', 'difficulty', and 'topic' are mapped explicitly just in case AI messes up the constants
      return parsed.map((q: any) => ({
        ...q,
        subject,
        difficulty,
        topic,
      })) as CreateQuestionDTO[];
    } catch (e) {
      console.error("JSON parsing error from AI response:", e);
      throw new AppError("AI returned invalid JSON format");
    }
  }
}

