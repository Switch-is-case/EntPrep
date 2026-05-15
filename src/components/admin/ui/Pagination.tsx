"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { t, type Lang } from "@/lib/i18n";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  lang: Lang;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  lang
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text hover:bg-surface-raised rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronLeft className="w-4 h-4" />
        {t("admin.common.prev", lang)}
      </button>

      <div className="flex items-center gap-1">
        {[...Array(totalPages)].map((_, i) => {
          const p = i + 1;
          // Show first, last, and pages around current
          if (
            p === 1 ||
            p === totalPages ||
            (p >= page - 1 && p <= page + 1)
          ) {
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center text-sm font-medium rounded-xl transition-all",
                  page === p
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-text-secondary hover:text-text hover:bg-surface-raised"
                )}
              >
                {p}
              </button>
            );
          }
          if (p === page - 2 || p === page + 2) {
            return <span key={p} className="px-1 text-text-secondary">...</span>;
          }
          return null;
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text hover:bg-surface-raised rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        {t("admin.common.next", lang)}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
