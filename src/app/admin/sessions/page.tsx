"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

import { useAdminSessions } from "@/hooks/useAdminSessions";
import { Spinner } from "@/components/Spinner";

export default function AdminSessions() {
  const { user, lang } = useApp();
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
  } = useAdminSessions();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t("admin.sessions.title", lang)}</h1>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">{t("admin.questions.filter.allSubjects", lang).replace(t("admin.questions.form.subject", lang).replace(" *", ""), t("admin.common.status", lang).toLowerCase()).replace("Предметы", "типы").replace("пәндер", "түрлер").replace("Subjects", "Types")}</option>
          <option value="diagnostic">{t("admin.testType.diagnostic", lang)}</option>
          <option value="full">{t("admin.testType.mock", lang)}</option>
          <option value="practice">{t("admin.testType.practice", lang)}</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700/50">
                <tr className="text-left text-slate-300">
                  <th className="px-4 py-3 font-medium">{t("admin.users.table.user", lang)}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.common.status", lang).replace("Статус", "Тип").replace("Мәртебе", "Түрі").replace("Status", "Type")}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.sessions.table.result", lang)}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.sessions.table.details", lang)}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.common.status", lang)}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.sessions.table.time", lang)}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.common.date", lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      {session.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                            {session.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">
                              {session.user.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {session.user.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          session.testType === "diagnostic"
                            ? "bg-primary/20 text-primary"
                            : session.testType === "full"
                            ? "bg-accent/20 text-accent"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {getTestTypeName(session.testType)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-lg font-bold ${
                          session.score >= 80
                            ? "text-success"
                            : session.score >= 60
                            ? "text-primary"
                            : session.score >= 40
                            ? "text-warning"
                            : "text-danger"
                        }`}
                      >
                        {session.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">
                      <div className="flex items-center gap-3">
                        <span className="text-success">
                          ✓{session.correctAnswers}
                        </span>
                        <span className="text-danger">
                          ✗{session.wrongAnswers}
                        </span>
                        <span className="text-warning">
                          ?{session.skippedAnswers}
                        </span>
                        <span className="text-slate-500">
                          /{session.totalQuestions}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {session.completed ? (
                        <span className="text-success text-xs">
                          {t("admin.status.completed", lang)}
                        </span>
                      ) : (
                        <span className="text-warning text-xs">
                          {t("admin.status.inProgress", lang)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {formatDuration(session.startedAt, session.completedAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(session.startedAt).toLocaleString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      {t("admin.sessions.notFound", lang)}
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
            className="px-3 py-1 rounded bg-slate-700 text-white text-sm disabled:opacity-50"
          >
            ←
          </button>
          <span className="text-slate-300 text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-slate-700 text-white text-sm disabled:opacity-50"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
