"use client";

import React from "react";
import { BarChart3, MapPin, Calendar, RefreshCw } from "lucide-react";

export type SulamSubMenu = "antar-pg" | "antar-wilayah";

interface SubMenuTabsProps {
  activeTab: SulamSubMenu;
  onTabChange?: (tab: SulamSubMenu) => void;
  selectedYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function SubMenuTabs({
  activeTab,
  selectedYear,
  availableYears,
  onYearChange,
  onRefresh,
  loading,
}: SubMenuTabsProps) {
  const isAntarPg = activeTab === "antar-pg";

  return (
    <div className="bg-white rounded-2xl border border-[#DDE5DF] p-3.5 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
      {/* Left: Active Section Context & Badge */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#EAF3EC] text-[#16823B] shrink-0 border border-[#CBE0D1]">
          {isAntarPg ? <BarChart3 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-black text-[#17231B] tracking-tight">
              {isAntarPg
                ? "Evaluasi Sulam Antar PG (PG1 -- PG3)"
                : "Evaluasi Sulam Antar Wilayah (PG1: AW01 -- AW07)"}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1] hidden sm:inline-block">
              Modul Aktif
            </span>
          </div>
          <p className="text-xs text-[#5F6B63] mt-0.5">
            {isAntarPg
              ? "Perbandingan efisiensi biaya, rasio kinerja bulanan, dan kebutuhan tenaga kerja antar PG."
              : "Monitoring bulanan pemakaian tenaga kerja (TK), bibit batang sulam, dan rincian lokasi PG1."}
          </p>
        </div>
      </div>

      {/* Right Controls: Year Filter & Refresh */}
      <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-[#5F6B63] font-semibold">
            <Calendar className="w-3.5 h-3.5 text-[#16823B]" />
            <span>Tahun:</span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-white font-bold text-[#17231B] text-xs focus:outline-[#16823B] cursor-pointer transition-colors shadow-2xs"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-xs font-bold text-[#5F6B63] hover:text-[#17231B] transition-colors cursor-pointer shadow-2xs"
            title="Segarkan data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#16823B] ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
}
