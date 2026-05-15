"use client";

import React, { useState } from "react";
import { useAuditLogs, AuditLog } from "@/hooks/useAuditLogs";
import { AuditAction, AuditEntityType } from "@/types/audit";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { 
  RefreshCw, 
  ChevronDown, 
  Calendar, 
  User, 
  Shield, 
  Search,
  ArrowRight,
  Info
} from "lucide-react";
import { IconButton, DataTable, Pagination, SearchToolbar, Badge } from "@/components/admin/ui";
import { motion, AnimatePresence } from "framer-motion";

export default function AuditLogsPage() {
  const { lang } = useApp();
  const { logs, loading, page, totalPages, filters, setPage, setFilters, refresh } = useAuditLogs();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  const getActionVariant = (action: string): "danger" | "success" | "info" | "warning" | "outline" => {
    if (action.includes("BANNED") || action.includes("DELETED") || action.includes("ERROR")) return "danger";
    if (action.includes("UNBANNED") || action.includes("RESTORED") || action.includes("GRANTED") || action.includes("LOGIN_SUCCESS")) return "success";
    if (action.includes("CREATED")) return "info";
    if (action.includes("UPDATED")) return "warning";
    return "outline";
  };

  const columns = [
    { key: "date", label: t("admin.common.date", lang), width: 140 },
    { key: "actor", label: t("admin.audit.table.admin", lang), width: 220 },
    { key: "action", label: t("admin.audit.filter.action", lang), width: 150 },
    { key: "entity", label: t("admin.audit.table.entity", lang), width: 180 },
    { key: "description", label: t("admin.audit.table.description", lang), flex: 1 },
    { key: "expand", label: "", width: 50 },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-1">{t("admin.audit.title", lang)}</h1>
          <p className="text-text-secondary text-sm">Track system changes and administrative actions</p>
        </div>
        <IconButton 
          icon={<RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />} 
          tooltip={t("common.refresh", lang)} 
          onClick={refresh} 
        />
      </div>

      <SearchToolbar
        search={filters.actorEmail || ""}
        onSearchChange={(val) => {
          setFilters({ ...filters, actorEmail: val || undefined });
          setPage(1);
        }}
        placeholder={t("admin.audit.table.admin", lang)}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={filters.action || ""}
              onChange={(e) => { 
                setFilters({ ...filters, action: e.target.value as AuditAction || undefined }); 
                setPage(1); 
              }}
              className="appearance-none bg-surface-base border border-border rounded-xl px-4 py-2 pr-10 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:bg-surface-raised"
            >
              <option value="">{t("admin.audit.filter.action", lang)}</option>
              {Object.values(AuditAction).map((a) => (
                <option key={a} value={a}>{formatAction(a)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.entityType || ""}
              onChange={(e) => { 
                setFilters({ ...filters, entityType: e.target.value as AuditEntityType || undefined }); 
                setPage(1); 
              }}
              className="appearance-none bg-surface-base border border-border rounded-xl px-4 py-2 pr-10 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:bg-surface-raised"
            >
              <option value="">{t("admin.audit.filter.entity", lang)}</option>
              {Object.values(AuditEntityType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 bg-surface-base border border-border rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-text-secondary" />
            <input
              type="date"
              value={filters.from || ""}
              onChange={(e) => { setFilters({ ...filters, from: e.target.value || undefined }); setPage(1); }}
              className="bg-transparent text-xs text-text focus:outline-none w-[110px]"
            />
            <span className="text-text-secondary">/</span>
            <input
              type="date"
              value={filters.to || ""}
              onChange={(e) => { setFilters({ ...filters, to: e.target.value || undefined }); setPage(1); }}
              className="bg-transparent text-xs text-text focus:outline-none w-[110px]"
            />
          </div>
        </div>
      </SearchToolbar>

      <DataTable
        columns={columns}
        rows={logs}
        isLoading={loading}
        renderRow={(log) => (
          <React.Fragment key={log.id}>
            <tr 
              className={cn(
                "border-b border-border hover:bg-surface-raised/50 transition-colors group cursor-pointer",
                expandedId === log.id && "bg-surface-raised"
              )}
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-text text-xs font-medium">
                    {new Date(log.createdAt).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US", {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="text-text-secondary text-[10px]">
                    {new Date(log.createdAt).toLocaleTimeString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US", {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center text-text-secondary border border-border">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col max-w-[150px]">
                    <span className="text-text text-sm font-medium truncate" title={log.actorEmail}>{log.actorEmail}</span>
                    <span className="text-[10px] text-text-secondary font-mono">{log.ip}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant={getActionVariant(log.action)} className="uppercase text-[9px] px-1.5 py-0.5">
                  {formatAction(log.action)}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-text text-xs font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3 text-primary" />
                    {log.entityType}
                  </span>
                  <span className="text-[9px] text-text-secondary font-mono truncate max-w-[100px]">{log.entityId}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-text-secondary text-xs line-clamp-2">{log.description}</p>
              </td>
              <td className="px-6 py-4 text-right">
                <ChevronDown className={cn("w-4 h-4 text-text-secondary transition-transform duration-300", expandedId === log.id && "rotate-180")} />
              </td>
            </tr>
            <AnimatePresence>
              {expandedId === log.id && (
                <tr>
                  <td colSpan={6} className="p-0 border-b border-border bg-surface-raised/30">
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                            <ArrowRight className="w-3 h-3 rotate-180" />
                            {t("admin.audit.details.oldValue", lang)}
                          </h4>
                          <div className="bg-surface-base p-4 rounded-xl border border-border shadow-inner">
                            <pre className="text-xs text-text-secondary font-mono overflow-x-auto max-h-[300px] scrollbar-thin scrollbar-thumb-border">
                              {log.oldValue ? JSON.stringify(log.oldValue, null, 2) : t("admin.audit.details.noData", lang)}
                            </pre>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-success uppercase tracking-widest flex items-center gap-2">
                            <ArrowRight className="w-3 h-3" />
                            {t("admin.audit.details.newValue", lang)}
                          </h4>
                          <div className="bg-surface-base p-4 rounded-xl border border-border shadow-inner">
                            <pre className="text-xs text-success/80 font-mono overflow-x-auto max-h-[300px] scrollbar-thin scrollbar-thumb-border">
                              {log.newValue ? JSON.stringify(log.newValue, null, 2) : t("admin.audit.details.noData", lang)}
                            </pre>
                          </div>
                        </div>
                        <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-border mt-2">
                          <div className="flex gap-4 text-[10px] text-text-secondary font-mono">
                            <span className="flex items-center gap-1"><Info className="w-3 h-3" /> ID: {log.id}</span>
                            <span className="truncate max-w-[300px]" title={log.userAgent || ""}>UA: {log.userAgent}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px]">{log.ip}</Badge>
                        </div>
                      </div>
                    </motion.div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </React.Fragment>
        )}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        lang={lang}
      />
    </div>
  );
}
