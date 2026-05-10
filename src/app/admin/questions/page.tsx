"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState, useCallback } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { MANDATORY_SUBJECTS, PROFILE_SUBJECTS } from "@/domain/tests/rules";

import { useAdminQuestions } from "@/hooks/useAdminQuestions";
import { Spinner } from "@/components/Spinner";

const allSubjects = [...MANDATORY_SUBJECTS, ...PROFILE_SUBJECTS];

export default function AdminQuestions() {
  const {
    questions,
    loading,
    page,
    totalPages,
    filterSubject,
    search,
    showModal,
    editingQuestion,
    saving,
    showBulkModal,
    bulkJson,
    bulkParsed,
    bulkParseError,
    bulkImporting,
    bulkResult,
    bulkErrors,
    showAiModal,
    aiForm,
    aiGenerating,
    aiError,
    form,
    imageUploading,
    optionImageUploading,
    setPage,
    setFilterSubject,
    setSearch,
    setShowModal,
    setShowBulkModal,
    setBulkJson,
    setBulkParsed,
    setBulkParseError,
    setBulkResult,
    setBulkErrors,
    setShowAiModal,
    setAiForm,
    setForm,
    getSubjectName,
    resetForm,
    openCreate,
    openEdit,
    handleSave,
    handleImageUpload,
    handleOptionImageUpload,
    removeOptionImage,
    handleDelete,
    updateOption,
    handleBulkJsonChange,
    handleBulkFileUpload,
    handleBulkImport,
    handleAiGenerate
  } = useAdminQuestions();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Вопросы</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="bg-purple-600/20 text-purple-400 border border-purple-600/50 px-4 py-2 rounded-lg font-medium hover:bg-purple-600/30 transition-colors flex items-center gap-2 text-sm"
          >
            Сгенерировать ИИ
          </button>
          <button
            onClick={() => {
              setShowBulkModal(true);
              setBulkJson("");
              setBulkParsed(null);
              setBulkParseError("");
              setBulkResult(null);
              setBulkErrors([]);
            }}
            className="border border-slate-600 text-slate-300 px-4 py-2 rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
          >
            Массовый импорт
          </button>
          <button
            onClick={openCreate}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span> Добавить вопрос
          </button>
        </div>
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
            <Spinner size="md" />
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
                          className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="text-xs font-medium px-2 py-1 rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                        >
                          Удалить
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
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-start justify-center p-4 overflow-auto">
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

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Изображение к вопросу (необязательно)
                </label>
                <div className="flex items-start gap-4">
                  <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${imageUploading ? "opacity-50 cursor-not-allowed border-slate-600 text-slate-400" : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"}`}>
                    {imageUploading ? "Загрузка..." : "Выбрать файл"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={imageUploading}
                      onChange={handleImageUpload}
                    />
                  </label>
                  {form.imageUrl && (
                    <div className="flex items-center gap-3">
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded-lg border border-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                        className="text-xs text-danger hover:text-red-400"
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  JPEG, PNG, WebP или GIF — максимум 5 МБ
                </p>
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
                      {/* Option image upload */}
                      <div className="mt-2 flex items-center gap-3">
                        <label className={`flex items-center gap-1.5 cursor-pointer px-3 py-1 rounded border text-xs font-medium transition-colors ${optionImageUploading[i] ? "opacity-50 cursor-not-allowed border-slate-600 text-slate-500" : "border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white"}`}>
                          {optionImageUploading[i] ? "Загрузка..." : "Картинка к ответу"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            disabled={optionImageUploading[i]}
                            onChange={(e) => handleOptionImageUpload(i, e)}
                          />
                        </label>
                        {form.optionImages[i] && (
                          <>
                            <img
                              src={form.optionImages[i]!}
                              alt={`Option ${String.fromCharCode(65 + i)}`}
                              className="h-10 w-10 object-cover rounded border border-slate-600"
                            />
                            <button
                              type="button"
                              onClick={() => removeOptionImage(i)}
                              className="text-xs text-danger hover:text-red-400"
                            >
                              Удалить
                            </button>
                          </>
                        )}
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

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-start justify-center p-4 overflow-auto">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl my-8">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Массовый импорт вопросов</h2>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Format hint */}
              <div className="bg-slate-700/50 rounded-lg p-4 text-xs text-slate-300 font-mono leading-relaxed">
                <p className="text-slate-400 mb-2 font-sans font-medium text-sm">Формат JSON-файла:</p>
                {`[
  {
    "subject": "math_literacy",
    "questionTextRu": "Вопрос на русском",
    "questionTextKz": "Сұрақ қазақша",
    "questionTextEn": "Question in English",
    "optionsRu": ["Вариант A", "Вариант B", "Вариант C", "Вариант D"],
    "optionsKz": ["A нұсқа", "B нұсқа", "C нұсқа", "D нұсқа"],
    "optionsEn": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "difficulty": "medium",
    "topic": "Алгебра"
  }
]`}
              </div>

              {/* File upload */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer border border-dashed border-slate-600 rounded-lg p-4 text-slate-400 hover:border-primary hover:text-white transition-colors text-sm">
                  Загрузить .json файл
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleBulkFileUpload}
                  />
                </label>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  или вставьте JSON вручную
                </label>
                <textarea
                  value={bulkJson}
                  onChange={(e) => handleBulkJsonChange(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-xs font-mono resize-none"
                  placeholder='[{"subject": "math_literacy", "questionTextRu": "...", ...}]'
                />
              </div>

              {/* Parse error */}
              {bulkParseError && (
                <div className="bg-danger/10 text-danger text-sm rounded-lg p-3 border border-danger/20">
                  {bulkParseError}
                </div>
              )}

              {/* Preview count */}
              {bulkParsed && !bulkParseError && (
                <div className="bg-success/10 text-success text-sm rounded-lg p-3 border border-success/20">
                  Готово к импорту: <strong>{bulkParsed.length}</strong> вопросов
                </div>
              )}

              {/* Import errors */}
              {bulkErrors.length > 0 && (
                <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <p className="text-danger text-sm font-medium mb-1">Ошибки валидации:</p>
                  {bulkErrors.map((e, i) => (
                    <p key={i} className="text-danger/80 text-xs">{e}</p>
                  ))}
                </div>
              )}

              {/* Success result */}
              {bulkResult && (
                <div className="bg-success/10 text-success text-sm rounded-lg p-3 border border-success/20 font-medium">
                  ✓ {bulkResult.message}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Закрыть
              </button>
              <button
                onClick={handleBulkImport}
                disabled={!bulkParsed || bulkImporting || !!bulkParseError}
                className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {bulkImporting ? "Импорт..." : "Импортировать"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-start justify-center p-4 overflow-auto">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-xl my-8">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                Генератор ИИ
              </h2>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-purple-500/10 text-purple-300 text-sm rounded-lg p-3 border border-purple-500/20 leading-relaxed">
                Сгенерированные вопросы будут загружены в окно Массового импорта, где вы сможете их проверить и отредактировать перед сохранением.
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Предмет *
                </label>
                <select
                  value={aiForm.subject}
                  onChange={(e) => setAiForm({ ...aiForm, subject: e.target.value })}
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
                  Тема (описание для ИИ) *
                </label>
                <input
                  type="text"
                  value={aiForm.topic}
                  onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-400"
                  placeholder="Например: Квадратные уравнения, Производные..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Сложность
                  </label>
                  <select
                    value={aiForm.difficulty}
                    onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="easy">Легкий</option>
                    <option value="medium">Средний</option>
                    <option value="hard">Сложный</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Количество (макс. 20)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={aiForm.count}
                    onChange={(e) => setAiForm({ ...aiForm, count: Number(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>

              {aiError && (
                <div className="bg-danger/10 text-danger text-sm rounded-lg p-3 border border-danger/20">
                  {aiError}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
                disabled={aiGenerating}
              >
                Отмена
              </button>
              <button
                onClick={handleAiGenerate}
                disabled={aiGenerating || !aiForm.topic}
                className="px-6 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {aiGenerating ? (
                  <>
                    <Spinner size="sm" color="white" />
                    Генерация...
                  </>
                ) : (
                  "Сгенерировать"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
