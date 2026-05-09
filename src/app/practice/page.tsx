"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { MANDATORY_SUBJECTS, PROFILE_SUBJECTS } from "@/domain/tests/rules";

interface PracticeQuestion {
  id: number;
  subject: string;
  questionTextRu: string;
  questionTextKz: string;
  questionTextEn: string;
  optionsRu: string[];
  optionsKz: string[];
  optionsEn: string[];
  correctAnswer: number;
  topic: string | null;
}

type PracticeState = "select" | "practicing" | "review";

export default function PracticePage() {
  const { lang, user, token, authHeaders, ready } = useApp();
  const router = useRouter();

  const [state, setState] = useState<PracticeState>("select");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [score, setScore] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && !user && !token) window.location.href = "/login";
  }, [ready, user, token, router]);

  const startPractice = async () => {
    if (!token || !selectedSubject) return;
    setLoading(true);

    try {
      const res = await fetch("/api/test/practice", {
        headers: authHeaders(),
        method: "POST",
        body: JSON.stringify({ subject: selectedSubject, count: questionCount }),
      });

      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setAnswers({});
        setScore({ correct: 0, wrong: 0, skipped: 0 });
        setState("practicing");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const finishPractice = () => {
    let correct = 0, wrong = 0, skipped = 0;
    questions.forEach((q, idx) => {
      const ans = answers[idx];
      if (ans === undefined || ans === null) skipped++;
      else if (ans === q.correctAnswer) correct++;
      else wrong++;
    });
    setScore({ correct, wrong, skipped });
    setState("review");
  };

  if (!user) return null;

  const allSubjects = [...MANDATORY_SUBJECTS, ...PROFILE_SUBJECTS];

  const getSubjectName = (s: string) => {
    const key = `subject.${s}` as keyof typeof import("@/lib/i18n").translations;
    return t(key, lang);
  };

  const getQuestionText = (q: PracticeQuestion) => {
    if (lang === "kz") return q.questionTextKz;
    if (lang === "en") return q.questionTextEn;
    return q.questionTextRu;
  };

  const getOptions = (q: PracticeQuestion): string[] => {
    if (lang === "kz") return q.optionsKz;
    if (lang === "en") return q.optionsEn;
    return q.optionsRu;
  };

  // Subject selection
  if (state === "select") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-text mb-8">{t("practice.title", lang)}</h1>

        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h3 className="font-semibold text-text mb-4">{t("practice.selectSubject", lang)}</h3>

          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-2">
              {lang === "ru" ? "Обязательные" : lang === "kz" ? "Міндетті" : "Mandatory"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {MANDATORY_SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                    selectedSubject === s
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {getSubjectName(s)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-2">
              {lang === "ru" ? "Профильные" : lang === "kz" ? "Профильдік" : "Profile"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROFILE_SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                    selectedSubject === s
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-border hover:border-accent/30"
                  }`}
                >
                  {getSubjectName(s)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h3 className="font-semibold text-text mb-4">{t("practice.questionsCount", lang)}</h3>
          <div className="flex gap-3">
            {[5, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  questionCount === n
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startPractice}
          disabled={!selectedSubject || loading}
          className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("common.loading", lang) : t("practice.startPractice", lang)}
        </button>
      </div>
    );
  }

  // Practicing
  if (state === "practicing" && questions[currentIndex]) {
    const q = questions[currentIndex];
    const options = getOptions(q);
    const progress = ((currentIndex + 1) / questions.length) * 100;
    
    const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
    const skippedCount = Object.values(answers).filter((v) => v === null).length;
    const allAnswered = Object.keys(answers).length === questions.length;
    const selectedAnswer = answers[currentIndex];

    const resetAnswers = () => {
      if (confirm(lang === "ru" ? "Сбросить все ответы?" : lang === "kz" ? "Барлық жауаптарды тазалау?" : "Reset all answers?")) {
        setAnswers({});
        setCurrentIndex(0);
      }
    };

    return (
      <div className="flex gap-5 min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-4">

        {/* ── SIDEBAR CARD ── */}
        <aside className="w-80 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4 sticky top-4 min-h-[calc(100vh-6rem)]">
            
            <p className="text-base font-bold text-text">
              {lang === "ru" ? "Вопросы" : lang === "kz" ? "Сұрақтар" : "Questions"}
            </p>

            {/* Legend */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="w-3.5 h-3.5 rounded-full bg-success shrink-0" />
                {lang === "ru" ? "Ответил" : lang === "kz" ? "Жауап берді" : "Answered"}
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="w-3.5 h-3.5 rounded-full bg-warning shrink-0" />
                {lang === "ru" ? "Отметил «Не знаю»" : lang === "kz" ? "«Білмеймін»" : "Don't know"}
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="w-3.5 h-3.5 rounded-full bg-gray-200 border border-gray-300 shrink-0" />
                {lang === "ru" ? "Не отвечено" : lang === "kz" ? "Жауапсыз" : "Unanswered"}
              </div>
            </div>

            {/* Number grid */}
            <div className="flex flex-wrap gap-2.5">
              {questions.map((_, idx) => {
                const ans = answers[idx];
                const isAnswered = ans !== undefined && ans !== null;
                const isSkipped = ans === null;
                const isCurrent = idx === currentIndex;
                
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-14 h-14 rounded-2xl text-base font-bold transition-all border-2 shadow-sm ${
                      isSkipped
                        ? "bg-warning border-warning text-white"
                        : isAnswered
                        ? "bg-success border-success text-white"
                        : isCurrent
                        ? "bg-white border-primary text-primary"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 disabled:opacity-50"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Stats */}
            <div className="space-y-0.5">
              <p className="text-xs text-text-secondary">
                {lang === "ru" ? "Отвечено" : "Answered"}:{" "}
                <span className="font-semibold text-text">{answeredCount} {lang === "ru" ? "из" : "of"} {questions.length}</span>
              </p>
              <p className="text-xs text-text-secondary">
                {lang === "ru" ? "Отмечено «Не знаю»" : "Don't know"}:{" "}
                <span className="font-semibold text-text">{skippedCount}</span>
              </p>
            </div>
            
            {/* Reset button */}
            <button
              onClick={resetAnswers}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm border border-gray-200 rounded-xl text-text-secondary hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {lang === "ru" ? "Сбросить ответы" : lang === "kz" ? "Тазалау" : "Reset"}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1">
          {/* Progress */}
          <div className="mb-4 max-w-4xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-secondary">
                {lang === "ru" ? "Вопрос" : "Question"} {currentIndex + 1} {lang === "ru" ? "из" : "of"} {questions.length}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {getSubjectName(selectedSubject)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4 max-w-4xl">
            {q.topic && (
              <div className="text-xs text-text-secondary mb-2">{q.topic}</div>
            )}
            <h2 className="text-2xl font-bold text-text mb-6">
              {getQuestionText(q)}
            </h2>

            <div className="space-y-3">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: idx }))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    selectedAnswer === idx
                      ? "border-warning bg-warning/5"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold shrink-0 ${
                    selectedAnswer === idx ? "border-warning text-warning" : "border-gray-300 text-gray-400"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm text-text">{option}</span>
                </button>
              ))}
            </div>

            {/* I don't know */}
            <button
              onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: null }))}
              className={`w-full mt-3 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                selectedAnswer === null && answers[currentIndex] !== undefined
                  ? "border-warning bg-warning/5 text-warning"
                  : "border-dashed border-gray-200 text-gray-400 hover:border-warning hover:text-warning"
              }`}
            >
              {t("test.iDontKnow", lang)}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-start justify-between w-full">
            {/* Back & Next constrained to Question Card width */}
            <div className="flex items-center justify-between w-full max-w-4xl">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-text-secondary font-medium hover:border-gray-300 hover:text-text transition-all disabled:opacity-30"
              >
                ← {t("test.prev", lang)}
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                  className="px-6 py-3 rounded-xl bg-primary shadow-sm text-white font-medium hover:bg-primary-dark hover:shadow transition-all"
                >
                  {t("test.next", lang)} →
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* Finish test on the far right */}
            <div className="relative group shrink-0 ml-4">
              <button
                onClick={allAnswered ? finishPractice : undefined}
                className={`px-6 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all ${
                  allAnswered
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-200/50 text-gray-400 cursor-not-allowed"
                }`}
              >
                <span className="flex items-center gap-2">
                  {!allAnswered && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                  {lang === "ru" ? "Завершить тест" : lang === "kz" ? "Тестті аяқтау" : "Finish test"}
                </span>
              </button>
              {!allAnswered && (
                <div className="absolute top-full mt-2 right-0 w-56 text-gray-400 text-xs text-right leading-relaxed">
                  {lang === "ru" ? "Ответьте на все вопросы, чтобы завершить тест" : "Answer all questions to finish"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Review
  if (state === "review") {
    const total = score.correct + score.wrong + score.skipped;
    const pct = Math.round((score.correct / Math.max(total, 1)) * 100);

    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-white">{pct}%</span>
        </div>

        <h1 className="text-3xl font-bold text-text mb-2">
          {t("practice.title", lang)} — {t("test.results", lang)}
        </h1>
        <p className="text-text-secondary mb-6">{getSubjectName(selectedSubject)}</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-success/10 rounded-xl p-4 border border-success/20">
            <div className="text-2xl font-bold text-success">{score.correct}</div>
            <div className="text-xs text-success/80">{t("test.correct", lang)}</div>
          </div>
          <div className="bg-danger/10 rounded-xl p-4 border border-danger/20">
            <div className="text-2xl font-bold text-danger">{score.wrong}</div>
            <div className="text-xs text-danger/80">{t("test.wrong", lang)}</div>
          </div>
          <div className="bg-warning/10 rounded-xl p-4 border border-warning/20">
            <div className="text-2xl font-bold text-warning">{score.skipped}</div>
            <div className="text-xs text-warning/80">{t("test.skipped", lang)}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setState("select");
              setQuestions([]);
            }}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-border text-text font-semibold hover:border-primary transition-all"
          >
            {lang === "ru" ? "Другой предмет" : lang === "kz" ? "Басқа пән" : "Another Subject"}
          </button>
          <button
            onClick={startPractice}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:shadow-lg transition-all"
          >
            {lang === "ru" ? "Ещё раз" : lang === "kz" ? "Тағы бір рет" : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
