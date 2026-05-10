import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { aiGeneratorService } from "@/lib/container";
import { withApiHandler } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";

async function checkAdmin(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.isAdmin) return null;
  return user;
}

export const POST = withApiHandler(async (request: NextRequest) => {
  const adminUser = await checkAdmin(request);
  if (!adminUser) throw new AppError("Unauthorized or Forbidden", 403);

  const { subject, topic, difficulty, count } = await request.json();

  if (!subject || !topic || !count) {
    throw new AppError("Missing required fields: subject, topic, or count", 400);
  }

  if (count > 20) {
    throw new AppError("Cannot generate more than 20 questions at once", 400);
  }

  const generatedQuestions = await aiGeneratorService.generateQuestions(
    subject,
    topic,
    difficulty || "medium",
    count
  );

  return NextResponse.json({ questions: generatedQuestions });
});
