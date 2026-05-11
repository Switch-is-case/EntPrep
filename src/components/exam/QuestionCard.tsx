"use client";
/* eslint-disable @next/next/no-img-element */
import React from "react";
import { LatexText } from "../LatexText";
import { OptionButton } from "./OptionButton";

import { type Question } from "@/types/exam";

interface QuestionCardProps {
  question: Question;
  lang: string;
  onSelectAnswer: (oIdx: number) => void;
  showFeedback: boolean;
  isReadOnly: boolean;
}

export function QuestionCard({
  question,
  lang,
  onSelectAnswer,
  showFeedback,
  isReadOnly,
}: QuestionCardProps) {
  const langKey = lang.charAt(0).toUpperCase() + lang.slice(1);
  const textKey = `questionText${langKey}` as "questionTextRu" | "questionTextKz" | "questionTextEn";
  const optionsKey = `options${langKey}` as "optionsRu" | "optionsKz" | "optionsEn";
  
  const questionText = question[textKey] || question.questionTextRu;
  const options = (question[optionsKey] || question.optionsRu || []) as string[];
  const userAnswer = question.selectedAnswer !== undefined ? question.selectedAnswer : question.userAnswer;

  return (
    <div className="flex-1">
      <div className="text-xl md:text-2xl font-bold text-text mb-8 leading-tight">
        <LatexText text={questionText} />
      </div>

      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt="Question"
          className="max-h-64 object-contain rounded-2xl mb-8 border border-slate-200"
        />
      )}

      <div className="space-y-3">
        {options.map((option, oIdx) => (
          <OptionButton
            key={oIdx}
            index={oIdx}
            text={option}
            image={question.optionImages?.[oIdx] || undefined}
            isSelected={userAnswer === oIdx}
            isCorrect={oIdx === question.correctAnswer}
            showFeedback={showFeedback}
            isReadOnly={isReadOnly}
            onClick={() => onSelectAnswer(oIdx)}
          />
        ))}
      </div>
    </div>
  );
}
