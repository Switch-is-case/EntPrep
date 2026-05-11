"use client";

import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useApp } from "./Providers";
import { t } from "@/lib/i18n";
import { usePathname } from "next/navigation";

export function VerificationBanner() {
  const { user, lang, ready } = useApp();
  const pathname = usePathname();

  // Don't show if user is verified, not logged in, or on verification pages
  if (!ready || !user || user.emailVerified || pathname === "/verify-email" || pathname === "/verify-email-pending") {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-amber-800">
          <div className="bg-amber-100 p-1.5 rounded-lg">
            <Mail className="w-4 h-4" />
          </div>
          <span className="font-medium">
            {t("verifyEmail.banner.message", lang)}
          </span>
        </div>
        <Link 
          href="/verify-email-pending" 
          className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-lg font-bold hover:bg-amber-200 transition-colors whitespace-nowrap text-xs uppercase tracking-wider"
        >
          {t("verifyEmail.banner.button", lang)}
        </Link>
      </div>
    </div>
  );
}
