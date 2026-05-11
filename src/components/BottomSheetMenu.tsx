"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { useApp } from "./Providers";

interface BottomSheetMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BottomSheetMenu({ isOpen, onClose }: BottomSheetMenuProps) {
  const { lang } = useApp();

  const menuItems = [
    {
      href: "/career",
      label: lang === "ru" ? "Выбор карьеры" : lang === "kz" ? "Мамандық таңдау" : "Career Wizard",
      icon: "🎯",
      color: "from-blue-500 to-indigo-600",
    },
    {
      href: "/universities",
      label: lang === "ru" ? "Университеты" : lang === "kz" ? "Университеттер" : "Universities",
      icon: "🏛️",
      color: "from-emerald-500 to-teal-600",
    },
    {
      href: "/mock-exam",
      label: lang === "ru" ? "Пробный ЕНТ" : lang === "kz" ? "Пробный ҰБТ" : "Mock Exam",
      icon: "📝",
      color: "from-amber-500 to-orange-600",
    },
    {
      href: "/analytics",
      label: lang === "ru" ? "Аналитика" : lang === "kz" ? "Аналитика" : "Analytics",
      icon: "📊",
      color: "from-purple-500 to-pink-600",
    },
    {
      href: "/profile",
      label: lang === "ru" ? "Настройки" : lang === "kz" ? "Баптаулар" : "Settings",
      icon: "⚙️",
      color: "from-slate-500 to-slate-700",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-[70] md:hidden px-6 pt-2 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-2xl"
          >
            {/* Handle bar */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onClose}
                  className="group"
                >
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="h-full flex flex-col items-center justify-center p-5 rounded-3xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-md"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-3 shadow-lg shadow-indigo-500/10`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-bold text-text text-center leading-tight">
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
