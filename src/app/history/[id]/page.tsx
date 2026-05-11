"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { useHistoryReview } from "@/hooks/useHistoryReview";
import { Spinner } from "@/components/Spinner";
import { QuestionNavigator } from "@/components/exam/QuestionNavigator";
import { QuestionCard } from "@/components/exam/QuestionCard";
import { AiExplanationBlock } from "@/components/exam/AiExplanationBlock";
import { type Question } from "@/types/exam";

export default function HistoryReviewPage() {
  const {
    lang,
    user,
    session,
    questions,
    loading,
    currentIndex,
    setCurrentIndex,
    router,
  } = useHistoryReview();

  const { authHeaders } = useApp();
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [loadingExplanations, setLoadingExplanations] = useState<Record<number, boolean>>({});

  const fetchExplanation = useCallback(async (question: Question) => {
    if (explanations[question.id] || loadingExplanations[question.id]) return;
    
    setLoadingExplanations(prev => ({ ...prev, [question.id]: true }));
    try {
      const langKey = lang.charAt(0).toUpperCase() + lang.slice(1);
      const textKey = `questionText${langKey}` as "questionTextRu" | "questionTextKz" | "questionTextEn";
      const optionsKey = `options${langKey}` as "optionsRu" | "optionsKz" | "optionsEn";
      
      const res = await fetch("/api/test/explain", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          questionId: question.id,
          questionText: question[textKey] || question.questionTextRu,
          options: question[optionsKey] || question.optionsRu,
          correctAnswer: question.correctAnswer,
          userAnswer: question.userAnswer,
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
  }, [lang, authHeaders, explanations, loadingExplanations]);

  const questionsBySubject = useMemo(() => {
    if (!session?.subjects || !Array.isArray(session.subjects)) {
      return [{ id: 0, name: "Test", questions }];
    }
    
    const map = new Map<number, Question[]>();
    questions.forEach(q => {
      const sid = q.subjectId || 0;
      if (!map.has(sid)) map.set(sid, []);
      map.get(sid)!.push(q);
    });
    
    return session.subjects.map((s: any) => ({
      id: s.id,
      name: lang === "ru" ? (s.nameRu || s.slug) : lang === "kz" ? (s.nameKz || s.slug) : (s.nameEn || s.nameRu || s.slug || "—"),
      questions: map.get(s.id) || []
    })).filter(s => s.questions.length > 0);
  }, [questions, session, lang]);

  const [activeSubjectId, setActiveSubjectId] = useState<number | null>(null);

  useEffect(() => {
    if (!activeSubjectId && questionsBySubject.length > 0) {
      setActiveSubjectId(questionsBySubject[0].id);
    }
  }, [questionsBySubject, activeSubjectId]);

  useEffect(() => {
    const currentQ = questions[currentIndex];
    if (currentQ && currentQ.subjectId !== activeSubjectId) {
      setActiveSubjectId(currentQ.subjectId);
    }
  }, [currentIndex, questions, activeSubjectId]);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const activeSubject = questionsBySubject.find(s => s.id === activeSubjectId);
  const visibleQuestions = activeSubject?.questions ?? [];
  const currentIndexInSubject = visibleQuestions.findIndex(q => q.id === currentQ.id);

  const handleSelectIndex = (idxInSubject: number) => {
    const targetQ = visibleQuestions[idxInSubject];
    const globalIdx = questions.findIndex(q => q.id === targetQ.id);
    if (globalIdx !== -1) setCurrentIndex(globalIdx);
  };

  const accentBg = "bg-primary";
  const testTypeLabel = session.testType === "diagnostic" ? "Diagnostic" : session.testType === "practice" ? "Practice" : "Mock Exam";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header matching Test UI */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="font-black text-xl text-primary flex items-center gap-2 uppercase">
            {testTypeLabel}
          </div>
          <div className="h-6 w-px bg-border hidden md:block" />
          <div className="text-sm font-bold text-text-secondary hidden md:block uppercase tracking-widest">
            {activeSubject?.name || currentQ.subject}
          </div>
        </div>

        <button 
          onClick={() => router.push("/history")}
          className="px-5 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-colors"
        >
          {lang === "ru" ? "← К истории" : lang === "kz" ? "← Тарихқа" : "← To History"}
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar matching Test UI */}
        <aside className="w-full md:w-80 bg-white border-r border-border flex flex-col md:h-[calc(100vh-4.5rem)]">
          {/* Stats Section preserved as requested */}
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-base font-bold text-text">
                {lang === "ru" ? "Обзор теста" : lang === "kz" ? "Тестті шолу" : "Test Review"}
              </h2>
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white ${
                session.score >= 80 ? "bg-emerald-500" : session.score >= 60 ? "bg-primary" : session.score >= 40 ? "bg-amber-500" : "bg-rose-500"
              }`}>
                {session.score}%
              </div>
            </div>
            
            {/* Legend matching Test UI colors */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                {lang === "ru" ? "Правильно" : lang === "kz" ? "Дұрыс" : "Correct"}
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                {lang === "ru" ? "Неправильно" : lang === "kz" ? "Қате" : "Incorrect"}
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                {lang === "ru" ? "Пропущено" : lang === "kz" ? "Өткізілді" : "Skipped"}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            {/* Subject Tabs - horizontally scrollable on mobile, vertical on desktop */}
            {questionsBySubject.length > 1 && (
              <div className="flex overflow-x-auto md:flex-col gap-1 mb-6 pb-2 md:pb-0 shrink-0 scrollbar-hide">
                {questionsBySubject.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      setActiveSubjectId(subject.id);
                      // Auto-select first question of subject
                      const firstQ = subject.questions[0];
                      const globalIdx = questions.findIndex(q => q.id === firstQ.id);
                      if (globalIdx !== -1) setCurrentIndex(globalIdx);
                    }}
                    className={`whitespace-nowrap text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                      activeSubjectId === subject.id
                        ? "bg-primary text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            )}

            <QuestionNavigator
              questions={visibleQuestions}
              currentIndex={currentIndexInSubject}
              onSelectIndex={handleSelectIndex}
              accentBg={accentBg}
              showFeedback={true}
            />

            <div className="mt-auto pt-8">
              <button 
                onClick={() => router.push("/history")}
                className="w-full px-5 py-3 border border-border text-text-secondary rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                {lang === "ru" ? "← Вернуться к истории" : lang === "kz" ? "← Тарихқа оралу" : "← Back to History"}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content matching Test UI */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 md:h-[calc(100vh-4.5rem)]">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div className="text-sm font-bold text-text-secondary uppercase tracking-widest">
                {t("test.question", lang)} {currentIndex + 1} / {questions.length}
              </div>
              {currentQ.isSkipped && (
                <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-200">
                  {lang === "ru" ? "Пропущено" : lang === "kz" ? "Өткізілді" : "Skipped"}
                </div>
              )}
            </div>

            <QuestionCard
              question={currentQ}
              lang={lang}
              onSelectAnswer={() => {}} // Read-only
              showFeedback={true}
              isReadOnly={true}
            />

            {currentQ.isSkipped && (
               <div className="mt-8 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 text-sm font-bold text-center">
                  {lang === "ru" ? "Вы ответили: «Не знаю»" : lang === "kz" ? "Сіздің жауабыңыз: «Білмеймін»" : "You answered: 'I don't know'"}
               </div>
            )}

            <AiExplanationBlock
              lang={lang as any}
              explanation={explanations[currentQ.id]}
              loading={loadingExplanations[currentQ.id] || false}
              onFetch={() => fetchExplanation(currentQ)}
            />

            {/* Navigation Buttons matching Test UI */}
            <div className="flex justify-between mt-12 pt-8 border-t border-border">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="px-8 py-3 rounded-xl font-bold text-sm border border-border bg-white hover:bg-slate-50 transition-all disabled:opacity-30"
              >
                ← {t("test.prev", lang)}
              </button>
              
              <button
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-30 shadow-lg shadow-primary/20"
              >
                {t("test.next", lang)} →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
