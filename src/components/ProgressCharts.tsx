"use client";

import React from "react";
import {
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
} from "recharts";
import { t, SUBJECT_COLORS, type Lang } from "@/lib/i18n";

interface SubjectProgress {
  id: number;
  subject: string;
  totalAttempted: number;
  totalCorrect: number;
  totalSkipped: number;
  lastScore: number;
  bestScore: number;
}

interface ProgressChartsProps {
  subjectProgress: SubjectProgress[];
  lang: Lang;
}

export default function ProgressCharts({
  subjectProgress,
  lang,
}: ProgressChartsProps) {
  const getSubjectName = (s: string) => {
    const key = `subject.${s}` as keyof typeof import("@/lib/i18n").translations;
    return t(key, lang);
  };

  // Bar chart data
  const barData = subjectProgress.map((sp) => ({
    name: getSubjectName(sp.subject).substring(0, 12),
    accuracy:
      sp.totalAttempted > 0
        ? Math.round((sp.totalCorrect / sp.totalAttempted) * 100)
        : 0,
    best: sp.bestScore,
    fill: SUBJECT_COLORS[sp.subject] || "#2563eb",
  }));

  // Pie chart data
  const totalCorrect = subjectProgress.reduce(
    (sum, p) => sum + p.totalCorrect,
    0
  );
  const totalWrong = subjectProgress.reduce(
    (sum, p) => sum + (p.totalAttempted - p.totalCorrect - p.totalSkipped),
    0
  );
  const totalSkipped = subjectProgress.reduce(
    (sum, p) => sum + p.totalSkipped,
    0
  );

  const pieData = [
    {
      name: t("test.correct", lang),
      value: totalCorrect,
      color: "#10b981",
    },
    {
      name: t("test.wrong", lang),
      value: totalWrong,
      color: "#ef4444",
    },
    {
      name: t("test.skipped", lang),
      value: totalSkipped,
      color: "#f59e0b",
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Bar Chart - Subject Accuracy */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-text mb-4">
          {t("progress.bySubject", lang)}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="accuracy"
                name={t("progress.accuracy", lang)}
                radius={[4, 4, 0, 0]}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart - Overall Distribution */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-text mb-4">
          {t("progress.overall", lang)}
        </h3>
        <div className="h-64">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-text-secondary text-sm">
              {t("common.loading", lang)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
