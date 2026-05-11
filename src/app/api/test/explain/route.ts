import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { explanationService } from "@/lib/container";
import { withApiHandler } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/ratelimit";

export const POST = withApiHandler(async (req: NextRequest) => {
  if (!process.env.DIFY_API_KEY) {
    throw new AppError("Server configuration error", 500);
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decodedToken = token ? verifyToken(token) : null;

  if (!token || !decodedToken) {
    throw new AppError("Unauthorized", 401);
  }

  const userId = decodedToken.userId;
  const rateLimit = await checkRateLimit(userId, "AI_GENERAL");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Maximum 10 explanations per hour." },
      { status: 429 }
    );
  }

  const { questionId, questionText, options, correctAnswer, userAnswer, subject, lang } =
    await req.json();

  if (!questionText || !options || correctAnswer === undefined) {
    throw new AppError("Missing fields", 400);
  }

  const explanation = await explanationService.getOrGenerate({
    questionId: questionId ? Number(questionId) : null,
    questionText,
    options,
    correctAnswer: Number(correctAnswer),
    userAnswer: userAnswer !== null && userAnswer !== undefined ? Number(userAnswer) : null,
    subject,
    lang: lang || "ru",
    difyUser: decodedToken.userId || "ent-prep-student",
  });

  return NextResponse.json({ explanation });
});