import { useState, useEffect } from "react";
import { useApp } from "@/components/Providers";
import { useRouter } from "next/navigation";

export interface Session {
  id: string;
  testType: string;
  totalQuestions: number;
  correctAnswers: number;
  skippedAnswers: number;
  wrongAnswers: number;
  score: number;
  startedAt: string;
  subjects: { id: number; slug?: string; nameRu?: string; nameKz?: string; nameEn?: string; type?: string }[];
}

export function useHistory() {
  const { user, token, authHeaders, ready } = useApp();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !user && !token) {
      router.push("/login");
      return;
    }
    if (!user || !token) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history", { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [ready, user, token, router, authHeaders]);

  return {
    sessions,
    loading,
    user,
  };
}
