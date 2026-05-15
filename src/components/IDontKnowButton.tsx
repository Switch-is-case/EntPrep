"use client";
import { t, type Lang } from "@/lib/i18n";
import { HelpCircle } from "lucide-react";

type Props = {
  isSkipped: boolean;
  onToggle: () => void;
  lang: Lang;
};

export function IDontKnowButton({ isSkipped, onToggle, lang }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        w-full mt-4 py-3 px-4 rounded-xl border-2 transition-all
        flex items-center justify-center gap-2
        ${isSkipped 
          ? "border-amber-500 bg-amber-50 text-amber-700" 
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      <HelpCircle className="w-5 h-5" />
      <span className="text-sm font-medium">
        {t('exam.iDontKnow', lang)}
      </span>
    </button>
  );
}
