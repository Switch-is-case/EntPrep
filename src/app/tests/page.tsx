"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { Spinner } from "@/components/Spinner";

interface Question {
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

interface TestResults {
  score: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  totalQuestions: number;
  subjectResults: Record<string, { correct: number; total: number; skipped: number; wrong: number }>;
  recommendations: string;
  detailedResults?: Array<{
    questionId: number;
    selectedAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
    isSkipped: boolean;
  }>;
}

type TestState = "select" | "testing" | "results";

export default function TestsPage() {
  const { lang, user, token, authHeaders, ready } = useApp();
  const router = useRouter();
  const [testState, setTestState] = useState<TestState>("select");
  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [testType, setTestType] = useState<"diagnostic" | "full">("diagnostic");
  const [gridOpen, setGridOpen] = useState(false);

  useEffect(() => {
    if (ready && !user && !token) window.location.href = "/login";
  }, [ready, user, token, router]);

  // Refs to always have the latest values in the cleanup effect
  const testStateRef = useRef(testState);
  const sessionIdRef = useRef(sessionId);
  const questionsRef = useRef(questions);
  const answersRef = useRef(answers);
  const tokenRef = useRef(token);
  const authHeadersRef = useRef(authHeaders);
  useEffect(() => { testStateRef.current = testState; }, [testState]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { tokenRef.current = token; }, [token]);
  useEffect(() => { authHeadersRef.current = authHeaders; }, [authHeaders]);

  // Auto-submit when navigating away mid-test
  useEffect(() => {
    return () => {
      if (testStateRef.current !== "testing") return;
      if (!tokenRef.current || !sessionIdRef.current) return;
      const answersList = questionsRef.current.map((q) => ({
        questionId: q.id,
        selectedAnswer: answersRef.current[q.id] !== undefined ? answersRef.current[q.id] : null,
      }));
      // fire-and-forget
      fetch("/api/test/submit", {
        method: "POST",
        headers: authHeadersRef.current(),
        body: JSON.stringify({ sessionId: sessionIdRef.current, answers: answersList }),
      }).catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTest = async (type: "diagnostic" | "full") => {
    if (!token) return;
    setLoading(true);
    setTestType(type);
    try {
      const res = await fetch("/api/test/start", {
        headers: authHeaders(),
        method: "POST",
        body: JSON.stringify({ testType: type }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessionId(data.sessionId);
        setQuestions(data.questions);
        setCurrentIndex(0);
        setAnswers({});
        setTestState("testing");
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const submitTest = useCallback(async () => {
    if (!token || !sessionId) return;
    setLoading(true);
    const answersList = questions.map((q) => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] !== undefined ? answers[q.id] : null,
    }));
    try {
      const res = await fetch("/api/test/submit", {
        headers: authHeaders(),
        method: "POST",
        body: JSON.stringify({ sessionId, answers: answersList }),
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data);
        setTestState("results");
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token, sessionId, questions, answers, authHeaders]);

  if (!user) return null;

  const currentQuestion = questions[currentIndex];

  const getQuestionText = (q: Question) => {
    if (lang === "kz") return q.questionTextKz;
    if (lang === "en") return q.questionTextEn;
    return q.questionTextRu;
  };

  const getOptions = (q: Question): string[] => {
    if (lang === "kz") return q.optionsKz;
    if (lang === "en") return q.optionsEn;
    return q.optionsRu;
  };

  const getSubjectName = (s: string) => {
    const key = `subject.${s}` as keyof typeof import("@/lib/i18n").translations;
    return t(key, lang);
  };

  // ---------- SELECT ----------
  if (testState === "select") {
    const hasProfile = user.profileSubject1 && user.profileSubject2;
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-text mb-8">{t("nav.tests", lang)}</h1>
        {!hasProfile && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-warning text-sm font-bold">!</span>
            <div>
              <p className="text-sm font-medium text-text">{t("common.selectProfile", lang)}</p>
              <button onClick={() => router.push("/profile")} className="text-primary text-sm font-medium mt-1 hover:underline">
                {t("nav.profile", lang)} →
              </button>
            </div>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <h3 className="font-semibold text-lg text-text mb-2">{t("home.features.diagnostic", lang)}</h3>
            <p className="text-sm text-text-secondary mb-4">{t("test.diagnosticDesc", lang)}</p>
            <p className="text-xs text-text-secondary mb-4">~25 {lang === "ru" ? "вопросов" : lang === "kz" ? "сұрақ" : "questions"} • ~15 {lang === "ru" ? "мин" : "min"}</p>
            <button onClick={() => startTest("diagnostic")} disabled={!hasProfile || loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? t("common.loading", lang) : t("test.startDiagnostic", lang)}
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-purple-700 flex items-center justify-center text-white mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <h3 className="font-semibold text-lg text-text mb-2">{t("test.fullTest", lang)}</h3>
            <p className="text-sm text-text-secondary mb-4">{t("test.fullTestDesc", lang)}</p>
            <p className="text-xs text-text-secondary mb-4">140 {lang === "ru" ? "вопросов" : lang === "kz" ? "сұрақ" : "questions"} • 3.5 {lang === "ru" ? "часа" : lang === "kz" ? "сағат" : "hours"}</p>
            <button onClick={() => startTest("full")} disabled={!hasProfile || loading}
              className="w-full bg-gradient-to-r from-accent to-purple-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? t("common.loading", lang) : t("test.start", lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- TESTING ----------
  if (testState === "testing" && currentQuestion) {
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const selectedAnswer = answers[currentQuestion.id];
    const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
    const skippedCount = Object.values(answers).filter((v) => v === null).length;
    const totalInteracted = Object.keys(answers).length;
    const allAnswered = totalInteracted === questions.length;

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
              {questions.map((q, i) => {
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
                const isSkipped = answers[q.id] === null;
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
            {getSubjectName(currentQuestion.subject)}
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
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
                  const isSkipped = answers[q.id] === null;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
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
                <div className="flex items-center gap-2 text-xs text-text-secondary"><span className="w-3.5 h-3.5 rounded-full bg-warning shrink-0" />{lang === "ru" ? "Не знаю" : lang === "kz" ? "«Білмеймін»" : "Don't know"}</div>
                <div className="flex items-center gap-2 text-xs text-text-secondary"><span className="w-3.5 h-3.5 rounded-full bg-gray-200 border border-gray-300 shrink-0" />{lang === "ru" ? "Не отвечено" : lang === "kz" ? "Жауапсыз" : "Unanswered"}</div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
                  const isSkipped = answers[q.id] === null;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
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
                  {getSubjectName(currentQuestion.subject)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 mb-4">
              {currentQuestion.topic && (
                <div className="text-xs text-text-secondary mb-2">{currentQuestion.topic}</div>
              )}
              <h2 className="text-xl md:text-2xl font-bold text-text mb-5">
                {getQuestionText(currentQuestion)}
              </h2>
              <div className="space-y-2.5">
                {getOptions(currentQuestion).map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: idx }))}
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
                    <span className="text-sm text-text">{option}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: null }))}
                className={`w-full mt-3 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  selectedAnswer === null && answers[currentQuestion.id] !== undefined
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
                  onClick={allAnswered ? submitTest : undefined}
                  disabled={loading}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all ${
                    allAnswered ? "bg-success text-white hover:bg-emerald-600" : "bg-gray-200/50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loading ? "..." : (lang === "ru" ? "Завершить тест" : lang === "kz" ? "Тестті аяқтау" : "Finish test")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE FIXED BOTTOM NAVIGATION ── */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
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
              onClick={allAnswered ? submitTest : undefined}
              disabled={loading}
              className={`flex-1 h-11 rounded-xl font-semibold text-sm transition-all ${
                allAnswered ? "bg-success text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "..." : (allAnswered
                ? (lang === "ru" ? "✓ Завершить" : lang === "kz" ? "✓ Аяқтау" : "✓ Finish")
                : (lang === "ru" ? `Осталось ${questions.length - Object.keys(answers).length}` : `${questions.length - Object.keys(answers).length} left`)
              )}
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





  // ---------- RESULTS ----------



  // ---------- RESULTS ----------



  if (testState === "results" && results) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Score header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">{results.score}%</span>
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">{t("test.results", lang)}</h1>
          <p className="text-text-secondary">
            {testType === "diagnostic"
              ? lang === "ru" ? "Диагностический тест" : lang === "kz" ? "Диагностикалық тест" : "Diagnostic Test"
              : lang === "ru" ? "Полный тест ЕНТ" : lang === "kz" ? "Толық ЕНТ тест" : "Full ENT Test"}
          </p>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-success/10 rounded-xl p-4 text-center border border-success/20">
            <div className="text-2xl font-bold text-success">{results.totalCorrect}</div>
            <div className="text-xs text-success/80">{t("test.correct", lang)}</div>
          </div>
          <div className="bg-danger/10 rounded-xl p-4 text-center border border-danger/20">
            <div className="text-2xl font-bold text-danger">{results.totalWrong}</div>
            <div className="text-xs text-danger/80">{t("test.wrong", lang)}</div>
          </div>
          <div className="bg-warning/10 rounded-xl p-4 text-center border border-warning/20">
            <div className="text-2xl font-bold text-warning">{results.totalSkipped}</div>
            <div className="text-xs text-warning/80">{t("test.skipped", lang)}</div>
          </div>
        </div>

        {/* Subject breakdown */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h3 className="font-semibold text-text mb-4">{t("progress.bySubject", lang)}</h3>
          <div className="space-y-4">
            {Object.entries(results.subjectResults).map(([subject, result]) => {
              const pct = Math.round((result.correct / Math.max(result.total, 1)) * 100);
              return (
                <div key={subject}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{getSubjectName(subject)}</span>
                    <span className="text-sm font-semibold">{pct}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${pct >= 80 ? "bg-success" : pct >= 60 ? "bg-primary" : pct >= 40 ? "bg-warning" : "bg-danger"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-secondary w-20 text-right">{result.correct}/{result.total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed answer review */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h3 className="font-semibold text-text mb-4">
            {lang === "ru" ? "Разбор ответов" : lang === "kz" ? "Жауаптарды талдау" : "Answer Review"}
          </h3>
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isSkipped = userAnswer === null || userAnswer === undefined;
              const isCorrect = !isSkipped && userAnswer === q.correctAnswer;
              const opts = lang === "kz" ? q.optionsKz : lang === "en" ? q.optionsEn : q.optionsRu;
              const qText = lang === "kz" ? q.questionTextKz : lang === "en" ? q.questionTextEn : q.questionTextRu;

              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-4 ${
                    isSkipped
                      ? "border-warning/30 bg-warning/5"
                      : isCorrect
                      ? "border-success/30 bg-success/5"
                      : "border-danger/30 bg-danger/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSkipped ? "bg-warning/20 text-warning" : isCorrect ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                    }`}>
                      {isSkipped ? "?" : isCorrect ? "✓" : "✗"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text mb-2">
                        <span className="text-text-secondary mr-1">#{idx + 1}</span>{qText}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {!isSkipped && !isCorrect && (
                          <span className="px-2 py-1 rounded bg-danger/10 text-danger">
                            {lang === "ru" ? "Ваш ответ" : lang === "kz" ? "Сіздің жауабыңыз" : "Your answer"}: {String.fromCharCode(65 + (userAnswer as number))} — {opts[userAnswer as number]}
                          </span>
                        )}
                        {isSkipped && (
                          <span className="px-2 py-1 rounded bg-warning/10 text-warning">
                            {lang === "ru" ? "Не отвечено" : lang === "kz" ? "Жауапсыз" : "Skipped"}
                          </span>
                        )}
                        <span className="px-2 py-1 rounded bg-success/10 text-success">
                          {lang === "ru" ? "Правильно" : lang === "kz" ? "Дұрыс" : "Correct"}: {String.fromCharCode(65 + q.correctAnswer)} — {opts[q.correctAnswer]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 p-6 mb-8">
          <h3 className="font-semibold text-text mb-3">AI {t("home.features.ai", lang)}</h3>
          <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">{results.recommendations}</pre>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setTestState("select")}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-border text-text font-semibold hover:border-primary hover:text-primary transition-all">
            {lang === "ru" ? "Новый тест" : lang === "kz" ? "Жаңа тест" : "New Test"}
          </button>
          <button onClick={() => router.push("/practice")}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:shadow-lg transition-all">
            {t("practice.startPractice", lang)}
          </button>
          <button onClick={() => router.push("/progress")}
            className="flex-1 px-6 py-3 rounded-xl bg-text text-white font-semibold hover:bg-slate-800 transition-all">
            {t("progress.title", lang)}
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
