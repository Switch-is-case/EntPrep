import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { questionsService } from "@/lib/container";
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

export const GET = withApiHandler(async (request: NextRequest) => {
  const adminUser = await checkAdmin(request);
  if (!adminUser) throw new AppError("Unauthorized or Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100); // max 100
  const subject = searchParams.get("subject") || undefined;
  const search = searchParams.get("search") || undefined;

  const result = await questionsService.getQuestions({ page, limit, subject, search });
  return NextResponse.json(result);
});

export const POST = withApiHandler(async (request: NextRequest) => {
  const adminUser = await checkAdmin(request);
  if (!adminUser) throw new AppError("Unauthorized or Forbidden", 403);

  const body = await request.json();
  const newQuestion = await questionsService.createQuestion(body);
  return NextResponse.json({ question: newQuestion });
});
