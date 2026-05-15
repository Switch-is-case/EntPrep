"use client";

import React from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { useAdminSessions } from "@/hooks/useAdminSessions";
import { cn } from "@/lib/utils";
import { 
  RefreshCw, 
  Clock, 
  Trophy, 
  Users, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  BarChart3,
  ChevronDown
} from "lucide-react";
import { IconButton, DataTable, Pagination, SearchToolbar, Badge } from "@/components/admin/ui";

export default function AdminSessions() {
  const { lang } = useApp();
  const {
    sessions,
    loading,
    page,
    totalPages,
    filterType,
    setPage,
    setFilterType,
    getTestTypeName,
    formatDuration,
    refresh
  } = useAdminSessions();

  const columns = [
    { key: "user", label: t("admin.users.table.user", lang), width: 220 },
    { key: "type", label: t("admin.common.status", lang).replace("Status", "Type"), width: 150 },
    { key: "score", label: t("admin.sessions.table.result", lang), width: 100 },
    { key: "details", label: t("admin.sessions.table.details", lang), width: 180 },
    { key: "status", label: t("admin.common.status", lang), width: 120 },
    { key: "duration", label: t("admin.sessions.table.time", lang), width: 120 },
    { key: "date", label: t("admin.common.date", lang), flex: 1 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-info";
    if (score >= 40) return "text-warning";
    return "text-danger";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-1">{t("admin.sessions.title", lang)}</h1>
          <p className="text-text-secondary text-sm">Analyze student performance and test activity</p>
        </div>
        <IconButton 
          icon={<RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />} 
          tooltip={t("common.refresh", lang)} 
          onClick={refresh} 
        />
      </div>

      <SearchToolbar
        search=""
        onSearchChange={() => {}}
        placeholder={t("admin.common.search", lang)}
        hideSearch
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-surface-base border border-border rounded-xl px-4 py-2 pr-10 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:bg-surface-raised"
            >
              <option value="">{t("admin.common.all", lang)} Types</option>
              <option value="diagnostic">{t("admin.testType.diagnostic", lang)}</option>
              <option value="full">{t("admin.testType.mock", lang)}</option>
              <option value="practice">{t("admin.testType.practice", lang)}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-raised/50 rounded-xl border border-border">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-text-secondary">
              Total: {sessions.length} sessions
            </span>
          </div>
        </div>
      </SearchToolbar>

      <DataTable
        columns={columns}
        rows={sessions}
        isLoading={loading}
        renderRow={(session) => (
          <tr key={session.id} className="border-b border-border hover:bg-surface-raised/50 transition-colors group">
            <td className="px-6 py-4">
              {session.user ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold border border-primary/10">
                    {session.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-text text-sm font-semibold truncate max-w-[150px]">{session.user.name}</span>
                    <span className="text-[10px] text-text-secondary truncate max-w-[150px]">{session.user.email}</span>
                  </div>
                </div>
              ) : (
                <span className="text-text-secondary text-xs italic opacity-50">Anonymous</span>
              )}
            </td>
            <td className="px-6 py-4">
              <Badge 
                variant={session.testType === "diagnostic" ? "info" : session.testType === "full" ? "success" : "outline"}
                className="capitalize"
              >
                {getTestTypeName(session.testType)}
              </Badge>
            </td>
            <td className="px-6 py-4">
              <div className={cn("text-lg font-black flex items-center gap-1", getScoreColor(session.score))}>
                <Trophy className="w-4 h-4 opacity-50" />
                {session.score}%
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <div className="flex items-center gap-1 text-success" title="Correct">
                  <CheckCircle2 className="w-3 h-3" />
                  {session.correctAnswers}
                </div>
                <div className="flex items-center gap-1 text-danger" title="Wrong">
                  <XCircle className="w-3 h-3" />
                  {session.wrongAnswers}
                </div>
                <div className="flex items-center gap-1 text-warning" title="Skipped">
                  <HelpCircle className="w-3 h-3" />
                  {session.skippedAnswers}
                </div>
                <div className="text-text-secondary/50 font-medium">
                  / {session.totalQuestions}
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <Badge variant={session.completed ? "success" : "warning"} className="text-[10px]">
                {session.completed ? t("admin.status.completed", lang) : t("admin.status.inProgress", lang)}
              </Badge>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                <Clock className="w-3 h-3 opacity-50" />
                {formatDuration(session.startedAt, session.completedAt)}
              </div>
            </td>
            <td className="px-6 py-4">
              <span className="text-text-secondary text-xs font-medium">
                {new Date(session.startedAt).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </td>
          </tr>
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
