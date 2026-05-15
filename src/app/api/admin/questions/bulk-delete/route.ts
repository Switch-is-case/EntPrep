import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { questionsService } from "@/lib/container";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_GENERAL");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return createErrorResponse("No IDs provided", 400);
    }

    if (ids.length > 1000) {
      return createErrorResponse("Cannot delete more than 1000 items at once", 400);
    }

    // Validate that all IDs are numbers
    const validIds = ids.filter(id => typeof id === "number");
    if (validIds.length !== ids.length) {
      return createErrorResponse("Invalid ID format", 400);
    }

    const deletedCount = await questionsService.bulkDeleteQuestions(validIds);

    revalidatePath("/admin/questions");
    revalidatePath("/practice");
    revalidatePath("/tests");
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache] Revalidated paths after question bulk deletion: ${deletedCount} items`);
    }

    console.log(`[Admin] Bulk deleted ${deletedCount} questions by user ${admin.email}`);

    return createAdminResponse({ 
      success: true, 
      deletedCount 
    });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Bulk delete questions error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
