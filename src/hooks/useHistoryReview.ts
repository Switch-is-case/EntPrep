import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/components/Providers";

import { type Question, type TestSession } from "@/types/exam";

export function useHistoryReview() {
  const { lang, user, token, authHeaders, ready } = useApp();
  const router = useRouter();
  const params = useParams();
  
  const [session, setSession] = useState<TestSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (ready && !user && !token) {
      router.replace("/login");
      return;
    }
    if (!user || !token) return;

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/history/${params.id}`, { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          setSession(data.session);
          setQuestions(data.questions || []);
        } else {
          router.replace("/history");
        }
      } catch (e) {
        console.error(e);
        router.replace("/history");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [ready, user, token, router, params.id, authHeaders]);

  return {
    lang,
    user,
    session,
    questions,
    loading,
    currentIndex,
    setCurrentIndex,
    router,
  };
}
