"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { useApp } from "@/components/Providers";
import { t, type Lang } from "@/lib/i18n";

import { useAdminUniversities } from "@/hooks/useAdminUniversities";
import { SearchToolbar } from "@/components/admin/ui/SearchToolbar";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { BulkActionsBar, type BulkAction } from "@/components/admin/ui/BulkActionsBar";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Badge } from "@/components/admin/ui/Badge";
import { IconButton } from "@/components/admin/ui/IconButton";
import { Pagination } from "@/components/admin/ui/Pagination";
import { RefreshCw, Plus, Upload, Eye, Pencil, Trash2, Download, Edit, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { UniversityCard, UniversityCardSkeleton } from "@/components/admin/UniversityCard";

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      setIsConfirmOpen(false);
      await fetchUniversities();
    } catch (error: any) {
      console.error("Bulk delete failed:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    const selectedData = universities.filter(u => selectedIds.has(u.id));
    if (selectedData.length === 0) return;

    let content = "";
    let mimeType = "";
    let fileName = `universities-export-${new Date().toISOString().split("T")[0]}`;

    if (format === "json") {
      content = JSON.stringify(selectedData, null, 2);
      mimeType = "application/json";
      fileName += ".json";
    } else {
      // CSV
      const headers = ["ID", "Name (RU)", "City (RU)", "Programs Count"];
      const rows = selectedData.map(u => [
        u.id,
        u.nameRu,
        u.cityRu,
        u.programs.length
      ]);
      content = [headers, ...rows].map(r => r.join(",")).join("\n");
      mimeType = "text/csv";
      fileName += ".csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<any>[] = [
    { key: "select", width: 48, label: (
      <input 
        type="checkbox" 
        checked={selectedIds.size === universities.length && universities.length > 0} 
        onChange={toggleAll}
        className="w-4 h-4 rounded border-border bg-surface-raised text-primary focus:ring-primary/20"
      />
    )},
    { key: "id", label: "ID", width: 80 },
    { key: "logo", label: "", width: 60 },
    { key: "name", label: t("admin.common.name", lang), flex: 1 },
    { key: "city", label: t("admin.common.status", lang), width: 140 }, // Using as City for now or status
    { key: "programs", label: "Programs", width: 100 },
    { key: "actions", width: 120, label: "" },
  ];

  const bulkActions: BulkAction[] = [
    { 
      key: "export-csv", 
      icon: <Download className="w-4 h-4" />, 
      label: "Export CSV", 
      onClick: () => handleExport("csv") 
    },
    { 
      key: "export-json", 
      icon: <Download className="w-4 h-4" />, 
      label: "Export JSON", 
      onClick: () => handleExport("json") 
    },
    { 
      key: "delete", 
      icon: <Trash2 className="w-4 h-4" />, 
      label: t("admin.bulk.delete", lang), 
      variant: "danger", 
      onClick: () => setIsConfirmOpen(true) 
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedIds.size > 0) {
        cancelSelection();
      }
      if (e.key === "Delete" && selectedIds.size > 0) {
        setIsConfirmOpen(true);
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-1">{t("admin.nav.universities" as any, lang)}</h1>
          <p className="text-text-secondary text-sm">Manage educational institutions and their programs</p>
        </div>
        <div className="flex items-center gap-2">
          <IconButton 
            icon={<RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />} 
            tooltip={t("common.refresh", lang)} 
            onClick={fetchUniversities} 
          />
          
          <button 
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-base hover:bg-surface-raised border border-border text-text text-sm font-semibold rounded-xl transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            {t("admin.questions.bulkImport", lang)}
          </button>
          
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t("admin.universities.add", lang)}
          </button>
        </div>
      </div>

      <SearchToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t("admin.search.placeholder", lang)}
      >
        <div className="flex items-center gap-1 bg-surface-base border border-border rounded-xl p-1 mr-2">
          <IconButton 
            icon={<LayoutGrid className="w-4 h-4" />} 
            tooltip="Grid view" 
            variant={viewMode === "grid" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setViewMode("grid")}
          />
          <IconButton 
            icon={<List className="w-4 h-4" />} 
            tooltip="List view" 
            variant={viewMode === "list" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setViewMode("list")}
          />
        </div>
      </SearchToolbar>

      {loading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <UniversityCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <DataTable columns={columns} rows={[]} isLoading={true} renderRow={() => null} />
        )
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {universities.map((uni) => (
            <UniversityCard
              key={uni.id}
              university={uni}
              lang={lang}
              isSelected={selectedIds.has(uni.id)}
              onToggle={toggleOne}
              onEdit={openModal}
              onDelete={deleteUniversity}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={universities}
          renderRow={(uni) => (
            <tr key={uni.id} className="border-b border-border hover:bg-surface-raised/50 transition-colors group">
              <td className="px-4 py-4">
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(uni.id)} 
                  onChange={() => toggleOne(uni.id)}
                  className="w-4 h-4 rounded border-border bg-surface-base text-primary focus:ring-primary/20"
                />
              </td>
              <td className="px-4 py-4 font-mono text-text-secondary text-xs">#{uni.id}</td>
              <td className="px-4 py-4">
                {uni.logoUrl ? (
                  <img src={uni.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover bg-surface-raised" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {uni.nameRu[0]}
                  </div>
                )}
              </td>
              <td className="px-4 py-4">
                <p className="text-text font-medium truncate">{uni.nameRu}</p>
                <p className="text-text-secondary text-xs">{uni.cityRu}</p>
              </td>
              <td className="px-4 py-4">
                <Badge variant="outline">{uni.cityRu}</Badge>
              </td>
              <td className="px-4 py-4">
                <Badge variant="secondary">{uni.programs.length} progs</Badge>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton icon={<Pencil className="w-4 h-4" />} tooltip={t("common.edit", lang)} onClick={() => openModal(uni)} />
                  <IconButton icon={<Trash2 className="w-4 h-4" />} tooltip={t("common.delete", lang)} variant="danger" onClick={() => deleteUniversity(uni.id)} />
                </div>
              </td>
            </tr>
          )}
        />
      )}

      <Pagination
        page={page}
        totalPages={Math.ceil(total / pageSize)}
        onPageChange={setPage}
        lang={lang}
      />

      <BulkActionsBar
        selectedCount={selectedIds.size}
        onClear={cancelSelection}
        actions={bulkActions}
        lang={lang}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={t("admin.confirm.delete.title", lang)}
        description={t("admin.confirm.delete.description", lang, { count: selectedIds.size })}
        warning={t("admin.confirm.delete.warning", lang)}
        confirmLabel={t("admin.confirm.delete.confirm", lang)}
        cancelLabel={t("common.cancel", lang)}
        variant="danger"
        onConfirm={handleBulkDelete}
        isLoading={isDeletingBulk}
      />

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
