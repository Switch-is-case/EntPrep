"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { MANDATORY_SUBJECTS, PROFILE_SUBJECTS } from "@/domain/tests/rules";
import { Spinner } from "@/components/Spinner";
import { LatexText } from "@/components/LatexText";

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
  const { lang, user, token, authHeaders, ready, setIsFullPageMode } = useApp();
  const router = useRouter();

  const [state, setState] = useState<PracticeState>("select");

  const [selectedSubject, setSelectedSubject] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [score, setScore] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [loading, setLoading] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);

  useEffect(() => {
    if (ready && !user && !token) window.location.href = "/login";
  }, [ready, user, token, router]);

  // Refs for cleanup
  const stateRef = useRef(state);
  const questionsRef = useRef(questions);
  const answersRef = useRef(answers);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // Reset to select screen if user navigated away mid-practice
  useEffect(() => {
    // On mount: if there was an unfinished session flagged, reset
    if (sessionStorage.getItem("practice_abandoned") === "1") {
      sessionStorage.removeItem("practice_abandoned");
    }
    return () => {
      // On unmount: flag if mid-session
      if (stateRef.current === "practicing") {
        sessionStorage.setItem("practice_abandoned", "1");
      }
    };
  }, []);

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
        setIsFullPageMode(true);
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
    setIsFullPageMode(false);
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
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">

        {/* ── MOBILE TOP BAR ── */}
        <div className="md:hidden sticky top-16 z-30 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between gap-3">
          <button
            onClick={() => setGridOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
          >
            <span className="flex gap-0.5">
              {questions.map((_, i) => {
                const ans = answers[i];
                const isAnswered = ans !== undefined && ans !== null;
                const isSkipped = ans === null;
                const isCurrent = i === currentIndex;
                return (
                  <span key={i} className={`w-2 h-2 rounded-full ${
                    isSkipped ? "bg-warning" : isAnswered ? "bg-success" : isCurrent ? "bg-primary" : "bg-gray-200"
                  }`} />
                );
              })}
            </span>
            <span>{currentIndex + 1}/{questions.length}</span>
          </button>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium truncate max-w-[140px]">
            {getSubjectName(selectedSubject)}
          </span>
          <button onClick={resetAnswers} className="text-xs text-text-secondary hover:text-danger transition-colors shrink-0">
            {lang === "ru" ? "Сброс" : "Reset"}
          </button>
        </div>

        {/* ── MOBILE QUESTION GRID DRAWER ── */}
        {gridOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => setGridOpen(false)} />
            <div className="relative bg-white rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-text">{lang === "ru" ? "Вопросы" : lang === "kz" ? "Сұрақтар" : "Questions"}</p>
                <button onClick={() => setGridOpen(false)} className="text-text-secondary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-4 mb-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-success" />{lang === "ru" ? "Ответил" : "Answered"}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-warning" />{lang === "ru" ? "Не знаю" : "Skipped"}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300" />{lang === "ru" ? "Не отвечено" : "Unanswered"}</span>
              </div>
              <div className="overflow-x-auto pb-2 -mx-5 px-5">
                <div className="flex gap-2" style={{width: "max-content"}}>
                {questions.map((_, idx) => {
                  const ans = answers[idx];
                  const isAnswered = ans !== undefined && ans !== null;
                  const isSkipped = ans === null;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => { setCurrentIndex(idx); setGridOpen(false); }}
                      className={`w-12 h-12 shrink-0 rounded-xl text-sm font-bold transition-all border-2 ${
                        isSkipped ? "bg-warning border-warning text-white"
                        : isAnswered ? "bg-success border-success text-white"
                        : isCurrent ? "bg-white border-primary text-primary"
                        : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-4">
                {lang === "ru" ? "Отвечено" : "Answered"}: <span className="font-semibold text-text">{answeredCount}/{questions.length}</span>
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-5 px-4 py-4 max-w-[1400px] mx-auto">

          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="hidden md:block w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4 sticky top-4 min-h-[calc(100vh-6rem)]">
              <p className="text-base font-bold text-text">{lang === "ru" ? "Вопросы" : lang === "kz" ? "Сұрақтар" : "Questions"}</p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs text-text-secondary"><span className="w-3.5 h-3.5 rounded-full bg-success shrink-0" />{lang === "ru" ? "Ответил" : lang === "kz" ? "Жауап берді" : "Answered"}</div>
                <div className="flex items-center gap-2 text-xs text-text-secondary"><span className="w-3.5 h-3.5 rounded-full bg-warning shrink-0" />{lang === "ru" ? "Отметил «Не знаю»" : lang === "kz" ? "«Білмеймін»" : "Don't know"}</div>
                <div className="flex items-center gap-2 text-xs text-text-secondary"><span className="w-3.5 h-3.5 rounded-full bg-gray-200 border border-gray-300 shrink-0" />{lang === "ru" ? "Не отвечено" : lang === "kz" ? "Жауапсыз" : "Unanswered"}</div>
              </div>
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
                      className={`w-12 h-12 rounded-2xl text-sm font-bold transition-all border-2 shadow-sm ${
                        isSkipped ? "bg-warning border-warning text-white"
                        : isAnswered ? "bg-success border-success text-white"
                        : isCurrent ? "bg-white border-primary text-primary"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="flex-1" />
              <div className="space-y-0.5">
                <p className="text-xs text-text-secondary">{lang === "ru" ? "Отвечено" : "Answered"}: <span className="font-semibold text-text">{answeredCount} {lang === "ru" ? "из" : "of"} {questions.length}</span></p>
                <p className="text-xs text-text-secondary">{lang === "ru" ? "Не знаю" : "Don't know"}: <span className="font-semibold text-text">{skippedCount}</span></p>
              </div>
              <button onClick={resetAnswers} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm border border-gray-200 rounded-xl text-text-secondary hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {lang === "ru" ? "Сбросить ответы" : lang === "kz" ? "Тазалау" : "Reset"}
              </button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">

            {/* Desktop progress bar */}
            <div className="hidden md:block mb-4">
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

            {/* Question card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 mb-4">
              {q.topic && (
                <div className="text-xs text-text-secondary mb-2">{q.topic}</div>
              )}
              <h2 className="text-xl md:text-2xl font-bold text-text mb-5">
                <LatexText text={getQuestionText(q)} />
              </h2>
              <div className="space-y-2.5">
                {options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: idx }))}
                    className={`w-full text-left p-3.5 md:p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      selectedAnswer === idx
                        ? "border-warning bg-warning/5"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold shrink-0 ${
                      selectedAnswer === idx ? "border-warning text-warning" : "border-gray-300 text-gray-400"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm text-text"><LatexText text={option} /></span>
                  </button>
                ))}
              </div>
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-text-secondary font-medium hover:border-gray-300 hover:text-text transition-all disabled:opacity-30"
              >
                ← {t("test.prev", lang)}
              </button>
              <div className="flex items-center gap-3">
                {currentIndex < questions.length - 1 && (
                  <button
                    onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                    className="px-6 py-3 rounded-xl bg-primary shadow-sm text-white font-medium hover:bg-primary-dark transition-all"
                  >
                    {t("test.next", lang)} →
                  </button>
                )}
                <button
                  onClick={allAnswered ? finishPractice : undefined}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all ${
                    allAnswered ? "bg-success text-white hover:bg-emerald-600" : "bg-gray-200/50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {lang === "ru" ? "Завершить тест" : lang === "kz" ? "Тестті аяқтау" : "Finish test"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE FIXED BOTTOM NAVIGATION ── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center gap-3">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="h-11 px-4 rounded-xl border border-gray-200 text-text-secondary font-medium text-sm disabled:opacity-30 shrink-0"
          >
            ←
          </button>
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
              className="flex-1 h-11 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all"
            >
              {t("test.next", lang)} →
            </button>
          ) : (
            <button
              onClick={allAnswered ? finishPractice : undefined}
              className={`flex-1 h-11 rounded-xl font-semibold text-sm transition-all ${
                allAnswered ? "bg-success text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {allAnswered
                ? (lang === "ru" ? "✓ Завершить" : lang === "kz" ? "✓ Аяқтау" : "✓ Finish")
                : (lang === "ru" ? `Осталось ${questions.length - Object.keys(answers).length}` : `${questions.length - Object.keys(answers).length} left`)
              }
            </button>
          )}
          <button
            onClick={() => setGridOpen(true)}
            className="h-11 w-11 rounded-xl border border-gray-200 flex items-center justify-center text-text-secondary shrink-0 relative"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            {answeredCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-white text-[9px] flex items-center justify-center font-bold">{answeredCount}</span>
            )}
          </button>
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
              setIsFullPageMode(false);
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
      <Spinner size="md" />
    </div>
  );
}
