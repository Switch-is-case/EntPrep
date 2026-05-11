"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/Spinner";
import { useApp } from "@/components/Providers";

interface RoadmapData {
  summary: {
    feasibility: "easy" | "medium" | "hard" | "very_hard";
    estimatedScoreGain: number;
    recommendedHoursPerDay: number;
  };
  weeklyPlan: Array<{
    weekIndex: number;
    focus: string;
    topics: Array<{
      id: number;
      title: string;
      objective: string;
    }>;
  }>;
  priorityTopics: Array<{
    topicId: number;
    reason: string;
    estimatedHours: number;
    impactOnScore: number;
  }>;
  motivationalMessage: string;
}

interface RoadmapResponse {
  id: number;
  userId: string;
  currentScore: number;
  targetScore: number;
  daysUntilExam: number;
  roadmapData: RoadmapData;
  generatedAt: string;
  expiresAt: string;
}

import { Target, Calendar, TrendingUp, Clock, Trophy } from "lucide-react";

export default function RoadmapPage() {
  const { lang, authHeaders } = useApp();
  const [response, setResponse] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/roadmap/latest", { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data && data.roadmapData) {
          setResponse(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authHeaders]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!response || !response.roadmapData) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center mt-10">
        <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
          <div className="flex justify-center mb-6">
            <Target className="w-20 h-20 text-slate-300" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">
            {lang === "ru" 
              ? "У вас ещё нет плана обучения" 
              : lang === "kz" 
              ? "Сізде әлі оқу жоспары жоқ"
              : "You don't have a study plan yet"}
          </h1>
          <p className="text-gray-600 mb-10 text-lg">
            {lang === "ru" 
              ? "Пройдите Пробный ЕНТ, чтобы наш AI проанализировал ваши знания и создал персональный путь к успеху."
              : lang === "kz" 
              ? "Біздің AI сіздің біліміңізді талдап, жетістікке жетелейтін жеке жоспар құруы үшін Пробный ЕНТ-дан өтіңіз."
              : "Take a Mock Exam so our AI can analyze your knowledge and create a personalized path to success."}
          </p>
          <Link 
            href="/mock-exam" 
            className="inline-block px-10 py-5 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold text-lg transition-colors"
          >
            {lang === "ru" ? "Начать Пробный ЕНТ" : lang === "kz" ? "Пробный ЕНТ бастау" : "Start Mock Exam"}
          </Link>
        </div>
      </div>
    );
  }

  const { roadmapData: data, currentScore, targetScore, daysUntilExam } = response;

  // Цвета сложности
  const feasibilityColors = {
    easy: "from-emerald-500 to-teal-600",
    medium: "from-blue-500 to-indigo-600", 
    hard: "from-orange-500 to-red-600",
    very_hard: "from-purple-600 to-rose-700"
  };

  const feasibilityLabels = {
    easy: { ru: "Легко", kz: "Оңай", en: "Easy" },
    medium: { ru: "Средне", kz: "Орташа", en: "Medium" },
    hard: { ru: "Сложно", kz: "Қиын", en: "Hard" },
    very_hard: { ru: "Очень сложно", kz: "Өте қиын", en: "Very Hard" }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      
      {/* HERO - Summary */}
      <div className="bg-gradient-to-br from-primary via-indigo-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
            {lang === "ru" ? "Твой AI-Навигатор" : lang === "kz" ? "Сіздің AI-Навигаторыңыз" : "Your AI Navigator"}
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 font-medium max-w-2xl leading-relaxed">
            {lang === "ru" 
              ? `Путь от ${currentScore} до ${targetScore} баллов за ${daysUntilExam} дней` 
              : lang === "kz" 
              ? `${daysUntilExam} күнде ${currentScore}-ден ${targetScore} баллға дейінгі жол`
              : `The path from ${currentScore} to ${targetScore} in ${daysUntilExam} days`}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-[10px] uppercase tracking-widest text-white/60 mb-2 font-black">
                {lang === "ru" ? "Сложность" : "Difficulty"}
              </div>
              <div className="text-xl font-bold">
                {feasibilityLabels[data.summary.feasibility][lang as "ru" | "kz" | "en"]}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-[10px] uppercase tracking-widest text-white/60 mb-2 font-black">
                {lang === "ru" ? "Прогноз прироста" : "Score Gain"}
              </div>
              <div className="text-xl font-bold">
                +{data.summary.estimatedScoreGain} баллов
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-[10px] uppercase tracking-widest text-white/60 mb-2 font-black">
                {lang === "ru" ? "Нагрузка" : "Load"}
              </div>
              <div className="text-xl font-bold">
                {data.summary.recommendedHoursPerDay}ч / день
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: WEEKLY PLAN */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" aria-hidden="true" />
              </div>
              {lang === "ru" ? "Пошаговый план" : "Step-by-Step Plan"}
            </h2>
            <div className="space-y-10">
              {data.weeklyPlan?.map((week) => (
                <div key={week.weekIndex} className="relative pl-8 border-l-4 border-primary/20 hover:border-primary transition-colors">
                  <div className="absolute -left-[14px] top-0 w-6 h-6 bg-white border-4 border-primary rounded-full z-10"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-tighter">
                      {lang === "ru" ? "Неделя" : "Week"} {week.weekIndex}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800">{week.focus}</h3>
                  </div>
                  <div className="space-y-3">
                    {week.topics?.map((topic) => (
                      <div key={topic.id} className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 hover:bg-gray-50 transition-colors">
                        <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                          {topic.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{topic.objective}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRIORITY & MOTIVATION */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* PRIORITY TOPICS */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" aria-hidden="true" />
              </div>
              {lang === "ru" ? "Точки роста" : "Growth Areas"}
            </h2>
            <div className="space-y-4">
              {data.priorityTopics?.map((topic, i) => (
                <div key={i} className="group p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white border-2 border-orange-200 text-orange-600 rounded-lg flex items-center justify-center font-black text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 mb-3 leading-snug">{topic.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-gray-500 border border-gray-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" aria-hidden="true" /> {topic.estimatedHours}ч
                        </span>
                        <span className="px-3 py-1 bg-green-100 rounded-full text-[10px] font-bold text-green-700">
                          +{topic.impactOnScore} БАЛЛОВ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MOTIVATIONAL MESSAGE */}
          {data.motivationalMessage && (
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="mb-4">
                  <Trophy className="w-12 h-12 text-white/90" aria-hidden="true" />
                </div>
                <p className="text-lg leading-relaxed font-bold italic opacity-95">
                  &quot;{data.motivationalMessage}&quot;
                </p>
              </div>
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <svg width="160" height="160" viewBox="0 0 24 24" fill="white"><path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/></svg>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="grid grid-cols-1 gap-4">
            <Link 
              href="/practice" 
              className="px-8 py-5 bg-primary text-white rounded-2xl font-black text-center transition-colors"
            >
              {lang === "ru" ? "ПЕРЕЙТИ К ПРАКТИКЕ" : "GO TO PRACTICE"}
            </Link>
            <Link 
              href="/mock-exam" 
              className="px-8 py-5 bg-white border-2 border-primary/20 text-primary rounded-2xl font-black text-center hover:bg-gray-50 transition-colors"
            >
              {lang === "ru" ? "НОВЫЙ ПРОБНЫЙ ЕНТ" : "NEW MOCK EXAM"}
            </Link>
          </div>

          <div className="text-center">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <Calendar className="w-3 h-3" aria-hidden="true" /> {lang === "ru" ? "Обновлено" : "Updated"}: {new Date(response.generatedAt).toLocaleDateString()}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
