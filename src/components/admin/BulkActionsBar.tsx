"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Pencil, Trash2, X } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";

interface BulkActionsBarProps {
  selectedCount: number;
  lang: Lang;
  onClear: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: (format: "csv" | "json") => void;
}

export function BulkActionsBar({
  selectedCount,
  lang,
  onClear,
  onEdit,
  onDelete,
  onExport
}: BulkActionsBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 100, x: "-50%", opacity: 0 }}
          className="fixed bottom-8 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-2xl"
        >
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/60 px-3 py-2 backdrop-blur-md">
            {/* Counter */}
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </div>
              <span className="text-sm font-bold text-blue-400 whitespace-nowrap">
                {t("admin.bulk.selected", lang, { count: selectedCount })}
              </span>
            </div>

            <div className="w-px h-8 bg-slate-800 mx-1 hidden sm:block" />

            {/* Actions Wrapper */}
            <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => onExport("json")}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">{t("admin.bulk.export", lang)}</span>
              </button>

              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all whitespace-nowrap"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden md:inline">{t("admin.bulk.edit", lang)}</span>
              </button>

              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden md:inline">{t("admin.bulk.delete", lang)}</span>
              </button>
            </div>

            <div className="w-px h-8 bg-slate-800 mx-1" />

            {/* Close */}
            <button
              onClick={onClear}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title={t("admin.bulk.clear", lang)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
