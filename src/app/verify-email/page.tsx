"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, refreshUser } = useApp();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorKey, setErrorKey] = useState<string>("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setErrorKey("verifyEmail.error.invalid");
        return;
      }
      
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          await refreshUser();
          setTimeout(() => {
            router.replace("/");
          }, 3000);
        } else {
          setStatus("error");
          if (data.error === "Token expired") {
            setErrorKey("verifyEmail.error.expired");
          } else if (data.error === "Token already used") {
            setErrorKey("verifyEmail.error.alreadyUsed");
          } else {
            setErrorKey("verifyEmail.error.invalid");
          }
        }
      } catch (err) {
        setStatus("error");
        setErrorKey("common.error");
      }
    };

    verify();
  }, [token, router, refreshUser]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <h1 className="text-xl font-bold text-slate-900">
              {t("common.loading", lang)}
            </h1>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            <h1 className="text-2xl font-bold text-slate-900">
              {t("verifyEmail.success.title", lang)}
            </h1>
            <p className="text-slate-600">
              {t("verifyEmail.success.body", lang)}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="w-16 h-16 text-red-500" />
            <h1 className="text-2xl font-bold text-slate-900">
              {t("common.error", lang)}
            </h1>
            <p className="text-slate-600">
              {t(errorKey as any, lang)}
            </p>
            <button
              onClick={() => router.replace("/login")}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors"
            >
              {t("nav.login", lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
