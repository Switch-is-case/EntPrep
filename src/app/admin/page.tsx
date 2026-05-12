"use client";

import React from "react";
import { useApp } from "@/components/Providers";
import { useAdminStats, Period } from "@/hooks/useAdminStats";
import { t } from "@/lib/i18n";
import { StatCard } from "@/components/admin/StatCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { DataTable, Column } from "@/components/admin/DataTable";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#94a3b8"];

export default function AdminDashboard() {
  const { user, lang } = useApp();
  const {
    data,
    period,
    setPeriod,
    loading,
    getSubjectName,
  } = useAdminStats();

  const stats = data?.stats;
  const userRegistrations = data?.userRegistrations || [];
  const testSessionsData = data?.testSessions || [];
  const subjectPerformance = data?.subjectPerformance || [];
  const engagement = data?.engagement;
  const completionRates = data?.completionRates || [];
  const recentUsers = data?.recentUsers || [];
  const recentSessions = data?.recentSessions || [];

  const engagementData = engagement ? [
    { name: t("admin.engagement.verified", lang), value: engagement.verifiedUsers, color: COLORS[0] },
    { 
      name: t("admin.engagement.unverified", lang), 
      value: Math.max(0, engagement.totalUsers - engagement.verifiedUsers - engagement.bannedUsers - engagement.deletedUsers),
      color: COLORS[1]
    },
    { name: t("admin.engagement.banned", lang), value: engagement.bannedUsers, color: COLORS[2] },
    { name: t("admin.engagement.deleted", lang), value: engagement.deletedUsers, color: COLORS[3] },
  ] : [];

  const tooltipStyle = {
    backgroundColor: "#1e293b", // slate-800
    border: "1px solid #334155", // slate-700
    borderRadius: "8px",
    color: "#e2e8f0", // slate-200
  };

  const axisStyle = {
    fill: "#94a3b8", // slate-400
    fontSize: 12,
  };

  const userColumns: Column<any>[] = [
    { 
      key: "name", 
      label: t("admin.common.name", lang),
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium truncate">{row.name}</span>
        </div>
      )
    },
    { key: "email", label: t("admin.common.email", lang), className: "hidden md:table-cell" },
    { 
      key: "status", 
      label: t("admin.common.status", lang),
      render: (row) => {
        if (row.isAdmin) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary uppercase">{t("admin.status.admin", lang)}</span>;
        if (row.bannedAt) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 uppercase">{t("admin.status.banned", lang)}</span>;
        if (row.emailVerified) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">{t("admin.status.verified", lang)}</span>;
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-400 uppercase">{t("admin.status.unverified", lang)}</span>;
      }
    },
    { 
      key: "createdAt", 
      label: t("admin.common.date", lang),
      className: "text-right",
      render: (row) => new Date(row.createdAt).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US")
    },
  ];

  const sessionColumns: Column<any>[] = [
    { 
      key: "testType", 
      label: t("admin.common.type", lang),
      render: (row) => {
        const typeKey = `admin.testType.${row.testType}` as any;
        return <span className="font-medium">{t(typeKey, lang)}</span>;
      }
    },
    { 
      key: "score", 
      label: t("admin.common.score", lang),
      render: (row) => (
        <span className={`font-bold ${
          row.score >= 70 ? "text-emerald-400" : row.score >= 50 ? "text-amber-400" : "text-rose-400"
        }`}>
          {row.score}%
        </span>
      )
    },
    { 
      key: "completed", 
      label: t("admin.common.status", lang),
      render: (row) => row.completed ? 
        <span className="text-emerald-400 text-xs">{t("admin.status.completed", lang)}</span> : 
        <span className="text-amber-400 text-xs">{t("admin.status.inProgress", lang)}</span>
    },
    { 
      key: "startedAt", 
      label: t("admin.common.date", lang),
      className: "text-right",
      render: (row) => new Date(row.startedAt).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US")
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* SECTION 1: Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{t("admin.dashboard.title", lang)}</h1>
          <p className="text-slate-400 mt-1">{t("admin.dashboard.welcome", lang)}, {user?.name}</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* SECTION 2: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("admin.stats.totalUsers", lang)}
          value={stats?.totalUsers || 0}
          subtitle={t("admin.engagement.active7d", lang)}
          trend={stats?.newUsersThisPeriod ? { value: Math.round((stats.newUsersThisPeriod / (stats.totalUsers || 1)) * 100), label: t("admin.stats.usersInPeriod", lang), positive: true } : undefined}
          color="blue"
          loading={loading}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <StatCard
          title={t("admin.stats.totalQuestions", lang)}
          value={stats?.totalQuestions || 0}
          subtitle={t("admin.stats.baseContent", lang)}
          color="purple"
          loading={loading}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title={t("admin.stats.totalSessions", lang)}
          value={stats?.totalSessions || 0}
          subtitle={t("admin.charts.testingActivity", lang)}
          trend={stats?.newSessionsThisPeriod ? { value: Math.round((stats.newSessionsThisPeriod / (stats.totalSessions || 1)) * 100), label: t("admin.stats.sessionsInPeriod", lang), positive: true } : undefined}
          color="green"
          loading={loading}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          title={t("admin.stats.totalAnswers", lang)}
          value={stats?.totalAnswers || 0}
          subtitle={t("admin.stats.dataCollection", lang)}
          color="yellow"
          loading={loading}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* SECTION 3: Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t("admin.charts.userRegistrations", lang)} subtitle={t("admin.charts.userRegistrationsDesc", lang)} loading={loading}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userRegistrations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={axisStyle}
                tickFormatter={(val) => val.split("-").slice(1).reverse().join(".")}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis 
                tick={axisStyle}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                allowDecimals={false} 
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                itemStyle={{ color: "#3b82f6" }}
              />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("admin.charts.testingActivity", lang)} subtitle={t("admin.charts.testingActivityDesc", lang)} loading={loading}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={testSessionsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={axisStyle}
                tickFormatter={(val) => val.split("-").slice(1).reverse().join(".")}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis 
                tick={axisStyle}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                allowDecimals={false} 
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* SECTION 4: Engagement & Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t("admin.charts.userEngagement", lang)} loading={loading}>
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center" 
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/50">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">{t("admin.engagement.active7d", lang)}</p>
                <p className="text-2xl font-bold text-white">{engagement?.activeThisWeek || 0}</p>
              </div>
              <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/50">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">{t("admin.engagement.verification", lang)}</p>
                <p className="text-2xl font-bold text-white">
                  {engagement ? Math.round((engagement.verifiedUsers / engagement.totalUsers) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title={t("admin.charts.completionRates", lang)} loading={loading}>
          <div className="space-y-6 mt-4">
            {completionRates.map((rate) => {
               const typeKey = `admin.testType.${rate.testType}` as any;
               return (
                <div key={rate.testType}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300 font-medium">{t(typeKey, lang)}</span>
                    <span className="text-white font-bold">{Math.round(rate.rate)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${rate.rate}%` }} 
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{rate.completed} {t("admin.engagement.completedOf", lang)} {rate.total}</p>
                </div>
               );
            })}
          </div>
        </ChartCard>
      </div>

      {/* SECTION 5: Subject Performance */}
      <ChartCard title={t("admin.charts.subjectPerformance", lang)} subtitle={t("admin.charts.subjectPerformanceDesc", lang)} loading={loading}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={subjectPerformance} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis 
              dataKey="subject" 
              type="category" 
              tick={axisStyle}
              width={140}
              tickFormatter={getSubjectName}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={tooltipStyle}
              formatter={(val: any) => [val !== undefined ? `${Math.round(Number(val))}%` : "0%", t("admin.charts.avgScore", lang)]}
            />
            <Bar 
              dataKey="avgScore" 
              radius={[0, 4, 4, 0]}
              background={{ fill: "rgba(255,255,255,0.02)" }}
            >
              {subjectPerformance.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.avgScore > 70 ? "#10b981" : entry.avgScore > 40 ? "#3b82f6" : "#ef4444"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* SECTION 6: Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">{t("admin.recent.users", lang)}</h2>
          <DataTable 
            columns={userColumns} 
            data={recentUsers} 
            loading={loading} 
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">{t("admin.recent.sessions", lang)}</h2>
          <DataTable 
            columns={sessionColumns} 
            data={recentSessions} 
            loading={loading} 
          />
        </div>
      </div>
    </div>
  );
}
