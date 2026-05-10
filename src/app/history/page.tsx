"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

import { useHistory } from "@/hooks/useHistory";
import { Spinner } from "@/components/Spinner";
import { ScoreBadges } from "@/components/ScoreBadges";

export default function HistoryPage() {
  const { lang } = useApp();
  const router = useRouter();
  const { sessions, loading, user } = useHistory();

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold text-text mb-2">
        {lang === "ru" ? "История тестов" : lang === "kz" ? "Тест тарихы" : "Test History"}
      </h1>
      <p className="text-text-secondary mb-8">
        {lang === "ru" 
          ? "Здесь отображаются все пройденные вами тесты. Нажмите на тест, чтобы посмотреть подробный разбор." 
          : lang === "kz" 
          ? "Мұнда сіз тапсырған барлық тесттер көрсетілген. Толық талдауды көру үшін тестті басыңыз." 
          : "All your completed tests are shown here. Click on a test to see a detailed review."}
      </p>

      {sessions.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {sessions.map((s) => (
              <div 
                key={s.id} 
                onClick={() => router.push(`/history/${s.id}`)}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                {/* Score badge */}
                <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                  s.score >= 80 ? "bg-success" : s.score >= 60 ? "bg-primary" : s.score >= 40 ? "bg-warning" : "bg-danger"
                }`}>
                  {s.score}%
                </div>

                {/* Info — takes remaining space, truncates if needed */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text group-hover:text-primary transition-colors truncate">
                    {s.testType === "diagnostic"
                      ? lang === "ru" ? "Диагностический" : lang === "kz" ? "Диагностикалық" : "Diagnostic"
                      : s.testType === "full"
                      ? lang === "ru" ? "Полный ЕНТ" : lang === "kz" ? "Толық ЕНТ" : "Full ENT"
                      : lang === "ru" ? "Практика" : lang === "kz" ? "Жаттығу" : "Practice"}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {new Date(s.startedAt).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US")}
                    {" · "}
                    {new Date(s.startedAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}
                  </div>
                </div>

                {/* Badges + arrow — always visible, never shrinks */}
                <div className="flex items-center gap-2 shrink-0">
                  <ScoreBadges
                    correct={s.correctAnswers}
                    wrong={s.wrongAnswers}
                    skipped={s.skippedAnswers}
                  />
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-text mb-2">
            {lang === "ru" ? "История пуста" : lang === "kz" ? "Тарих бос" : "History is empty"}
          </h3>
          <p className="text-text-secondary mb-6">
            {lang === "ru" ? "Вы еще не прошли ни одного теста." : lang === "kz" ? "Сіз әлі ешқандай тест тапсырмадыңыз." : "You haven't taken any tests yet."}
          </p>
          <button
            onClick={() => router.push("/tests")}
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            {t("test.start", lang)}
          </button>
        </div>
      )}
    </div>
  );
}
