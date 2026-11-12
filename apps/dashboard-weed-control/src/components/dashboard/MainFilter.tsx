"use client";

import React, { useState } from "react";
import { MainFilterState } from "@/types/dashboard";
import { Filter, RotateCcw, Check, X, SlidersHorizontal } from "lucide-react";

interface MainFilterProps {
  filters: MainFilterState;
  activities: string[];
  statuses: Array<{ value: string; label: string }>;
  onApplyFilters: (filters: MainFilterState) => void;
  onResetFilters: () => void;
  loading?: boolean;
}

export default function MainFilter({
  filters,
  activities,
  statuses,
  onApplyFilters,
  onResetFilters,
  loading,
}: MainFilterProps) {
  const [localFilters, setLocalFilters] = useState<MainFilterState>(filters);
  const [isOpen, setIsOpen] = useState(false);

  // Sync state if external filters change
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof MainFilterState, value: string) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onApplyFilters(updated);
  };

  const handleReset = () => {
    const defaultFilters: MainFilterState = {
      aktivitas: "Total Aktivitas",
      status: "NS",
    };
    setLocalFilters(defaultFilters);
    onResetFilters();
  };

  const isFiltered =
    localFilters.aktivitas !== "Total Aktivitas" || localFilters.status !== "NS";

  const activeCount =
    (localFilters.aktivitas !== "Total Aktivitas" ? 1 : 0) +
    (localFilters.status !== "NS" ? 1 : 0);

  return (
    <>
      {/* ================= DESKTOP INLINE FILTER BAR (sm: and larger) ================= */}
      <div className="hidden sm:flex bg-white border border-[#DDE5DF] rounded-xl p-3 sm:p-3.5 shadow-sm shadow-[#16823B]/5 flex-col lg:flex-row lg:items-center gap-3">
        {/* Title / Badge */}
        <div className="flex items-center gap-1.5 shrink-0 pr-1">
          <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B] border border-[#E5C959] shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-[#17231B]" />
          </div>
          <span className="font-bold text-xs text-[#17231B] uppercase tracking-wider">
            Filter Utama
          </span>
        </div>

        {/* Selects Grid & Reset Button Sejajar */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-2.5">
          {/* 1. Filter Aktivitas */}
          <div className="flex-1 flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">
              Aktivitas
            </label>
            <select
              value={localFilters.aktivitas}
              onChange={(e) => handleChange("aktivitas", e.target.value)}
              disabled={loading}
              suppressHydrationWarning
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer"
            >
              {activities.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Filter Status */}
          <div className="w-full sm:w-56 lg:w-64 flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">
              Status
            </label>
            <select
              value={localFilters.status}
              onChange={(e) => handleChange("status", e.target.value)}
              disabled={loading}
              suppressHydrationWarning
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Tombol Reset Sejajar dengan Kolom Pilihan Filter */}
          <div className="flex flex-col gap-0.5 justify-end shrink-0">
            <button
              onClick={handleReset}
              disabled={loading || !isFiltered}
              title="Reset ke Total Aktivitas & Status NS"
              suppressHydrationWarning
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDE5DF] text-[#5F6B63] hover:bg-[#F7F9F7] text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer h-[31px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
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
                  <h3 className="font-bold text-sm text-[#17231B] uppercase tracking-wider">
                    Filter Utama Dashboard
                  </h3>
                  <p className="text-[11px] text-[#5F6B63]">
                    Pilih filter untuk memperbarui data dashboard
                  </p>
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
              {/* Aktivitas */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">
                  Aktivitas
                </label>
                <select
                  value={localFilters.aktivitas}
                  onChange={(e) => handleChange("aktivitas", e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                >
                  {activities.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={localFilters.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                >
                  {statuses.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#DDE5DF] mt-1">
              <button
                onClick={() => {
                  handleReset();
                  setIsOpen(false);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DDE5DF] text-[#5F6B63] hover:bg-[#F7F9F7] text-xs font-semibold transition-colors cursor-pointer w-1/3"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
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
