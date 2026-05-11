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
        let btnClass = "bg-white text-text-secondary border-border";
        
        const isSelected = currentIndex === idx;
        const userAnswer = q.selectedAnswer !== undefined ? q.selectedAnswer : q.userAnswer;
        const hasAnswered = userAnswer !== null && userAnswer !== undefined;
        const isSkipped = q.isSkipped;

        if (isSelected) {
          btnClass = `${accentBg} text-white border-transparent shadow-md`;
        } else if (hasAnswered || isSkipped) {
          if (showFeedback) {
            if (isSkipped) {
              btnClass = "bg-warning text-white border-transparent";
            } else {
              const isCorrect = q.isCorrect !== undefined ? q.isCorrect : (userAnswer === q.correctAnswer);
              btnClass = isCorrect 
                ? "bg-emerald-500 text-white border-transparent" 
                : "bg-rose-500 text-white border-transparent";
            }
          } else {
            btnClass = "bg-emerald-50 text-emerald-600 border-emerald-200";
          }
        }

        return (
          <button
            key={idx}
            onClick={() => onSelectIndex(idx)}
            className={`h-11 rounded-lg text-xs font-bold transition-all border ${btnClass} hover:opacity-80`}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
}
