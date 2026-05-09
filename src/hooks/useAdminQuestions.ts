import { useState, useCallback, useEffect } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";

export interface Question {
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
  imageUrl: string | null;
  optionImages: (string | null)[] | null;
}

export function useAdminQuestions() {
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

  // Bulk import state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkParsed, setBulkParsed] = useState<unknown[] | null>(null);
  const [bulkParseError, setBulkParseError] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ imported: number; message: string } | null>(null);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  // AI Generator state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiForm, setAiForm] = useState({
    subject: "math_literacy",
    topic: "",
    difficulty: "medium",
    count: 3,
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

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
    imageUrl: "",
    optionImages: [null, null, null, null] as (string | null)[],
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [optionImageUploading, setOptionImageUploading] = useState<boolean[]>([false, false, false, false]);

  const fetchQuestions = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: "15",
    });
    if (filterSubject) params.set("subject", filterSubject);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/admin/questions?${params}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, page, filterSubject, search, authHeaders]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      imageUrl: "",
      optionImages: [null, null, null, null],
    });
    setOptionImageUploading([false, false, false, false]);
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
      imageUrl: q.imageUrl || "",
      optionImages: q.optionImages || [null, null, null, null],
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

    try {
      const res = await fetch(url, {
        headers: authHeaders(),
        method,
        body: JSON.stringify({
          ...form,
          imageUrl: form.imageUrl || null,
          optionImages: form.optionImages.some(Boolean) ? form.optionImages : null,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({ ...f, imageUrl: data.url }));
      } else {
        alert("Ошибка загрузки изображения");
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка сети");
    } finally {
      setImageUploading(false);
    }
  };

  const handleOptionImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOptionImageUploading((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    const fd = new FormData();
    fd.append("file", file);
    
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setForm((f) => {
          const newImages = [...f.optionImages];
          newImages[index] = data.url;
          return { ...f, optionImages: newImages };
        });
      } else {
        alert("Ошибка загрузки изображения");
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка сети");
    } finally {
      setOptionImageUploading((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }
  };

  const removeOptionImage = (index: number) => {
    setForm((f) => {
      const newImages = [...f.optionImages];
      newImages[index] = null;
      return { ...f, optionImages: newImages };
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить вопрос?")) return;
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        headers: authHeaders(),
        method: "DELETE",
      });

      if (res.ok) {
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
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

  const handleBulkJsonChange = (value: string) => {
    setBulkJson(value);
    setBulkParseError("");
    setBulkParsed(null);
    setBulkResult(null);
    setBulkErrors([]);
    if (!value.trim()) return;
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        setBulkParseError("JSON должен быть массивом [ {...}, {...} ]");
        return;
      }
      setBulkParsed(parsed);
    } catch {
      setBulkParseError("Неверный формат JSON");
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
      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(bulkParsed),
      });
      const data = await res.json();
      if (res.ok) {
        setBulkResult(data);
        fetchQuestions();
      } else {
        setBulkErrors(data.details || [data.error || "Ошибка импорта"]);
      }
    } catch (e) {
      console.error(e);
      setBulkErrors(["Сетевая ошибка при импорте"]);
    } finally {
      setBulkImporting(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!token) return;
    if (!aiForm.topic.trim()) {
      setAiError("Введите тему (например, 'Логарифмы' или 'Оптика')");
      return;
    }
    setAiGenerating(true);
    setAiError("");

    try {
      const res = await fetch("/api/admin/questions/generate", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(aiForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка генерации");

      setShowAiModal(false);
      
      const jsonString = JSON.stringify(data.questions, null, 2);
      setBulkJson(jsonString);
      setBulkParseError("");
      setBulkParsed(data.questions);
      setBulkResult(null);
      setBulkErrors([]);
      setShowBulkModal(true);
      
    } catch (e: unknown) {
      setAiError((e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setAiGenerating(false);
    }
  };

  return {
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
  };
}
