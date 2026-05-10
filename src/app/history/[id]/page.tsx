"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { useHistoryReview } from "@/hooks/useHistoryReview";
import { Spinner } from "@/components/Spinner";
import { LatexText } from "@/components/LatexText";

/* ────────── AI Explanation Panel ────────── */
function AiExplanation({
  questionId,
  questionText,
  options,
  correctAnswer,
  userAnswer,
  subject,
}: {
  questionId: number;
  questionText: string;
  options: string[];
  correctAnswer: number;
  userAnswer: number | null | undefined;
  subject: string;
}) {
  const { lang, authHeaders } = useApp();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error" | "overloaded">("idle");
  const [explanation, setExplanation] = useState("");

  const fetchExplanation = useCallback(async () => {
    if (status === "loading" || status === "done") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/test/explain", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          questionId,
          questionText,
          options,
          correctAnswer,
          userAnswer: userAnswer ?? null,
          subject,
          lang,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setExplanation(data.explanation);
        setStatus("done");
      } else if (res.status === 503) {
        setStatus("overloaded");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [status, questionId, questionText, options, correctAnswer, userAnswer, subject, lang, authHeaders]);

  // Reset when question changes
  useEffect(() => {
    setStatus("idle");
    setExplanation("");
  }, [questionText]);

  if (status === "idle" || status === "loading") {
    return (
      <button
        onClick={fetchExplanation}
        disabled={status === "loading"}
        className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-accent/30 text-accent bg-accent/5 hover:bg-accent/10 hover:border-accent/50 transition-all text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <Spinner size="sm" />
            {lang === "ru" ? "ИИ анализирует вопрос..." : lang === "kz" ? "ЖИ сұрақты талдауда..." : "AI is analyzing the question..."}
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {lang === "ru" ? "Объяснение ИИ" : lang === "kz" ? "ЖИ түсіндірмесі" : "AI Explanation"}
          </>
        )}
      </button>
    );
  }

  if (status === "error" || status === "overloaded") {
    return (
      <div className={`mt-5 p-4 rounded-xl border flex flex-col gap-3 ${status === "overloaded" ? "bg-warning/5 border-warning/20" : "bg-danger/5 border-danger/20"}`}>
        <div className="flex items-center justify-between gap-3">
          <span className={`text-sm font-medium ${status === "overloaded" ? "text-warning-dark" : "text-danger"}`}>
            {status === "overloaded" 
              ? (lang === "ru" ? "ИИ-учитель сейчас отвечает другим ученикам." : lang === "kz" ? "ЖИ-мұғалім қазір басқа оқушыларға жауап беруде." : "AI teacher is currently answering other students.") 
              : (lang === "ru" ? "Ошибка генерации" : "Generation error")}
          </span>
          <button onClick={() => setStatus("idle")} className={`text-xs underline ${status === "overloaded" ? "text-warning-dark" : "text-danger"}`}>
            {lang === "ru" ? "Повторить" : "Retry"}
          </button>
        </div>
        {status === "overloaded" && (
          <p className="text-xs text-warning-dark/80">
            {lang === "ru" ? "Пожалуйста, подождите минутку и попробуйте снова." : lang === "kz" ? "Бір минут күтіп, қайталап көріңіз." : "Please wait a minute and try again."}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-purple-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-accent/10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-accent">
            {lang === "ru" ? "Объяснение ИИ" : lang === "kz" ? "ЖИ түсіндірмесі" : "AI Explanation"}
          </span>
        </div>
        <button
          onClick={() => setStatus("idle")}
          className="text-xs text-text-secondary hover:text-text transition-colors"
        >
          {lang === "ru" ? "Скрыть" : lang === "kz" ? "Жасыру" : "Hide"}
        </button>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-text leading-relaxed">
          <LatexText text={explanation} />
        </p>
        <p className="mt-3 text-[10px] text-text-secondary flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {lang === "ru" ? "Сгенерировано на основе ИИ" : lang === "kz" ? "ЖИ негізінде жасалды" : "Generated by AI"}
        </p>
      </div>
    </div>
  );
}

/* ────────── Main Page ────────── */
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

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  const textKey = `questionText${lang.charAt(0).toUpperCase() + lang.slice(1)}` as "questionTextRu" | "questionTextKz" | "questionTextEn";
  const optionsKey = `options${lang.charAt(0).toUpperCase() + lang.slice(1)}` as "optionsRu" | "optionsKz" | "optionsEn";

  const questionText = currentQ[textKey] || currentQ.questionTextRu;
  const options = currentQ[optionsKey] || currentQ.optionsRu;

  const userAnswer = currentQ.userAnswer;
  const correctAnswer = currentQ.correctAnswer;
  const isSkipped = currentQ.isSkipped;

  return (
    <div className="flex flex-col md:flex-row gap-5 min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-4 max-w-7xl mx-auto">

      {/* ── SIDEBAR ── */}
      <aside className="w-full md:w-72 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4 md:sticky top-4 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto">

          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-text">
              {lang === "ru" ? "Обзор теста" : lang === "kz" ? "Тестті шолу" : "Test Review"}
            </h2>
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white ${
              session.score >= 80 ? "bg-success" : session.score >= 60 ? "bg-primary" : session.score >= 40 ? "bg-warning" : "bg-danger"
            }`}>
              {session.score}%
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-2.5 h-2.5 rounded-full bg-success shrink-0" />
              {lang === "ru" ? "Правильно" : lang === "kz" ? "Дұрыс" : "Correct"}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-2.5 h-2.5 rounded-full bg-danger shrink-0" />
              {lang === "ru" ? "Неправильно" : lang === "kz" ? "Қате" : "Incorrect"}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-2.5 h-2.5 rounded-full bg-warning shrink-0" />
              {lang === "ru" ? "Пропущено" : lang === "kz" ? "Өткізілді" : "Skipped"}
            </div>
          </div>

          {/* Question grid — horizontal scroll on mobile */}
          <div className="overflow-x-auto -mx-5 px-5 md:overflow-x-visible md:mx-0 md:px-0">
            <div className="flex md:flex-wrap gap-2" style={{ width: "max-content" }} >
              {questions.map((q, idx) => {
                const btnColor = q.isSkipped
                  ? "bg-warning text-white"
                  : q.isCorrect
                  ? "bg-success text-white"
                  : "bg-danger text-white";
                const ring = idx === currentIndex ? "ring-2 ring-primary ring-offset-2" : "";
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-10 h-10 md:w-11 md:h-11 shrink-0 rounded-xl text-xs font-bold transition-all ${btnColor} ${ring}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => router.push("/history")}
            className="w-full py-2 border border-gray-200 rounded-xl text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors"
          >
            {lang === "ru" ? "← Вернуться к истории" : lang === "kz" ? "← Тарихқа оралу" : "← Back to History"}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col gap-4 min-w-0 pb-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-gray-100">
            <span className="text-sm font-semibold text-text-secondary">
              {t("test.question", lang)} {currentIndex + 1} {t("test.of", lang)} {questions.length}
            </span>
            <span className="text-xs font-medium text-text-secondary px-2.5 py-1 bg-gray-100 rounded-lg truncate max-w-[160px]">
              {currentQ.subject}
            </span>
          </div>

          {/* Question Body */}
          <div className="p-4 md:p-8 flex-1">
            <div className="text-xl md:text-2xl font-bold text-text mb-6">
              <LatexText text={questionText} />
            </div>

            {currentQ.imageUrl && (
              <img
                src={currentQ.imageUrl}
                alt="Question"
                className="max-h-64 object-contain rounded-xl mb-6 border border-gray-200 shadow-sm"
              />
            )}

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {options.map((opt: string, optIdx: number) => {
                const isUserChoice = optIdx === userAnswer;
                const isCorrectChoice = optIdx === correctAnswer;

                let optionClass = "bg-white border-gray-200 text-text";
                if (isCorrectChoice) {
                  optionClass = "bg-success/10 border-success text-success-dark ring-1 ring-success";
                } else if (isUserChoice && !isCorrectChoice) {
                  optionClass = "bg-danger/10 border-danger text-danger-dark ring-1 ring-danger";
                }

                return (
                  <div
                    key={optIdx}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${optionClass}`}
                  >
                    {/* Letter */}
                    <span className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold border ${
                      isCorrectChoice ? "border-success text-success" : isUserChoice ? "border-danger text-danger" : "border-gray-300 text-gray-400"
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <div className="flex-1">
                      <span className="text-sm"><LatexText text={opt} /></span>
                      {currentQ.optionImages?.[optIdx] && (
                        <img
                          src={currentQ.optionImages[optIdx]}
                          alt="Option"
                          className="max-h-40 object-contain rounded-lg border border-gray-200 mt-2"
                        />
                      )}
                    </div>
                    {isCorrectChoice && (
                      <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center shrink-0 text-xs">✓</div>
                    )}
                    {isUserChoice && !isCorrectChoice && (
                      <div className="w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center shrink-0 text-xs">✕</div>
                    )}
                  </div>
                );
              })}

              {isSkipped && (
                <div className="mt-2 p-3 rounded-xl border border-warning bg-warning/10 text-warning-dark text-center text-sm font-medium">
                  {lang === "ru" ? "Вы ответили: «Не знаю»" : lang === "kz" ? "Сіздің жауабыңыз: «Білмеймін»" : "You answered: 'I don't know'"}
                </div>
              )}
            </div>

            {/* ── AI Explanation ── */}
            <AiExplanation
              key={currentIndex}
              questionId={currentQ.id}
              questionText={questionText}
              options={options}
              correctAnswer={correctAnswer}
              userAnswer={userAnswer}
              subject={currentQ.subject ?? ""}
            />
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-gray-100 px-4 md:px-6 py-3.5 bg-gray-50 rounded-b-2xl flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-text-secondary bg-white border border-gray-200 shadow-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← {t("test.prev", lang)}
            </button>

            <button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-primary shadow-sm disabled:opacity-40 hover:bg-primary-dark transition-colors"
            >
              {t("test.next", lang)} →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
