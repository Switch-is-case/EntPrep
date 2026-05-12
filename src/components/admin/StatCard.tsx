"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple";
  loading?: boolean;
}

const colorMap = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", icon: "bg-blue-500/20" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: "bg-emerald-500/20" },
  yellow: { bg: "bg-amber-500/10", text: "text-amber-400", icon: "bg-amber-500/20" },
  red: { bg: "bg-rose-500/10", text: "text-rose-400", icon: "bg-rose-500/20" },
  purple: { bg: "bg-violet-500/10", text: "text-violet-400", icon: "bg-violet-500/20" },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
  loading = false,
}: StatCardProps) {
  const styles = colorMap[color];

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-slate-700" />
          <div className="flex-1">
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-2" />
            <div className="h-6 bg-slate-700 rounded w-3/4" />
          </div>
        </div>
        <div className="h-3 bg-slate-700 rounded w-full" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-3">
        {icon && (
          <div className={`w-12 h-12 rounded-xl ${styles.icon} flex items-center justify-center shrink-0`}>
            <div className={styles.text}>{icon}</div>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400 truncate">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-0.5">{value}</h3>
        </div>
      </div>
      
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-auto">
          {trend && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
              trend.positive ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
            }`}>
              {trend.positive ? "↑" : "↓"} {trend.value}%
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-slate-500 truncate">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
