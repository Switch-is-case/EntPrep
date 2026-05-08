"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { t, MANDATORY_SUBJECTS, PROFILE_SUBJECTS } from "@/lib/i18n";

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
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
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
        setSelectedAnswer(null);
        setShowAnswer(false);
        setScore({ correct: 0, wrong: 0, skipped: 0 });
        setState("practicing");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = () => {
    setShowAnswer(true);
    const q = questions[currentIndex];
    if (selectedAnswer === null) {
      setScore((prev) => ({ ...prev, skipped: prev.skipped + 1 }));
    } else if (selectedAnswer === q.correctAnswer) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setState("review");
    }
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

    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary">
              {t("test.question", lang)} {currentIndex + 1} {t("test.of", lang)} {questions.length}
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-success font-medium">✓ {score.correct}</span>
              <span className="text-danger font-medium">✗ {score.wrong}</span>
              <span className="text-warning font-medium">? {score.skipped}</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8 mb-6">
          {q.topic && (
            <div className="text-xs text-text-secondary mb-3">{q.topic}</div>
          )}
          <h2 className="text-lg md:text-xl font-semibold text-text mb-6">
            {getQuestionText(q)}
          </h2>

          <div className="space-y-3">
            {options.map((option, idx) => {
              let cls = "border-border hover:border-primary/30 hover:bg-gray-50";
              if (showAnswer) {
                if (idx === q.correctAnswer) {
                  cls = "border-success bg-success/5";
                } else if (idx === selectedAnswer && idx !== q.correctAnswer) {
                  cls = "border-danger bg-danger/5";
                } else {
                  cls = "border-border opacity-50";
                }
              } else if (selectedAnswer === idx) {
                cls = "border-primary bg-primary/5";
              }

              return (
                <button
                  key={idx}
                  onClick={() => !showAnswer && setSelectedAnswer(idx)}
                  disabled={showAnswer}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${cls}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold shrink-0 ${
                      showAnswer && idx === q.correctAnswer
                        ? "border-success bg-success text-white"
                        : showAnswer && idx === selectedAnswer
                        ? "border-danger bg-danger text-white"
                        : selectedAnswer === idx
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 text-text-secondary"
                    }`}
                  >
                    {showAnswer && idx === q.correctAnswer ? "✓" : showAnswer && idx === selectedAnswer ? "✗" : String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm">{option}</span>
                </button>
              );
            })}
          </div>

          {/* I don't know */}
          {!showAnswer && (
            <button
              onClick={() => {
                setSelectedAnswer(null);
                checkAnswer();
              }}
              className="w-full mt-4 p-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-text-secondary hover:border-warning hover:text-warning transition-all"
            >
              {t("test.iDontKnow", lang)}
            </button>
          )}

          {/* Correct answer explanation */}
          {showAnswer && (
            <div className={`mt-4 p-4 rounded-xl border ${
              selectedAnswer === q.correctAnswer
                ? "bg-success/5 border-success/20"
                : "bg-danger/5 border-danger/20"
            }`}>
              <p className="text-sm font-medium">
                {selectedAnswer === q.correctAnswer
                  ? (lang === "ru" ? "Правильно!" : lang === "kz" ? "Дұрыс!" : "Correct!")
                  : selectedAnswer === null
                  ? (lang === "ru" ? "Пропущено" : lang === "kz" ? "Өткізілді" : "Skipped")
                  : (lang === "ru" ? "Неправильно" : lang === "kz" ? "Қате" : "Wrong")}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                {lang === "ru" ? "Правильный ответ: " : lang === "kz" ? "Дұрыс жауап: " : "Correct answer: "}
                <strong>{String.fromCharCode(65 + q.correctAnswer)}) {options[q.correctAnswer]}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-end">
          {!showAnswer ? (
            <button
              onClick={checkAnswer}
              disabled={selectedAnswer === null && selectedAnswer !== null}
              className="px-8 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              {lang === "ru" ? "Проверить" : lang === "kz" ? "Тексеру" : "Check"}
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="px-8 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              {currentIndex < questions.length - 1
                ? t("test.next", lang) + " →"
                : t("test.results", lang)}
            </button>
          )}
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
