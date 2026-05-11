"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { Spinner } from "@/components/Spinner";
import Link from "next/link";

interface University {
  id: number;
  nameRu: string;
  nameKz: string;
  nameEn: string;
  cityRu: string;
  cityKz: string;
  cityEn: string;
  logoUrl?: string;
  programs: any[];
}

export default function UniversitiesPage() {
  const { lang, user } = useApp();
  const [unis, setUnis] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    async function fetchUnis() {
      setLoading(true);
      try {
        const url = `/api/universities?search=${search}&city=${city}${user?.targetCombinationId ? `&comboId=${user.targetCombinationId}` : ""}`;
        const res = await fetch(url);
        const data = await res.json();
        setUnis(data);
      } catch (error) {
        console.error("Failed to fetch universities:", error);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(fetchUnis, 300);
    return () => clearTimeout(timer);
  }, [search, city, user?.targetCombinationId]);

  const cities = ["Алматы", "Астана", "Шымкент", "Караганда", "Павлодар", "Каскелен"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight">
            {lang === "ru" ? "Университеты Казахстана" : lang === "kz" ? "Қазақстан университеттері" : "Universities of Kazakhstan"}
          </h1>
          <p className="text-text-secondary mt-2 max-w-md">
            {lang === "ru" ? "Найди свой идеальный ВУЗ и узнай проходные баллы" : "Өзіңе лайықты ЖОО тауып, өту балдарын біл"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder={lang === "ru" ? "Поиск..." : "Іздеу..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all bg-white"
            />
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all bg-white"
          >
            <option value="">{lang === "ru" ? "Все города" : "Барлық қалалар"}</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : unis.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-4">🔍</div>
          <div className="text-lg font-bold text-text">{lang === "ru" ? "Ничего не найдено" : "Ештеңе табылмады"}</div>
          <div className="text-sm text-text-secondary mt-1">{lang === "ru" ? "Попробуйте изменить параметры поиска" : "Іздеу параметрлерін өзгертіп көріңіз"}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unis.map((uni) => (
            <div key={uni.id} className="group bg-white rounded-[2rem] border border-border p-1 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                    {uni.logoUrl ? <img src={uni.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : "🏛️"}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-wider">
                    {lang === "ru" ? uni.cityRu : uni.cityKz}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-text leading-tight mb-2 group-hover:text-primary transition-colors">
                  {lang === "ru" ? uni.nameRu : uni.nameKz}
                </h3>

                <div className="space-y-3 mt-6">
                  {uni.programs.slice(0, 2).map((prog: any) => (
                    <div key={prog.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">{prog.combination?.subject1?.nameRu} + {prog.combination?.subject2?.nameRu}</div>
                      <div className="flex justify-between items-end">
                        <div className="text-xs font-bold text-text line-clamp-1 flex-1 pr-2">{lang === "ru" ? prog.nameRu : prog.nameKz}</div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-text-secondary leading-none">Грант 2024</div>
                          <div className="text-sm font-black text-primary">{prog.scoreHistory?.[0]?.grantScore || "—"}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {uni.programs.length > 2 && (
                    <div className="text-center text-[10px] font-bold text-text-secondary py-1">
                      + еще {uni.programs.length - 2} программы
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 rounded-b-[1.9rem] border-t border-gray-100 flex justify-between items-center">
                <span className="text-[11px] font-bold text-text-secondary uppercase">
                  {uni.programs.length} {lang === "ru" ? "программ" : "бағдарлама"}
                </span>
                <Link 
                  href={`/universities/${uni.id}`}
                  className="text-xs font-black text-primary hover:underline flex items-center gap-1"
                >
                  Подробнее →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
