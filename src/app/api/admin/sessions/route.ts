import { NextRequest } from "next/server";
import { testService } from "@/lib/container";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_GENERAL");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const testType = searchParams.get("testType") || undefined;
    const completed = searchParams.get("completed") === "true" ? true : searchParams.get("completed") === "false" ? false : undefined;

    const result = await testService.getAllSessions({ page, limit, testType, completed });
    
    return createAdminResponse(result);
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Fetch sessions error:", error);
    return createErrorResponse("Failed to fetch sessions", 500);
  }
}
