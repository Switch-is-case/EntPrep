import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { verifyToken } from "@/lib/auth";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { questionText, options, correctAnswer, userAnswer, subject, lang } =
    await req.json();

  if (!questionText || !options || correctAnswer === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const correctOption = options[correctAnswer] ?? "";
  const userOption =
    userAnswer !== null && userAnswer !== undefined
      ? options[userAnswer] ?? "—"
      : null;

  const langLabel =
    lang === "kz" ? "Kazakh" : lang === "en" ? "English" : "Russian";

  const prompt = `You are an educational AI tutor for the Kazakhstani UNT exam. 
A student is reviewing a test question and needs a clear explanation.

Subject: ${subject}
Question: ${questionText}
Options: ${options.map((o: string, i: number) => `${String.fromCharCode(65 + i)}) ${o}`).join("; ")}
Correct answer: ${String.fromCharCode(65 + correctAnswer)}) ${correctOption}
${userOption !== null ? `Student's answer: ${userAnswer !== null ? `${String.fromCharCode(65 + userAnswer)}) ${userOption}` : "Skipped (I don't know)"}` : ""}

Write a concise explanation (3-5 sentences) in ${langLabel}:
1. Why the correct answer is right
2. If the student answered incorrectly or skipped, gently explain the mistake
3. Add a short helpful tip or memory trick if applicable

Keep it friendly, encouraging, and educational. Do NOT use markdown headers.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    const explanation = response.text ?? "";
    return NextResponse.json({ explanation });
  } catch (err) {
    console.error("AI explain error:", err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
