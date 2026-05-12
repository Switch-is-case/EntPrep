"use client";

import React, { useState } from "react";
import { useAuditLogs, AuditLog } from "@/hooks/useAuditLogs";
import { AuditAction, AuditEntityType } from "@/types/audit";
import { Spinner } from "@/components/Spinner";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

export default function AuditLogsPage() {
  const { lang } = useApp();
  const { logs, loading, page, totalPages, filters, setPage, setFilters } = useAuditLogs();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  const getActionColor = (action: string) => {
    if (action.includes("BANNED") || action.includes("DELETED")) return "text-red-400 bg-red-400/10 border-red-400/20";
    if (action.includes("UNBANNED") || action.includes("RESTORED") || action.includes("GRANTED")) return "text-green-400 bg-green-400/10 border-green-400/20";
    if (action.includes("CREATED")) return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    if (action.includes("UPDATED")) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    return "text-slate-400 bg-slate-400/10 border-slate-400/20";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t("admin.audit.title", lang)}</h1>

      {/* Filters */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">{t("admin.audit.filter.action", lang)}</label>
          <select
            value={filters.action || ""}
            onChange={(e) => { setFilters({ ...filters, action: e.target.value as AuditAction || undefined }); setPage(1); }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">{t("admin.questions.filter.allSubjects", lang).replace(t("admin.questions.form.subject", lang).replace(" *", ""), t("admin.audit.filter.action", lang).toLowerCase()).replace("Предметы", "действия").replace("пәндер", "іс-әрекеттер").replace("Subjects", "Actions")}</option>
            {Object.values(AuditAction).map((a) => (
              <option key={a} value={a}>{formatAction(a)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">{t("admin.audit.filter.entity", lang)}</label>
          <select
            value={filters.entityType || ""}
            onChange={(e) => { setFilters({ ...filters, entityType: e.target.value as AuditEntityType || undefined }); setPage(1); }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">{t("admin.questions.filter.allSubjects", lang).replace(t("admin.questions.form.subject", lang).replace(" *", ""), t("admin.audit.filter.entity", lang).toLowerCase()).replace("Предметы", "типы").replace("пәндер", "түрлер").replace("Subjects", "Types")}</option>
            {Object.values(AuditEntityType).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">{t("admin.audit.filter.from", lang)}</label>
          <input
            type="date"
            value={filters.from || ""}
            onChange={(e) => { setFilters({ ...filters, from: e.target.value || undefined }); setPage(1); }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">{t("admin.audit.filter.to", lang)}</label>
          <input
            type="date"
            value={filters.to || ""}
            onChange={(e) => { setFilters({ ...filters, to: e.target.value || undefined }); setPage(1); }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/50 border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t("admin.common.date", lang)}</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t("admin.audit.table.admin", lang)}</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t("admin.audit.filter.action", lang)}</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t("admin.audit.table.entity", lang)}</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t("admin.audit.table.description", lang)}</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US", {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{log.actorEmail}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.ip}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getActionColor(log.action)} uppercase`}>
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-300 text-xs font-bold">{log.entityType}</span>
                          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[100px]">{log.entityId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-4 w-4 text-slate-500 transition-transform ${expandedId === log.id ? "rotate-180" : ""}`} 
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr className="bg-slate-900/50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t("admin.audit.details.oldValue", lang)}</h4>
                              <pre className="bg-slate-950 p-3 rounded-lg text-xs text-slate-400 overflow-x-auto max-h-[200px] border border-slate-800">
                                {log.oldValue ? JSON.stringify(log.oldValue, null, 2) : t("admin.audit.details.noData", lang)}
                              </pre>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t("admin.audit.details.newValue", lang)}</h4>
                              <pre className="bg-slate-950 p-3 rounded-lg text-xs text-green-400/80 overflow-x-auto max-h-[200px] border border-slate-800">
                                {log.newValue ? JSON.stringify(log.newValue, null, 2) : t("admin.audit.details.noData", lang)}
                              </pre>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-4 text-[10px] text-slate-600">
                            <span>ID: {log.id}</span>
                            <span>UA: {log.userAgent}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                      {t("admin.audit.notFound", lang)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm disabled:opacity-50 hover:bg-slate-700 transition-all"
          >
            {t("admin.users.pagination.prev", lang)}
          </button>
          <span className="text-slate-400 text-sm">
            {t("admin.users.pagination.page", lang)} {page} {t("admin.users.pagination.of", lang)} {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm disabled:opacity-50 hover:bg-slate-700 transition-all"
          >
            {t("admin.users.pagination.next", lang)}
          </button>
        </div>
      )}
    </div>
  );
}
