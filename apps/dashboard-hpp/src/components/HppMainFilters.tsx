"use client";

import React from "react";
import { Filter, Calendar, Layers, Activity, FileSpreadsheet, ShieldCheck } from "lucide-react";

export interface HppFilterState {
  taksasiFilter: "all" | "100_only";
  costGroupFilter: string;
  statusFilter: "all" | "NSSC" | "NSFC" | "NS";
  periodeFilter: number | "all";
  reportFilter: "rp_kg" | "rp_ha";
  wilayahFilter: string;
}

interface HppMainFiltersProps {
  filters: HppFilterState;
  onChangeFilter: (newFilters: Partial<HppFilterState>) => void;
  availableGroups: string[];
}

export const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function HppMainFilters({
  filters,
  onChangeFilter,
  availableGroups,
}: HppMainFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#DDE5DF] p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#EAEFEB] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#17231B] text-sm sm:text-base">Filter Utama Dashboard HPP</h3>
            <p className="text-xs text-[#5F6B63]">Sesuaikan parameter analisis untuk memperbarui grafik & tabel</p>
          </div>
        </div>

        {/* Reset Filter Button */}
        <button
          onClick={() =>
            onChangeFilter({
              taksasiFilter: "all",
              costGroupFilter: "all",
              statusFilter: "all",
              periodeFilter: "all",
              reportFilter: "rp_kg",
              wilayahFilter: "all",
            })
          }
          className="text-xs font-bold text-[#16823B] hover:text-[#0B6B32] hover:underline transition-all"
        >
          Reset Filter
        </button>
      </div>

      {/* Filter Toolbar per PRD Layout: [Taksasi] [Cost Group] [Status] [Bulan] [Report] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* 1. Taksasi Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-[#16823B]" />
            Taksasi
          </label>
          <select
            value={filters.taksasiFilter}
            onChange={(e) => onChangeFilter({ taksasiFilter: e.target.value as any })}
            className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] focus:bg-white transition-all"
          >
            <option value="all">All Taksasi</option>
            <option value="100_only">100% Only</option>
          </select>
        </div>

        {/* 2. Cost Group Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            Cost Group
          </label>
          <select
            value={filters.costGroupFilter}
            onChange={(e) => onChangeFilter({ costGroupFilter: e.target.value })}
            className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] focus:bg-white transition-all"
          >
            <option value="all">All Group Cost</option>
            {availableGroups.map((grp) => (
              <option key={grp} value={grp}>
                Group {grp}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Status Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Status Lokasi
          </label>
          <select
            value={filters.statusFilter}
            onChange={(e) => onChangeFilter({ statusFilter: e.target.value as any })}
            className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] focus:bg-white transition-all"
          >
            <option value="all">All Status</option>
            <option value="NSSC">NSSC</option>
            <option value="NSFC">NSFC</option>
            <option value="NS">NS (NSSC + NSFC)</option>
          </select>
        </div>

        {/* 4. Bulan Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            Bulan (Periode)
          </label>
          <select
            value={filters.periodeFilter}
            onChange={(e) =>
              onChangeFilter({
                periodeFilter: e.target.value === "all" ? "all" : Number(e.target.value),
              })
            }
            className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] focus:bg-white transition-all"
          >
            <option value="all">All Periode (Semua Bulan)</option>
            {MONTH_NAMES.map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1} - {name}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Report Mode Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Report Mode
          </label>
          <div className="flex p-0.5 bg-[#E8EFEA] rounded-xl border border-[#D5E1D8] h-full">
            <button
              onClick={() => onChangeFilter({ reportFilter: "rp_kg" })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filters.reportFilter === "rp_kg"
                  ? "bg-[#16823B] text-white shadow-2xs"
                  : "text-[#455248] hover:text-[#17231B]"
              }`}
            >
              Rp / Kg
            </button>
            <button
              onClick={() => onChangeFilter({ reportFilter: "rp_ha" })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filters.reportFilter === "rp_ha"
                  ? "bg-[#16823B] text-white shadow-2xs"
                  : "text-[#455248] hover:text-[#17231B]"
              }`}
            >
              Rp / Ha
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
