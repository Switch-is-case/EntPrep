"use client";

import React, { useState } from "react";
import { Spinner } from "@/components/Spinner";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function MockExamLanding() {
  const { lang, user, authHeaders, ready } = useRequireAuth({ requireVerified: true });
  const [loading, setLoading] = useState(false);

  const startMock = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/mock/start", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.sessionId) {
        window.location.href = `/mock-exam/${data.sessionId}`;
      } else {
        alert(data.error || "Failed to start");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const hasGoals = !!user?.targetCombinationId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] border border-border p-8 md:p-12 text-center shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-primary via-indigo-500 to-primary" />
        
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
          {hasGoals ? "📝" : "🎯"}
        </div>

        <h1 className="text-4xl font-black text-text mb-4">
          {hasGoals 
            ? (lang === "ru" ? "Симулятор ЕНТ" : "ҰБТ Симуляторы")
            : (lang === "ru" ? "Сначала выберите цель" : "Алдымен мақсатты таңдаңыз")}
        </h1>
        
        <p className="text-text-secondary text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          {hasGoals
            ? (lang === "ru" 
                ? "Полноценная имитация реального экзамена. Проверь свои силы перед настоящим тестированием."
                : "Нағыз емтиханның толық симуляциясы. Нағыз тестілеу алдында өз күшіңді сынап көр.")
            : (lang === "ru"
                ? "Чтобы составить точный вариант экзамена, нам нужно знать ваши профильные предметы."
                : "Емтихан нұсқасын дұрыс жасау үшін бізге сіздің профильдік пәндеріңізді білу керек.")}
        </p>

        {hasGoals ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 text-left">
              <div className="bg-slate-50 p-6 rounded-3xl border border-border">
                <div className="text-xs font-bold text-primary uppercase mb-1">{lang === "ru" ? "Вопросов" : "Сұрақтар"}</div>
                <div className="text-2xl font-black text-text">140</div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-border">
                <div className="text-xs font-bold text-indigo-500 uppercase mb-1">{lang === "ru" ? "Время" : "Уақыт"}</div>
                <div className="text-2xl font-black text-text">240 {lang === "ru" ? "мин" : "мин"}</div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-border">
                <div className="text-xs font-bold text-emerald-500 uppercase mb-1">{lang === "ru" ? "Макс. балл" : "Макс. балл"}</div>
                <div className="text-2xl font-black text-text">140</div>
              </div>
            </div>

            <div className="space-y-4 mb-12 text-left bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100">
              <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[10px]">!</span>
                {lang === "ru" ? "Правила симуляции:" : "Симуляция ережелері:"}
              </h3>
              <ul className="text-sm text-indigo-800 space-y-2 list-disc list-inside">
                <li>{lang === "ru" ? "Таймер не останавливается при выходе" : "Шыққан кезде таймер тоқтамайды"}</li>
                <li>{lang === "ru" ? "Можно переключаться между предметами" : "Пәндер арасында ауысуға болады"}</li>
                <li>{lang === "ru" ? "Результат будет доступен сразу после завершения" : "Нәтиже аяқталғаннан кейін бірден қолжетімді болады"}</li>
                <li>{lang === "ru" ? "AI построит план подготовки на основе ошибок" : "ИИ қателер негізінде дайындық жоспарын құрады"}</li>
              </ul>
            </div>

            <button
              onClick={startMock}
              disabled={loading}
              className="w-full sm:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-bold text-xl hover:bg-primary-dark shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Spinner size="sm" color="white" /> : (lang === "ru" ? "Начать экзамен 🚀" : "Емтиханды бастау 🚀")}
            </button>
          </>
        ) : (
          <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 mb-8">
            <p className="text-amber-800 font-medium mb-6">
              {lang === "ru" 
                ? "Пожалуйста, выберите направление обучения и предметы ЕНТ в мастере карьеры."
                : "Мансап шеберінен оқу бағыты мен ҰБТ пәндерін таңдаңыз."}
            </p>
            <a
              href="/career"
              className="inline-block px-10 py-4 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-200"
            >
              {lang === "ru" ? "Перейти к выбору →" : "Таңдауға өту →"}
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
}
