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
      icon: "1",
      title: t("home.features.diagnostic", lang),
      desc: t("home.features.diagnostic.desc", lang),
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: "2",
      title: t("home.features.ai", lang),
      desc: t("home.features.ai.desc", lang),
      color: "from-teal-500 to-teal-600",
    },
    {
      icon: "3",
      title: t("home.features.practice", lang),
      desc: t("home.features.practice.desc", lang),
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: "4",
      title: t("home.features.progress", lang),
      desc: t("home.features.progress.desc", lang),
      color: "from-amber-500 to-amber-600",
    },
  ];

  const stats = [
    { value: "140", label: lang === "ru" ? "Вопросов в ЕНТ" : lang === "kz" ? "ЕНТ-дегі сұрақтар" : "Questions in ENT" },
    { value: "5", label: lang === "ru" ? "Предметов" : lang === "kz" ? "Пәндер" : "Subjects" },
    { value: "3", label: lang === "ru" ? "Языка" : lang === "kz" ? "Тіл" : "Languages" },
    { value: "AI", label: lang === "ru" ? "Рекомендации" : lang === "kz" ? "Ұсыныстар" : "Recommendations" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-bg" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              {lang === "ru"
                ? "Платформа подготовки к ЕНТ"
                : lang === "kz"
                ? "ЕНТ-ге дайындық платформасы"
                : "ENT Preparation Platform"}
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-text leading-tight mb-6">
              {t("home.hero.title", lang)}
            </h1>

            <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
              {t("home.hero.subtitle", lang)}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/tests"
                  className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-md shadow-primary/20 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
                  >
                    {t("test.startDiagnostic", lang)}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/practice"
                    className="inline-flex items-center gap-2 border-2 border-border text-text px-8 py-4 rounded-xl font-semibold text-lg hover:border-primary hover:text-primary transition-all"
                  >
                    {t("practice.title", lang)}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                  className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-md shadow-primary/20 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
                  >
                    {t("home.hero.cta", lang)}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 border-2 border-border text-text px-8 py-4 rounded-xl font-semibold text-lg hover:border-primary hover:text-primary transition-all"
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8 bg-clip-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text mb-3">
            {lang === "ru"
              ? "Возможности платформы"
              : lang === "kz"
              ? "Платформа мүмкіндіктері"
              : "Platform Features"}
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
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
              className="group bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
              >
                {feature.icon}
              </div>
              <h3 className="font-semibold text-text text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-text-secondary text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ENT Format Explanation */}
      <section className="bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-3">
              {lang === "ru"
                ? "Формат ЕНТ"
                : lang === "kz"
                ? "ЕНТ форматы"
                : "ENT Format"}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-primary">
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
                  <div key={i} className="flex items-center justify-between bg-bg rounded-lg p-3">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      {s.q} {lang === "ru" ? "вопросов" : lang === "kz" ? "сұрақ" : "questions"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-accent">
                {lang === "ru"
                  ? "Профильные предметы (выбираете 2)"
                  : lang === "kz"
                  ? "Профильдік пәндер (2-уін таңдайсыз)"
                  : "Profile Subjects (choose 2)"}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-bg rounded-lg p-3">
                  <span className="text-sm font-medium">
                    {lang === "ru" ? "Профильный предмет 1" : lang === "kz" ? "Профильдік пән 1" : "Profile Subject 1"}
                  </span>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">
                    40 {lang === "ru" ? "вопросов" : lang === "kz" ? "сұрақ" : "questions"}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-bg rounded-lg p-3">
                  <span className="text-sm font-medium">
                    {lang === "ru" ? "Профильный предмет 2" : lang === "kz" ? "Профильдік пән 2" : "Profile Subject 2"}
                  </span>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">
                    40 {lang === "ru" ? "вопросов" : lang === "kz" ? "сұрақ" : "questions"}
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                <p className="text-sm font-semibold text-center">
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
      <footer className="bg-text text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-lg">
              ENT<span className="text-primary-light">Prep</span>
              <span className="text-accent-light ml-0.5 text-xs">AI</span>
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            {lang === "ru"
              ? "Платформа подготовки к ЕНТ с использованием AI"
              : lang === "kz"
              ? "AI қолданатын ЕНТ-ге дайындық платформасы"
              : "ENT Preparation Platform powered by AI"}
          </p>
          <p className="text-gray-500 text-xs mt-4">© 2025 ENT Prep AI</p>
        </div>
      </footer>
    </div>
  );
}
