"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/components/Providers";
import { Spinner } from "@/components/Spinner";
import { t, type Lang } from "@/lib/i18n";

const langLabels: Record<Lang, string> = {
  kz: "Қаз",
  ru: "Рус",
  en: "Eng",
};

const adminNav = [
  { href: "/admin", labelKey: "admin.nav.dashboard", icon: "D" },
  { href: "/admin/questions", labelKey: "admin.nav.questions", icon: "Q" },
  { href: "/admin/users", labelKey: "admin.nav.users", icon: "U" },
  { href: "/admin/sessions", labelKey: "admin.nav.sessions", icon: "S" },
  { href: "/admin/universities", labelKey: "admin.nav.universities", icon: "V" },
  { href: "/admin/audit-logs", labelKey: "admin.nav.auditLogs", icon: "L" },
];

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, authHeaders, lang, setLang } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      router.push("/login");
      return;
    }

    // Check admin status
    fetch("/api/admin/stats", { headers: authHeaders() })
      .then((res) => {
        if (res.status === 403 || res.status === 401) {
          setIsAdmin(false);
        } else if (res.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => setIsAdmin(false));
  }, [user, token, router, authHeaders]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Spinner size="md" color="white" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">{t("admin.access.denied" as any, lang)}</h1>
          <p className="text-text-secondary mb-6">
            {t("admin.access.noRights" as any, lang)}
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            {t("admin.access.toHome" as any, lang)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform transition-transform md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-slate-700">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-white">
              Admin<span className="text-primary-light">Panel</span>
            </span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span className="text-xs font-bold w-5 h-5 rounded bg-slate-600 flex items-center justify-center">{item.icon}</span>
              {t(item.labelKey as any, lang)}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            {t("admin.nav.backToSite" as any, lang)}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between md:justify-end">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-4">
            {/* Language switcher */}
            <div className="flex bg-slate-700 rounded-lg p-0.5">
              {(["kz", "ru", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                    lang === l
                      ? "bg-slate-800 text-primary shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {langLabels[l]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300">{user?.name}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
