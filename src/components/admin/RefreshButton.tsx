"use client";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  onRefresh?: () => Promise<void> | void;
  className?: string;
};

export function RefreshButton({ onRefresh, className }: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      router.refresh();  // обновляет Server Components
    } finally {
      // Минимальная задержка чтобы анимация была видна
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };
  
  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`
        flex items-center gap-2 px-4 py-2
        bg-slate-800 hover:bg-slate-700 disabled:opacity-50
        border border-slate-700 rounded-lg
        text-sm font-medium transition-colors text-white
        ${className || ""}
      `}
      title="Refresh data"
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
      <span>Refresh</span>
    </button>
  );
}
