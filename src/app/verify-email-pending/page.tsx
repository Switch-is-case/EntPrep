"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, ArrowLeft, LogOut } from "lucide-react";
import { t } from "@/lib/i18n";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function VerifyEmailPendingPage() {
  const { lang, user, logout, ready } = useRequireAuth();
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setResending(true);
    setMessage(null);
    
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("ent-token")}`,
        },
      });

      if (res.ok) {
        setMessage({ type: "success", text: t("verifyEmail.pending.resendSuccess", lang) });
        setCooldown(60);
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || t("common.error", lang) });
      }
    } catch (err) {
      setMessage({ type: "error", text: t("common.error", lang) });
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Mail className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {t("verifyEmail.pending.title", lang)}
            </h1>
            <p className="text-slate-600">
              {t("verifyEmail.pending.body", lang).replace("{email}", user?.email || "...")}
            </p>
          </div>

          {message && (
            <div className={`w-full p-3 rounded-xl text-sm font-medium ${
              message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}>
              {message.text}
            </div>
          )}

          <div className="w-full space-y-3">
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {resending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : cooldown > 0 ? (
                `${t("verifyEmail.pending.resendButton", lang)} (${cooldown}s)`
              ) : (
                t("verifyEmail.pending.resendButton", lang)
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t("nav.logout", lang)}
            </button>
          </div>

          <button
            onClick={() => router.push("/")}
            className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.back", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
