import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { AdminDashboardDTO, Period } from "@/domain/analytics/types";

// Re-export Period for convenience
export type { Period };

export function useAdminStats() {
  const { token, lang, authHeaders } = useApp();
  const [data, setData] = useState<AdminDashboardDTO | null>(null);
  const [period, setPeriod] = useState<Period>("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (currentPeriod: Period) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/stats?period=${currentPeriod}`, { 
        headers: authHeaders() 
      });
      
      if (!res.ok) throw new Error("Failed to fetch stats");
      
      const resData = await res.json();
      if (resData.ok) {
        setData(resData.data);
      } else {
        throw new Error(resData.error || "Unknown error");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    fetchStats(period);
  }, [period, fetchStats]);

  const getSubjectName = (s: string) => {
    const key = `subject.${s}` as any;
    const translated = t(key, lang);
    // If translation doesn't exist, try to map manually for common keys
    if (translated === key) {
      const manual: Record<string, string> = {
        'math': 'Математика',
        'history': 'История Казахстана',
        'physics': 'Физика',
        'chemistry': 'Химия',
        'biology': 'Биология',
        'geography': 'География',
        'english': 'Английский язык',
        'russian': 'Русский язык',
        'kazakh': 'Казахский язык',
        'literature': 'Литература',
        'computer_science': 'Информатика',
        'world_history': 'Всемирная история',
      };
      return manual[s] || s;
    }
    return translated;
  };

  return {
    data,
    period,
    setPeriod,
    loading,
    error,
    getSubjectName,
    refresh: () => fetchStats(period),
  };
}
