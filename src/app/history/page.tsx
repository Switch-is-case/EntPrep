"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { t, tSubject, pickLocalized } from "@/lib/i18n";

import { useHistory } from "@/hooks/useHistory";
import { Spinner } from "@/components/Spinner";
import { ScoreBadges } from "@/components/ScoreBadges";

export default function HistoryPage() {
  const { lang } = useApp();
  const router = useRouter();
  const { sessions, loading, user } = useHistory();
  const [filterSubject, setFilterSubject] = useState<string>("all");

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="md" />
      </div>
    );
  }

  // Extract unique subjects from sessions
  const allSubjects = Array.from(
    new Map(
      sessions
        .flatMap(s => s.subjects || [])
        .filter(sub => sub && sub.id != null) // skip null/undefined
        .map(sub => [String(sub.id), sub])
    ).values()
  ).sort((a, b) => {
    const nameA = a.slug || a.nameRu || "";
    const nameB = b.slug || b.nameRu || "";
    return nameA.localeCompare(nameB);
  });

  const filteredSessions = filterSubject === "all" 
    ? sessions 
    : sessions.filter(s => s.subjects?.some(sub => sub.slug === filterSubject));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            {t("history.title", lang)}
          </h1>
          <p className="text-slate-600 font-medium">
            {t("history.subtitle", lang)}
          </p>
        </div>

        {sessions.length > 0 && (
          <div className="shrink-0">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full md:w-64 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary outline-none text-sm transition-colors bg-white font-bold text-slate-700"
            >
              <option value="all">{t("filters.allSubjects", lang)}</option>
              {allSubjects.map((sub, idx) => (
                <option key={`${sub.id}-${idx}`} value={sub.slug || `id-${sub.id}`}>
                  {tSubject(sub.nameRu || sub.slug, lang) || "—"}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filteredSessions.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredSessions.map((s) => (
              <div 
                key={s.id} 
                onClick={() => router.push(`/history/${s.id}`)}
                className="flex items-center gap-3 px-4 py-4 hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                {/* Score badge */}
                <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-white text-xs font-bold ${
                  s.score >= 80 ? "bg-emerald-500" : s.score >= 60 ? "bg-primary" : s.score >= 40 ? "bg-amber-500" : "bg-red-500"
                }`}>
                  {s.score}%
                </div>

                {/* Info — takes remaining space, truncates if needed */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                    {s.testType === "diagnostic"
                      ? t("history.typeDiagnostic", lang)
                      : s.testType === "full"
                      ? t("history.typeFull", lang)
                      : t("history.typePractice", lang)}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {new Date(s.startedAt).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US")}
                    {" · "}
                    {new Date(s.startedAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}
                    {s.subjects && s.subjects.length > 0 && ` · ${s.subjects.map(sub => tSubject(sub.nameRu || sub.slug, lang)).join(", ")}`}
                  </div>
                </div>

                {/* Badges + arrow — always visible, never shrinks */}
                <div className="flex items-center gap-2 shrink-0">
                  <ScoreBadges
                    correct={s.correctAnswers}
                    wrong={s.wrongAnswers}
                    skipped={s.skippedAnswers}
                  />
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {filterSubject !== "all" 
              ? t("common.noDataFound", lang)
              : t("history.emptyTitle", lang)}
          </h3>
          <p className="text-slate-600 font-medium mb-8 max-w-sm mx-auto">
            {filterSubject !== "all"
              ? t("history.tryAnotherSubject", lang)
              : t("history.emptyDesc", lang)}
          </p>
          {filterSubject === "all" && (
            <button
              onClick={() => router.push("/tests")}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors"
            >
              {t("test.start", lang)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
