"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

interface Stats {
  totalUsers: number;
  totalQuestions: number;
  totalSessions: number;
  totalAnswers: number;
}

interface QuestionsBySubject {
  subject: string;
  count: number;
}

interface RecentSession {
  id: string;
  testType: string;
  score: number;
  completed: boolean;
  startedAt: string;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isAdmin: boolean;
}

export default function AdminDashboard() {
  const { token, lang, authHeaders } = useApp();
  const [stats, setStats] = useState<Stats | null>(null);
  const [questionsBySubject, setQuestionsBySubject] = useState<
    QuestionsBySubject[]
  >([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch("/api/admin/stats", { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
        setQuestionsBySubject(data.questionsBySubject);
        setRecentSessions(data.recentSessions);
        setRecentUsers(data.recentUsers);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const getSubjectName = (s: string) => {
    const key = `subject.${s}` as keyof typeof import("@/lib/i18n").translations;
    return t(key, lang);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Дашборд</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-2"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
          <div className="text-2xl font-bold text-white">
            {stats?.totalUsers || 0}
          </div>
          <div className="text-sm text-slate-400">Пользователей</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center mb-2"><svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
          <div className="text-2xl font-bold text-white">
            {stats?.totalQuestions || 0}
          </div>
          <div className="text-sm text-slate-400">Вопросов</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-2"><svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div>
          <div className="text-2xl font-bold text-white">
            {stats?.totalSessions || 0}
          </div>
          <div className="text-sm text-slate-400">Тестов</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-2"><svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
          <div className="text-2xl font-bold text-white">
            {stats?.totalAnswers || 0}
          </div>
          <div className="text-sm text-slate-400">Ответов</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Questions by subject */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            Вопросы по предметам
          </h2>
          <div className="space-y-3">
            {questionsBySubject.map((item) => (
              <div key={item.subject} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">
                      {getSubjectName(item.subject)}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (item.count /
                            Math.max(
                              ...questionsBySubject.map((q) => q.count),
                              1
                            )) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {questionsBySubject.length === 0 && (
              <p className="text-slate-400 text-sm">Нет вопросов</p>
            )}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            Последние пользователи
          </h2>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/50"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">
                      {user.name}
                    </span>
                    {user.isAdmin && (
                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {user.email}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-slate-400 text-sm">Нет пользователей</p>
            )}
          </div>
        </div>

        {/* Recent sessions */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">
            Последние тесты
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-3 font-medium">Тип</th>
                  <th className="pb-3 font-medium">Результат</th>
                  <th className="pb-3 font-medium">Статус</th>
                  <th className="pb-3 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {recentSessions.map((session) => (
                  <tr key={session.id}>
                    <td className="py-3 text-slate-300">
                      {session.testType === "diagnostic"
                        ? "Диагностический"
                        : session.testType === "full"
                        ? "Полный ЕНТ"
                        : "Практика"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-medium ${
                          session.score >= 80
                            ? "text-success"
                            : session.score >= 60
                            ? "text-primary"
                            : session.score >= 40
                            ? "text-warning"
                            : "text-danger"
                        }`}
                      >
                        {session.score}%
                      </span>
                    </td>
                    <td className="py-3">
                      {session.completed ? (
                        <span className="text-success">Завершён</span>
                      ) : (
                        <span className="text-warning">⏳ В процессе</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(session.startedAt).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                ))}
                {recentSessions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      Нет тестов
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
