"use client";

import React from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
}

export function ChartCard({
  title,
  subtitle,
  children,
  actions,
  loading = false,
}: ChartCardProps) {
  return (
    <div className="bg-surface-base border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-text">{title}</h3>
          {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="relative min-h-[300px] w-full">
        {loading ? (
          <div className="absolute inset-0 flex flex-col gap-4 animate-pulse">
            <div className="flex-1 bg-surface-raised rounded-lg" />
            <div className="h-4 bg-surface-raised rounded-full w-full" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
