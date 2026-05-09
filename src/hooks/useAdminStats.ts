import { useState, useEffect } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

export interface Stats {
  totalUsers: number;
  totalQuestions: number;
  totalSessions: number;
  totalAnswers: number;
}

export interface QuestionsBySubject {
  subject: string;
  count: number;
}

export interface RecentSession {
  id: string;
  testType: string;
  score: number;
  completed: boolean;
  startedAt: string;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isAdmin: boolean;
}

export function useAdminStats() {
  const { token, lang, authHeaders } = useApp();
  const [stats, setStats] = useState<Stats | null>(null);
  const [questionsBySubject, setQuestionsBySubject] = useState<QuestionsBySubject[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch("/api/admin/stats", { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then((data) => {
        setStats(data.stats);
        setQuestionsBySubject(data.questionsBySubject);
        setRecentSessions(data.recentSessions);
        setRecentUsers(data.recentUsers);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [token, authHeaders]);

  const getSubjectName = (s: string) => {
    const key = `subject.${s}` as keyof typeof import("@/lib/i18n").translations;
    return t(key, lang);
  };

  return {
    stats,
    questionsBySubject,
    recentSessions,
    recentUsers,
    loading,
    getSubjectName,
  };
}
