"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { MANDATORY_SUBJECTS, PROFILE_SUBJECTS } from "@/domain/tests/rules";
import { Spinner } from "@/components/Spinner";

export default function PracticePage() {
  const { lang, user, authHeaders, ready } = useApp();
  const router = useRouter();

  const [selectedSubject, setSelectedSubject] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && !user) router.push("/login");
  }, [ready, user, router]);

  const startPractice = async () => {
    if (!selectedSubject) return;
    setLoading(true);

    try {
      const res = await fetch("/api/mock/start", {
        headers: authHeaders(),
        method: "POST",
        body: JSON.stringify({ 
          mode: "practice", 
          subjectSlug: selectedSubject, 
          count: questionCount 
        }),
      });

      const data = await res.json();
      if (res.ok && data.sessionId) {
        router.push(`/mock-exam/${data.sessionId}`);
      } else {
        alert(data.error || "Failed to start practice");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!ready || !user) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const getSubjectName = (s: string) => {
    const key = `subject.${s}` as any;
    return t(key, lang);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text mb-2">
          {t("practice.title", lang)}
        </h1>
        <p className="text-text-secondary">
          {lang === "ru" 
            ? "Выборочная тренировка по конкретным предметам с моментальной проверкой ответов."
            : "Жауаптарды жедел тексерумен нақты пәндер бойынша жаттығу."}
        </p>
      </div>

      <div className="space-y-6">
        {/* Subject Selection */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-bold text-text mb-6">
            {t("practice.selectSubject", lang)}
          </h3>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-text-secondary uppercase mb-3 px-1">
                {lang === "ru" ? "Обязательные предметы" : "Міндетті пәндер"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {MANDATORY_SUBJECTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSubject(s)}
                    className={`p-4 rounded-xl border transition-all text-sm font-semibold text-left ${
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
              <p className="text-xs font-bold text-text-secondary uppercase mb-3 px-1">
                {lang === "ru" ? "Профильные предметы" : "Профильдік пәндер"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PROFILE_SUBJECTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSubject(s)}
                    className={`p-4 rounded-xl border transition-all text-sm font-semibold text-left ${
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
          </div>
        </div>

        {/* Count Selection */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-bold text-text mb-6">
            {t("practice.questionsCount", lang)}
          </h3>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 20, 25, 30].map((n) => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={`w-12 h-12 rounded-xl border font-bold transition-all flex items-center justify-center ${
                  questionCount === n
                    ? "border-primary bg-primary text-white"
                    : "border-border text-text-secondary hover:border-primary/30"
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
          className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {loading ? (
            <Spinner size="sm" color="white" />
          ) : (
            t("practice.startPractice", lang)
          )}
        </button>
      </div>
    </div>
  );
}
