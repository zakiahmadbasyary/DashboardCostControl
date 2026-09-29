"use client";

import React, { useState, useEffect } from "react";
import { Filter, RotateCcw, Check, X, SlidersHorizontal } from "lucide-react";

export interface CostGroupOption {
  group: string;
  descGroup: string;
}

export interface HppFilterState {
  taksasiFilter: "all" | "100_only";
  costGroupFilter: string;
  statusFilter: "all" | "NSSC" | "NSFC" | "NS";
  periodeFilter: number; // 1 s/d 12 (Tanpa opsi "Semua Bulan")
  reportFilter: "rp_kg" | "rp_ha";
  wilayahFilter: string;
}

interface HppMainFiltersProps {
  filters: HppFilterState;
  onChangeFilter: (newFilters: HppFilterState) => void;
  availableGroupOptions: CostGroupOption[];
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
  availableGroupOptions,
}: HppMainFiltersProps) {
  // Local state for filter selections until "Terapkan" is clicked
  const [localFilters, setLocalFilters] = useState<HppFilterState>(filters);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Sync localState when parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof HppFilterState, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onChangeFilter(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultFilters: HppFilterState = {
      taksasiFilter: "all",
      costGroupFilter: "all",
      statusFilter: "all",
      periodeFilter: 1, // Default bulan 1 (Januari)
      reportFilter: "rp_kg",
      wilayahFilter: "all",
    };
    setLocalFilters(defaultFilters);
    onChangeFilter(defaultFilters);
    setIsOpen(false);
  };

  // Count active non-default filters for mobile badge
  const activeCount = [
    localFilters.taksasiFilter !== "all",
    localFilters.costGroupFilter !== "all",
    localFilters.statusFilter !== "all",
    localFilters.wilayahFilter !== "all",
  ].filter(Boolean).length;

  return (
    <>
      {/* ================= DESKTOP INLINE STICKY FILTER BAR (sm: and larger) ================= */}
      <div className="hidden sm:flex bg-white/95 backdrop-blur-md border border-[#DDE5DF] rounded-xl p-3 sm:p-3.5 shadow-md shadow-[#16823B]/5 flex-col lg:flex-row lg:items-center justify-between gap-3 transition-all">
        
        {/* Title / Badge */}
        <div className="flex items-center gap-2 shrink-0 pr-1">
          <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B] border border-[#E5C959] shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-[#17231B]" />
          </div>
          <span className="font-bold text-xs text-[#17231B] uppercase tracking-wider">Filter Utama</span>
        </div>

        {/* Select Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 flex-1 gap-2 sm:gap-2.5">
          
          {/* Taksasi */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">Taksasi</label>
            <select
              value={localFilters.taksasiFilter}
              onChange={(e) => handleChange("taksasiFilter", e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer"
            >
              <option value="all">All Taksasi</option>
              <option value="100_only">100% Only</option>
            </select>
          </div>

          {/* Cost Group */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">Cost Group</label>
            <select
              value={localFilters.costGroupFilter}
              onChange={(e) => handleChange("costGroupFilter", e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer truncate"
            >
              <option value="all">Semua Group Cost</option>
              {availableGroupOptions.map((opt) => (
                <option key={opt.group} value={opt.group}>
                  {opt.group} - {opt.descGroup}
                </option>
              ))}
            </select>
          </div>

          {/* Status Lokasi */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">Status Lokasi</label>
            <select
              value={localFilters.statusFilter}
              onChange={(e) => handleChange("statusFilter", e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="NSSC">NSSC</option>
              <option value="NSFC">NSFC</option>
              <option value="NS">NS (NSSC & NSFC)</option>
            </select>
          </div>

          {/* Bulan (Periode) — HANYA Bulan 1 s/d 12 */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">Bulan (Periode)</label>
            <select
              value={localFilters.periodeFilter}
              onChange={(e) => handleChange("periodeFilter", Number(e.target.value))}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer font-bold"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1} - {name}
                </option>
              ))}
            </select>
          </div>

          {/* Report Mode */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">Report Mode</label>
            <div className="flex p-0.5 bg-[#F7F9F7] rounded-lg border border-[#DDE5DF] h-[31px] items-center">
              <button
                onClick={() => handleChange("reportFilter", "rp_kg")}
                className={`flex-1 py-1 rounded-md text-xs font-bold transition-all ${
                  localFilters.reportFilter === "rp_kg"
                    ? "bg-[#16823B] text-white shadow-2xs"
                    : "text-[#455248] hover:text-[#17231B]"
                }`}
              >
                Rp/Kg
              </button>
              <button
                onClick={() => handleChange("reportFilter", "rp_ha")}
                className={`flex-1 py-1 rounded-md text-xs font-bold transition-all ${
                  localFilters.reportFilter === "rp_ha"
                    ? "bg-[#16823B] text-white shadow-2xs"
                    : "text-[#455248] hover:text-[#17231B]"
                }`}
              >
                Rp/Ha
              </button>
            </div>
          </div>

        </div>

        {/* Action Buttons: Reset & Terapkan */}
        <div className="flex items-center gap-2 shrink-0 lg:self-end pt-1 lg:pt-0">
          <button
            onClick={handleReset}
            title="Reset Filter"
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] text-[#5F6B63] hover:bg-[#F7F9F7] text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleApply}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#16823B] hover:bg-[#0B6B32] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Terapkan</span>
          </button>
        </div>

      </div>

      {/* ================= MOBILE COMPACT BUTTON TRIGGER (< sm) ================= */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-xs flex items-center justify-between text-xs text-[#17231B] font-bold cursor-pointer active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B]">
              <Filter className="w-4 h-4" />
            </div>
            <span>Filter Utama Dashboard</span>
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 border border-[#DDE5DF] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DF]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B]">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17231B] uppercase tracking-wider">Filter Utama Dashboard</h3>
                  <p className="text-[11px] text-[#5F6B63]">Sesuaikan parameter analisis HPP</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F7F9F7] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selects Body */}
            <div className="flex flex-col gap-3.5">
              {/* Taksasi */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">Taksasi</label>
                <select
                  value={localFilters.taksasiFilter}
                  onChange={(e) => handleChange("taksasiFilter", e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer"
                >
                  <option value="all">All Taksasi</option>
                  <option value="100_only">100% Only</option>
                </select>
              </div>

              {/* Cost Group */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">Group Cost</label>
                <select
                  value={localFilters.costGroupFilter}
                  onChange={(e) => handleChange("costGroupFilter", e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer"
                >
                  <option value="all">Semua Group Cost</option>
                  {availableGroupOptions.map((opt) => (
                    <option key={opt.group} value={opt.group}>
                      {opt.group} - {opt.descGroup}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Lokasi */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">Status Lokasi</label>
                <select
                  value={localFilters.statusFilter}
                  onChange={(e) => handleChange("statusFilter", e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="NSSC">NSSC</option>
                  <option value="NSFC">NSFC</option>
                  <option value="NS">NS (NSSC & NSFC)</option>
                </select>
              </div>

              {/* Bulan (Periode) */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">Bulan (Periode)</label>
                <select
                  value={localFilters.periodeFilter}
                  onChange={(e) => handleChange("periodeFilter", Number(e.target.value))}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer font-bold"
                >
                  {MONTH_NAMES.map((name, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1} - {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Report Mode */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">Report Mode</label>
                <div className="flex p-0.5 bg-[#F7F9F7] rounded-xl border border-[#DDE5DF] h-10 items-center">
                  <button
                    onClick={() => handleChange("reportFilter", "rp_kg")}
                    className={`flex-1 h-full rounded-lg text-xs font-bold transition-all ${
                      localFilters.reportFilter === "rp_kg"
                        ? "bg-[#16823B] text-white shadow-2xs"
                        : "text-[#455248] hover:text-[#17231B]"
                    }`}
                  >
                    Rp/Kg
                  </button>
                  <button
                    onClick={() => handleChange("reportFilter", "rp_ha")}
                    className={`flex-1 h-full rounded-lg text-xs font-bold transition-all ${
                      localFilters.reportFilter === "rp_ha"
                        ? "bg-[#16823B] text-white shadow-2xs"
                        : "text-[#455248] hover:text-[#17231B]"
                    }`}
                  >
                    Rp/Ha
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#DDE5DF] mt-1">
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DDE5DF] text-[#5F6B63] hover:bg-[#F7F9F7] text-xs font-semibold transition-colors cursor-pointer w-1/3"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleApply}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#16823B] hover:bg-[#0B6B32] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer w-2/3"
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
