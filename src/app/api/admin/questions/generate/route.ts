import { NextRequest } from "next/server";
import { aiGeneratorService } from "@/lib/container";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_GENERATE");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const { subject, topic, difficulty, count } = await request.json();

    if (!subject || !topic || !count) {
      return createErrorResponse("Missing required fields: subject, topic, or count", 400);
    }

    if (count > 20) {
      return createErrorResponse("Cannot generate more than 20 questions at once", 400);
    }

    const generatedQuestions = await aiGeneratorService.generateQuestions(
      subject,
      topic,
      difficulty || "medium",
      count
    );

    return createAdminResponse({ questions: generatedQuestions });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("API Error:", error);
    return createErrorResponse("Internal Server Error", 500);
  }
}
