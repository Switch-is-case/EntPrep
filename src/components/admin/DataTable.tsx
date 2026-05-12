"use client";

import React, { ReactNode } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyMessage,
  loading = false,
}: DataTableProps<T>) {
  const { lang } = useApp();
  const displayEmptyMessage = emptyMessage || t("admin.common.noData", lang);
  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-slate-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-800 text-slate-400 border-b border-slate-700 font-medium">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700 bg-slate-800/30">
          {data.length > 0 ? (
            data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-700/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-4 text-slate-300 ${col.className || ""}`}>
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                {displayEmptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
