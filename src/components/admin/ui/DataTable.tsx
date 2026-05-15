"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label?: React.ReactNode;
  width?: number | string;
  flex?: number;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  renderRow: (row: T) => React.ReactNode;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  renderRow,
  isLoading,
  emptyState
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-surface-base shadow-sm">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-surface-base/80 backdrop-blur-md">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 font-semibold text-text-secondary transition-colors"
                  style={{
                    width: column.width,
                    flex: column.flex,
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse bg-surface-base/50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <div className="h-4 bg-surface-overlay rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-20 text-center">
                  {emptyState || (
                    <div className="flex flex-col items-center gap-2 text-text-secondary">
                      <p className="text-base font-medium">No results found</p>
                      <p className="text-sm opacity-70">Try adjusting your filters or search query</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <React.Fragment key={row.id}>
                  {renderRow(row)}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
