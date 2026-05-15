"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "./Providers";
import { Spinner } from "./Spinner";
import { LatexText } from "./LatexText";
import { t, tSubject } from "@/lib/i18n";

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
    if (!confirm(t("exam.confirmFinish", lang))) return;
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
        
        if (res.status === 403 && json.error === "EMAIL_NOT_VERIFIED") {
          window.location.href = "/verify-email-pending";
          return;
        }
        
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

  const stripRef = useRef<HTMLDivElement>(null);
  const subjectStripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stripRef.current) return;
    const activeButton = stripRef.current.children[currentQuestionIdx] as HTMLElement;
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }, [currentQuestionIdx]);

  useEffect(() => {
    if (!subjectStripRef.current) return;
    const activeSub = subjectStripRef.current.children[currentSubjectIdx] as HTMLElement;
    if (activeSub) {
      activeSub.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }, [currentSubjectIdx]);

  if (loading || !data) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!data.subjects || !Array.isArray(data.subjects) || data.subjects.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center">
        <div className="text-5xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-text mb-4">
          {t("common.loadingError", lang)}
        </h2>
        <button onClick={() => window.location.href = "/tests"} className="bg-primary text-white px-8 py-3 rounded-xl font-bold">
          {t("common.goBack", lang)}
        </button>
      </div>
    );
  }

  const currentSubject = data.subjects[currentSubjectIdx];
  const currentQuestion = currentSubject?.questions?.[currentQuestionIdx];

  if (!currentQuestion) return null;

  const accentBg = isPractice ? "bg-emerald-600" : "bg-primary";
  const accentText = isPractice ? "text-emerald-600" : "text-primary";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-3 md:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <div className={`font-bold text-base md:text-xl ${accentText} flex items-center gap-2 uppercase tracking-tight shrink-0`}>
            {isDiagnostic ? "Diagnostic" : isPractice ? "Practice" : "Mock Exam"}
          </div>
          <div className="h-6 w-px bg-slate-200 hidden md:block" />
          <div className="text-[10px] md:text-sm font-bold text-slate-500 hidden sm:block uppercase tracking-widest truncate">
            {tSubject(currentSubject.nameKz || currentSubject.nameRu || "—", lang)}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {!isPractice && (
            <div className={`px-3 md:px-6 py-1.5 md:py-2 rounded-xl font-mono text-base md:text-xl font-bold ${
              remainingMs < 60000 
                ? "text-red-600 bg-red-50" 
                : remainingMs < 300000 
                ? "text-amber-600 bg-amber-50" 
                : "text-slate-700 bg-slate-100"
            }`}>
              {formatTime(remainingMs)}
            </div>
          )}

          <button 
            onClick={handleFinish}
            className={`px-4 md:px-6 py-1.5 md:py-2 ${accentBg} text-white rounded-xl font-bold text-xs md:text-sm transition-colors hover:bg-opacity-90`}
          >
            {t("exam.finish", lang)}
          </button>
        </div>
      </header>
      
      {/* Mobile Navigation Strip */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-[60px] md:top-[68px] z-40">
        {data.subjects.length > 1 && (
          <div 
            ref={subjectStripRef}
            className="flex gap-2 px-4 py-2 border-b border-slate-100 overflow-x-auto scrollbar-hide"
          >
            {data.subjects.map((sub, idx) => (
              <button
                key={sub.id}
                onClick={() => { setCurrentSubjectIdx(idx); setCurrentQuestionIdx(0); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                  currentSubjectIdx === idx ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tSubject(sub.nameKz || sub.nameRu || "—", lang)}
              </button>
            ))}
          </div>
        )}
        
        <div 
          ref={stripRef}
          className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
        >
          {currentSubject.questions.map((q, idx) => {
            const isSelected = currentQuestionIdx === idx;
            const userAnswer = q.selectedAnswer !== undefined ? q.selectedAnswer : q.userAnswer;
            const hasAnswered = userAnswer !== null && userAnswer !== undefined;
            
            let btnClass = "";
            if (showFeedback) {
              if (q.isSkipped) btnClass = "bg-amber-400 text-white";
              else {
                const isCorrect = q.isCorrect !== undefined ? q.isCorrect : (userAnswer === q.correctAnswer);
                btnClass = isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white";
              }
            } else {
              btnClass = hasAnswered ? "bg-primary text-white" : "bg-slate-100 text-slate-500";
            }

            return (
              <button
                key={q.id ?? idx}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={`flex-shrink-0 w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${btnClass} ${
                  isSelected ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-white border-r border-slate-200 hidden lg:flex flex-col">
          <div className="p-4 border-b border-slate-200 space-y-2">
            {data.subjects.map((sub: any, idx: number) => (
              <button
                key={sub.id}
                onClick={() => { setCurrentSubjectIdx(idx); setCurrentQuestionIdx(0); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                  currentSubjectIdx === idx ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {tSubject(sub.nameKz || sub.nameRu || "—", lang)}
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
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                {t("exam.question", lang)} {currentQuestionIdx + 1} / {currentSubject.questions.length}
              </div>
              {saving && <div className="text-[10px] font-bold text-primary uppercase tracking-wider">Сохранение...</div>}
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

            <div className="flex justify-between mt-12 pt-8 border-t border-slate-200">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                className="px-8 py-3 rounded-xl font-bold text-sm border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-30"
              >
                ← {t("common.back", lang)}
              </button>
              
              {showFeedback && currentQuestion.selectedAnswer === null ? (
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    {t("exam.chooseAnswer", lang)}
                 </div>
              ) : (
                <button
                  disabled={currentQuestionIdx === currentSubject.questions.length - 1}
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                  className={`px-8 py-3 ${accentBg} text-white rounded-xl font-bold text-sm transition-colors hover:bg-opacity-90 disabled:opacity-30`}
                >
                  {t("common.next", lang)} →
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
