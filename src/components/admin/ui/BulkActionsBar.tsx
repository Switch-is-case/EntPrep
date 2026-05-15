"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { t, type Lang } from "@/lib/i18n";

export interface BulkAction {
  key: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  actions: BulkAction[];
  lang: Lang;
}

export function BulkActionsBar({
  selectedCount,
  onClear,
  actions,
  lang
}: BulkActionsBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 100, x: "-50%", opacity: 0 }}
          className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-1 bg-surface-base/95 backdrop-blur-md border border-border rounded-xl shadow-2xl shadow-black/50 px-2 py-1.5">
            {/* Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 shrink-0">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-text whitespace-nowrap">
                {t("admin.bulk.selected", lang, { count: selectedCount })}
              </span>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Actions */}
            <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
              {actions.map((action) => (
                <button
                  key={action.key}
                  onClick={action.onClick}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                    action.variant === "danger"
                      ? "text-danger hover:text-danger hover:bg-danger/10"
                      : "text-text-secondary hover:text-text hover:bg-surface-raised"
                  )}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {action.icon}
                  </div>
                  {action.label}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Clear selection */}
            <button
              onClick={onClear}
              className="p-1.5 text-text-secondary hover:text-text hover:bg-surface-raised rounded-lg transition-colors"
              title={t("admin.bulk.clear", lang)}
              aria-label={t("admin.bulk.clear", lang)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
