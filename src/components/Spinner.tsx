import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white";
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 32,
  lg: 40,
};

/** SVG loading spinner. Replaces CSS border-trick spinners for cleaner markup. */
export function Spinner({ size = "md", color = "primary", className = "" }: SpinnerProps) {
  const px = sizeMap[size];
  const stroke = color === "white" ? "#ffffff" : "var(--color-primary)";

  return (
    <svg
      className={`animate-spin ${className}`}
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Loading"
      role="status"
    >
      {/* Track */}
      <circle cx="12" cy="12" r="10" stroke={stroke} strokeOpacity="0.2" strokeWidth="2.5" />
      {/* Arc */}
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
