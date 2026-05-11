"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/components/Providers";
import { Spinner } from "@/components/Spinner";
import { motion } from "framer-motion";

export default function RoadmapPage() {
  const { lang, authHeaders, user } = useApp();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoadmap() {
      try {
        const res = await fetch("/api/roadmap/latest", { headers: authHeaders() });
        const data = await res.json();
        setRoadmap(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoadmap();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (!roadmap) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] border border-border p-12 shadow-xl"
        >
          <div className="text-6xl mb-8">🗺️</div>
          <h1 className="text-3xl font-black text-text mb-4">
            {lang === "ru" ? "Дорожная карта не создана" : "Жол картасы жасалмаған"}
          </h1>
          <p className="text-text-secondary text-lg mb-10 leading-relaxed">
            {lang === "ru" 
              ? "Для создания персонального плана обучения ИИ нужно проанализировать твои знания. Пройди Mock-экзамен, и мы построим твою карту подготовки."
              : "Жеке оқу жоспарын құру үшін ИИ сенің біліміңді талдауы керек. Mock-емтиханынан өт, біз сенің дайындық картаңды жасаймыз."}
          </p>
          <a href="/mock-exam" className="inline-block bg-primary text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95">
            {lang === "ru" ? "К экзамену 🚀" : "Емтиханға 🚀"}
          </a>
        </motion.div>
      </div>
    );
  }

  const data = roadmap.roadmapData;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-4">
          Personal AI Roadmap
        </div>
        <h1 className="text-4xl font-black text-text mb-2">
          {lang === "ru" ? "Твой план подготовки" : "Сенің дайындық жоспарың"}
        </h1>
        <p className="text-text-secondary">
          {lang === "ru" ? "На основе твоего последнего Mock-экзамена" : "Соңғы Mock-емтиханың негізінде"}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Stats & Focus */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-border p-8 shadow-sm">
            <h3 className="font-bold text-text mb-6 flex items-center gap-2">
              🎯 {lang === "ru" ? "Твои цели" : "Мақсаттарың"}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-text-secondary font-medium">{lang === "ru" ? "Текущий балл" : "Қазіргі балл"}</span>
                <span className="text-2xl font-black text-text">{roadmap.currentScore}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${(roadmap.currentScore / roadmap.targetScore) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-text-secondary font-medium">{lang === "ru" ? "Целевой балл" : "Мақсатты балл"}</span>
                <span className="text-2xl font-black text-primary">{roadmap.targetScore}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="font-bold mb-4 opacity-80">{lang === "ru" ? "Фокусные зоны" : "Назар аударатын аймақтар"}</h3>
            <div className="flex flex-wrap gap-2">
              {data.focusAreas.map((area: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold border border-white/10">
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content: Weekly Plan */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-border p-8 shadow-sm">
            <h3 className="text-xl font-bold text-text mb-8">{lang === "ru" ? "Понедельный план" : "Апталық жоспар"}</h3>
            <div className="space-y-12 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {data.weeklyPlan.map((week: any, i: number) => (
                <div key={i} className="relative pl-12">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-4 border-primary flex items-center justify-center font-bold text-sm text-primary">
                    {week.week}
                  </div>
                  <h4 className="font-bold text-text mb-2">{lang === "ru" ? `Неделя ${week.week}` : `${week.week}-апта`}</h4>
                  <p className="text-sm text-text-secondary mb-4 italic">"{week.goals}"</p>
                  <ul className="space-y-2">
                    {week.tasks.map((task: string, j: number) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-text">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-[2.5rem] border border-amber-100 p-8">
            <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
              💡 {lang === "ru" ? "Советы ментора" : "Ментор кеңестері"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.tips.map((tip: string, i: number) => (
                <div key={i} className="text-sm text-amber-800 leading-relaxed">• {tip}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
