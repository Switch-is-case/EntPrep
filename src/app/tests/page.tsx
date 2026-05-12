"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp, type User } from "@/components/Providers";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { t, type Lang } from "@/lib/i18n";
import { Spinner } from "@/components/Spinner";
import { motion, AnimatePresence } from "framer-motion";

interface Combination {
  id: number;
  subject1: { nameRu: string; nameKz: string; nameEn: string };
  subject2: { nameRu: string; nameKz: string; nameEn: string };
}

export default function TestsPage() {
  const { lang, user, ready, authHeaders } = useRequireAuth({ requireVerified: true });
  const router = useRouter();
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (ready && user && localStorage.getItem("ent-token")) {
      fetch("/api/combinations", { headers: authHeaders() })
        .then(res => res.json())
        .then(data => {
          if (isMounted) {
            setCombinations(data);
            setLoadingData(false);
          }
        })
        .catch(err => {
          console.error("Failed to fetch combinations", err);
          if (isMounted) setLoadingData(false);
        });
    }
    return () => { isMounted = false; };
  }, [ready, user, authHeaders]);

  if (!ready || (user && loadingData)) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!user) return null;

  return (
    <TestsForm 
      user={user} 
      lang={lang} 
      combinations={combinations} 
      authHeaders={authHeaders} 
    />
  );
}

function TestsForm({ user, lang, combinations, authHeaders }: {
  user: User;
  lang: Lang;
  combinations: Combination[];
  authHeaders: () => Record<string, string>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedComboId, setSelectedComboId] = useState<number | null>(user.targetCombinationId || null);
  const [showComboPicker, setShowComboPicker] = useState(false);

  const startTest = async (mode: "diagnostic" | "mock") => {
    if (!selectedComboId) {
      alert(t("common.selectProfile", lang));
      return;
    }

    setLoading(mode);
    try {
      const res = await fetch("/api/mock/start", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ mode, combinationId: selectedComboId }),
      });
      const data = await res.json();
      if (res.ok && data.sessionId) {
        router.push(`/mock-exam/${data.sessionId}`);
      } else if (res.status === 403 && data.error === "EMAIL_NOT_VERIFIED") {
        alert(t("verifyEmail.required.testBlocked", lang));
        router.push("/verify-email-pending");
      } else {
        alert(data.error || "Failed to start test");
        setLoading(null);
      }
    } catch (err) {
      console.error(err);
      setLoading(null);
    }
  };

  const currentCombo = combinations.find(c => c.id === selectedComboId);

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
      mode: "mock" as const,
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
          {t("nav.tests", lang)}
        </h1>
        <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">
          {lang === "ru" 
            ? "Выберите режим тестирования для оценки своих знаний."
            : "Біліміңізді тексеру үшін тест түрін таңдаңыз."}
        </p>
      </div>

      {/* Subject Combination Selector */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                {lang === "ru" ? "Профильные предметы" : "Профильдік пәндер"}
              </h2>
            </div>
            
            <button 
              onClick={() => setShowComboPicker(!showComboPicker)}
              className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200 hover:border-primary transition-colors text-sm font-bold text-slate-700"
            >
              {currentCombo ? (
                <span>
                  {lang === "ru" ? currentCombo.subject1.nameRu : currentCombo.subject1.nameKz} + {lang === "ru" ? currentCombo.subject2.nameRu : currentCombo.subject2.nameKz}
                </span>
              ) : (
                <span className="text-red-500">{lang === "ru" ? "Не выбрано" : "Таңдалмаған"}</span>
              )}
              <span className={`text-[10px] transition-transform ${showComboPicker ? "rotate-180" : ""}`}>▼</span>
            </button>
          </div>

          {showComboPicker && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-slate-100">
              {combinations.map((combo) => (
                <button
                  key={combo.id}
                  onClick={() => { setSelectedComboId(combo.id); setShowComboPicker(false); }}
                  className={`p-4 rounded-xl border transition-colors text-left flex flex-col justify-center min-h-[70px] ${
                    selectedComboId === combo.id
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 hover:border-primary/40"
                  }`}
                >
                  <div className="text-sm font-bold text-slate-800">
                    {lang === "ru" ? combo.subject1.nameRu : combo.subject1.nameKz} + {lang === "ru" ? combo.subject2.nameRu : combo.subject2.nameKz}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {testOptions.map((opt) => (
          <div 
            key={opt.id}
            className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 flex flex-col"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              {opt.icon}
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
              {opt.title[lang as "ru" | "kz" | "en"]}
            </h3>
            
            <p className="text-slate-600 text-sm mb-8 flex-1 leading-relaxed font-medium">
              {opt.description[lang as "ru" | "kz" | "en"]}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8 w-fit">
               {opt.stats[lang as "ru" | "kz" | "en"]}
            </div>

            <button 
              onClick={() => startTest(opt.mode)} 
              disabled={!selectedComboId || !!loading}
              className={`w-full py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                loading === opt.id
                ? "bg-slate-100 text-slate-400"
                : "bg-primary text-white hover:bg-primary-dark"
              } disabled:opacity-50`}
            >
              {loading === opt.id ? <Spinner size="sm" /> : (
                <>
                  <span>{lang === "ru" ? "Начать тест" : "Тестті бастау"}</span>
                  <span className="text-xl">→</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
