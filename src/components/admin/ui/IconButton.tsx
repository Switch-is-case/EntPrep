"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  tooltip: string;
  variant?: "ghost" | "danger" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function IconButton({
  icon,
  tooltip,
  variant = "ghost",
  size = "md",
  className,
  ...props
}: IconButtonProps) {
  const variants = {
    ghost: "text-text-secondary hover:text-text hover:bg-surface-raised",
    danger: "text-danger hover:bg-danger/10",
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-surface-raised text-text hover:bg-surface-overlay",
  };

  const sizes = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  };

  return (
    <button
      className={cn(
        "rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      title={tooltip}
      aria-label={tooltip}
      {...props}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {icon}
      </div>
    </button>
  );
}
