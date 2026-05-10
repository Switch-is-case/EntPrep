"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from "react";
import { useApp } from "@/components/Providers";
import { Spinner } from "@/components/Spinner";

interface Program {
  id: number;
  nameRu: string;
  nameKz: string;
  nameEn: string;
  passingScore: number;
}

interface University {
  id: number;
  nameRu: string;
  nameKz: string;
  nameEn: string;
  cityRu: string;
  cityKz: string;
  cityEn: string;
  descriptionRu: string | null;
  descriptionKz: string | null;
  descriptionEn: string | null;
  logoUrl: string | null;
  programs: Program[];
}

export default function UniversitiesPage() {
  const { lang } = useApp();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      try {
        const res = await fetch(`/api/universities?${params}`);
        if (res.ok) {
          const data = await res.json();
          setUniversities(data.universities);
        }
      } catch (error) {
        console.error("Failed to fetch universities", error);
      }
      setLoading(false);
    };

    const delayDebounceFn = setTimeout(() => {
      fetchUniversities();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const getName = (item: any) => lang === "kz" ? item.nameKz : lang === "en" ? item.nameEn : item.nameRu;
  const getCity = (item: any) => lang === "kz" ? item.cityKz : lang === "en" ? item.cityEn : item.cityRu;
  const getDescription = (item: any) => lang === "kz" ? item.descriptionKz : lang === "en" ? item.descriptionEn : item.descriptionRu;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">
              {lang === "ru" ? "Университеты Казахстана" : lang === "kz" ? "Қазақстан Университеттері" : "Universities of Kazakhstan"}
            </h1>
            <p className="text-text-secondary">
              {lang === "ru" 
                ? "Узнайте проходные баллы на грант и доступные специальности." 
                : lang === "kz" 
                ? "Грантқа өту балдарын және қолжетімді мамандықтарды біліңіз." 
                : "Find out passing scores for grants and available professions."}
            </p>
          </div>
          
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder={lang === "ru" ? "Поиск по названию или городу..." : lang === "kz" ? "Атауы немесе қаласы бойынша іздеу..." : "Search by name or city..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : universities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <div className="text-4xl mb-4">🏫</div>
            <h3 className="text-lg font-bold text-text mb-2">
              {lang === "ru" ? "Ничего не найдено" : lang === "kz" ? "Ештеңе табылмады" : "Nothing found"}
            </h3>
            <p className="text-text-secondary">
              {lang === "ru" ? "Попробуйте изменить параметры поиска" : lang === "kz" ? "Іздеу параметрлерін өзгертіп көріңіз" : "Try changing your search parameters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((uni) => (
              <div key={uni.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      {uni.logoUrl ? (
                        <img src={uni.logoUrl} alt={getName(uni)} className="w-full h-full object-contain rounded-xl" />
                      ) : (
                        <span className="text-xl font-bold text-primary">{getName(uni).charAt(0)}</span>
                      )}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      📍 {getCity(uni)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-text mb-2 line-clamp-2" title={getName(uni)}>
                    {getName(uni)}
                  </h3>
                  
                  {getDescription(uni) && (
                    <p className="text-sm text-text-secondary line-clamp-3 mb-4">
                      {getDescription(uni)}
                    </p>
                  )}
                </div>

                <div className="p-5 bg-white">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                    {lang === "ru" ? "Проходные баллы" : lang === "kz" ? "Өту балдары" : "Passing scores"}
                  </h4>
                  
                  {uni.programs && uni.programs.length > 0 ? (
                    <div className="space-y-2.5">
                      {uni.programs.map((program) => (
                        <div key={program.id} className="flex items-center justify-between group">
                          <span className="text-sm font-medium text-text group-hover:text-primary transition-colors line-clamp-1 pr-2" title={getName(program)}>
                            {getName(program)}
                          </span>
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-success/10 text-success text-xs font-bold shrink-0">
                            {program.passingScore} {lang === "ru" ? "б." : lang === "kz" ? "б." : "pts"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      {lang === "ru" ? "Информации о специальностях пока нет" : lang === "kz" ? "Мамандықтар туралы ақпарат әлі жоқ" : "No program information available yet"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
