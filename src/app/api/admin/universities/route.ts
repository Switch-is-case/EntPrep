import { NextRequest } from "next/server";
import { universitiesService } from "@/lib/container";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_GENERAL");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;

    const allUniversities = await universitiesService.getAllUniversities(search);
    return createAdminResponse({ universities: allUniversities });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Admin universities GET error:", error);
    return createErrorResponse("Failed to load universities", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_GENERAL");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const body = await request.json();
    const newUni = await universitiesService.createUniversity(body);
    return createAdminResponse({ success: true, university: newUni });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("API Error:", error);
    return createErrorResponse("Internal Server Error", 500);
  }
}
