import { AppError } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { questionsService } from "@/lib/container";

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

export async function GET(request: NextRequest) {
  const adminUser = await checkAdmin(request);
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const subject = searchParams.get("subject") || undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const result = await questionsService.getQuestions({ page, limit, subject, search });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin questions error:", error);
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminUser = await checkAdmin(request);
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const newQuestion = await questionsService.createQuestion(body);
    return NextResponse.json({ question: newQuestion });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
