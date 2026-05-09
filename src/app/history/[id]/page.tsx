"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

import { useHistoryReview } from "@/hooks/useHistoryReview";

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  
  // Helpers for formatting
  const textKey = `questionText${lang.charAt(0).toUpperCase() + lang.slice(1)}` as "questionTextRu" | "questionTextKz" | "questionTextEn";
  const optionsKey = `options${lang.charAt(0).toUpperCase() + lang.slice(1)}` as "optionsRu" | "optionsKz" | "optionsEn";
  
  const questionText = currentQ[textKey] || currentQ.questionTextRu;
  const options = currentQ[optionsKey] || currentQ.optionsRu;
  
  const userAnswer = currentQ.userAnswer;
  const correctAnswer = currentQ.correctAnswer;
  const isSkipped = currentQ.isSkipped;

  return (
    <div className="flex flex-col md:flex-row gap-5 min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-4 max-w-7xl mx-auto">
      
      {/* ── SIDEBAR (Grid) ── */}
      <aside className="w-full md:w-80 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4 sticky top-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          
          <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-text">
              {lang === "ru" ? "Обзор теста" : lang === "kz" ? "Тестті шолу" : "Test Review"}
            </h2>
            <div className={`px-3 py-1 rounded-lg text-sm font-bold text-white shadow-sm ${
              session.score >= 80 ? "bg-success" : session.score >= 60 ? "bg-primary" : session.score >= 40 ? "bg-warning" : "bg-danger"
            }`}>
              {session.score}%
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-3 h-3 rounded-full bg-success shrink-0" />
              {lang === "ru" ? "Правильно" : lang === "kz" ? "Дұрыс" : "Correct"}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-3 h-3 rounded-full bg-danger shrink-0" />
              {lang === "ru" ? "Неправильно" : lang === "kz" ? "Қате" : "Incorrect"}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-3 h-3 rounded-full bg-warning shrink-0" />
              {lang === "ru" ? "Пропущено («Не знаю»)" : lang === "kz" ? "Өткізілді" : "Skipped"}
            </div>
          </div>

          {/* Grid */}
          <div className="flex flex-wrap gap-2.5 mt-2">
            {questions.map((q, idx) => {
              let btnClass = "bg-gray-100 text-text hover:bg-gray-200"; // Default (should not happen in history)
              
              if (q.isSkipped) {
                btnClass = "bg-warning/20 text-warning-dark border border-warning/30";
              } else if (q.isCorrect) {
                btnClass = "bg-success text-white shadow-sm shadow-success/30";
              } else {
                btnClass = "bg-danger text-white shadow-sm shadow-danger/30";
              }

              // Highlight current question
              const isCurrent = idx === currentIndex;
              const ringClass = isCurrent ? "ring-2 ring-primary ring-offset-2" : "";

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-12 h-12 rounded-xl text-sm font-semibold flex items-center justify-center transition-all ${btnClass} ${ringClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => router.push("/history")}
            className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-sm font-semibold text-text-secondary hover:bg-gray-50 transition-colors"
          >
            {lang === "ru" ? "Вернуться к истории" : lang === "kz" ? "Тарихқа оралу" : "Back to History"}
          </button>

        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col gap-4 min-w-0 max-w-4xl w-full">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[500px]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <span className="text-sm font-bold text-text-secondary">
              {t("test.question", lang)} {currentIndex + 1} {t("test.of", lang)} {questions.length}
            </span>
            <span className="text-sm font-medium text-text-secondary px-3 py-1 bg-gray-100 rounded-lg">
              {currentQ.subject ? (lang === "ru" ? "Предмет: " + currentQ.subject : currentQ.subject) : ""}
            </span>
          </div>

          {/* Question Body */}
          <div className="p-6 md:p-8 flex-1">
            <div
              className="prose prose-sm md:prose-base max-w-none text-text mb-8"
              dangerouslySetInnerHTML={{ __html: questionText }}
            />

            {currentQ.imageUrl && (
              <img
                src={currentQ.imageUrl}
                alt="Question"
                className="max-h-64 object-contain rounded-xl mb-8 border border-gray-200 shadow-sm"
              />
            )}

            {/* Options */}
            <div className="flex flex-col gap-3">
              {options.map((opt: string, optIdx: number) => {
                const isUserChoice = optIdx === userAnswer;
                const isCorrectChoice = optIdx === correctAnswer;
                
                let optionClass = "bg-white border-gray-200 text-text hover:bg-gray-50";
                
                if (isCorrectChoice) {
                  optionClass = "bg-success/10 border-success text-success-dark ring-1 ring-success";
                } else if (isUserChoice && !isCorrectChoice) {
                  optionClass = "bg-danger/10 border-danger text-danger-dark ring-1 ring-danger";
                }

                return (
                  <div
                    key={optIdx}
                    className={`relative w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${optionClass}`}
                  >
                    <div className="flex flex-col flex-1 gap-2">
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: opt }}
                      />
                      {currentQ.optionImages && currentQ.optionImages[optIdx] && (
                        <img
                          src={currentQ.optionImages[optIdx]}
                          alt="Option"
                          className="max-h-40 object-contain rounded-lg border border-gray-200"
                        />
                      )}
                    </div>
                    
                    {/* Status Icons */}
                    {isCorrectChoice && (
                      <div className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center shrink-0">
                        ✓
                      </div>
                    )}
                    {isUserChoice && !isCorrectChoice && (
                      <div className="w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center shrink-0">
                        ✕
                      </div>
                    )}
                  </div>
                );
              })}
              
              {isSkipped && (
                <div className="mt-4 p-4 rounded-xl border border-warning bg-warning/10 text-warning-dark text-center font-medium">
                  {lang === "ru" ? "Вы ответили: «Не знаю»" : lang === "kz" ? "Сіздің жауабыңыз: «Білмеймін»" : "You answered: 'I don't know'"}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-gray-100 p-4 md:p-6 bg-gray-50 rounded-b-2xl flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-text-secondary bg-white border border-gray-200 shadow-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              ← {t("test.prev", lang)}
            </button>
            
            <button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-primary shadow-sm disabled:opacity-50 hover:bg-primary-dark transition-colors"
            >
              {t("test.next", lang)} →
            </button>
          </div>

        </div>
      </main>

    </div>
  );
}
