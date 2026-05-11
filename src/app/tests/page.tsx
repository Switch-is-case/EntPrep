"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp, type User } from "@/components/Providers";
import { t, type Lang } from "@/lib/i18n";
import { Spinner } from "@/components/Spinner";
import { motion, AnimatePresence } from "framer-motion";

interface Combination {
  id: number;
  subject1: { nameRu: string; nameKz: string; nameEn: string };
  subject2: { nameRu: string; nameKz: string; nameEn: string };
}

export default function TestsPage() {
  const { lang, user, ready, authHeaders } = useApp();
  const router = useRouter();
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (ready && user) {
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
  if (!user) {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }

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
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      btnColor: "bg-blue-600",
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
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      btnColor: "bg-purple-600",
      mode: "mock" as const,
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text mb-2">
          {t("nav.tests", lang)}
        </h1>
        <p className="text-text-secondary">
          {lang === "ru" 
            ? "Выберите режим тестирования для оценки своих знаний."
            : "Біліміңізді тексеру үшін тест түрін таңдаңыз."}
        </p>
      </div>

      {/* Subject Combination Selector */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-5 bg-bg border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-text">
                {lang === "ru" ? "Профильные предметы" : "Профильдік пәндер"}
              </h2>
            </div>
            
            <button 
              onClick={() => setShowComboPicker(!showComboPicker)}
              className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-border hover:border-primary transition-all text-sm font-semibold"
            >
              {currentCombo ? (
                <span>
                  {lang === "ru" ? currentCombo.subject1.nameRu : currentCombo.subject1.nameKz} + {lang === "ru" ? currentCombo.subject2.nameRu : currentCombo.subject2.nameKz}
                </span>
              ) : (
                <span className="text-danger">{lang === "ru" ? "Не выбрано" : "Таңдалмаған"}</span>
              )}
              <span className={`text-[10px] transition-transform ${showComboPicker ? "rotate-180" : ""}`}>▼</span>
            </button>
          </div>

          <AnimatePresence>
            {showComboPicker && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden bg-white"
              >
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {combinations.map((combo) => (
                    <button
                      key={combo.id}
                      onClick={() => { setSelectedComboId(combo.id); setShowComboPicker(false); }}
                      className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-center min-h-[70px] ${
                        selectedComboId === combo.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="text-sm font-bold text-text">
                        {lang === "ru" ? combo.subject1.nameRu : combo.subject1.nameKz} + {lang === "ru" ? combo.subject2.nameRu : combo.subject2.nameKz}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {testOptions.map((opt) => (
          <div 
            key={opt.id}
            className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col"
          >
            <div className={`w-12 h-12 rounded-xl ${opt.bgColor} ${opt.textColor} flex items-center justify-center mb-6`}>
              {opt.icon}
            </div>

            <h3 className="text-xl font-bold text-text mb-2">
              {opt.title[lang as "ru" | "kz" | "en"]}
            </h3>
            
            <p className="text-text-secondary text-sm mb-6 flex-1">
              {opt.description[lang as "ru" | "kz" | "en"]}
            </p>

            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-6">
               {opt.stats[lang as "ru" | "kz" | "en"]}
            </div>

            <button 
              onClick={() => startTest(opt.mode)} 
              disabled={!selectedComboId || !!loading}
              className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                loading === opt.id
                ? "bg-gray-100 text-gray-400"
                : `${opt.btnColor} text-white hover:brightness-110 shadow-sm`
              } disabled:opacity-50`}
            >
              {loading === opt.id ? <Spinner size="sm" /> : (
                <>
                  <span>{lang === "ru" ? "Начать тест" : "Тестті бастау"}</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
