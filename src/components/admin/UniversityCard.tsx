"use client";
import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { University } from "@/hooks/useAdminUniversities";
import { t, type Lang } from "@/lib/i18n";

interface UniversityCardProps {
  university: University;
  lang: Lang;
  isSelected: boolean;
  onToggle: (id: number) => void;
  onEdit: (uni: University) => void;
  onDelete: (id: number) => void;
}

export function UniversityCard({
  university,
  lang,
  isSelected,
  onToggle,
  onEdit,
  onDelete
}: UniversityCardProps) {
  const name = lang === "kz" ? university.nameKz : lang === "en" ? university.nameEn : university.nameRu;
  const city = lang === "kz" ? university.cityKz : lang === "en" ? university.cityEn : university.cityRu;

  return (
    <div 
      className={`flex flex-col h-full bg-slate-800 border rounded-xl overflow-hidden transition-all hover:border-slate-600 hover:shadow-lg hover:shadow-black/20 group ${
        isSelected ? "border-blue-500 ring-1 ring-blue-500/50 shadow-md shadow-blue-900/10" : "border-slate-700"
      }`}
    >
      {/* Header: Checkbox + Actions */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="relative z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(university.id)}
            className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer bg-slate-900"
          />
        </div>
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(university)}
            title={t("admin.common.edit", lang)}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(university.id)}
            title={t("admin.common.delete", lang)}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body: Avatar + Info */}
      <div className="flex gap-4 px-4 pb-4">
        <div className="shrink-0">
          {university.logoUrl ? (
            <img 
              src={university.logoUrl} 
              alt="logo" 
              className="w-12 h-12 rounded-lg bg-white object-contain p-1 border border-slate-700" 
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xl border border-slate-600">
              {university.nameRu.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-white line-clamp-2 leading-tight mb-1" title={name}>
            {name}
          </h3>
          <p className="text-sm text-slate-400 truncate" title={city}>
            {city}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700/50 mx-4" />

      {/* Programs */}
      <div className="p-4 pt-3 flex-1 flex flex-col">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {t("admin.universities.programs", lang)} ({university.programs.length})
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {university.programs.slice(0, 3).map((p, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center bg-slate-700/50 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700 truncate max-w-[140px]"
              title={lang === "kz" ? p.nameKz : lang === "en" ? p.nameEn : p.nameRu}
            >
              <span className="truncate mr-1">
                {lang === "kz" ? p.nameKz : lang === "en" ? p.nameEn : p.nameRu}
              </span>
              <span className="text-emerald-400 font-mono flex-shrink-0">{p.passingScore}</span>
            </span>
          ))}
          {university.programs.length > 3 && (
            <span className="text-[10px] text-slate-500 self-center ml-1">
              {t("admin.universities.more", lang).replace("{count}", String(university.programs.length - 3))}
            </span>
          )}
          {university.programs.length === 0 && (
            <span className="text-xs text-slate-600 italic">
              {t("admin.universities.form.noPrograms", lang)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function UniversityCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden animate-pulse">
      <div className="flex justify-between p-4 pb-2">
        <div className="w-4 h-4 bg-slate-700 rounded" />
        <div className="flex gap-1">
          <div className="w-8 h-8 bg-slate-700 rounded-lg" />
          <div className="w-8 h-8 bg-slate-700 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-4 px-4 pb-4">
        <div className="w-12 h-12 bg-slate-700 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-700 rounded w-1/2" />
        </div>
      </div>
      <div className="border-t border-slate-700/50 mx-4" />
      <div className="p-4 pt-3 flex-1 space-y-2">
        <div className="h-2 bg-slate-700 rounded w-1/3 mb-4" />
        <div className="flex flex-wrap gap-2">
          <div className="h-5 bg-slate-700 rounded w-20" />
          <div className="h-5 bg-slate-700 rounded w-24" />
          <div className="h-5 bg-slate-700 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
