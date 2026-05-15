"use client";
import React from "react";

import { type Question } from "@/types/exam";

interface QuestionNavigatorProps {
  questions: Question[];
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
  accentBg: string;
  showFeedback?: boolean;
}

export function QuestionNavigator({
  questions,
  currentIndex,
  onSelectIndex,
  accentBg,
  showFeedback = false,
}: QuestionNavigatorProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {questions.map((q, idx) => {
        const isSelected = currentIndex === idx;
        const userAnswer = q.selectedAnswer !== undefined ? q.selectedAnswer : q.userAnswer;
        const hasAnswered = userAnswer !== null && userAnswer !== undefined;
        const isSkipped = q.isSkipped;

        let btnClass = "";
        
        if (showFeedback) {
          // HISTORY REVIEW MODE
          if (isSkipped) {
            btnClass = "bg-amber-400 text-white border-transparent";
          } else {
            const isCorrect = q.isCorrect !== undefined ? q.isCorrect : (userAnswer === q.correctAnswer);
            btnClass = isCorrect 
              ? "bg-emerald-500 text-white border-transparent" 
              : "bg-red-500 text-white border-transparent";
          }
        } else {
          // ACTIVE TEST MODE
          if (isSkipped) {
            btnClass = "bg-amber-50 text-amber-600 border-amber-400";
          } else if (hasAnswered) {
            btnClass = "bg-primary text-white border-transparent";
          } else {
            btnClass = "bg-white text-slate-400 border-slate-200";
          }
        }

        return (
          <button
            key={idx}
            onClick={() => onSelectIndex(idx)}
            className={`h-11 rounded-xl text-xs font-bold transition-all border ${btnClass} ${
              isSelected ? "ring-2 ring-primary ring-offset-2 scale-105 z-10" : "hover:bg-opacity-80"
            }`}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
}
