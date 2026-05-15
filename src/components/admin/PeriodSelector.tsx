"use client";

import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

export type Period = "7d" | "30d" | "90d";

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const { lang } = useApp();
  const periods: { value: Period; labelKey: string }[] = [
    { value: "7d", labelKey: "admin.period.7d" },
    { value: "30d", labelKey: "admin.period.30d" },
    { value: "90d", labelKey: "admin.period.90d" },
  ];

  return (
    <div className="flex bg-surface-raised p-1 rounded-lg">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            value === p.value
              ? "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:text-text"
          }`}
        >
          {t(p.labelKey as any, lang)}
        </button>
      ))}
    </div>
  );
}
