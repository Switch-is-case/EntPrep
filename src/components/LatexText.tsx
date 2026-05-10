"use client";

import React from "react";
import Latex from "react-latex-next";

// We import the CSS in globals.css to avoid duplicating it or causing SSR issues

interface LatexTextProps {
  text: string;
  className?: string;
}

export function LatexText({ text, className = "" }: LatexTextProps) {
  return (
    <span className={className}>
      <Latex>{text}</Latex>
    </span>
  );
}
