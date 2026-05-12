"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { useApp } from "@/components/Providers";
import { t, type Lang } from "@/lib/i18n";

import { useAdminUniversities } from "@/hooks/useAdminUniversities";

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
    handleBulkImport
  } = useAdminUniversities();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{t("admin.nav.universities" as any, lang)}</h1>
        <div className="flex items-center gap-2">
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

      <div className="mb-6">
        <input
          type="text"
          placeholder={t("admin.universities.searchPlaceholder", lang)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm"
        />
      </div>

      {loading ? (
        <div className="text-slate-400">{t("common.loading", lang)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {universities.map((uni) => (
            <div key={uni.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
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
