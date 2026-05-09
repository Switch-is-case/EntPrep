"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/components/Providers";
import { t, type Lang } from "@/lib/i18n";
import { PROFILE_SUBJECTS } from "@/domain/tests/rules";

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
      <h1 className="text-3xl font-bold text-text mb-8">{t("profile.title", lang)}</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-lg text-text">{user.name}</h2>
              <p className="text-sm text-text-secondary">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-text mb-4">{t("profile.language", lang)}</h3>
          <div className="grid grid-cols-3 gap-3">
            {([
              { code: "kz" as Lang, label: "Қазақша", flag: "KZ" },
              { code: "ru" as Lang, label: "Русский", flag: "RU" },
              { code: "en" as Lang, label: "English", flag: "EN" },
            ]).map((l) => (
              <button
                key={l.code}
                onClick={() => setSelectedLang(l.code)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  selectedLang === l.code
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="text-xs font-bold text-primary mb-1">{l.flag}</div>
                <div className="text-sm font-medium">{l.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-text mb-2">{t("profile.subjects", lang)}</h3>
          <p className="text-sm text-text-secondary mb-4">
            {lang === "ru" ? "Быстрый выбор популярных комбинаций:" : lang === "kz" ? "Танымал комбинацияларды жылдам таңдау:" : "Quick select popular combinations:"}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
            {popularCombos.map((combo) => (
              <button
                key={combo.label}
                onClick={() => { setSubject1(combo.s1); setSubject2(combo.s2); }}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  subject1 === combo.s1 && subject2 === combo.s2
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border hover:border-accent/30 text-text-secondary"
                }`}
              >
                {combo.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                {t("profile.subject1", lang)}
              </label>
              <select
                value={subject1}
                onChange={(e) => setSubject1(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
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
              <label className="block text-sm font-medium text-text mb-1.5">
                {t("profile.subject2", lang)}
              </label>
              <select
                value={subject2}
                onChange={(e) => setSubject2(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
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

        {error && (
          <div className="bg-danger/10 text-danger text-sm rounded-lg p-3 text-center border border-danger/20">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
        >
          {saving ? t("common.loading", lang) : saved ? t("profile.saved", lang) : t("profile.save", lang)}
        </button>

        {saved && (
          <div className="bg-success/10 text-success text-sm rounded-lg p-3 text-center border border-success/20">
            {t("profile.saved", lang)}
          </div>
        )}

        <AdminAccess />
      </div>
    </div>
  );
}

function AdminAccess() {
  const { authHeaders, updateUser, user, logout } = useApp();
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleBecomeAdmin = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/make-admin", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ adminSecret: secret }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Теперь вы администратор!" });
        if (data.user && user) {
          updateUser({ ...user, ...data.user });
        }
      } else if (res.status === 401) {
        logout();
        window.location.href = "/login";
      } else {
        setMessage({ type: "error", text: data.error || "Ошибка" });
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка сети" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h3 className="font-semibold text-text mb-3">Админ-доступ</h3>
      <p className="text-sm text-text-secondary mb-4">
        Введите секретный ключ или станьте первым админом (если ещё нет ни одного).
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Секретный ключ (необязательно для 1-го)"
          className="flex-1 px-4 py-2 rounded-lg border border-border text-sm outline-none focus:border-primary"
        />
        <button
          onClick={handleBecomeAdmin}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "..." : "Стать админом"}
        </button>
      </div>
      {message && (
        <div className={`mt-3 text-sm p-2.5 rounded-lg ${
          message.type === "success"
            ? "bg-success/10 text-success border border-success/20"
            : "bg-danger/10 text-danger border border-danger/20"
        }`}>
          {message.text}
          {message.type === "success" && (
            <Link href="/admin" className="ml-2 underline font-medium">
              Перейти в админку
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
