"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "info" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-surface-raised text-text",
    secondary: "bg-surface-overlay text-text-secondary",
    success: "bg-success/15 text-success border-success-border",
    warning: "bg-warning/15 text-warning border-warning-border",
    danger: "bg-danger/15 text-danger border-danger-border",
    info: "bg-info/15 text-info border-info-border",
    outline: "border border-border text-text-secondary bg-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border border-transparent transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
