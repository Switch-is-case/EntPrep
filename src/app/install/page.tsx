"use client";

import React, { useState } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { useIsPWAInstalled } from "@/hooks/useIsPWAInstalled";
import Link from "next/link";

type Platform = "ios" | "android" | null;

export default function InstallPage() {
  const { lang } = useApp();
  const isInstalled = useIsPWAInstalled();
  const [platform, setPlatform] = useState<Platform>(null);

  if (isInstalled) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">{t("install.alreadyInstalled", lang)}</h1>
        <p className="text-text-secondary mb-8">{t("install.alreadyInstalledDesc", lang)}</p>
        <Link href="/" className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all">
          {t("nav.home", lang)}
        </Link>
      </div>
    );
  }

  const iosSteps = [
    { id: 1, text: t("install.ios.step1", lang), icon: "🧭" },
    { id: 2, text: t("install.ios.step2", lang), icon: "📤" },
    { id: 3, text: t("install.ios.step3", lang), icon: "🏠" },
    { id: 4, text: t("install.ios.step4", lang), icon: "➕" },
    { id: 5, text: t("install.ios.step5", lang), icon: "🎉" },
  ];

  const androidSteps = [
    { id: 1, text: t("install.android.step1", lang), icon: "🌐" },
    { id: 2, text: t("install.android.step2", lang), icon: "⋮" },
    { id: 3, text: t("install.android.step3", lang), icon: "📲" },
    { id: 4, text: t("install.android.step4", lang), icon: "✅" },
    { id: 5, text: t("install.android.step5", lang), icon: "🎉" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text mb-3">{t("install.title", lang)}</h1>
        <p className="text-text-secondary">{t("install.desc", lang)}</p>
      </div>

      {!platform ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setPlatform("ios")}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <span className="text-5xl group-hover:scale-110 transition-transform">🍎</span>
            <span className="text-lg font-bold text-text">iOS (iPhone / iPad)</span>
          </button>
          <button
            onClick={() => setPlatform("android")}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <span className="text-5xl group-hover:scale-110 transition-transform">🤖</span>
            <span className="text-lg font-bold text-text">Android</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setPlatform(null)}
              className="flex items-center gap-2 text-primary font-bold hover:underline"
            >
              ← {t("common.back", lang)}
            </button>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-text-secondary uppercase tracking-wider">
              {platform} tutorial
            </span>
          </div>

          <div className="space-y-3">
            {(platform === "ios" ? iosSteps : androidSteps).map((step, index) => (
              <div
                key={step.id}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                  {step.id}
                </div>
                <div className="flex-1 text-sm font-medium text-text leading-tight">
                  <span className="mr-2">{step.icon}</span>
                  {step.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
