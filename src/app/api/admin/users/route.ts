import { NextRequest } from "next/server";
import { usersService } from "@/lib/container";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_GENERAL");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("pageSize") || searchParams.get("limit") || "15");
    const search = searchParams.get("search") || undefined;
    
    const isAdmin = searchParams.get("isAdmin") === "true" ? true : searchParams.get("isAdmin") === "false" ? false : undefined;
    const isBanned = searchParams.get("isBanned") === "true" ? true : searchParams.get("isBanned") === "false" ? false : undefined;
    const isDeleted = searchParams.get("isDeleted") === "true" ? true : searchParams.get("isDeleted") === "false" ? false : undefined;
    const emailVerified = searchParams.get("emailVerified") === "true" ? true : searchParams.get("emailVerified") === "false" ? false : undefined;

    const result = await usersService.getAllUsers(page, limit, search, {
      isAdmin,
      isBanned,
      isDeleted,
      emailVerified
    });
    
    return createAdminResponse({
      users: result.users,
      total: result.total,
      page: result.page,
      pageSize: result.limit,
      totalPages: result.totalPages
    });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Fetch users error:", error);
    return createErrorResponse("Failed to fetch users", 500);
  }
}
