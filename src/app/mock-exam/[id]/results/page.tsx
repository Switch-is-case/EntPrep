"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useApp } from "@/components/Providers";
import { Spinner } from "@/components/Spinner";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MockResultsPage() {
  const { id } = useParams();
  const { lang, authHeaders, user } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/mock/${id}`, { headers: authHeaders() });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [id, authHeaders]);

  const generateRoadmap = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ sessionId: id, userId: user?.id }),
      });
      if (res.ok) {
        window.location.href = "/roadmap";
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !data) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const results = data.session.results || {};
  const breakdown = results.subjectBreakdown || {};

    const isDiagnostic = data.session?.testType === "diagnostic";

    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 text-center">
          <div className={`inline-block px-4 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-6 bg-slate-100 text-slate-500`}>
            {isDiagnostic ? (lang === "ru" ? "Диагностика" : "Диагностика") : (lang === "ru" ? "Пробный ЕНТ" : "Сынақ ҰБТ")}
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">
            {lang === "ru" ? "Ваш результат" : "Сенің нәтижең"}
          </h1>
  
          <div className="relative inline-flex items-center justify-center mb-12">
            <div className={`w-48 h-48 rounded-full border-[10px] border-slate-50 flex items-center justify-center`}>
              <div className={`text-6xl font-bold text-primary`}>{data.session.score}</div>
            </div>
            <div className={`absolute -bottom-4 bg-primary text-white px-6 py-2 rounded-xl font-bold text-sm`}>
              {lang === "ru" ? `ИЗ ${isDiagnostic ? 25 : 140}` : `${isDiagnostic ? 25 : 140}-ТАН`}
            </div>
          </div>

        <div className="grid grid-cols-1 gap-4 mb-12 text-left">
          {Object.values(breakdown).map((sub: any, idx) => (
            <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-border flex justify-between items-center">
              <div>
                <div className="font-bold text-text mb-1">{sub.name}</div>
                <div className="text-xs text-text-secondary uppercase tracking-widest">
                  {Math.round((sub.score / sub.total) * 100)}% {lang === "ru" ? "правильно" : "дұрыс"}
                </div>
              </div>
              <div className={`text-2xl font-black ${isDiagnostic ? "text-blue-600" : "text-primary"}`}>{sub.score} <span className="text-text-secondary text-sm">/ {sub.total}</span></div>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-200 mb-10 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
            {lang === "ru" ? "Что дальше?" : "Әрі қарай не болады?"}
          </h3>
          <p className="text-slate-600 font-medium mb-8 max-w-sm mx-auto">
            {lang === "ru" 
              ? "Наш ИИ готов проанализировать твои ошибки и составить персональный план обучения."
              : "Біздің ИИ сенің қателеріңді талдап, жеке оқу жоспарын құруға дайын."}
          </p>
          <button
            onClick={generateRoadmap}
            disabled={generating}
            className="w-full max-w-xs mx-auto bg-primary text-white py-4 px-8 rounded-2xl font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            {generating ? <Spinner size="sm" color="white" /> : (
              <>
                <span>{lang === "ru" ? "Создать AI Roadmap" : "AI Roadmap жасау"}</span>
              </>
            )}
          </button>
        </div>

        <Link href="/" className="text-slate-400 font-bold hover:text-primary transition-colors text-sm">
          ← {lang === "ru" ? "Вернуться на главную" : "Басты бетке оралу"}
        </Link>
      </div>
    </div>
  );
}
