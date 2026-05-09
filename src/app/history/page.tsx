"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

import { useHistory } from "@/hooks/useHistory";

export default function HistoryPage() {
  const { lang } = useApp();
  const router = useRouter();
  const { sessions, loading, user } = useHistory();

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
                className="flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm ${
                    s.score >= 80 ? "bg-success" : s.score >= 60 ? "bg-primary" : s.score >= 40 ? "bg-warning" : "bg-danger"
                  }`}>
                    {s.score}%
                  </div>
                  <div>
                    <div className="text-base font-bold text-text group-hover:text-primary transition-colors">
                      {s.testType === "diagnostic"
                        ? lang === "ru" ? "Диагностический тест" : lang === "kz" ? "Диагностикалық тест" : "Diagnostic Test"
                        : s.testType === "full"
                        ? lang === "ru" ? "Полный ЕНТ" : lang === "kz" ? "Толық ЕНТ" : "Full ENT"
                        : lang === "ru" ? "Практика" : lang === "kz" ? "Жаттығу" : "Practice"}
                    </div>
                    <div className="text-sm text-text-secondary flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(s.startedAt).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {new Date(s.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-3 text-sm font-medium">
                    <span className="text-success bg-success/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success inline-block"></span>
                      {s.correctAnswers}
                    </span>
                    <span className="text-danger bg-danger/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-danger inline-block"></span>
                      {s.wrongAnswers}
                    </span>
                    <span className="text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400 inline-block"></span>
                      {s.skippedAnswers}
                    </span>
                  </div>
                  
                  <div className="text-gray-400 group-hover:text-primary transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
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
