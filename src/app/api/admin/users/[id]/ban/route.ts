import { NextRequest } from "next/server";
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
    const { reason } = await request.json();

    if (!reason || reason.trim().length < 1) {
      return createErrorResponse("Reason is required", 400);
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await usersService.banUser(admin.userId, admin.email, id, reason, ip);
    
    return createAdminResponse({ message: "User banned successfully" });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Ban user error:", error);
    return createErrorResponse("Failed to ban user", 500);
  }
}
