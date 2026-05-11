"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./Providers";
import { t, type Lang } from "@/lib/i18n";

import { useIsPWAInstalled } from "@/hooks/useIsPWAInstalled";

const langLabels: Record<Lang, string> = {
  kz: "Қаз",
  ru: "Рус",
  en: "Eng",
};

export default function Navbar() {
  const { lang, setLang, user, logout } = useApp();
  const isInstalled = useIsPWAInstalled();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = user
    ? [
        { href: "/tests", label: t("nav.tests", lang) },
        { href: "/practice", label: t("nav.practice", lang) },
        { href: "/universities", label: t("nav.universities", lang) },
        { href: "/progress", label: t("nav.progress", lang) },
        { href: "/history", label: t("nav.history", lang) },
        { href: "/profile", label: t("nav.profile", lang) },
      ]
    : [];

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-lg text-text">
                ENT<span className="text-primary">Prep</span>
                <span className="text-accent ml-0.5 text-xs">AI</span>
              </span>
            </Link>

            {/* Download Button */}
            {!isInstalled && (
              <Link
                href="/install"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs sm:text-sm font-bold border border-primary/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden xs:inline">{t("nav.download", lang)}</span>
              </Link>
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-text hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(["kz", "ru", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                    lang === l
                      ? "bg-white text-primary shadow-sm"
                      : "text-text-secondary hover:text-text"
                  }`}
                >
                  {langLabels[l]}
                </button>
              ))}
            </div>

            {/* Auth buttons */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-text-secondary">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-danger hover:text-red-700 font-medium"
                >
                  {t("nav.logout", lang)}
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-text-secondary hover:text-text px-3 py-2"
                >
                  {t("nav.login", lang)}
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
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
