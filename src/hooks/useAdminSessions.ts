import { useState, useCallback, useEffect } from "react";
import { useApp } from "@/components/Providers";

export interface Session {
  id: string;
  userId: string;
  testType: string;
  subjects: string[];
  totalQuestions: number;
  correctAnswers: number;
  skippedAnswers: number;
  wrongAnswers: number;
  score: number;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
  user: { id: string; name: string; email: string } | null;
}

export function useAdminSessions() {
  const { token, authHeaders } = useApp();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState("");

  const fetchSessions = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20",
    });
    if (filterType) params.set("testType", filterType);

    try {
      const res = await fetch(`/api/admin/sessions?${params}`, {
        headers: authHeaders(),
        cache: "no-store",
      });

      if (res.ok) {
        const resData = await res.json();
        const data = resData.data;
        setSessions(data.sessions);
        setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, page, filterType, authHeaders]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions();
  }, [fetchSessions]);

  const getTestTypeName = (type: string) => {
    switch (type) {
      case "diagnostic":
        return "Диагностический";
      case "full":
        return "Полный ЕНТ";
      case "practice":
        return "Практика";
      default:
        return type;
    }
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "—";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}м ${seconds}с`;
  };

  return {
    sessions,
    loading,
    page,
    totalPages,
    filterType,
    setPage,
    setFilterType,
    getTestTypeName,
    formatDuration,
    refresh: fetchSessions
  };
}
