import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { aiGeneratorService } from "@/services/ai-generator.service";

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

export async function POST(request: NextRequest) {
  const adminUser = await checkAdmin(request);
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });
  }

  try {
    const { subject, topic, difficulty, count } = await request.json();

    if (!subject || !topic || !count) {
      return NextResponse.json(
        { error: "Missing required fields: subject, topic, or count" },
        { status: 400 }
      );
    }

    if (count > 20) {
      return NextResponse.json(
        { error: "Cannot generate more than 20 questions at once" },
        { status: 400 }
      );
    }

    const generatedQuestions = await aiGeneratorService.generateQuestions(
      subject,
      topic,
      difficulty || "medium",
      count
    );

    return NextResponse.json({ questions: generatedQuestions });
  } catch (error: any) {
    console.error("AI Generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}
