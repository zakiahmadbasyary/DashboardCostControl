"use client";

import React, { useState, useEffect } from "react";
import { Filter, RotateCcw, Check, X, SlidersHorizontal, RefreshCw } from "lucide-react";

export const MONTH_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

interface WilayahMainFiltersProps {
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  monthsWithData?: number[];
  selectedYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function WilayahMainFilters({
  selectedMonth,
  onMonthChange,
  monthsWithData = [],
  selectedYear,
  availableYears,
  onYearChange,
  onRefresh,
  loading = false,
}: WilayahMainFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempMonth, setTempMonth] = useState<number>(selectedMonth);
  const [tempYear, setTempYear] = useState<number>(selectedYear);

  useEffect(() => {
    setTempMonth(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    setTempYear(selectedYear);
  }, [selectedYear]);

  const handleOpenMobile = () => {
    setTempMonth(selectedMonth);
    setTempYear(selectedYear);
    setIsOpen(true);
  };

  const handleApplyMobile = () => {
    if (tempMonth !== selectedMonth) {
      onMonthChange(tempMonth);
    }
    if (tempYear !== selectedYear) {
      onYearChange(tempYear);
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    onMonthChange(1);
    if (availableYears.length > 0 && selectedYear !== availableYears[0]) {
      onYearChange(availableYears[0]);
    }
    setTempMonth(1);
    if (availableYears.length > 0) setTempYear(availableYears[0]);
  };

  const activeCount =
    (selectedMonth !== 1 ? 1 : 0) +
    (availableYears.length > 0 && selectedYear !== availableYears[0] ? 1 : 0);

  return (
    <>
      {/* ================= DESKTOP INLINE FILTER BAR (sm: and larger) ================= */}
      <div
        className="hidden sm:flex bg-white border border-[#DDE5DF] rounded-xl p-3 sm:p-3.5 shadow-sm shadow-[#16823B]/5 flex-col lg:flex-row lg:items-center gap-3 font-sans"
        suppressHydrationWarning
      >
        {/* Title / Badge (CAPEX Style Yellow/Gold Badge) */}
        <div className="flex items-center gap-1.5 shrink-0 pr-2">
          <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B] border border-[#E5C959] shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-[#17231B]" />
          </div>
          <span className="font-bold text-xs text-[#17231B] uppercase tracking-wider">
            Filter Utama
          </span>
        </div>

        {/* 2 Core Selects (Pilihan Bulan Analisis & Tahun Realisasi) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 gap-2 sm:gap-2.5">
          {/* 1. Pilihan Bulan Analisis */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">
              Pilihan Bulan Analisis
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors truncate cursor-pointer"
              suppressHydrationWarning
            >
              {MONTH_OPTIONS.map((m) => {
                const hasData = monthsWithData.length > 0 ? monthsWithData.includes(m.value) : true;
                return (
                  <option key={m.value} value={m.value}>
                    {m.label} {monthsWithData.length > 0 && hasData ? "●" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 2. Tahun Realisasi */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">
              Tahun Realisasi
            </label>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors truncate cursor-pointer"
              suppressHydrationWarning
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons Inline: Reset & Refresh */}
        <div className="flex items-center gap-1.5 shrink-0 lg:self-end pt-1 lg:pt-0">
          <button
            type="button"
            onClick={handleReset}
            title="Reset ke Default (Januari)"
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F7F9F7] text-xs font-semibold transition-colors cursor-pointer"
            suppressHydrationWarning
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16823B] hover:bg-[#0B6B32] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              suppressHydrationWarning
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Memuat..." : "Refresh"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= MOBILE COMPACT BUTTON TRIGGER (< sm) ================= */}
      <div className="sm:hidden font-sans" suppressHydrationWarning>
        <button
          type="button"
          onClick={handleOpenMobile}
          className="w-full bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-xs flex items-center justify-between text-xs text-[#17231B] font-bold cursor-pointer active:scale-98 transition-all"
          suppressHydrationWarning
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B]">
              <Filter className="w-4 h-4" />
            </div>
            <span>Filter Utama Antar Wilayah</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#16823B] text-white text-[10px] flex items-center justify-center font-bold">
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#16823B] bg-[#16823B]/10 px-2.5 py-1 rounded-lg border border-[#16823B]/20">
            <span>Filter</span>
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* ================= MOBILE POP-UP FILTER MODAL ================= */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
          onClick={() => setIsOpen(false)}
          suppressHydrationWarning
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 border border-[#DDE5DF] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
            suppressHydrationWarning
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DF]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B]">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17231B] uppercase tracking-wider">
                    Filter Utama Antar Wilayah
                  </h3>
                  <p className="text-[11px] text-[#5F6B63]">
                    Pilih bulan analisis dan tahun realisasi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F7F9F7] transition-colors cursor-pointer"
                suppressHydrationWarning
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selects Body */}
            <div className="flex flex-col gap-3.5">
              {/* Bulan */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">
                  Pilihan Bulan Analisis
                </label>
                <select
                  value={tempMonth}
                  onChange={(e) => setTempMonth(parseInt(e.target.value, 10))}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] font-bold focus:outline-none focus:border-[#16823B] transition-colors"
                  suppressHydrationWarning
                >
                  {MONTH_OPTIONS.map((m) => {
                    const hasData = monthsWithData.length > 0 ? monthsWithData.includes(m.value) : true;
                    return (
                      <option key={m.value} value={m.value}>
                        {m.label} {monthsWithData.length > 0 && hasData ? "●" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Tahun */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">
                  Tahun Realisasi
                </label>
                <select
                  value={tempYear}
                  onChange={(e) => setTempYear(parseInt(e.target.value, 10))}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] font-bold focus:outline-none focus:border-[#16823B] transition-colors"
                  suppressHydrationWarning
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      Tahun {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#DDE5DF] mt-1">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  setIsOpen(false);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DDE5DF] text-[#5F6B63] hover:bg-[#F7F9F7] text-xs font-semibold transition-colors cursor-pointer w-1/3"
                suppressHydrationWarning
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={handleApplyMobile}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#16823B] hover:bg-[#0B6B32] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer w-2/3"
                suppressHydrationWarning
              >
                <Check className="w-3.5 h-3.5" />
                <span>Terapkan Filter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

