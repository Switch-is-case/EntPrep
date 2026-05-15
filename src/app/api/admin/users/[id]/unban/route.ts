import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { usersService } from "@/lib/container";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_USERS");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const { id } = await context.params;
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await usersService.unbanUser(admin.userId, admin.email, id, ip);
    
    revalidatePath("/admin/users");
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache] Revalidated paths after user unban: ${id}`);
    }

    return createAdminResponse({ message: "User unbanned successfully" });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Unban user error:", error);
    return createErrorResponse("Failed to unban user", 500);
  }
}
