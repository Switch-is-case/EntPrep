import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { questionsService } from "@/lib/container";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_GENERAL");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const { id } = await context.params;
    const questionId = parseInt(id);

    const question = await questionsService.getQuestionById(questionId);

    if (!question) {
      return createErrorResponse("Not found", 404);
    }

    return createAdminResponse({ question });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("API Error:", error);
    return createErrorResponse("Internal Server Error", 500);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_GENERAL");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const { id } = await context.params;
    const questionId = parseInt(id);

    const body = await request.json();
    const updated = await questionsService.updateQuestion(questionId, body);
    
    if (!updated) {
      return createErrorResponse("Not found", 404);
    }

    revalidatePath("/admin/questions");
    revalidatePath("/practice");
    revalidatePath("/tests");
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache] Revalidated paths after question update: ${questionId}`);
    }

    return createAdminResponse({ question: updated });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("API Error:", error);
    return createErrorResponse("Internal Server Error", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_GENERAL");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const { id } = await context.params;
    const questionId = parseInt(id);

    await questionsService.deleteQuestion(questionId);

    revalidatePath("/admin/questions");
    revalidatePath("/practice");
    revalidatePath("/tests");
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache] Revalidated paths after question deletion: ${questionId}`);
    }

    return createAdminResponse({ success: true });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Delete question error:", error);
    return createErrorResponse("Failed to delete question", 500);
  }
}
