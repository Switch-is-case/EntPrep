import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { verifyToken } from "@/lib/auth";
import { db } from "@/db";
import { explanations } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY environment variable");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { questionId, questionText, options, correctAnswer, userAnswer, subject, lang } =
    await req.json();

  if (!questionText || !options || correctAnswer === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const isSkipped = userAnswer === null || userAnswer === undefined;
  const langCode = lang || "ru";

  // 1. Проверяем кэш в базе данных
  if (questionId) {
    try {
      const condition = isSkipped 
        ? isNull(explanations.userAnswer) 
        : eq(explanations.userAnswer, Number(userAnswer));

      const [cached] = await db
        .select()
        .from(explanations)
        .where(
          and(
            eq(explanations.questionId, Number(questionId)),
            eq(explanations.lang, langCode),
            condition
          )
        )
        .limit(1);

      if (cached) {
        return NextResponse.json({ explanation: cached.explanationText });
      }
    } catch (dbErr) {
      console.error("Cache read error:", dbErr);
    }
  }

  const correctOption = options[correctAnswer] ?? "";
  const userOption = isSkipped ? null : options[userAnswer] ?? "—";

  const langLabel =
    lang === "kz" ? "Kazakh" : lang === "en" ? "English" : "Russian";

  const prompt = `You are an educational AI tutor for the Kazakhstani UNT exam. 
A student is reviewing a test question and needs a clear explanation.

Subject: ${subject}
Question: ${questionText}
Options: ${options.map((o: string, i: number) => `${String.fromCharCode(65 + Number(i))}) ${o}`).join("; ")}
Correct answer: ${String.fromCharCode(65 + Number(correctAnswer))}) ${correctOption}
Student's answer: ${isSkipped ? "Skipped (I don't know)" : `${String.fromCharCode(65 + Number(userAnswer))}) ${userOption}`}

Write a concise explanation (3-5 sentences) in ${langLabel}:
1. Why the correct answer is right
2. If the student answered incorrectly or skipped, gently explain the mistake
3. Add a short helpful tip or memory trick if applicable

Keep it friendly, encouraging, and educational. Do NOT use markdown headers.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const explanation = response.text ?? "";

    // 2. Сохраняем в кэш
    if (questionId && explanation) {
      try {
        await db.insert(explanations).values({
          questionId: Number(questionId),
          userAnswer: isSkipped ? null : Number(userAnswer),
          lang: langCode,
          explanationText: explanation,
        });
      } catch (dbErr) {
        console.error("Cache write error:", dbErr);
      }
    }

    return NextResponse.json({ explanation });
  } catch (err: any) {
    console.error("AI explain error:", err);
    // 3. Graceful degradation: возвращаем 503 при превышении лимитов (Quota exceeded)
    return NextResponse.json(
      { error: "AI is overloaded. Please wait." },
      { status: 503 }
    );
  }
}