"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const { lang, login, user } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in
  if (user) {
    router.replace("/profile");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      // Use window.location for a hard navigation — guarantees fresh state
      window.location.href = "/profile";
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text">{t("auth.login", lang)}</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-8 shadow-sm space-y-5">
          {error && (
            <div className="bg-danger/10 text-danger text-sm rounded-lg p-3 border border-danger/20">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
              {t("auth.email", lang)}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              placeholder="example@mail.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
              {t("auth.password", lang)}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
          >
            {loading ? t("common.loading", lang) : t("auth.login", lang)}
          </button>

          <p className="text-center text-sm text-text-secondary">
            {t("auth.noAccount", lang)}{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              {t("auth.register", lang)}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
