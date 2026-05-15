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
import { IDontKnowButton } from "./IDontKnowButton";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isDiagnostic = data?.session?.testType === "diagnostic";
  const isPractice = data?.session?.testType === "practice";
  // We no longer show feedback (correct/wrong colors or AI explanations) during the active test mode.
  const showFeedback = false;

  const submitTest = async () => {
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

  const handleFinishClick = useCallback(() => {
    if (!data) return;
    let skippedCount = 0;
    let unansweredCount = 0;

    data.subjects.forEach(sub => {
      sub.questions.forEach(q => {
        const ans = q.selectedAnswer !== undefined ? q.selectedAnswer : q.userAnswer;
        if (q.isSkipped) {
          skippedCount++;
        } else if (ans === null || ans === undefined) {
          unansweredCount++;
        }
      });
    });

    if (skippedCount > 0 || unansweredCount > 0) {
      setShowConfirmModal(true);
    } else {
      submitTest();
    }
  }, [data, sessionId, authHeaders]);

  const handleFinish = useCallback(() => {
    submitTest();
  }, [sessionId, authHeaders]);

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

  const handleSelectAnswer = async (answerId: number, optionIdx: number) => {
    if (!data) return;
    const currentSubject = data.subjects[currentSubjectIdx];
    const question = currentSubject.questions[currentQuestionIdx];
    
    // Allow re-selection since showFeedback is false
    const newData = { ...data };
    newData.subjects[currentSubjectIdx].questions[currentQuestionIdx].selectedAnswer = optionIdx;
    newData.subjects[currentSubjectIdx].questions[currentQuestionIdx].isSkipped = false;
    setData(newData);

    setSaving(true);
    try {
      await fetch(`/api/test/answer`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ answerId, selectedAnswer: optionIdx, isSkipped: false }),
      });
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkipQuestion = async (answerId: number) => {
    if (!data) return;
    const currentSubject = data.subjects[currentSubjectIdx];
    const question = currentSubject.questions[currentQuestionIdx];
    
    const isCurrentlySkipped = question.isSkipped;
    const newSkippedState = !isCurrentlySkipped;

    const newData = { ...data };
    newData.subjects[currentSubjectIdx].questions[currentQuestionIdx].selectedAnswer = null;
    newData.subjects[currentSubjectIdx].questions[currentQuestionIdx].isSkipped = newSkippedState;
    setData(newData);

    setSaving(true);
    try {
      await fetch(`/api/test/answer`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ answerId, selectedAnswer: null, isSkipped: newSkippedState }),
      });
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
            onClick={handleFinishClick}
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
            if (q.isSkipped) {
              btnClass = "bg-amber-50 text-amber-600 border border-amber-400";
            } else if (hasAnswered) {
              btnClass = "bg-primary text-white";
            } else {
              btnClass = "bg-slate-100 text-slate-500";
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
              showFeedback={false}
              isReadOnly={false}
            />

            <IDontKnowButton
              isSkipped={!!currentQuestion.isSkipped}
              onToggle={() => handleSkipQuestion(currentQuestion.answerId!)}
              lang={lang}
            />

            <div className="flex justify-between mt-12 pt-8 border-t border-slate-200">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                className="px-8 py-3 rounded-xl font-bold text-sm border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-30"
              >
                ← {t("common.back", lang)}
              </button>
              
              <button
                disabled={currentQuestionIdx === currentSubject.questions.length - 1}
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                className={`px-8 py-3 ${accentBg} text-white rounded-xl font-bold text-sm transition-colors hover:bg-opacity-90 disabled:opacity-30`}
              >
                {t("common.next", lang)} →
              </button>
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full relative z-10 shadow-xl"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                {t("exam.submitConfirm.title", lang)}
              </h3>
              <p className="text-slate-600 text-center mb-8">
                {t("exam.submitConfirm.message", lang).replace("{count}", String(
                  data.subjects.reduce((sum, sub) => sum + sub.questions.filter(q => q.isSkipped || (q.selectedAnswer === null && q.userAnswer === null)).length, 0)
                ))}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  {t("exam.submitConfirm.cancel", lang)}
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    submitTest();
                  }}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors"
                >
                  {t("exam.submitConfirm.confirm", lang)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
