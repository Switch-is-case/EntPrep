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
  }, [id]);

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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] border border-border p-8 md:p-12 shadow-2xl text-center"
        >
          <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${isDiagnostic ? "bg-blue-100 text-blue-600" : "bg-primary/10 text-primary"}`}>
            {isDiagnostic ? (lang === "ru" ? "Диагностика" : "Диагностика") : (lang === "ru" ? "Пробный ЕНТ" : "Сынақ ҰБТ")}
          </div>

          <h1 className="text-3xl font-black text-text mb-8">
            {lang === "ru" ? "Ваш результат" : "Сенің нәтижең"}
          </h1>
  
          <div className="relative inline-flex items-center justify-center mb-10">
            <div className={`w-48 h-48 rounded-full border-[12px] border-slate-100 flex items-center justify-center ${isDiagnostic ? "border-blue-50" : "border-slate-100"}`}>
              <div className={`text-6xl font-black ${isDiagnostic ? "text-blue-600" : "text-primary"}`}>{data.session.score}</div>
            </div>
            <div className={`absolute -bottom-4 ${isDiagnostic ? "bg-blue-600" : "bg-primary"} text-white px-6 py-2 rounded-full font-bold text-sm shadow-xl`}>
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

        <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 mb-10">
          <h3 className="font-bold text-indigo-900 mb-2">
            {lang === "ru" ? "Что дальше? 🤔" : "Әрі қарай не болады? 🤔"}
          </h3>
          <p className="text-indigo-800 text-sm mb-6">
            {lang === "ru" 
              ? "Наш ИИ готов проанализировать твои ошибки и составить персональный план обучения."
              : "Біздің ИИ сенің қателеріңді талдап, жеке оқу жоспарын құруға дайын."}
          </p>
          <button
            onClick={generateRoadmap}
            disabled={generating}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
          >
            {generating ? <Spinner size="sm" color="white" /> : (lang === "ru" ? "Создать AI Roadmap ✨" : "AI Roadmap жасау ✨")}
          </button>
        </div>

        <Link href="/" className="text-text-secondary font-bold hover:text-primary transition-colors">
          ← {lang === "ru" ? "Вернуться на главную" : "Басты бетке оралу"}
        </Link>
      </motion.div>
    </div>
  );
}
