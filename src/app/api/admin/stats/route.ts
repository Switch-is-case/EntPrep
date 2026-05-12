import { NextRequest } from "next/server";
import { analyticsService } from "@/lib/container";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";

export const revalidate = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_GENERAL");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") as "7d" | "30d" | "90d") || "7d";

    const dashboard = await analyticsService.getDashboardOverview(period);
    
    const response = createAdminResponse(dashboard);
    // Add cache tag
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Admin stats error:", error);
    return createErrorResponse("Failed to load stats", 500);
  }
}
