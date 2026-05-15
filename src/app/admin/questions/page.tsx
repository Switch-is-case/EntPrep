"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState, useCallback } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { MANDATORY_SUBJECTS, PROFILE_SUBJECTS } from "@/domain/tests/rules";

import { useAdminQuestions } from "@/hooks/useAdminQuestions";
import { Spinner } from "@/components/Spinner";
import { SelectAllCheckbox } from "@/components/admin/SelectAllCheckbox";
import { BulkActionBar } from "@/components/admin/BulkActionBar";

const allSubjects = [...MANDATORY_SUBJECTS, ...PROFILE_SUBJECTS];

export default function AdminQuestions() {
  const { user, lang } = useApp();
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
    handleAiGenerate,
    fetchQuestions
  } = useAdminQuestions();

  const { authHeaders } = useApp();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const toggleOne = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map(q => q.id)));
    }
  };

  const cancelSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${count} question${count > 1 ? "s" : ""}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeletingBulk(true);
    try {
      const res = await fetch("/api/admin/questions/bulk-delete", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete");
      }

      const result = await res.json();
      setSelectedIds(new Set());
      await fetchQuestions();
      alert(`Successfully deleted ${result.data.deletedCount} question(s)`);
    } catch (error: any) {
      console.error("Bulk delete failed:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsDeletingBulk(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedIds.size > 0) {
        cancelSelection();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
        e.preventDefault();
        toggleAll();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds.size, questions.length]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{t("admin.questions.title", lang)}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="bg-purple-600/20 text-purple-400 border border-purple-600/50 px-4 py-2 rounded-lg font-medium hover:bg-purple-600/30 transition-colors flex items-center gap-2 text-sm"
          >
            {t("admin.questions.generateAi", lang)}
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
            {t("admin.questions.bulkImport", lang)}
          </button>
          <button
            onClick={openCreate}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span> {t("admin.questions.add", lang)}
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
          <option value="">{t("admin.questions.filter.allSubjects", lang)}</option>
          {allSubjects.map((s) => (
            <option key={s} value={s}>
              {getSubjectName(s)}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder={t("admin.common.search", lang)}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 w-64"
        />
      </div>

      <BulkActionBar
        selectedCount={selectedIds.size}
        onDelete={handleBulkDelete}
        onCancel={cancelSelection}
        isDeleting={isDeletingBulk}
      />
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
                  <th className="px-4 py-3 font-medium w-12">
                    <SelectAllCheckbox
                      totalCount={questions.length}
                      selectedCount={selectedIds.size}
                      onToggleAll={toggleAll}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">{t("admin.questions.form.subject", lang).replace(" *", "")}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.questions.table.question", lang)}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.questions.table.answer", lang)}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.questions.table.difficulty", lang)}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.common.actions", lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {questions.map((q) => (
                  <tr 
                    key={q.id} 
                    className={`hover:bg-slate-700/30 transition-colors ${selectedIds.has(q.id) ? "bg-blue-600/10" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(q.id)}
                        onChange={() => toggleOne(q.id)}
                        className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer bg-slate-700"
                      />
                    </td>
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
                        {t(`admin.questions.difficulty.${q.difficulty}` as any, lang)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(q)}
                          className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          {t("admin.common.edit", lang)}
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="text-xs font-medium px-2 py-1 rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                        >
                          {t("admin.users.actions.delete", lang)}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {questions.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      {t("admin.common.noData", lang)}
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
                {editingQuestion ? t("admin.questions.modal.edit", lang) : t("admin.questions.modal.new", lang)}
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
                    {t("admin.questions.form.subject", lang)}
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
                    {t("admin.questions.table.difficulty", lang)}
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm({ ...form, difficulty: e.target.value })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="easy">{t("admin.questions.difficulty.easy", lang)}</option>
                    <option value="medium">{t("admin.questions.difficulty.medium", lang)}</option>
                    <option value="hard">{t("admin.questions.difficulty.hard", lang)}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t("admin.questions.form.topic", lang)}
                  </label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder={t("admin.questions.form.topicPlaceholder", lang)}
                  />
                </div>
              </div>

              {/* Questions in 3 languages */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t("admin.questions.form.questionRu", lang)}
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
                    {t("admin.questions.form.questionKz", lang)}
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
                    {t("admin.questions.form.questionEn", lang)}
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
                  {t("admin.questions.form.imageLabel", lang)}
                </label>
                <div className="flex items-start gap-4">
                  <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${imageUploading ? "opacity-50 cursor-not-allowed border-slate-600 text-slate-400" : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"}`}>
                    {imageUploading ? t("common.loading", lang) : t("admin.questions.bulk.uploadJson", lang).replace(".json ", "")}
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
                        {t("admin.users.actions.delete", lang)}
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {t("admin.questions.form.imageHint", lang)}
                </p>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  {t("admin.questions.form.optionsLabel", lang)}
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
                            ? t("admin.questions.form.correctAnswer", lang)
                            : t("admin.questions.form.selectCorrect", lang)}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={form.optionsRu[i]}
                          onChange={(e) => updateOption("Ru", i, e.target.value)}
                          placeholder={`${t("admin.questions.form.option", lang)} ${String.fromCharCode(65 + i)} (RU)`}
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
                          {optionImageUploading[i] ? t("common.loading", lang) : t("admin.questions.form.optionImage", lang)}
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
                {t("admin.common.cancel", lang)}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.questionTextRu || !form.optionsRu[0]}
                className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saving ? t("admin.questions.form.saving", lang) : t("admin.common.save", lang)}
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
              <h2 className="text-lg font-semibold text-white">{t("admin.questions.bulk.title", lang)}</h2>
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
                <p className="text-slate-400 mb-2 font-sans font-medium text-sm">{t("admin.questions.bulk.formatHint", lang)}</p>
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
                  {t("admin.questions.bulk.uploadJson", lang)}
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
                  {t("admin.questions.bulk.manualLabel", lang)}
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
                  {t("admin.questions.bulk.ready", lang).replace("{count}", String(bulkParsed.length))}
                </div>
              )}

              {/* Import errors */}
              {bulkErrors.length > 0 && (
                <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <p className="text-danger text-sm font-medium mb-1">{t("admin.questions.bulk.validationErrors", lang)}</p>
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
                {t("admin.common.cancel", lang)}
              </button>
              <button
                onClick={handleBulkImport}
                disabled={!bulkParsed || bulkImporting || !!bulkParseError}
                className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {bulkImporting ? t("admin.questions.bulk.importing", lang) : t("admin.questions.bulkImport", lang)}
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
                {t("admin.questions.ai.title", lang)}
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
                {t("admin.questions.ai.hint", lang)}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t("admin.questions.form.subject", lang)}
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
                  {t("admin.questions.ai.promptLabel", lang)}
                </label>
                <input
                  type="text"
                  value={aiForm.topic}
                  onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-400"
                  placeholder={t("admin.questions.ai.promptPlaceholder", lang)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t("admin.questions.table.difficulty", lang)}
                  </label>
                  <select
                    value={aiForm.difficulty}
                    onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="easy">{t("admin.questions.difficulty.easy", lang)}</option>
                    <option value="medium">{t("admin.questions.difficulty.medium", lang)}</option>
                    <option value="hard">{t("admin.questions.difficulty.hard", lang)}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t("admin.questions.ai.count", lang)}
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
                {t("admin.common.cancel", lang)}
              </button>
              <button
                onClick={handleAiGenerate}
                disabled={aiGenerating || !aiForm.topic}
                className="px-6 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {aiGenerating ? (
                  <>
                    <Spinner size="sm" color="white" />
                    {t("admin.questions.ai.generating", lang)}
                  </>
                ) : (
                  t("admin.questions.generateAi", lang).replace(t("admin.questions.title", lang), "").trim() || t("admin.questions.ai.title", lang)
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
