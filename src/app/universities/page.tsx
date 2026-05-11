"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { Spinner } from "@/components/Spinner";
import Link from "next/link";
import Image from "next/image";

import { Search, Building } from "lucide-react";

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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {lang === "ru" ? "Университеты Казахстана" : lang === "kz" ? "Қазақстан университеттері" : "Universities of Kazakhstan"}
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-md">
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
              className="w-full sm:w-64 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary outline-none text-sm transition-colors bg-white font-bold"
            />
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 focus:border-primary outline-none text-sm transition-colors bg-white font-bold text-slate-700"
          >
            <option value="">{lang === "ru" ? "Все города" : "Барлық қалалар"}</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : unis.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="flex justify-center mb-4">
            <Search className="w-16 h-16 text-slate-300" aria-hidden="true" />
          </div>
          <div className="text-lg font-bold text-slate-900">{lang === "ru" ? "Ничего не найдено" : "Ештеңе табылмады"}</div>
          <div className="text-sm font-medium text-slate-500 mt-1">{lang === "ru" ? "Попробуйте изменить параметры поиска" : "Іздеу параметрлерін өзгертіп көріңіз"}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unis.map((uni) => (
            <div key={uni.id} className="bg-white rounded-2xl border border-slate-200 flex flex-col transition-colors hover:border-primary/40 overflow-hidden">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {uni.logoUrl ? (
                      <Image 
                        src={uni.logoUrl} 
                        alt={lang === "ru" ? uni.nameRu : uni.nameKz} 
                        width={64} 
                        height={64} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="w-8 h-8 text-slate-300" aria-hidden="true" />
                    )}
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                    {lang === "ru" ? uni.cityRu : uni.cityKz}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-4 group-hover:text-primary transition-colors">
                  {lang === "ru" ? uni.nameRu : uni.nameKz}
                </h3>

                <div className="space-y-2 mt-6">
                  {uni.programs.slice(0, 2).map((prog: any) => (
                    <div key={prog.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{prog.combination?.subject1?.nameRu} + {prog.combination?.subject2?.nameRu}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs font-bold text-slate-700 line-clamp-1 flex-1 pr-2">{lang === "ru" ? prog.nameRu : prog.nameKz}</div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-primary">{prog.scoreHistory?.[0]?.grantScore || "—"}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {uni.programs.length > 2 && (
                    <div className="text-center text-[10px] font-bold text-slate-400 py-1 uppercase tracking-widest">
                      + {uni.programs.length - 2} {lang === "ru" ? "программы" : "бағдарлама"}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {uni.programs.length} {lang === "ru" ? "курсов" : "курс"}
                </span>
                <Link 
                  href={`/universities/${uni.id}`}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  {lang === "ru" ? "Подробнее" : "Толығырақ"} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
