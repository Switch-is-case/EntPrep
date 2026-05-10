"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/components/Providers";
import { t, type Lang } from "@/lib/i18n";
import { PROFILE_SUBJECTS } from "@/domain/tests/rules";
import { Spinner } from "@/components/Spinner";

export default function ProfilePage() {
  const { lang, setLang, user, updateUser, authHeaders, ready, logout } = useApp();

  const [subject1, setSubject1] = useState("");
  const [subject2, setSubject2] = useState("");
  const [selectedLang, setSelectedLang] = useState<Lang>(lang);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !user) {
      window.location.href = "/login";
    }
  }, [ready, user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubject1(user.profileSubject1 || "");
      setSubject2(user.profileSubject2 || "");
      setSelectedLang((user.language as Lang) || lang);
    }
  }, [user, lang]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          profileSubject1: subject1 || null,
          profileSubject2: subject2 || null,
          language: selectedLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data);
        setLang(selectedLang);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else if (res.status === 401) {
        logout();
        window.location.href = "/login";
      } else {
        const errData = await res.json();
        setError(errData.error || "Ошибка сохранения");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="md" />
      </div>
    );
  }

  const popularCombos = [
    { s1: "math", s2: "physics", label: lang === "ru" ? "Физ + Мат" : lang === "kz" ? "Физ + Мат" : "Physics + Math" },
    { s1: "chemistry", s2: "biology", label: lang === "ru" ? "Хим + Био" : lang === "kz" ? "Хим + Био" : "Chem + Bio" },
    { s1: "math", s2: "informatics", label: lang === "ru" ? "Мат + Инф" : lang === "kz" ? "Мат + Инф" : "Math + CS" },
    { s1: "world_history", s2: "english", label: lang === "ru" ? "Ист + Англ" : lang === "kz" ? "Тар + Ағыл" : "Hist + Eng" },
    { s1: "geography", s2: "english", label: lang === "ru" ? "Гео + Англ" : lang === "kz" ? "Гео + Ағыл" : "Geo + Eng" },
    { s1: "biology", s2: "chemistry", label: lang === "ru" ? "Био + Хим" : lang === "kz" ? "Био + Хим" : "Bio + Chem" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Page header — only place gradient text is used */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">{t("profile.title", lang)}</h1>
        <p className="text-sm text-text-secondary mt-1">{user.email}</p>
      </div>

      <div className="space-y-5">
        {/* User card */}
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-lg text-text leading-tight">{user.name}</h2>
            <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/8 text-primary border border-primary/15">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              {lang === "ru" ? "Студент" : lang === "kz" ? "Студент" : "Student"}
            </span>
          </div>
        </div>

        {/* Language card */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-text mb-4 text-base">{t("profile.language", lang)}</h3>
          <div className="grid grid-cols-3 gap-3">
            {([
              { code: "kz" as Lang, label: "Қазақша", flag: "🇰🇿" },
              { code: "ru" as Lang, label: "Русский", flag: "🇷🇺" },
              { code: "en" as Lang, label: "English", flag: "🇬🇧" },
            ]).map((l) => (
              <button
                key={l.code}
                onClick={() => setSelectedLang(l.code)}
                className={`py-3 px-2 rounded-xl border-2 transition-all text-center ${
                  selectedLang === l.code
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30 hover:bg-slate-50"
                }`}
              >
                <div className="text-xl mb-1">{l.flag}</div>
                <div className="text-xs font-semibold text-text">{l.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Profile subjects card */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-text mb-1 text-base">{t("profile.subjects", lang)}</h3>
          <p className="text-xs text-text-secondary mb-4">
            {lang === "ru" ? "Быстрый выбор популярных комбинаций" : lang === "kz" ? "Танымал комбинацияларды жылдам таңдау" : "Quick select popular combinations"}
          </p>

          {/* Combo chips — flat, no nesting */}
          <div className="flex flex-wrap gap-2 mb-5">
            {popularCombos.map((combo) => (
              <button
                key={combo.label}
                onClick={() => { setSubject1(combo.s1); setSubject2(combo.s2); }}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  subject1 === combo.s1 && subject2 === combo.s2
                    ? "border-accent bg-accent text-white shadow-sm"
                    : "border-border text-text-secondary hover:border-accent/40 hover:text-accent hover:bg-accent/5"
                }`}
              >
                {combo.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">
                {t("profile.subject1", lang)}
              </label>
              <select
                value={subject1}
                onChange={(e) => setSubject1(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white transition-all"
              >
                <option value="">—</option>
                {PROFILE_SUBJECTS.filter((s) => s !== subject2).map((s) => (
                  <option key={s} value={s}>
                    {t(`subject.${s}` as keyof typeof import("@/lib/i18n").translations, lang)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">
                {t("profile.subject2", lang)}
              </label>
              <select
                value={subject2}
                onChange={(e) => setSubject2(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white transition-all"
              >
                <option value="">—</option>
                {PROFILE_SUBJECTS.filter((s) => s !== subject1).map((s) => (
                  <option key={s} value={s}>
                    {t(`subject.${s}` as keyof typeof import("@/lib/i18n").translations, lang)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-danger/8 text-danger text-sm rounded-xl p-3 text-center border border-danger/20">
            {error}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 active:scale-[0.99]"
        >
          {saving ? t("common.loading", lang) : saved ? `✓ ${t("profile.saved", lang)}` : t("profile.save", lang)}
        </button>

      </div>
    </div>
  );
}

