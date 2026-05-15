import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/components/Providers";

export interface Program {
  id?: number;
  nameRu: string;
  nameKz: string;
  nameEn: string;
  passingScore: number;
  descriptionRu?: string;
  descriptionKz?: string;
  descriptionEn?: string;
}

export interface University {
  id: number;
  nameRu: string;
  nameKz: string;
  nameEn: string;
  cityRu: string;
  cityKz: string;
  cityEn: string;
  descriptionRu?: string;
  descriptionKz?: string;
  descriptionEn?: string;
  logoUrl: string | null;
  programs: Program[];
}

export function useAdminUniversities() {
  const { token, authHeaders } = useApp();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // Default to 50 as requested
  const [total, setTotal] = useState(0);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUni, setEditingUni] = useState<University | null>(null);

  // Bulk Import State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkParsed, setBulkParsed] = useState<any[] | null>(null);
  const [bulkParseError, setBulkParseError] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ success: boolean; message: string } | null>(null);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  // Form State
  const [nameRu, setNameRu] = useState("");
  const [nameKz, setNameKz] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [cityRu, setCityRu] = useState("");
  const [cityKz, setCityKz] = useState("");
  const [cityEn, setCityEn] = useState("");
  const [descriptionRu, setDescriptionRu] = useState("");
  const [descriptionKz, setDescriptionKz] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);

  const fetchUniversities = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/universities?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.ok) {
        const resData = await res.json();
        const data = resData.data;
        setUniversities(data.universities || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, search, page, pageSize, authHeaders]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  const openModal = (uni: University | null = null) => {
    setEditingUni(uni);
    if (uni) {
      setNameRu(uni.nameRu || "");
      setNameKz(uni.nameKz || "");
      setNameEn(uni.nameEn || "");
      setCityRu(uni.cityRu || "");
      setCityKz(uni.cityKz || "");
      setCityEn(uni.cityEn || "");
      setDescriptionRu(uni.descriptionRu || "");
      setDescriptionKz(uni.descriptionKz || "");
      setDescriptionEn(uni.descriptionEn || "");
      setLogoUrl(uni.logoUrl || "");
      setPrograms(uni.programs || []);
    } else {
      setNameRu("");
      setNameKz("");
      setNameEn("");
      setCityRu("");
      setCityKz("");
      setCityEn("");
      setDescriptionRu("");
      setDescriptionKz("");
      setDescriptionEn("");
      setLogoUrl("");
      setPrograms([]);
    }
    setShowModal(true);
  };

  const saveUniversity = async () => {
    if (!nameRu || !nameKz || !nameEn || !cityRu || !cityKz || !cityEn) {
      alert("Заполните названия и города на всех 3-х языках!");
      return;
    }

    const payload = {
      nameRu, nameKz, nameEn,
      cityRu, cityKz, cityEn,
      descriptionRu, descriptionKz, descriptionEn,
      logoUrl,
      programs,
    };

    const method = editingUni ? "PUT" : "POST";
    const url = editingUni ? `/api/admin/universities/${editingUni.id}` : "/api/admin/universities";

    try {
      const res = await fetch(url, {
        method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        fetchUniversities();
      } else {
        alert("Ошибка при сохранении");
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка при сохранении");
    }
  };

  const deleteUniversity = async (id: number) => {
    if (!confirm("Точно удалить?")) return;
    try {
      const res = await fetch(`/api/admin/universities/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        fetchUniversities();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addProgram = () => {
    setPrograms([...programs, { nameRu: "", nameKz: "", nameEn: "", passingScore: 0 }]);
  };

  const updateProgram = (index: number, field: keyof Program, value: any) => {
    const newProgs = [...programs];
    newProgs[index] = { ...newProgs[index], [field]: value };
    setPrograms(newProgs);
  };

  const removeProgram = (index: number) => {
    setPrograms(programs.filter((_, i) => i !== index));
  };

  const handleBulkJsonChange = (val: string) => {
    setBulkJson(val);
    setBulkParseError("");
    setBulkParsed(null);
    if (!val.trim()) return;

    try {
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed)) {
        setBulkParseError("Ожидается массив (array) объектов");
        return;
      }
      setBulkParsed(parsed);
    } catch (e: unknown) {
      setBulkParseError("Неверный формат JSON: " + (e instanceof Error ? e.message : "Unknown error"));
    }
  };

  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      handleBulkJsonChange(text);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (!bulkParsed || !token) return;
    setBulkImporting(true);
    setBulkErrors([]);
    setBulkResult(null);

    try {
      const res = await fetch("/api/admin/universities/bulk", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(bulkParsed),
      });
      
      const resData = await res.json();
      const data = resData.data;
      if (res.ok || res.status === 207) {
        if (res.ok) setBulkResult(data);
        if (res.status === 207) {
          setBulkResult({ success: false, message: resData.message });
          setBulkErrors(resData.details || []);
        }
        fetchUniversities();
      } else {
        setBulkErrors([resData.error || "Ошибка импорта"]);
      }
    } catch (e) {
      console.error(e);
      setBulkErrors(["Сетевая ошибка при импорте"]);
    } finally {
      setBulkImporting(false);
    }
  };

  return {
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
  };
}
