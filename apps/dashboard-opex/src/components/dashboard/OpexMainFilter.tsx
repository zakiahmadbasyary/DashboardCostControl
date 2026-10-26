"use client";

import React from "react";
import { Filter, Calendar, RotateCcw } from "lucide-react";
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
    <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Title & Badge */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B] border border-[#E5C959] shadow-2xs">
          <Filter className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-bold text-xs text-[#17231B] uppercase tracking-wider block">
            FILTER UTAMA
          </span>
        </div>
      </div>

      {/* Select Periode */}
      <div className="flex items-center gap-2.5 flex-1 sm:justify-end">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-[11px] font-bold text-[#5F6B63] uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#16823B]" />
            Periode Bulan:
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => onSelectPeriod(parseInt(e.target.value, 10))}
            disabled={loading}
            suppressHydrationWarning
            className="w-full sm:w-56 bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer"
          >
            {periods.map((p) => (
              <option key={p.periode} value={p.periode}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {currentOption && (
          <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-[#16823B] bg-[#EAF3EC] border border-[#CBE0D1] px-2.5 py-1 rounded-lg">
            <span>Aktif:</span>
            <strong className="font-bold">{currentOption.label}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
