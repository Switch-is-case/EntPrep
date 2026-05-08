"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useApp } from "@/components/Providers";
import { t, MANDATORY_SUBJECTS, PROFILE_SUBJECTS } from "@/lib/i18n";

interface Question {
  id: number;
  subject: string;
  questionTextRu: string;
  questionTextKz: string;
  questionTextEn: string;
  optionsRu: string[];
  optionsKz: string[];
  optionsEn: string[];
  correctAnswer: number;
  difficulty: string;
  topic: string | null;
}

const allSubjects = [...MANDATORY_SUBJECTS, ...PROFILE_SUBJECTS];

export default function AdminQuestions() {
  const { token, lang, authHeaders } = useApp();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterSubject, setFilterSubject] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    subject: "math_literacy",
    questionTextRu: "",
    questionTextKz: "",
    questionTextEn: "",
    optionsRu: ["", "", "", ""],
    optionsKz: ["", "", "", ""],
    optionsEn: ["", "", "", ""],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "",
  });

  const fetchQuestions = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: "15",
    });
    if (filterSubject) params.set("subject", filterSubject);
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/questions?${params}`, { headers: authHeaders() });

    if (res.ok) {
      const data = await res.json();
      setQuestions(data.questions);
      setTotalPages(data.totalPages);
    }

    setLoading(false);
  }, [token, page, filterSubject, search]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const getSubjectName = (s: string) => {
    const key = `subject.${s}` as keyof typeof import("@/lib/i18n").translations;
    return t(key, lang);
  };

  const resetForm = () => {
    setForm({
      subject: "math_literacy",
      questionTextRu: "",
      questionTextKz: "",
      questionTextEn: "",
      optionsRu: ["", "", "", ""],
      optionsKz: ["", "", "", ""],
      optionsEn: ["", "", "", ""],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "",
    });
    setEditingQuestion(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (q: Question) => {
    setEditingQuestion(q);
    setForm({
      subject: q.subject,
      questionTextRu: q.questionTextRu,
      questionTextKz: q.questionTextKz,
      questionTextEn: q.questionTextEn,
      optionsRu: q.optionsRu as string[],
      optionsKz: q.optionsKz as string[],
      optionsEn: q.optionsEn as string[],
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      topic: q.topic || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);

    const url = editingQuestion
      ? `/api/admin/questions/${editingQuestion.id}`
      : "/api/admin/questions";
    const method = editingQuestion ? "PUT" : "POST";

    const res = await fetch(url, {
      headers: authHeaders(),
      method,
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowModal(false);
      resetForm();
      fetchQuestions();
    }

    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить вопрос?")) return;
    if (!token) return;

    const res = await fetch(`/api/admin/questions/${id}`, {
      headers: authHeaders(),
      method: "DELETE",
    });

    if (res.ok) {
      fetchQuestions();
    }
  };

  const updateOption = (
    lang: "Ru" | "Kz" | "En",
    index: number,
    value: string
  ) => {
    const key = `options${lang}` as "optionsRu" | "optionsKz" | "optionsEn";
    const newOptions = [...form[key]];
    newOptions[index] = value;
    setForm({ ...form, [key]: newOptions });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Вопросы</h1>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span> Добавить вопрос
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterSubject}
          onChange={(e) => {
            setFilterSubject(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">Все предметы</option>
          {allSubjects.map((s) => (
            <option key={s} value={s}>
              {getSubjectName(s)}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 w-64"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700/50">
                <tr className="text-left text-slate-300">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Предмет</th>
                  <th className="px-4 py-3 font-medium">Вопрос (RU)</th>
                  <th className="px-4 py-3 font-medium">Ответ</th>
                  <th className="px-4 py-3 font-medium">Сложность</th>
                  <th className="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-slate-400">{q.id}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                        {getSubjectName(q.subject)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white max-w-xs truncate">
                      {q.questionTextRu}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {String.fromCharCode(65 + q.correctAnswer)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          q.difficulty === "easy"
                            ? "bg-success/20 text-success"
                            : q.difficulty === "hard"
                            ? "bg-danger/20 text-danger"
                            : "bg-warning/20 text-warning"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(q)}
                          className="text-primary hover:text-primary-light"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="text-danger hover:text-red-400"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {questions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      Нет вопросов
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-slate-700 text-white text-sm disabled:opacity-50"
          >
            ←
          </button>
          <span className="text-slate-300 text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-slate-700 text-white text-sm disabled:opacity-50"
          >
            →
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-auto">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-4xl my-8">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editingQuestion ? "Редактировать вопрос" : "Новый вопрос"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Subject & Difficulty */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Предмет *
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    {allSubjects.map((s) => (
                      <option key={s} value={s}>
                        {getSubjectName(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Сложность
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm({ ...form, difficulty: e.target.value })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="easy">Легкий</option>
                    <option value="medium">Средний</option>
                    <option value="hard">Сложный</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Тема
                  </label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="Алгебра, Геометрия..."
                  />
                </div>
              </div>

              {/* Questions in 3 languages */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Вопрос (RU) *
                  </label>
                  <textarea
                    value={form.questionTextRu}
                    onChange={(e) =>
                      setForm({ ...form, questionTextRu: e.target.value })
                    }
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Сұрақ (KZ)
                  </label>
                  <textarea
                    value={form.questionTextKz}
                    onChange={(e) =>
                      setForm({ ...form, questionTextKz: e.target.value })
                    }
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Question (EN)
                  </label>
                  <textarea
                    value={form.questionTextEn}
                    onChange={(e) =>
                      setForm({ ...form, questionTextEn: e.target.value })
                    }
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none"
                  />
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Варианты ответов (4 варианта на каждом языке)
                </label>
                <div className="space-y-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        form.correctAnswer === i
                          ? "border-success bg-success/10"
                          : "border-slate-600 bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, correctAnswer: i })}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                            form.correctAnswer === i
                              ? "border-success bg-success text-white"
                              : "border-slate-500 text-slate-400"
                          }`}
                        >
                          {String.fromCharCode(65 + i)}
                        </button>
                        <span className="text-xs text-slate-400">
                          {form.correctAnswer === i
                            ? "Правильный ответ"
                            : "Нажмите, чтобы выбрать правильный"}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={form.optionsRu[i]}
                          onChange={(e) => updateOption("Ru", i, e.target.value)}
                          placeholder={`Вариант ${String.fromCharCode(65 + i)} (RU)`}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                        />
                        <input
                          type="text"
                          value={form.optionsKz[i]}
                          onChange={(e) => updateOption("Kz", i, e.target.value)}
                          placeholder={`Нұсқа ${String.fromCharCode(65 + i)} (KZ)`}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                        />
                        <input
                          type="text"
                          value={form.optionsEn[i]}
                          onChange={(e) => updateOption("En", i, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + i)} (EN)`}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.questionTextRu || !form.optionsRu[0]}
                className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
