"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useApp } from "@/components/Providers";
import { Spinner } from "@/components/Spinner";
import Link from "next/link";
import Image from "next/image";
import { Building } from "lucide-react";

export default function UniversityDetailPage() {
  const { id } = useParams();
  const { lang } = useApp();
  const [uni, setUni] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUni() {
      try {
        // Reusing the same API but filtering by ID could be done, 
        // or a new detail API. For simplicity, we'll fetch the one uni.
        const res = await fetch(`/api/universities?id=${id}`);
        const data = await res.json();
        // Since the current API returns a list, find the one
        setUni(data.find((u: any) => u.id === parseInt(id as string)));
      } catch (error) {
        console.error("Failed to fetch university detail:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUni();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!uni) return <div className="text-center py-20">University not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/universities" className="text-primary font-bold mb-8 inline-block hover:underline">
        ← {lang === "ru" ? "Назад к списку" : "Тізімге қайту"}
      </Link>

      <div className="bg-white rounded-[3rem] border border-border p-8 md:p-12 shadow-sm mb-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="flex flex-col md:flex-row gap-8 items-start relative">
          <div className="w-32 h-32 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            {uni.logoUrl ? (
              <Image 
                src={uni.logoUrl} 
                alt={lang === "ru" ? uni.nameRu : uni.nameKz} 
                width={128} 
                height={128} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Building className="w-16 h-16 text-slate-300" aria-hidden="true" />
            )}
          </div>
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-primary/8 text-primary text-xs font-black uppercase tracking-wider mb-4">
              {uni.cityRu}, Казахстан
            </div>
            <h1 className="text-4xl font-black text-text leading-tight mb-4">{lang === "ru" ? uni.nameRu : uni.nameKz}</h1>
            <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
              {lang === "ru" ? uni.descriptionRu : uni.descriptionKz}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-black text-text mb-6 px-4">
        {lang === "ru" ? "Образовательные программы" : "Білім беру бағдарламалары"}
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {uni.programs.map((prog: any) => (
          <div key={prog.id} className="bg-white rounded-3xl border border-border p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                  {prog.combination?.subject1?.nameRu} + {prog.combination?.subject2?.nameRu}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-[10px] font-bold text-indigo-600 uppercase tracking-tight">
                  {prog.language === "en" ? "English" : "KZ/RU"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-text leading-tight">
                {lang === "ru" ? prog.nameRu : prog.nameKz}
              </h3>
            </div>

            <div className="flex items-center gap-8 text-center md:text-right">
              <div>
                <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">Грант 2024</div>
                <div className="text-2xl font-black text-primary">{prog.scoreHistory?.[0]?.grantScore || "—"}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">Платное</div>
                <div className="text-2xl font-black text-text">{prog.scoreHistory?.[0]?.paidScore || "—"}</div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] font-bold text-text-secondary uppercase mb-1">Срок</div>
                <div className="text-lg font-bold text-text">{prog.durationYears} {lang === "ru" ? "года" : "жыл"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
