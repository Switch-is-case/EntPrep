import { useState, useCallback, useEffect } from "react";
import { useApp } from "@/components/Providers";
import { AuditAction, AuditEntityType } from "@/types/audit";

export interface AuditLog {
  id: string;
  actorId: string | null;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  oldValue: any;
  newValue: any;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export function useAuditLogs() {
  const { token, authHeaders } = useApp();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<{
    actorId?: string;
    action?: AuditAction;
    entityType?: AuditEntityType;
    from?: string;
    to?: string;
    actorEmail?: string;
  }>({});

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: "20",
    });
    
    if (filters.action) params.set("action", filters.action);
    if (filters.entityType) params.set("entityType", filters.entityType);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.actorEmail) params.set("actorEmail", filters.actorEmail); // Need to handle this in API if needed

    try {
      const res = await fetch(`/api/admin/audit-logs?${params}`, {
        headers: authHeaders(),
        cache: "no-store"
      });
      if (res.ok) {
        const resData = await res.json();
        const data = resData.data;
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error("Failed to fetch audit logs", e);
    } finally {
      setLoading(false);
    }
  }, [token, page, filters, authHeaders]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    page,
    totalPages,
    filters,
    setPage,
    setFilters,
    refresh: fetchLogs
  };
}
