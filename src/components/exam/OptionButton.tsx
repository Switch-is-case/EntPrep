"use client";
/* eslint-disable @next/next/no-img-element */
import React from "react";
import { LatexText } from "../LatexText";

interface OptionButtonProps {
  index: number;
  text: string;
  image?: string;
  isSelected: boolean;
  isCorrect: boolean;
  showFeedback: boolean;
  isReadOnly: boolean;
  onClick: () => void;
}

export function OptionButton({
  index,
  text,
  image,
  isSelected,
  isCorrect,
  showFeedback,
  isReadOnly,
  onClick,
}: OptionButtonProps) {
  let borderColor = "border-slate-200";
  let bgColor = "bg-white";
  let dotColor = "border-slate-200 text-slate-500";

  if (isSelected) {
    if (showFeedback) {
      borderColor = isCorrect ? "border-emerald-500" : "border-red-500";
      bgColor = isCorrect ? "bg-emerald-50" : "bg-red-50";
      dotColor = isCorrect ? "bg-emerald-500 text-white border-transparent" : "bg-red-500 text-white border-transparent";
    } else {
      borderColor = "border-primary";
      bgColor = "bg-primary/5";
      dotColor = "bg-primary text-white border-transparent";
    }
  } else if (showFeedback && isCorrect && (isSelected || isReadOnly)) {
    borderColor = "border-emerald-500";
    bgColor = "bg-emerald-50/30";
  } else if (isReadOnly && !isSelected) {
    borderColor = "border-slate-200";
    bgColor = "bg-slate-50";
  }

  return (
    <button
      disabled={isReadOnly || (showFeedback && isSelected)}
      onClick={onClick}
      className={`w-full p-4 md:p-5 rounded-2xl border text-left transition-colors flex items-center gap-4 ${borderColor} ${bgColor} ${!isSelected && !isCorrect && !isReadOnly ? "hover:border-primary/40" : ""}`}
    >
      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${dotColor}`}>
        {String.fromCharCode(65 + index)}
      </div>
      <div className="flex-1">
        <span className="font-medium text-slate-900 text-sm md:text-base"><LatexText text={text} /></span>
        {image && (
          <img
            src={image}
            alt={`Option ${String.fromCharCode(65 + index)}`}
            className="max-h-40 object-contain rounded-lg border border-slate-200 mt-2"
          />
        )}
      </div>
      {showFeedback && isCorrect && (isSelected || isReadOnly) && (
        <span className="ml-auto text-emerald-500 font-bold">✓</span>
      )}
      {showFeedback && isSelected && !isCorrect && (
        <span className="ml-auto text-red-500 font-bold">✕</span>
      )}
    </button>
  );
}
