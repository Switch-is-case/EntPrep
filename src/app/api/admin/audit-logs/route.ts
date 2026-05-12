import { NextRequest } from "next/server";
import { auditService } from "@/lib/container";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";
import { AuditAction, AuditEntityType } from "@/types/audit";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_GENERAL");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    
    const actorId = searchParams.get("actorId") || undefined;
    const action = searchParams.get("action") as AuditAction || undefined;
    const entityType = searchParams.get("entityType") as AuditEntityType || undefined;
    const entityId = searchParams.get("entityId") || undefined;
    
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");
    const from = fromStr ? new Date(fromStr) : undefined;
    const to = toStr ? new Date(toStr) : undefined;

    const result = await auditService.getLogs({
      actorId,
      action,
      entityType,
      entityId,
      from,
      to,
      page,
      pageSize
    });
    
    return createAdminResponse({
      logs: result.logs,
      total: result.total,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize)
    });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Fetch audit logs error:", error);
    return createErrorResponse("Failed to fetch audit logs", 500);
  }
}
