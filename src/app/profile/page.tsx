"use client";

import React, { useState, useEffect } from "react";
import { useApp, type User } from "@/components/Providers";
import { t, tSubject, type Lang } from "@/lib/i18n";
import { Spinner } from "@/components/Spinner";
import { motion, AnimatePresence } from "framer-motion";

interface Combination {
  id: number;
  subject1: { nameRu: string; nameKz: string; nameEn: string };
  subject2: { nameRu: string; nameKz: string; nameEn: string };
}

interface University {
  id: number;
  nameRu: string;
  nameKz: string;
  nameEn: string;
  logoUrl?: string;
  programs: Program[];
}

interface Program {
  id: number;
  nameRu: string;
  nameKz: string;
  nameEn: string;
  code: string;
}

import { Target, BookOpen, GraduationCap, Check } from "lucide-react";

import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ProfilePage() {
  const { lang, user, ready, authHeaders } = useRequireAuth();
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [universitiesData, setUniversitiesData] = useState<University[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!ready || !user || !localStorage.getItem("ent-token")) return;
      try {
        const [combosRes, univsRes] = await Promise.all([
          fetch("/api/combinations", { headers: authHeaders() }),
          fetch("/api/universities", { headers: authHeaders() })
        ]);
        if (combosRes.ok) setCombinations(await combosRes.json());
        if (univsRes.ok) setUniversitiesData(await univsRes.json());
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [ready, user, authHeaders]);

  if (!user || loadingData) {
    return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;
  }

  return (
    <ProfileForm 
      user={user} 
      lang={lang} 
      combinations={combinations} 
      universitiesData={universitiesData} 
    />
  );
}

function ProfileForm({ user, lang, combinations, universitiesData }: { 
  user: User; 
  lang: Lang; 
  combinations: Combination[]; 
  universitiesData: University[];
}) {
  const { setLang, updateUser, authHeaders, logout } = useApp();

  const [selectedComboId, setSelectedComboId] = useState<number | null>(user.targetCombinationId || null);
  const [targetScore, setTargetScore] = useState(user.targetScore || 100);
  const [targetSpecialtyId, setTargetSpecialtyId] = useState<number | null>(user.targetSpecialtyId || null);
  const [targetUniversityId, setTargetUniversityId] = useState<number | null>(user.targetUniversityId || null);
  const [selectedLang, setSelectedLang] = useState<Lang>((user.language as Lang) || lang);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          targetCombinationId: selectedComboId,
          targetScore,
          targetSpecialtyId,
          targetUniversityId,
          language: selectedLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data);
        setLang(selectedLang);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const errData = await res.json();
        setError(errData.error || "Ошибка сохранения");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  const selectedUniversity = universitiesData.find(u => u.id === targetUniversityId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("profile.title", lang)}</h1>
          <p className="text-slate-500 mt-1">{user.email}</p>
        </div>
        <button 
          onClick={logout} 
          className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors text-sm"
        >
          {t("nav.logout", lang)}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
             <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-4">
                   {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <div className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {t("profile.applicant", lang)}
                </div>
             </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">{t("profile.language", lang)}</h3>
            <div className="grid grid-cols-1 gap-2">
              {([
                { code: "kz" as Lang, label: "Қазақша" },
                { code: "ru" as Lang, label: "Русский" },
                { code: "en" as Lang, label: "English" },
              ]).map((l) => (
                <button
                  key={l.code}
                  onClick={() => setSelectedLang(l.code)}
                  className={`p-3 rounded-xl border transition-colors flex items-center gap-3 text-sm font-bold ${
                    selectedLang === l.code
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 text-slate-600 hover:border-primary/40"
                  }`}
                >
                  {l.label}
                  {selectedLang === l.code && <Check className="w-4 h-4 text-primary ml-auto" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
             <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" aria-hidden="true" />
                {t("goal.title", lang)}
             </h3>
             
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t("goal.targetScore", lang)}</span>
                  <span className="text-3xl font-bold text-primary">{targetScore}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="140"
                  value={targetScore}
                  onChange={(e) => setTargetScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>min 50</span>
                  <span>max 140</span>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
             <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
                {t("profile.subjects", lang)}
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {combinations.map((combo) => (
                  <button
                    key={combo.id}
                    onClick={() => setSelectedComboId(combo.id)}
                    className={`p-4 rounded-xl border transition-colors text-left flex flex-col justify-center min-h-[70px] ${
                      selectedComboId === combo.id
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-primary/40"
                    }`}
                  >
                    <div className="text-sm font-bold text-slate-800">
                      {`${tSubject(combo.subject1.nameKz, lang)} + ${tSubject(combo.subject2.nameKz, lang)}`}
                    </div>
                  </button>
                ))}
             </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
             <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" aria-hidden="true" />
                {t("profile.universityAndMajor", lang)}
             </h3>
             
             <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {t("profile.university", lang)}
                  </label>
                  <select
                    value={targetUniversityId || ""}
                    onChange={(e) => {
                      const id = e.target.value ? parseInt(e.target.value) : null;
                      setTargetUniversityId(id);
                      setTargetSpecialtyId(null);
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 outline-none focus:border-primary transition-colors"
                  >
                    <option value="">{t("profile.selectUniversity", lang)}</option>
                    {universitiesData.map(u => (
                      <option key={u.id} value={u.id}>{lang === "ru" ? u.nameRu : u.nameKz}</option>
                    ))}
                  </select>
                </div>

                {targetUniversityId && selectedUniversity && (
                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      {t("profile.specialty", lang)}
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedUniversity.programs.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setTargetSpecialtyId(p.id)}
                          className={`w-full p-3 rounded-xl border text-left transition-colors text-sm font-bold ${
                            targetSpecialtyId === p.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-200 text-slate-600 hover:border-primary/40"
                          }`}
                        >
                          {lang === "ru" ? p.nameRu : p.nameKz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </div>

          <div className="pt-4">
             {error && (
               <div className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider rounded-xl p-4 mb-4 border border-red-100 text-center">
                 {error}
               </div>
             )}
             <button
               onClick={handleSave}
               disabled={saving}
               className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
             >
               {saving ? <Spinner size="sm" color="white" /> : (saved ? t("profile.saved", lang) : t("profile.save", lang))}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

