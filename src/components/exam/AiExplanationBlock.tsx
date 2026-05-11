import React from "react";
import { motion } from "framer-motion";
import { Spinner } from "../Spinner";
import { LatexText } from "../LatexText";
import { type Lang } from "@/lib/i18n";
import { Lightbulb } from "lucide-react";

interface AiExplanationBlockProps {
  lang: Lang;
  explanation?: string;
  loading: boolean;
  onFetch?: () => void;
}

export function AiExplanationBlock({
  lang,
  explanation,
  loading,
  onFetch,
}: AiExplanationBlockProps) {
  if (!explanation && !loading && onFetch) {
    return (
      <button
        onClick={onFetch}
        className="mt-8 w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border border-dashed border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors text-sm font-bold"
      >
        <Lightbulb className="w-5 h-5" aria-hidden="true" />
        {lang === "ru" ? "Объяснение ИИ" : lang === "kz" ? "ЖИ түсіндірмесі" : "AI Explanation"}
      </button>
    );
  }

  return (
    <div className="mt-8 p-5 md:p-6 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-primary" aria-hidden="true" />
        <h3 className="text-base font-bold text-primary tracking-tight">
          {lang === "ru" ? "Объяснение ИИ" : "ЖИ түсіндірмесі"}
        </h3>
      </div>
      
      {loading ? (
        <div className="flex items-center gap-3 text-slate-500">
          <Spinner size="sm" />
          <span className="text-xs font-bold uppercase tracking-widest">
            {lang === "ru" ? "ИИ анализирует..." : "ЖИ талдауда..."}
          </span>
        </div>
      ) : (
        <div className="text-slate-700 leading-relaxed text-sm md:text-base font-medium">
          <LatexText text={explanation || (lang === "ru" ? "Объяснение скоро появится." : "Түсіндірме жақында пайда болады.")} />
        </div>
      )}
      
      {!loading && explanation && (
        <div className="mt-4 pt-3 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {lang === "ru" ? "Сгенерировано ИИ" : "ЖИ негізінде"}
        </div>
      )}
    </div>
  );
}
