import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { questionsService } from "@/services/questions.service";

type RouteContext = { params: Promise<{ id: string }> };

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

export async function GET(request: NextRequest, context: RouteContext) {
  const adminUser = await checkAdmin(request);
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const questionId = parseInt(id);

  const question = await questionsService.getQuestionById(questionId);

  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ question });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const adminUser = await checkAdmin(request);
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const questionId = parseInt(id);

  try {
    const body = await request.json();
    const updated = await questionsService.updateQuestion(questionId, body);
    
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ question: updated });
  } catch (error: any) {
    console.error("Update question error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const adminUser = await checkAdmin(request);
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const questionId = parseInt(id);

  try {
    await questionsService.deleteQuestion(questionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete question error:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
