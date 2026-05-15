"use client";
import React from "react";
import { Search, Grid3X3, List, Filter, ArrowUpDown } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";

interface SearchToolbarProps {
  search: string;
  setSearch: (val: string) => void;
  lang: Lang;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

export function SearchToolbar({
  search,
  setSearch,
  lang,
  viewMode,
  setViewMode
}: SearchToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
      {/* Search input */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.search.placeholder", lang)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {/* Sort (Placeholder for now) */}
        <div className="relative group">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select className="pl-9 pr-8 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 appearance-none focus:border-blue-500 focus:outline-none cursor-pointer hover:bg-slate-800/50 transition-colors">
            <option>Name (A-Z)</option>
            <option>Name (Z-A)</option>
            <option>Recent</option>
          </select>
        </div>

        {/* View mode toggle */}
        <div className="flex bg-slate-900/50 border border-slate-800 rounded-xl p-1 shrink-0">
          <button 
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-slate-800 text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
            title="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-slate-800 text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
