"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./Providers";
import { t } from "@/lib/i18n";

/**
 * Mobile-only bottom navigation bar (fixed, visible only on small screens).
 * Mirrors the pattern used by popular mobile web apps (e.g. Instagram, YouTube).
 * Hidden on md+ screens where the top navbar takes over.
 */
export function BottomNav() {
  const { lang, user, isFullPageMode } = useApp();
  const pathname = usePathname();

  // Hide BottomNav during active testing/practice or in history review
  if (!user || isFullPageMode || pathname.startsWith("/history/")) return null;

  const tabs = [
    {
      href: "/tests",
      label: t("nav.tests", lang),
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? "text-primary" : "text-text-secondary"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      href: "/practice",
      label: t("nav.practice", lang),
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? "text-primary" : "text-text-secondary"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      href: "/progress",
      label: t("nav.progress", lang),
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? "text-primary" : "text-text-secondary"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: "/history",
      label: t("nav.history", lang),
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? "text-primary" : "text-text-secondary"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: "/profile",
      label: t("nav.profile", lang),
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? "text-primary" : "text-text-secondary"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-sm border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                active ? "text-primary" : "text-text-secondary"
              }`}
            >
              {tab.icon(active)}
              <span className={`text-[10px] font-medium leading-tight ${active ? "text-primary" : "text-text-secondary"}`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-t-full" style={{ display: "none" }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
