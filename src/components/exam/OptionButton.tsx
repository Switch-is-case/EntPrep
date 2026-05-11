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
  let borderColor = "border-border";
  let bgColor = "bg-white";
  let dotColor = "border-border text-text-secondary";

  if (isSelected) {
    if (showFeedback) {
      borderColor = isCorrect ? "border-emerald-500" : "border-rose-500";
      bgColor = isCorrect ? "bg-emerald-50" : "bg-rose-50";
      dotColor = isCorrect ? "bg-emerald-500 text-white border-transparent" : "bg-rose-500 text-white border-transparent";
    } else {
      borderColor = "border-primary";
      bgColor = "bg-primary/5";
      dotColor = "bg-primary text-white border-transparent";
    }
  } else if (showFeedback && isCorrect && (isSelected || isReadOnly)) {
    borderColor = "border-emerald-500";
    bgColor = "bg-emerald-50/30";
  }

  return (
    <button
      disabled={isReadOnly || (showFeedback && isSelected)}
      onClick={onClick}
      className={`w-full p-4 md:p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${borderColor} ${bgColor} ${!isSelected && !isCorrect && !isReadOnly ? "hover:border-primary/30" : ""}`}
    >
      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 ${dotColor}`}>
        {String.fromCharCode(65 + index)}
      </div>
      <div className="flex-1">
        <span className="font-medium text-text text-sm md:text-base"><LatexText text={text} /></span>
        {image && (
          <img
            src={image}
            alt={`Option ${String.fromCharCode(65 + index)}`}
            className="max-h-40 object-contain rounded-lg border border-gray-200 mt-2"
          />
        )}
      </div>
      {showFeedback && isCorrect && (isSelected || isReadOnly) && (
        <span className="ml-auto text-emerald-500 font-black">✓</span>
      )}
      {showFeedback && isSelected && !isCorrect && (
        <span className="ml-auto text-rose-500 font-black">✕</span>
      )}
    </button>
  );
}
