"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { Spinner } from "@/components/Spinner";

export default function TestsPage() {
  const { lang, user, ready, authHeaders } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  if (!ready) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!user) {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }

  const startTest = async (mode: "diagnostic" | "mock") => {
    setLoading(mode);
    try {
      const res = await fetch("/api/mock/start", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (res.ok && data.sessionId) {
        router.push(`/mock-exam/${data.sessionId}`);
      } else {
        alert(data.error || "Failed to start test");
        setLoading(null);
      }
    } catch (err) {
      console.error(err);
      setLoading(null);
    }
  };

  const hasProfile = user.targetCombinationId;

  const testOptions = [
    {
      id: "diagnostic",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: { ru: "Диагностический тест", kz: "Диагностикалық тест", en: "Diagnostic Test" },
      description: { 
        ru: "Быстрая проверка уровня знаний по всем предметам",
        kz: "Барлық пәндер бойынша білім деңгейін тез тексеру",
        en: "Quick assessment across all subjects"
      },
      stats: { ru: "25 вопросов • 45 мин", kz: "25 сұрақ • 45 мин", en: "25 questions • 45 min" },
      color: "from-blue-500 to-cyan-600",
      mode: "diagnostic" as const,
    },
    {
      id: "mock",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: { ru: "Пробный ЕНТ", kz: "Сынақ ҰБТ", en: "Full Mock Exam" },
      description: { 
        ru: "Полная симуляция настоящего ЕНТ (140 вопросов)",
        kz: "Шынайы ҰБТ-ның толық симуляциясы (140 сұрақ)",
        en: "Full simulation of real ENT (140 questions)"
      },
      stats: { ru: "140 вопросов • 4 часа", kz: "140 сұрақ • 4 сағат", en: "140 questions • 4 hours" },
      color: "from-purple-600 to-indigo-700",
      mode: "mock" as const,
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-text mb-4">
          {t("nav.tests", lang)}
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          {lang === "ru" 
            ? "Выберите режим тестирования, чтобы оценить свои силы и получить персональный план обучения."
            : "Біліміңізді тексеріп, жеке оқу жоспарын алу үшін тест түрін таңдаңыз."}
        </p>
      </div>

      {!hasProfile && (
        <div className="bg-warning/10 border-2 border-dashed border-warning/30 rounded-3xl p-6 mb-10 flex items-center gap-4 animate-pulse">
          <div className="w-12 h-12 bg-warning/20 text-warning rounded-2xl flex items-center justify-center shrink-0">⚠️</div>
          <div className="flex-1">
            <p className="font-bold text-text mb-1">{t("common.selectProfile", lang)}</p>
            <button onClick={() => router.push("/profile")} className="text-primary font-black hover:underline text-sm uppercase tracking-wider">
              {t("nav.profile", lang)} →
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {testOptions.map((opt) => (
          <div 
            key={opt.id}
            className="group bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${opt.color} opacity-5 -mr-10 -mt-10 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`} />
            
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${opt.color} text-white flex items-center justify-center mb-8 shadow-lg shadow-primary/20`}>
              {opt.icon}
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-4">
              {opt.title[lang as "ru" | "kz" | "en"]}
            </h3>
            
            <p className="text-gray-600 mb-8 leading-relaxed font-medium">
              {opt.description[lang as "ru" | "kz" | "en"]}
            </p>

            <div className="flex items-center gap-4 mb-10 text-sm font-black text-gray-400 uppercase tracking-widest">
               {opt.stats[lang as "ru" | "kz" | "en"]}
            </div>

            <button 
              onClick={() => startTest(opt.mode)} 
              disabled={!hasProfile || !!loading}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${
                loading === opt.id
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : `bg-gradient-to-r ${opt.color} text-white shadow-xl hover:shadow-2xl hover:-translate-y-1`
              } disabled:opacity-50 disabled:hover:translate-y-0`}
            >
              {loading === opt.id ? <Spinner size="sm" /> : (
                <>
                  <span>{lang === "ru" ? "Начать" : "Бастау"}</span>
                  <span className="opacity-50 text-base">→</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
