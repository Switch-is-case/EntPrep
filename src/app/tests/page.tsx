"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

interface Question {
  id: number;
  subject: string;
  questionTextRu: string;
  questionTextKz: string;
  questionTextEn: string;
  optionsRu: string[];
  optionsKz: string[];
  optionsEn: string[];
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

  useEffect(() => {
    if (ready && !user && !token) window.location.href = "/login";
  }, [ready, user, token, router]);

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
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
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
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token, sessionId, questions, answers]);

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

  // Select test type
  if (testState === "select") {
    const hasProfile = user.profileSubject1 && user.profileSubject2;
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-text mb-8">{t("nav.tests", lang)}</h1>

        {!hasProfile && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-warning text-sm font-bold">!</span>
            <div>
              <p className="text-sm font-medium text-text">
                {t("common.selectProfile", lang)}
              </p>
              <button
                onClick={() => router.push("/profile")}
                className="text-primary text-sm font-medium mt-1 hover:underline"
              >
                {t("nav.profile", lang)} →
              </button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Diagnostic Test */}
          <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <h3 className="font-semibold text-lg text-text mb-2">
              {t("home.features.diagnostic", lang)}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {t("test.diagnosticDesc", lang)}
            </p>
            <p className="text-xs text-text-secondary mb-4">
              ~25 {lang === "ru" ? "вопросов" : lang === "kz" ? "сұрақ" : "questions"} • ~15 {lang === "ru" ? "мин" : "min"}
            </p>
            <button
              onClick={() => startTest("diagnostic")}
              disabled={!hasProfile || loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("common.loading", lang) : t("test.startDiagnostic", lang)}
            </button>
          </div>

          {/* Full ENT Test */}
          <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-purple-700 flex items-center justify-center text-white mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <h3 className="font-semibold text-lg text-text mb-2">
              {t("test.fullTest", lang)}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {t("test.fullTestDesc", lang)}
            </p>
            <p className="text-xs text-text-secondary mb-4">
              140 {lang === "ru" ? "вопросов" : lang === "kz" ? "сұрақ" : "questions"} • 3.5 {lang === "ru" ? "часа" : lang === "kz" ? "сағат" : "hours"}
            </p>
            <button
              onClick={() => startTest("full")}
              disabled={!hasProfile || loading}
              className="w-full bg-gradient-to-r from-accent to-purple-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("common.loading", lang) : t("test.start", lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Testing
  if (testState === "testing" && currentQuestion) {
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const selectedAnswer = answers[currentQuestion.id];

    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary">
              {t("test.question", lang)} {currentIndex + 1} {t("test.of", lang)} {questions.length}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {getSubjectName(currentQuestion.subject)}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8 mb-6">
          {currentQuestion.topic && (
            <div className="text-xs text-text-secondary mb-3">
              {currentQuestion.topic}
            </div>
          )}
          <h2 className="text-lg md:text-xl font-semibold text-text mb-6">
            {getQuestionText(currentQuestion)}
          </h2>

          <div className="space-y-3">
            {getOptions(currentQuestion).map((option, idx) => (
              <button
                key={idx}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [currentQuestion.id]: idx }))
                }
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  selectedAnswer === idx
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold shrink-0 ${
                    selectedAnswer === idx
                      ? "border-primary bg-primary text-white"
                      : "border-gray-300 text-text-secondary"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm">{option}</span>
              </button>
            ))}
          </div>

          {/* I don't know button */}
          <button
            onClick={() =>
              setAnswers((prev) => ({ ...prev, [currentQuestion.id]: null }))
            }
            className={`w-full mt-4 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
              selectedAnswer === null && answers[currentQuestion.id] !== undefined
                ? "border-warning bg-warning/5 text-warning"
                : "border-dashed border-border text-text-secondary hover:border-warning hover:text-warning"
            }`}
          >
            {t("test.iDontKnow", lang)}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-lg border border-border text-text-secondary font-medium hover:bg-gray-50 transition-colors disabled:opacity-30"
          >
            ← {t("test.prev", lang)}
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={submitTest}
              disabled={loading}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-success to-emerald-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? t("common.loading", lang) : t("test.finish", lang)}
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))
              }
              className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
            >
              {t("test.next", lang)} →
            </button>
          )}
        </div>

        {/* Question navigator */}
        <div className="mt-8 bg-white rounded-2xl border border-border p-4">
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const answered = answers[q.id] !== undefined;
              const skipped = answers[q.id] === null;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${
                    idx === currentIndex
                      ? "bg-primary text-white"
                      : skipped
                      ? "bg-warning/20 text-warning border border-warning/30"
                      : answered
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 text-text-secondary"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (testState === "results" && results) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
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

        {/* Score overview */}
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
          <h3 className="font-semibold text-text mb-4">
            {t("progress.bySubject", lang)}
          </h3>
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
                        className={`h-3 rounded-full transition-all ${
                          pct >= 80 ? "bg-success" : pct >= 60 ? "bg-primary" : pct >= 40 ? "bg-warning" : "bg-danger"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-secondary w-20 text-right">
                      {result.correct}/{result.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 p-6 mb-8">
          <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
            AI {t("home.features.ai", lang)}
          </h3>
          <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
            {results.recommendations}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setTestState("select")}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-border text-text font-semibold hover:border-primary hover:text-primary transition-all"
          >
            {lang === "ru" ? "Новый тест" : lang === "kz" ? "Жаңа тест" : "New Test"}
          </button>
          <button
            onClick={() => router.push("/practice")}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:shadow-lg transition-all"
          >
            {t("practice.startPractice", lang)}
          </button>
          <button
            onClick={() => router.push("/progress")}
            className="flex-1 px-6 py-3 rounded-xl bg-text text-white font-semibold hover:bg-slate-800 transition-all"
          >
            {t("progress.title", lang)}
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
