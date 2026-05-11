"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "./Providers";
import { t } from "@/lib/i18n";
import { Spinner } from "./Spinner";

interface Direction {
  id: number;
  nameRu: string;
  nameKz: string;
  nameEn: string;
  icon: string;
  color: string;
  specialties: Specialty[];
}

interface Specialty {
  id: number;
  nameRu: string;
  nameKz: string;
  nameEn: string;
  code: string;
}

interface Combination {
  id: number;
  subject1: { nameRu: string; nameKz: string; nameEn: string };
  subject2: { nameRu: string; nameKz: string; nameEn: string };
}

export function CareerWizard() {
  const { lang, user, updateUser, authHeaders } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [directions, setDirections] = useState<Direction[]>([]);
  const [combinations, setCombinations] = useState<Combination[]>([]);

  const [selectedDirection, setSelectedDirection] = useState<number | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
  const [selectedCombination, setSelectedCombination] = useState<number | null>(null);
  const [targetScore, setTargetScore] = useState(100);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dirsRes, combosRes] = await Promise.all([
          fetch("/api/career?type=directions"),
          fetch("/api/career?type=combinations"),
        ]);
        const dirs = await dirsRes.json();
        const combos = await combosRes.json();
        setDirections(dirs);
        setCombinations(combos);
      } catch (error) {
        console.error("Failed to fetch wizard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleFinish = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          targetSpecialtyId: selectedSpecialty,
          targetCombinationId: selectedCombination,
          targetScore,
          needsReonboarding: false,
        }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        updateUser(updatedUser);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Failed to save goals:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const currentDirection = directions.find(d => d.id === selectedDirection);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-text mb-2">
          {lang === "ru" ? "Твой путь к успеху" : lang === "kz" ? "Сенің табысқа жолың" : "Your Path to Success"}
        </h1>
        <p className="text-text-secondary">
          {lang === "ru" ? "Выбери направление и цель обучения" : lang === "kz" ? "Оқу бағытын және мақсатын таңда" : "Choose your study direction and goals"}
        </p>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-text mb-6">1. {lang === "ru" ? "Выберите направление" : "Бағытты таңдаңыз"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {directions.map((dir) => (
                  <button
                    key={dir.id}
                    onClick={() => { setSelectedDirection(dir.id); setStep(2); }}
                    className={`p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                      selectedDirection === dir.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-4xl">{dir.icon}</div>
                    <div>
                      <div className="font-bold text-text">{lang === "ru" ? dir.nameRu : lang === "kz" ? dir.nameKz : dir.nameEn}</div>
                      <div className="text-sm text-text-secondary">{dir.specialties.length} {lang === "ru" ? "специальностей" : "мамандық"}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && currentDirection && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button onClick={() => setStep(1)} className="text-primary font-medium mb-4 flex items-center gap-1">
                ← {lang === "ru" ? "Назад к направлениям" : "Бағыттарға қайту"}
              </button>
              <h2 className="text-xl font-bold text-text mb-6">2. {lang === "ru" ? "Выберите специальность" : "Мамандықты таңдаңыз"}</h2>
              <div className="grid grid-cols-1 gap-3">
                {currentDirection.specialties.map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => { setSelectedSpecialty(spec.id); setStep(3); }}
                    className={`p-5 rounded-xl border-2 transition-all text-left ${
                      selectedSpecialty === spec.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="font-bold text-text">{lang === "ru" ? spec.nameRu : lang === "kz" ? spec.nameKz : spec.nameEn}</div>
                    <div className="text-xs text-text-secondary mt-1">Код: {spec.code}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button onClick={() => setStep(2)} className="text-primary font-medium mb-4 flex items-center gap-1">
                ← {lang === "ru" ? "Назад к специальности" : "Мамандыққа қайту"}
              </button>
              <h2 className="text-xl font-bold text-text mb-6">3. {lang === "ru" ? "Комбинация предметов" : "Пәндер комбинациясы"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {combinations.map((combo) => (
                  <button
                    key={combo.id}
                    onClick={() => { setSelectedCombination(combo.id); setStep(4); }}
                    className={`p-6 rounded-2xl border-2 transition-all text-center ${
                      selectedCombination === combo.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-bold text-text mb-1">
                      {lang === "ru" ? combo.subject1.nameRu : lang === "kz" ? combo.subject1.nameKz : combo.subject1.nameEn}
                    </div>
                    <div className="text-primary font-black">+</div>
                    <div className="font-bold text-text mt-1">
                      {lang === "ru" ? combo.subject2.nameRu : lang === "kz" ? combo.subject2.nameKz : combo.subject2.nameEn}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button onClick={() => setStep(3)} className="text-primary font-medium mb-4 flex items-center gap-1">
                ← {lang === "ru" ? "Назад к предметам" : "Пәндерге қайту"}
              </button>
              <h2 className="text-xl font-bold text-text mb-2">4. {lang === "ru" ? "Ваша цель" : "Сенің мақсатың"}</h2>
              
              <div className="bg-slate-50 p-8 rounded-3xl border border-border text-center">
                <div className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">
                  {lang === "ru" ? "Целевой балл ЕНТ" : "ҰБТ мақсатты балл"}
                </div>
                <div className="text-7xl font-black text-primary mb-6">{targetScore}</div>
                <input
                  type="range"
                  min="50"
                  max="140"
                  step="1"
                  value={targetScore}
                  onChange={(e) => setTargetScore(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary mb-4"
                />
                <div className="flex justify-between text-xs font-bold text-text-secondary px-2">
                  <span>50</span>
                  <span>140</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? <Spinner size="sm" color="white" /> : (lang === "ru" ? "Начать подготовку 🚀" : "Дайындықты бастау 🚀")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
