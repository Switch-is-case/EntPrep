"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "./Providers";
import { Spinner } from "./Spinner";
import { LatexText } from "./LatexText";

interface MockExamInterfaceProps {
  sessionId: string;
}

import { QuestionNavigator } from "./exam/QuestionNavigator";
import { QuestionCard } from "./exam/QuestionCard";
import { AiExplanationBlock } from "./exam/AiExplanationBlock";

interface MockExamInterfaceProps {
  sessionId: string;
}

import { type Question, type TestSession } from "@/types/exam";

interface ExamData {
  session: TestSession;
  subjects: {
    id: number;
    nameRu: string;
    nameKz: string;
    questions: Question[];
  }[];
  remainingMs: number;
}

export function MockExamInterface({ sessionId }: MockExamInterfaceProps) {
  const { lang, authHeaders } = useApp();
  const [data, setData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSubjectIdx, setCurrentSubjectIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [saving, setSaving] = useState(false);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [loadingExplanations, setLoadingExplanations] = useState<Record<number, boolean>>({});

  const isDiagnostic = data?.session?.testType === "diagnostic";
  const isPractice = data?.session?.testType === "practice";
  const showFeedback = isDiagnostic || isPractice;

  const handleFinish = useCallback(async () => {
    if (!confirm(lang === "ru" ? "Вы уверены, что хотите завершить?" : "Аяқтағыңыз келе ме?")) return;
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
  }, [lang, sessionId, authHeaders]);

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
  }, [sessionId, authHeaders]);

  // Timer logic
  useEffect(() => {
    if (remainingMs <= 0 || isPractice) return;
    const interval = setInterval(() => {
      setRemainingMs(prev => {
        if (prev <= 1000) {
          clearInterval(interval);
          handleFinish();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingMs, handleFinish, isPractice]);

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const fetchExplanation = async (question: any) => {
    if (explanations[question.id] || loadingExplanations[question.id]) return;
    
    setLoadingExplanations(prev => ({ ...prev, [question.id]: true }));
    try {
      const res = await fetch("/api/test/explain", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          questionId: question.id,
          questionText: lang === "ru" ? question.questionTextRu : question.questionTextKz,
          options: lang === "ru" ? question.optionsRu : question.optionsKz,
          correctAnswer: question.correctAnswer,
          userAnswer: question.selectedAnswer,
          subject: question.subject,
          lang
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setExplanations(prev => ({ ...prev, [question.id]: result.explanation }));
      }
    } catch (err) {
      console.error("Failed to fetch explanation:", err);
    } finally {
      setLoadingExplanations(prev => ({ ...prev, [question.id]: false }));
    }
  };

  const handleSelectAnswer = async (answerId: number, optionIdx: number) => {
    if (!data) return;
    const currentSubject = data.subjects[currentSubjectIdx];
    const question = currentSubject.questions[currentQuestionIdx];
    
    if (showFeedback && question.selectedAnswer !== null) return;

    const newData = { ...data };
    newData.subjects[currentSubjectIdx].questions[currentQuestionIdx].selectedAnswer = optionIdx;
    newData.subjects[currentSubjectIdx].questions[currentQuestionIdx].isSkipped = false;
    setData(newData);

    setSaving(true);
    try {
      await fetch(`/api/test/answer`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ answerId, selectedAnswer: optionIdx }),
      });
      
      if (showFeedback) {
        fetchExplanation(newData.subjects[currentSubjectIdx].questions[currentQuestionIdx]);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!data.subjects || !Array.isArray(data.subjects) || data.subjects.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center">
        <div className="text-5xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-text mb-4">
          {lang === "ru" ? "Ошибка загрузки" : "Жүктеу қатесі"}
        </h2>
        <button onClick={() => window.location.href = "/tests"} className="bg-primary text-white px-8 py-3 rounded-xl font-bold">
          {lang === "ru" ? "Вернуться назад" : "Артқа қайту"}
        </button>
      </div>
    );
  }

  const currentSubject = data.subjects[currentSubjectIdx];
  const currentQuestion = currentSubject?.questions?.[currentQuestionIdx];

  if (!currentQuestion) return null;

  const accentBg = isDiagnostic ? "bg-blue-600" : isPractice ? "bg-emerald-600" : "bg-primary";
  const accentText = isDiagnostic ? "text-blue-600" : isPractice ? "text-emerald-600" : "text-primary";
  const accentShadow = isDiagnostic ? "shadow-blue-600/20" : isPractice ? "shadow-emerald-600/20" : "shadow-primary/20";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className={`font-black text-xl ${accentText} flex items-center gap-2 uppercase`}>
            {isDiagnostic ? "Diagnostic" : isPractice ? "Practice" : "Mock Exam"}
          </div>
          <div className="h-6 w-px bg-border hidden md:block" />
          <div className="text-sm font-bold text-text-secondary hidden md:block uppercase tracking-widest">
            {lang === "ru" ? currentSubject.nameRu : currentSubject.nameKz}
          </div>
        </div>

        {!isPractice && (
          <div className={`px-6 py-2 rounded-2xl font-mono text-xl font-black ${remainingMs < 300000 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-100 text-text"}`}>
            {formatTime(remainingMs)}
          </div>
        )}

        <button 
          onClick={handleFinish}
          className={`px-6 py-2 ${accentBg} text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-lg ${accentShadow}`}
        >
          {lang === "ru" ? "Завершить" : "Аяқтау"}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-white border-r border-border hidden lg:flex flex-col">
          <div className="p-4 border-b border-border space-y-2">
            {data.subjects.map((sub: any, idx: number) => (
              <button
                key={sub.id}
                onClick={() => { setCurrentSubjectIdx(idx); setCurrentQuestionIdx(0); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  currentSubjectIdx === idx ? `${accentBg} text-white shadow-lg ${accentShadow}` : "text-text-secondary hover:bg-slate-50"
                }`}
              >
                {lang === "ru" ? sub.nameRu : sub.nameKz}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <QuestionNavigator
              questions={currentSubject.questions}
              currentIndex={currentQuestionIdx}
              onSelectIndex={setCurrentQuestionIdx}
              accentBg={accentBg}
              showFeedback={showFeedback}
            />
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 md:p-12 pb-32">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div className="text-sm font-bold text-text-secondary uppercase tracking-widest">
                {lang === "ru" ? "Вопрос" : "Сұрақ"} {currentQuestionIdx + 1} / {currentSubject.questions.length}
              </div>
              {saving && <div className="text-[10px] font-bold text-primary animate-pulse uppercase">Сохранение...</div>}
            </div>

            <QuestionCard
              question={currentQuestion}
              lang={lang}
              onSelectAnswer={(oIdx) => handleSelectAnswer(currentQuestion.answerId!, oIdx)}
              showFeedback={showFeedback}
              isReadOnly={showFeedback && currentQuestion.selectedAnswer !== null}
            />

            <AiExplanationBlock
              lang={lang}
              explanation={explanations[currentQuestion.id]}
              loading={loadingExplanations[currentQuestion.id] || false}
            />

            <div className="flex justify-between mt-12 pt-8 border-t border-border">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                className="px-8 py-3 rounded-xl font-bold text-sm border border-border hover:bg-white transition-all disabled:opacity-30"
              >
                ← {lang === "ru" ? "Назад" : "Артқа"}
              </button>
              
              {showFeedback && currentQuestion.selectedAnswer === null ? (
                 <div className="text-xs font-black text-text-secondary uppercase tracking-widest flex items-center">
                    {lang === "ru" ? "Выберите ответ" : "Жауапты таңдаңыз"}
                 </div>
              ) : (
                <button
                  disabled={currentQuestionIdx === currentSubject.questions.length - 1}
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                  className={`px-8 py-3 ${accentBg} text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-30 shadow-lg ${accentShadow}`}
                >
                  {lang === "ru" ? "Далее" : "Келесі"} →
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
