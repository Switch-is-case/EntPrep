"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  warning?: string;
  confirmLabel: string;
  cancelLabel: string;
  variant?: "danger" | "warning" | "info";
  icon?: React.ReactNode;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  warning,
  confirmLabel,
  cancelLabel,
  variant = "danger",
  icon,
  onConfirm,
  isLoading
}: ConfirmDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild>
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-md bg-surface-base border border-border rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-full shrink-0",
                        variant === "danger" ? "bg-danger/10 text-danger" : 
                        variant === "warning" ? "bg-warning/10 text-warning" : "bg-info/10 text-info"
                      )}>
                        {icon || <AlertTriangle className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <DialogPrimitive.Title className="text-xl font-bold text-text leading-tight">
                          {title}
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Description className="text-text-secondary text-sm mt-2">
                          {description}
                        </DialogPrimitive.Description>
                        {warning && (
                          <p className="text-text-secondary/70 text-xs mt-3 bg-surface-raised/50 p-2 rounded-lg border border-border/50">
                            {warning}
                          </p>
                        )}
                      </div>
                      <DialogPrimitive.Close asChild>
                        <button className="p-1 text-text-secondary hover:text-text transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </DialogPrimitive.Close>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                      <DialogPrimitive.Close asChild>
                        <button
                          disabled={isLoading}
                          className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-raised rounded-xl transition-colors disabled:opacity-50"
                        >
                          {cancelLabel}
                        </button>
                      </DialogPrimitive.Close>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onConfirm();
                        }}
                        disabled={isLoading}
                        className={cn(
                          "px-6 py-2 text-sm font-semibold text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2",
                          variant === "danger" ? "bg-danger hover:bg-danger/90 shadow-danger/20" : 
                          variant === "warning" ? "bg-warning hover:bg-warning/90 shadow-warning/20" : "bg-info hover:bg-info/90 shadow-info/20"
                        )}
                      >
                        {isLoading && (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {confirmLabel}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
