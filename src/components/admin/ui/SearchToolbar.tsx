"use client";
import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  children?: React.ReactNode;
  hideSearch?: boolean;
}

export function SearchToolbar({
  search,
  onSearchChange,
  placeholder,
  children,
  hideSearch = false
}: SearchToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
      {!hideSearch && (
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 bg-surface-base border border-border rounded-xl text-sm text-text placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all"
          />
        </div>
      )}
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {children}
      </div>
    </div>
  );
}
