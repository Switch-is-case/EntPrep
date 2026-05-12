import { NextRequest } from "next/server";
import { questionsService } from "@/lib/container";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    
    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_BULK");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const body = await request.json();
    const result = await questionsService.bulkImport(body);
    return createAdminResponse(result);
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("API Error:", error);
    return createErrorResponse("Internal Server Error", 500);
  }
}
