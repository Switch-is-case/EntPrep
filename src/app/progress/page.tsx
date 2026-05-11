"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import ProgressCharts from "@/components/ProgressCharts";
import { Spinner } from "@/components/Spinner";
import { ScoreBadges } from "@/components/ScoreBadges";

interface SubjectProgress {
  id: number;
  subject: string;
  totalAttempted: number;
  totalCorrect: number;
  totalSkipped: number;
  lastScore: number;
  bestScore: number;
}

interface RecentSession {
  id: string;
  testType: string;
  totalQuestions: number;
  correctAnswers: number;
  skippedAnswers: number;
  wrongAnswers: number;
  score: number;
  completed: boolean;
  startedAt: string;
}

export default function ProgressPage() {
  const { lang, user, token, authHeaders, ready } = useApp();
  const router = useRouter();
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !user && !token) {
      window.location.href = "/login";
      return;
    }
    if (!user || !token) return;

    const fetchProgress = async () => {
      try {
        const res = await fetch("/api/progress", { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          setSubjectProgress(data.subjectProgress);
          setRecentSessions(data.recentSessions);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [ready, user, token, router, authHeaders]);

  if (!user) return null;

  const getSubjectName = (s: string) => {
    const key = `subject.${s}` as keyof typeof import("@/lib/i18n").translations;
    return t(key, lang);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="md" />
      </div>
    );
  }

  const totalAttempted = subjectProgress.reduce((sum, p) => sum + p.totalAttempted, 0);
  const totalCorrect = subjectProgress.reduce((sum, p) => sum + p.totalCorrect, 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-text mb-8">{t("progress.title", lang)}</h1>

      {/* Overall stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="text-sm text-text-secondary mb-1">{t("progress.accuracy", lang)}</div>
          <div className="text-3xl font-bold text-primary">{overallAccuracy}%</div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="text-sm text-text-secondary mb-1">{t("progress.attempted", lang)}</div>
          <div className="text-3xl font-bold text-text">{totalAttempted}</div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="text-sm text-text-secondary mb-1">{t("test.correct", lang)}</div>
          <div className="text-3xl font-bold text-success">{totalCorrect}</div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="text-sm text-text-secondary mb-1">
            {lang === "ru" ? "Тестов пройдено" : lang === "kz" ? "Тест тапсырылды" : "Tests Taken"}
          </div>
          <div className="text-3xl font-bold text-accent">{recentSessions.length}</div>
        </div>
      </div>

      {subjectProgress.length > 0 ? (
        <>
          {/* Charts */}
          <ProgressCharts subjectProgress={subjectProgress} lang={lang} />

          {/* Subject details */}
          <div className="bg-white rounded-2xl border border-border p-6 mb-8">
            <h3 className="font-semibold text-text mb-4">{t("progress.bySubject", lang)}</h3>
            <div className="space-y-4">
              {subjectProgress.map((sp) => {
                const accuracy = sp.totalAttempted > 0
                  ? Math.round((sp.totalCorrect / sp.totalAttempted) * 100)
                  : 0;
                return (
                  <div key={sp.id} className="space-y-1.5">
                    {/* Subject name + best score on one line */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-text">{getSubjectName(sp.subject)}</span>
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                        Best: {sp.bestScore}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          accuracy >= 80 ? "bg-success" : accuracy >= 60 ? "bg-primary" : accuracy >= 40 ? "bg-warning" : "bg-danger"
                        }`}
                        style={{ width: `${accuracy}%` }}
                      />
                    </div>
                    {/* Stats row */}
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>{sp.totalCorrect}/{sp.totalAttempted} {lang === "ru" ? "правильно" : lang === "kz" ? "дұрыс" : "correct"}</span>
                      <span className="font-semibold text-text">{accuracy}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent sessions */}
          {recentSessions.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-text mb-4">{t("progress.history", lang)}</h3>
              <div className="space-y-3">
                {recentSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-bg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                        s.score >= 80 ? "bg-success" : s.score >= 60 ? "bg-primary" : s.score >= 40 ? "bg-warning" : "bg-danger"
                      }`}>
                        {s.score}%
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {s.testType === "diagnostic"
                            ? lang === "ru" ? "Диагностический" : lang === "kz" ? "Диагностикалық" : "Diagnostic"
                            : s.testType === "full"
                            ? lang === "ru" ? "Полный ЕНТ" : lang === "kz" ? "Толық ЕНТ" : "Full ENT"
                            : lang === "ru" ? "Практика" : lang === "kz" ? "Жаттығу" : "Practice"}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {new Date(s.startedAt).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US")}
                        </div>
                      </div>
                    </div>
                    <ScoreBadges
                      correct={s.correctAnswers}
                      wrong={s.wrongAnswers}
                      skipped={s.skippedAnswers}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
          <h3 className="text-xl font-semibold text-text mb-2">
            {lang === "ru"
              ? "Пока нет данных"
              : lang === "kz"
              ? "Әлі деректер жоқ"
              : "No data yet"}
          </h3>
          <p className="text-text-secondary mb-6">
            {lang === "ru"
              ? "Пройдите тест, чтобы увидеть свой прогресс"
              : lang === "kz"
              ? "Прогресті көру үшін тест тапсырыңыз"
              : "Take a test to see your progress"}
          </p>
          <button
            onClick={() => router.push("/tests")}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors"
          >
            {t("test.start", lang)}
          </button>
        </div>
      )}
    </div>
  );
}
