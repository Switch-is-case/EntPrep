"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { useApp } from "./Providers";

import { Building, Lightbulb, Settings } from "lucide-react";

interface BottomSheetMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BottomSheetMenu({ isOpen, onClose }: BottomSheetMenuProps) {
  const { lang } = useApp();

  const menuItems = [
    {
      href: "/universities",
      label: t("nav.universities", lang),
      icon: Building,
      color: "from-emerald-500 to-teal-600",
    },
    {
      href: "/roadmap",
      label: t("nav.aiPlan", lang),
      icon: Lightbulb,
      color: "from-amber-500 to-orange-600",
    },
    {
      href: "/profile",
      label: t("nav.settings", lang),
      icon: Settings,
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[70] md:hidden px-6 pt-2 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-lg"
          >
            {/* Handle bar */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onClose}
                  className="group"
                >
                  <div
                    className="h-full flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-200 transition-colors hover:bg-slate-50"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <item.icon className="w-8 h-8 text-primary" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 text-center leading-tight">
                      {item.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
