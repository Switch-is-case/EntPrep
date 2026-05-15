"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { useApp } from "@/components/Providers";
import { t, type Lang } from "@/lib/i18n";

import { useAdminUniversities } from "@/hooks/useAdminUniversities";
import { SelectAllCheckbox } from "@/components/admin/SelectAllCheckbox";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { RefreshButton } from "@/components/admin/RefreshButton";

export default function AdminUniversitiesPage() {
  const { lang } = useApp();
  const {
    universities,
    loading,
    search,
    setSearch,
    showModal,
    setShowModal,
    editingUni,
    openModal,
    saveUniversity,
    deleteUniversity,
    nameRu, setNameRu,
    nameKz, setNameKz,
    nameEn, setNameEn,
    cityRu, setCityRu,
    cityKz, setCityKz,
    cityEn, setCityEn,
    descriptionRu, setDescriptionRu,
    descriptionKz, setDescriptionKz,
    descriptionEn, setDescriptionEn,
    logoUrl, setLogoUrl,
    programs,
    addProgram,
    updateProgram,
    removeProgram,
    showBulkModal,
    setShowBulkModal,
    bulkJson,
    setBulkJson,
    bulkParsed,
    setBulkParsed,
    bulkParseError,
    setBulkParseError,
    bulkImporting,
    bulkResult,
    setBulkResult,
    bulkErrors,
    setBulkErrors,
    handleBulkJsonChange,
    handleBulkFileUpload,
    handleBulkImport,
    fetchUniversities,
    page,
    setPage,
    pageSize,
    setPageSize,
    total
  } = useAdminUniversities();

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
    if (selectedIds.size === universities.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(universities.map(u => u.id)));
    }
  };

  const cancelSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${count} university/universities? This will also delete all associated programs. This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeletingBulk(true);
    try {
      const res = await fetch("/api/admin/universities/bulk-delete", {
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
      await fetchUniversities();
      alert(`Successfully deleted ${result.data.deletedCount} university/universities`);
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
  }, [selectedIds.size, universities.length]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{t("admin.nav.universities" as any, lang)}</h1>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={fetchUniversities} />
          <button
            onClick={() => {
              setShowBulkModal(true);
              setBulkJson("");
              setBulkParsed(null);
              setBulkParseError("");
              setBulkResult(null);
              setBulkErrors([]);
            }}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-600 transition-colors"
          >
            {t("admin.questions.bulkImport", lang)}
          </button>
          <button
            onClick={() => openModal()}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            + {t("admin.universities.add", lang)}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder={t("admin.universities.searchPlaceholder", lang)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm"
        />
        <button
          onClick={toggleAll}
          className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          {selectedIds.size === universities.length ? "Deselect all" : "Select all"}
        </button>
      </div>

      <BulkActionBar
        selectedCount={selectedIds.size}
        onDelete={handleBulkDelete}
        onCancel={cancelSelection}
        isDeleting={isDeletingBulk}
      />

      {loading ? (
        <div className="text-slate-400">{t("common.loading", lang)}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {universities.map((uni) => (
              <div 
                key={uni.id} 
                className={`bg-slate-800 border rounded-xl p-5 relative transition-all ${
                  selectedIds.has(uni.id) ? "border-blue-500 ring-1 ring-blue-500/50 shadow-lg shadow-blue-900/10" : "border-slate-700"
                }`}
              >
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(uni.id)}
                    onChange={() => toggleOne(uni.id)}
                    className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer bg-slate-900"
                  />
                </div>
                
                <div className="flex items-start justify-between mb-4 pl-8">
                  <div className="flex items-center gap-3">
                    {uni.logoUrl ? (
                      <img src={uni.logoUrl} alt="logo" className="w-12 h-12 rounded bg-white object-contain p-1" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-lg">
                        {uni.nameRu.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white">{lang === "kz" ? uni.nameKz : lang === "en" ? uni.nameEn : uni.nameRu}</h3>
                      <p className="text-sm text-slate-400">{lang === "kz" ? uni.cityKz : lang === "en" ? uni.cityEn : uni.cityRu}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <button onClick={() => openModal(uni)} className="text-slate-400 hover:text-white transition-colors">{t("admin.common.edit", lang)}</button>
                    <button onClick={() => deleteUniversity(uni.id)} className="text-danger hover:text-red-400 transition-colors">{t("admin.users.actions.delete", lang)}</button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">{t("admin.universities.programs", lang)} ({uni.programs.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {uni.programs.slice(0, 3).map((p, idx) => (
                      <span key={idx} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                        {lang === "kz" ? p.nameKz : lang === "en" ? p.nameEn : p.nameRu} <span className="text-success ml-1">{p.passingScore}</span>
                      </span>
                    ))}
                    {uni.programs.length > 3 && (
                      <span className="text-xs text-slate-500">{t("admin.universities.more", lang).replace("{count}", String(uni.programs.length - 3))}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > pageSize && (
            <div className="flex items-center justify-center gap-4 py-4 border-t border-slate-800">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
              >
                {t("admin.common.prev", lang)}
              </button>
              <div className="text-slate-400 text-sm">
                {t("admin.common.page", lang)} {page} {t("admin.common.of", lang)} {Math.ceil(total / pageSize)}
                <span className="ml-2 text-slate-500">({total} total)</span>
              </div>
              <button
                disabled={page * pageSize >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
              >
                {t("admin.common.next", lang)}
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-4xl border border-slate-700 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-white">
                {editingUni ? t("admin.universities.modal.edit", lang) : t("admin.universities.modal.new", lang)}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t("admin.universities.form.nameRu", lang)}</label>
                  <input type="text" value={nameRu} onChange={e => setNameRu(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t("admin.universities.form.nameKz", lang)}</label>
                  <input type="text" value={nameKz} onChange={e => setNameKz(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t("admin.universities.form.nameEn", lang)}</label>
                  <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t("admin.universities.form.cityRu", lang)}</label>
                  <input type="text" value={cityRu} onChange={e => setCityRu(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t("admin.universities.form.cityKz", lang)}</label>
                  <input type="text" value={cityKz} onChange={e => setCityKz(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t("admin.universities.form.cityEn", lang)}</label>
                  <input type="text" value={cityEn} onChange={e => setCityEn(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">URL Логотипа</label>
                <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t("admin.universities.form.description", lang)}</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <textarea placeholder="RU..." value={descriptionRu} onChange={e => setDescriptionRu(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                  <textarea placeholder="KZ..." value={descriptionKz} onChange={e => setDescriptionKz(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                  <textarea placeholder="EN..." value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{t("admin.universities.form.programs", lang)}</h3>
                  <button onClick={addProgram} className="bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-slate-600">+ {t("admin.common.add", lang).replace("Добавить", "Добавить").replace("Қосу", "Қосу").replace("Add", "Add")}</button>
                </div>

                <div className="space-y-4">
                  {programs.map((p, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg p-4 relative">
                      <button onClick={() => removeProgram(idx)} className="absolute top-2 right-2 text-slate-500 hover:text-danger">✕</button>
                      <div className="grid grid-cols-3 gap-3 mb-3 pr-8">
                        <input type="text" placeholder={`${t("admin.questions.table.question", lang).replace("Вопрос", "Название").replace("Сұрақ", "Атауы").replace("Question", "Name")} (RU)`} value={p.nameRu} onChange={e => updateProgram(idx, "nameRu", e.target.value)} className="bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white" />
                        <input type="text" placeholder={`${t("admin.questions.table.question", lang).replace("Вопрос", "Название").replace("Сұрақ", "Атауы").replace("Question", "Name")} (KZ)`} value={p.nameKz} onChange={e => updateProgram(idx, "nameKz", e.target.value)} className="bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white" />
                        <input type="text" placeholder={`${t("admin.questions.table.question", lang).replace("Вопрос", "Название").replace("Сұрақ", "Атауы").replace("Question", "Name")} (EN)`} value={p.nameEn} onChange={e => updateProgram(idx, "nameEn", e.target.value)} className="bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white" />
                      </div>
                      <div className="w-1/3">
                        <input type="number" placeholder={t("admin.universities.form.passingScore", lang)} value={p.passingScore} onChange={e => updateProgram(idx, "passingScore", parseInt(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white" />
                      </div>
                    </div>
                  ))}
                  {programs.length === 0 && <div className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-700 rounded-lg">{t("admin.universities.form.noPrograms", lang)}</div>}
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-700">{t("admin.common.cancel", lang)}</button>
              <button onClick={saveUniversity} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">{t("admin.common.save", lang)}</button>
            </div>
          </div>
        </div>
      )}
      
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-3xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-6">{t("admin.universities.bulk.title", lang)}</h2>
            {/* Modal Body for bulk is kept similar to before, omitting details for brevity since it handles raw JSON which user constructs */}
            <div className="space-y-4">
              <textarea
                  value={bulkJson}
                  onChange={(e) => handleBulkJsonChange(e.target.value)}
                  className="w-full h-64 bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-300 font-mono"
                  placeholder={`[\n  {\n    "nameRu": "Astana IT University",\n    "nameKz": "Астана АТ Университеті",\n    "nameEn": "Astana IT University",\n    "cityRu": "Астана",\n    "cityKz": "Астана",\n    "cityEn": "Astana",\n    "programs": [\n      { "nameRu": "Кибербезопасность", "nameKz": "Киберқауіпсіздік", "nameEn": "Cybersecurity", "passingScore": 95 }\n    ]\n  }\n]`}
              />
              {bulkParseError && <div className="text-danger text-sm">{bulkParseError}</div>}
              {bulkErrors.length > 0 && <div className="text-danger text-sm">{bulkErrors.join(', ')}</div>}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg">{t("admin.common.cancel", lang)}</button>
                <button onClick={handleBulkImport} disabled={!bulkParsed || bulkImporting} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">{t("admin.questions.bulkImport", lang).replace("Массовый импорт", "Импортировать").replace("Жаппай импорт", "Импорттау").replace("Bulk Import", "Import")}</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
