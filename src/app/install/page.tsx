"use client";

import React, { useState } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { useIsPWAInstalled } from "@/hooks/useIsPWAInstalled";
import Link from "next/link";
import { 
  Compass, 
  Share, 
  Home, 
  Plus, 
  CheckCircle2, 
  Globe, 
  MoreVertical, 
  Smartphone, 
  Check, 
  ArrowLeft 
} from "lucide-react";

type Platform = "ios" | "android" | null;

const AppleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 256 315" className={className} fill="currentColor" aria-label="iOS">
    <path d="M213.803,167.03c0.442,47.547,41.74,63.413,42.197,63.615c-0.348,1.163-6.61,22.729-21.824,44.921 c-13.148,19.167-26.784,38.256-48.21,38.653c-21.059,0.391-27.842-12.443-51.905-12.443c-24.066,0-31.593,12.046-51.52,12.83 c-20.672,0.785-36.568-20.75-49.803-39.814C5.553,235.105-15.011,162.222,6.589,124.793c10.72-18.574,29.743-30.301,50.601-30.603 c20.279-0.302,39.387,13.688,51.722,13.688c12.33,0,35.631-16.892,60.518-14.364c10.413,0.433,39.674,4.214,58.46,31.717 c-1.518,0.946-34.937,20.363-34.587,60.799L213.803,167.03z M174.453,60.771c11.082-13.435,18.544-32.112,16.512-50.771 c-16.035,0.645-35.43,10.679-46.942,24.114c-10.316,12.046-19.347,31.058-16.924,49.277C144.974,84.819,163.364,74.21,174.453,60.771 L174.453,60.771z" />
  </svg>
);

const AndroidIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="#3DDC84" aria-label="Android">
    <path d="M17.523 15.3414C17.523 14.8614 17.133 14.4714 16.653 14.4714C16.173 14.4714 15.783 14.8614 15.783 15.3414C15.783 15.8214 16.173 16.2114 16.653 16.2114C17.133 16.2114 17.523 15.8214 17.523 15.3414ZM8.217 15.3414C8.217 14.8614 7.827 14.4714 7.347 14.4714C6.867 14.4714 6.477 14.8614 6.477 15.3414C6.477 15.8214 6.867 16.2114 7.347 16.2114C7.827 16.2114 8.217 15.8214 8.217 15.3414ZM18.003 10.3814L19.983 6.94142C20.103 6.74142 20.033 6.48142 19.833 6.36142C19.633 6.24142 19.373 6.31142 19.253 6.51142L17.223 10.0214C15.713 9.33142 14.043 8.94142 12.303 8.94142C10.563 8.94142 8.89299 9.33142 7.38299 10.0214L5.35299 6.51142C5.23299 6.31142 4.97299 6.24142 4.77299 6.36142C4.57299 6.48142 4.50299 6.74142 4.62299 6.94142L6.60299 10.3814C3.89299 11.9014 2.10299 14.6514 2.01299 17.8414H22.593C22.503 14.6514 20.713 11.9014 18.003 10.3814Z" />
  </svg>
);

export default function InstallPage() {
  const { lang } = useApp();
  const isInstalled = useIsPWAInstalled();
  const [platform, setPlatform] = useState<Platform>(null);

  if (isInstalled) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" strokeWidth={3} />
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
    { id: 1, text: t("install.ios.step1", lang), icon: Compass },
    { id: 2, text: t("install.ios.step2", lang), icon: Share },
    { id: 3, text: t("install.ios.step3", lang), icon: Home },
    { id: 4, text: t("install.ios.step4", lang), icon: Plus },
    { id: 5, text: t("install.ios.step5", lang), icon: CheckCircle2 },
  ];

  const androidSteps = [
    { id: 1, text: t("install.android.step1", lang), icon: Globe },
    { id: 2, text: t("install.android.step2", lang), icon: MoreVertical },
    { id: 3, text: t("install.android.step3", lang), icon: Smartphone },
    { id: 4, text: t("install.android.step4", lang), icon: Check },
    { id: 5, text: t("install.android.step5", lang), icon: CheckCircle2 },
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
            <AppleIcon className="w-20 h-20 text-slate-700 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold text-text">iOS (iPhone / iPad)</span>
          </button>
          <button
            onClick={() => setPlatform("android")}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <AndroidIcon className="w-20 h-20 group-hover:scale-110 transition-transform" />
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
              <ArrowLeft className="w-5 h-5" />
              {t("common.back", lang)}
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
                <div className="flex-1 text-sm font-medium text-text leading-tight flex items-center gap-3">
                  <step.icon className="w-5 h-5 text-slate-600 shrink-0" aria-hidden="true" />
                  <span>{step.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
