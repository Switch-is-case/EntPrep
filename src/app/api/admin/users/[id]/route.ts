import { NextRequest } from "next/server";
import { usersService } from "@/lib/container";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_USERS");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const { id } = await context.params;
    const { isAdmin } = await request.json();
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const updated = await usersService.setAdminStatus(admin.userId, admin.email, id, isAdmin, ip);
    
    return createAdminResponse({ user: updated });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Update user error:", error);
    return createErrorResponse("Failed to update user", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_USERS");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const { id } = await context.params;
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await usersService.softDeleteUser(admin.userId, admin.email, id, ip);
    
    return createAdminResponse({ success: true });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Delete user error:", error);
    return createErrorResponse("Failed to delete user", 500);
  }
}
