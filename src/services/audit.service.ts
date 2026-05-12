import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { AuditAction, AuditEntityType } from "@/types/audit";

export interface AuditLogEntry {
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  description: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Creates an audit log entry.
   * This method is wrapped in a try/catch to ensure it doesn't break main operations.
   */
  async createLog(entry: AuditLogEntry): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        actorId: entry.actorId,
        actorEmail: entry.actorEmail,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        description: entry.description,
        oldValue: entry.oldValue,
        newValue: entry.newValue,
        ip: entry.ip,
        userAgent: entry.userAgent,
      });
    } catch (error) {
      console.error("Failed to create audit log:", error);
      // We don't throw here to prevent breaking main operations
    }
  }

  async getLogs(filters: {
    actorId?: string;
    action?: AuditAction;
    entityType?: AuditEntityType;
    entityId?: string;
    from?: Date;
    to?: Date;
    page?: number;
    pageSize?: number;
  }) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];

    if (filters.actorId) conditions.push(eq(auditLogs.actorId, filters.actorId));
    if (filters.action) conditions.push(eq(auditLogs.action, filters.action));
    if (filters.entityType) conditions.push(eq(auditLogs.entityType, filters.entityType));
    if (filters.entityId) conditions.push(eq(auditLogs.entityId, filters.entityId));
    if (filters.from) conditions.push(gte(auditLogs.createdAt, filters.from));
    if (filters.to) conditions.push(lte(auditLogs.createdAt, filters.to));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db
      .select()
      .from(auditLogs)
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [totalRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(where);

    return {
      logs,
      total: Number(totalRes.count),
    };
  }
}
