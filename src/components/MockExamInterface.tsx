"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "./Providers";
import { Spinner } from "./Spinner";

interface MockExamInterfaceProps {
  sessionId: string;
}

export function MockExamInterface({ sessionId }: MockExamInterfaceProps) {
  const { lang, authHeaders } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSubjectIdx, setCurrentSubjectIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/mock/${sessionId}`, { headers: authHeaders() });
        const json = await res.json();
        setData(json);
        setRemainingMs(json.remainingMs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId]);

  // Timer logic
  useEffect(() => {
    if (remainingMs <= 0) return;
    const interval = setInterval(() => {
      setRemainingMs(prev => {
        if (prev <= 1000) {
          clearInterval(interval);
          handleFinish(); // Auto-finish
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingMs]);

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = async (answerId: number, optionIdx: number) => {
    // Update local state first
    const newData = { ...data };
    const currentSubject = newData.subjects[currentSubjectIdx];
    const question = currentSubject.questions[currentQuestionIdx];
    question.selectedAnswer = optionIdx;
    question.isSkipped = false;
    setData(newData);

    // Save to DB
    setSaving(true);
    try {
      await fetch(`/api/test/answer`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ answerId, selectedAnswer: optionIdx }),
      });
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    if (!confirm(lang === "ru" ? "Вы уверены, что хотите завершить экзамен?" : "Емтиханды аяқтағыңыз келе ме?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/test/submit`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        window.location.href = `/mock-exam/${sessionId}/results`;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!data.subjects || !Array.isArray(data.subjects) || data.subjects.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center">
        <div className="text-5xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-text mb-4">
          {lang === "ru" ? "Ошибка загрузки экзамена" : "Емтиханды жүктеу қатесі"}
        </h2>
        <p className="text-text-secondary mb-8">
          {lang === "ru" 
            ? "Данные экзамена не найдены. Пожалуйста, попробуйте начать новый экзамен."
            : "Емтихан деректері табылмады. Жаңа емтиханды бастап көріңіз."}
        </p>
        <button onClick={() => window.location.href = "/mock-exam"} className="bg-primary text-white px-8 py-3 rounded-xl font-bold">
          {lang === "ru" ? "Вернуться назад" : "Артқа қайту"}
        </button>
      </div>
    );
  }

  const currentSubject = data.subjects[currentSubjectIdx];
  if (!currentSubject?.questions || currentSubject.questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center">
        <div className="text-5xl mb-6">📝</div>
        <h2 className="text-2xl font-bold text-text mb-4">
          {lang === "ru" ? "В этом предмете нет вопросов" : "Бұл пәнде сұрақтар жоқ"}
        </h2>
        <p className="text-text-secondary mb-8">
          {lang === "ru" 
            ? `Для предмета "${currentSubject.nameRu}" вопросы еще не добавлены.`
            : `"${currentSubject.nameKz}" пәні үшін сұрақтар әлі қосылмаған.`}
        </p>
        <div className="flex flex-col gap-2">
            {data.subjects.map((s: any, idx: number) => (
                <button key={s.id} onClick={() => setCurrentSubjectIdx(idx)} className="text-primary font-bold">
                    {lang === "ru" ? `Перейти к ${s.nameRu}` : `${s.nameKz} пәніне өту`}
                </button>
            ))}
        </div>
      </div>
    );
  }

  const currentQuestion = currentSubject.questions[currentQuestionIdx];
  if (!currentQuestion) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center">
        <h2 className="text-xl font-bold text-text mb-4">{lang === "ru" ? "Вопрос не найден" : "Сұрақ табылмады"}</h2>
        <button onClick={() => setCurrentQuestionIdx(0)} className="bg-primary text-white px-6 py-2 rounded-xl">
           {lang === "ru" ? "Начать с начала" : "Басынан бастау"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="font-black text-xl text-primary">ENT PREP <span className="text-text-secondary font-medium">MOCK</span></div>
          <div className="h-6 w-px bg-border hidden md:block" />
          <div className="text-sm font-bold text-text-secondary hidden md:block uppercase tracking-widest">
            {lang === "ru" ? currentSubject.nameRu : currentSubject.nameKz}
          </div>
        </div>

        <div className={`px-6 py-2 rounded-2xl font-mono text-xl font-black ${remainingMs < 600000 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-100 text-text"}`}>
          {formatTime(remainingMs)}
        </div>

        <button 
          onClick={handleFinish}
          className="px-6 py-2 bg-text text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
        >
          {lang === "ru" ? "Завершить" : "Аяқтау"}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-80 bg-white border-r border-border hidden lg:flex flex-col">
          <div className="p-4 border-b border-border space-y-2">
            {data.subjects.map((sub: any, idx: number) => (
              <button
                key={sub.id}
                onClick={() => { setCurrentSubjectIdx(idx); setCurrentQuestionIdx(0); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  currentSubjectIdx === idx ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-secondary hover:bg-slate-50"
                }`}
              >
                {lang === "ru" ? sub.nameRu : sub.nameKz}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {currentSubject.questions.map((q: any, idx: number) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`h-10 rounded-lg text-xs font-bold transition-all border ${
                    currentQuestionIdx === idx 
                      ? "bg-primary text-white border-primary" 
                      : q.selectedAnswer !== null 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                        : "bg-white text-text-secondary border-border"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div className="text-sm font-bold text-text-secondary uppercase tracking-widest">
                {lang === "ru" ? "Вопрос" : "Сұрақ"} {currentQuestionIdx + 1} / {currentSubject.questions.length}
              </div>
              {saving && <div className="text-[10px] font-bold text-primary animate-pulse uppercase">Сохранение...</div>}
            </div>

            <h2 className="text-2xl font-bold text-text mb-10 leading-tight">
              {lang === "ru" ? currentQuestion.questionTextRu : lang === "kz" ? currentQuestion.questionTextKz : currentQuestion.questionTextEn}
            </h2>

            <div className="space-y-4">
              {["optionsRu", "optionsKz", "optionsEn"].filter(k => k.endsWith(lang === "ru" ? "Ru" : "Kz")).map(key => (
                (currentQuestion[key] as any[]).map((option, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectAnswer(currentQuestion.answerId, oIdx)}
                    className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                      currentQuestion.selectedAnswer === oIdx
                        ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                      currentQuestion.selectedAnswer === oIdx ? "bg-primary text-white border-primary" : "border-border text-text-secondary"
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </div>
                    <span className="font-medium text-text">{option}</span>
                  </button>
                ))
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-8 border-t border-border">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                className="px-8 py-3 rounded-xl font-bold text-sm border border-border hover:bg-white transition-all disabled:opacity-30"
              >
                ← {lang === "ru" ? "Назад" : "Артқа"}
              </button>
              <button
                disabled={currentQuestionIdx === currentSubject.questions.length - 1}
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all disabled:opacity-30 shadow-lg shadow-primary/20"
              >
                {lang === "ru" ? "Далее" : "Келесі"} →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
