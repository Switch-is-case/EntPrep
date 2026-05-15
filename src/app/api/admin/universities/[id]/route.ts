import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { universitiesService } from "@/lib/container";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_GENERAL");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const { id } = await context.params;
    const uniId = parseInt(id);
    const body = await request.json();

    const updated = await universitiesService.updateUniversity(uniId, body);
    if (!updated) {
      return createErrorResponse("Not found", 404);
    }

    revalidatePath("/admin/universities");
    revalidatePath("/universities");
    revalidatePath(`/universities/${uniId}`);
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache] Revalidated paths after university update: ${uniId}`);
    }

    return createAdminResponse({ success: true, university: updated });
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
    const uniId = parseInt(id);

    await universitiesService.deleteUniversity(uniId);

    revalidatePath("/admin/universities");
    revalidatePath("/universities");
    revalidatePath(`/universities/${uniId}`);
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache] Revalidated paths after university deletion: ${uniId}`);
    }

    return createAdminResponse({ success: true });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Admin universities DELETE error:", error);
    return createErrorResponse("Failed to delete university", 500);
  }
}
