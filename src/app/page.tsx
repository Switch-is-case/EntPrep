"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

export default function HomePage() {
  const { lang, user } = useApp();

  // Auto-seed questions on first visit
  useEffect(() => {
    fetch("/api/seed", { method: "POST" }).catch(() => {});
  }, []);

  const features = [
    {
      icon: <span className="w-6 h-6 flex items-center justify-center">1</span>,
      title: t("home.features.diagnostic", lang),
      desc: t("home.features.diagnostic.desc", lang),
    },
    {
      icon: <span className="w-6 h-6 flex items-center justify-center">2</span>,
      title: t("home.features.ai", lang),
      desc: t("home.features.ai.desc", lang),
    },
    {
      icon: <span className="w-6 h-6 flex items-center justify-center">3</span>,
      title: t("home.features.practice", lang),
      desc: t("home.features.practice.desc", lang),
    },
    {
      icon: <span className="w-6 h-6 flex items-center justify-center">4</span>,
      title: t("home.features.progress", lang),
      desc: t("home.features.progress.desc", lang),
    },
  ];

  const stats = [
    { value: "140", label: lang === "ru" ? "Вопросов в ЕНТ" : lang === "kz" ? "ЕНТ-дегі сұрақтар" : "Questions in ENT" },
    { value: "5", label: lang === "ru" ? "Предметов" : lang === "kz" ? "Пәндер" : "Subjects" },
    { value: "3", label: lang === "ru" ? "Языка" : lang === "kz" ? "Тіл" : "Languages" },
    { value: "AI", label: lang === "ru" ? "Рекомендации" : lang === "kz" ? "Ұсыныстар" : "Recommendations" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 border-b border-slate-100">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              {lang === "ru"
                ? "Платформа подготовки к ЕНТ"
                : lang === "kz"
                ? "ЕНТ-ге дайындық платформасы"
                : "ENT Preparation Platform"}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-6 tracking-tight">
              {t("home.hero.title", lang)}
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
              {t("home.hero.subtitle", lang)}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/tests"
                    className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors hover:bg-primary-dark"
                  >
                    {t("test.startDiagnostic", lang)}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/practice"
                    className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:border-primary hover:text-primary transition-colors"
                  >
                    {t("practice.title", lang)}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors hover:bg-primary-dark"
                  >
                    {t("home.hero.cta", lang)}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:border-primary hover:text-primary transition-colors"
                  >
                    {t("nav.login", lang)}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-slate-50/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            {lang === "ru"
              ? "Возможности платформы"
              : lang === "kz"
              ? "Платформа мүмкіндіктері"
              : "Platform Features"}
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto font-medium">
            {lang === "ru"
              ? "Всё необходимое для успешной подготовки к ЕНТ"
              : lang === "kz"
              ? "ЕНТ-ге сәтті дайындалу үшін барлық қажетті"
              : "Everything you need for successful ENT preparation"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-primary transition-colors duration-150"
            >
              <div
                className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold mb-6"
              >
                {feature.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ENT Format Explanation */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              {lang === "ru"
                ? "Формат ЕНТ"
                : lang === "kz"
                ? "ЕНТ форматы"
                : "ENT Format"}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-primary">
                {lang === "ru"
                  ? "Обязательные предметы"
                  : lang === "kz"
                  ? "Міндетті пәндер"
                  : "Mandatory Subjects"}
              </h3>
              <div className="space-y-3">
                {[
                  { name: lang === "ru" ? "Математическая грамотность" : lang === "kz" ? "Математикалық сауаттылық" : "Math Literacy", q: 10 },
                  { name: lang === "ru" ? "Грамотность чтения" : lang === "kz" ? "Оқу сауаттылығы" : "Reading Literacy", q: 10 },
                  { name: lang === "ru" ? "История Казахстана" : lang === "kz" ? "Қазақстан тарихы" : "History of KZ", q: 20 },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <span className="text-sm font-bold text-slate-700">{s.name}</span>
                    <span className="text-xs font-bold bg-white border border-slate-200 text-primary px-3 py-1 rounded-lg">
                      {s.q} {lang === "ru" ? "вопросов" : lang === "kz" ? "сұрақ" : "questions"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-800">
                {lang === "ru"
                  ? "Профильные предметы (выбираете 2)"
                  : lang === "kz"
                  ? "Профильдік пәндер (2-уін таңдайсыз)"
                  : "Profile Subjects (choose 2)"}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <span className="text-sm font-bold text-slate-700">
                    {lang === "ru" ? "Профильный предмет 1" : lang === "kz" ? "Профильдік пән 1" : "Profile Subject 1"}
                  </span>
                  <span className="text-xs font-bold bg-white border border-slate-200 text-primary px-3 py-1 rounded-lg">
                    40 {lang === "ru" ? "вопросов" : lang === "kz" ? "сұрақ" : "questions"}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <span className="text-sm font-bold text-slate-700">
                    {lang === "ru" ? "Профильный предмет 2" : lang === "kz" ? "Профильдік пән 2" : "Profile Subject 2"}
                  </span>
                  <span className="text-xs font-bold bg-white border border-slate-200 text-primary px-3 py-1 rounded-lg">
                    40 {lang === "ru" ? "вопросов" : lang === "kz" ? "сұрақ" : "questions"}
                  </span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-slate-900 rounded-xl">
                <p className="text-sm font-bold text-center text-white">
                  {lang === "ru"
                    ? "Итого: 140 вопросов"
                    : lang === "kz"
                    ? "Барлығы: 140 сұрақ"
                    : "Total: 140 questions"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-lg">
              ENTPrep<span className="text-primary-light ml-0.5 text-xs">AI</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            {lang === "ru"
              ? "Платформа подготовки к ЕНТ с использованием AI"
              : lang === "kz"
              ? "AI қолданатын ЕНТ-ге дайындық платформасы"
              : "ENT Preparation Platform powered by AI"}
          </p>
          <p className="text-slate-500 text-xs mt-6 font-bold uppercase tracking-widest">© 2025 ENT Prep AI</p>
        </div>
      </footer>
    </div>
  );
}
