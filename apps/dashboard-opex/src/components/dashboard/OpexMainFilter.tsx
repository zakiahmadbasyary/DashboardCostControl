"use client";

import React from "react";
import { Filter, Calendar, ChevronDown } from "lucide-react";
import { PeriodOption } from "@/types/opex";

interface OpexMainFilterProps {
  periods: PeriodOption[];
  selectedPeriod: number;
  onSelectPeriod: (period: number) => void;
  loading?: boolean;
}

export default function OpexMainFilter({
  periods,
  selectedPeriod,
  onSelectPeriod,
  loading,
}: OpexMainFilterProps) {
  const currentOption = periods.find((p) => p.periode === selectedPeriod);

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-xl p-2.5 sm:p-3 shadow-xs flex items-center justify-between gap-2 sm:gap-3 transition-all">
      {/* Title & Badge */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B] border border-[#E5C959] shadow-2xs">
          <Filter className="w-3.5 h-3.5" />
        </div>
        <span className="font-bold text-xs text-[#17231B] uppercase tracking-wider">
          Filter Utama
        </span>
      </div>

      {/* Select Periode */}
      <div className="flex items-center gap-2 justify-end flex-1">
        <label className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-[#5F6B63] uppercase tracking-wider shrink-0">
          <Calendar className="w-3.5 h-3.5 text-[#16823B]" />
          Bulan:
        </label>

        <div className="relative w-36 sm:w-52">
          <select
            value={selectedPeriod}
            onChange={(e) => onSelectPeriod(parseInt(e.target.value, 10))}
            disabled={loading}
            suppressHydrationWarning
            className="w-full appearance-none bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer truncate"
          >
            {periods.map((p) => (
              <option key={p.periode} value={p.periode}>
                {p.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#5F6B63]">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {currentOption && (
          <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-[#16823B] bg-[#EAF3EC] border border-[#CBE0D1] px-2.5 py-1 rounded-lg shrink-0">
            <span>Aktif:</span>
            <strong className="font-bold">{currentOption.label}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
