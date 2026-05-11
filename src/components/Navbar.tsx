"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./Providers";
import { t, type Lang } from "@/lib/i18n";
import { useIsPWAInstalled } from "@/hooks/useIsPWAInstalled";

import { ChevronDown, User, LogOut } from "lucide-react";

const langLabels: Record<Lang, string> = {
  kz: "Қаз",
  ru: "Рус",
  en: "Eng",
};

// --- ICONS (Lucide style) ---
const Icons = {
  Tests: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Practice: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  MockExam: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <circle cx="12" cy="12" r="6" strokeWidth={2} />
      <circle cx="12" cy="12" r="2" strokeWidth={2} />
    </svg>
  ),
  Roadmap: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Career: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  Universities: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  History: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Progress: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

export default function Navbar() {
  const { lang, setLang, user, logout } = useApp();
  const isInstalled = useIsPWAInstalled();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Close dropdown on ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMenuOpen]);

  const mainLinks = user
    ? [
        { href: "/tests", label: t("nav.tests", lang), icon: Icons.Tests },
        { href: "/practice", label: t("nav.practice", lang), icon: Icons.Practice },
        { href: "/roadmap", label: t("nav.roadmap", lang), icon: Icons.Roadmap },
        { href: "/progress", label: t("nav.progress", lang), icon: Icons.Progress },
        { href: "/history", label: t("nav.history", lang), icon: Icons.History },
        { href: "/universities", label: t("nav.universities", lang), icon: Icons.Universities },
      ]
    : [];

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Download */}
          <div className="flex items-center gap-3 xl:gap-6">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-lg text-text hidden xl:inline-block">
                ENT<span className="text-primary">Prep</span>
                <span className="text-accent ml-0.5 text-xs tracking-tighter">AI</span>
              </span>
            </Link>

            {!isInstalled && (
              <Link
                href="/install"
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-[10px] font-bold border border-primary/10 shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">{t("nav.download", lang)}</span>
              </Link>
            )}
          </div>

          {/* Center: Desktop Nav (Breakpoint moved to lg: 1024px) */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center px-2 xl:px-4">
            {mainLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2 xl:px-4 py-2 rounded-xl text-[11px] xl:text-sm font-bold whitespace-nowrap transition-all ${
                    active
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                      : "text-text-secondary hover:text-text hover:bg-gray-100"
                  }`}
                >
                  <span className="shrink-0"><link.icon /></span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Language & Auth */}
          <div className="flex items-center gap-2 xl:gap-4">
            {/* Language switcher */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              {(["kz", "ru", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-lg text-[9px] xl:text-[10px] font-black uppercase transition-all ${
                    lang === l
                      ? "bg-white text-primary shadow-sm"
                      : "text-text-secondary hover:text-text"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Auth */}
            {user ? (
              <div className="hidden lg:flex items-center relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {(user.name?.[0] || user.email[0]).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-text hidden xl:block">
                    {user.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 mb-1">
                      <div className="font-black text-slate-900 text-sm truncate">{user.name}</div>
                      <div className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">
                        {t("nav.student", lang)}
                      </div>
                    </div>
                    
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      {t("nav.profile", lang)}
                    </Link>
                    
                    <div className="h-px bg-slate-100 my-1 mx-2" />
                    
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("nav.logout", lang)}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-text-secondary hover:text-text px-2 xl:px-3 py-2"
                >
                  {t("nav.login", lang)}
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-black bg-primary text-white px-3 xl:px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/10"
                >
                  {t("nav.register", lang)}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
