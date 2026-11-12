"use client";

import React, { useState } from "react";
import { MainFilterState } from "@/types/dashboard";
import { Filter, RotateCcw, Check, X, SlidersHorizontal, Tractor } from "lucide-react";

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
  const [mobileOpen, setMobileOpen] = useState(false);

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
    onResetFilters();
  };

  const isFiltered =
    localFilters.aktivitas !== "Total Aktivitas" || localFilters.status !== "NS";

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

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 gap-2.5">
          {/* 1. Filter Aktivitas */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wide">
              Aktivitas
            </label>
            <select
              value={localFilters.aktivitas}
              onChange={(e) => handleChange("aktivitas", e.target.value)}
              disabled={loading}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] font-medium focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer"
            >
              {activities.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Filter Status */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wide">
              Status Tanaman
            </label>
            <select
              value={localFilters.status}
              onChange={(e) => handleChange("status", e.target.value)}
              disabled={loading}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] font-medium focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions Button (Reset) */}
        <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#DDE5DF]/60">
          <button
            onClick={handleReset}
            disabled={loading || !isFiltered}
            title="Reset ke Total Aktivitas & Status NS"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDE5DF] hover:bg-[#F7F9F7] active:bg-[#EAEFEB] text-xs font-semibold text-[#5F6B63] hover:text-[#17231B] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ================= MOBILE FILTER BAR (< sm:) ================= */}
      <div className="flex sm:hidden items-center justify-between bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B] border border-[#E5C959]">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#17231B] uppercase tracking-wider">
              Filter Utama
            </h4>
            <p className="text-[10px] text-[#5F6B63]">
              {localFilters.aktivitas} • {localFilters.status}
            </p>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16823B] text-white text-xs font-bold"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Atur Filter</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-xs sm:hidden animate-in fade-in">
          <div className="w-full bg-white rounded-t-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DF]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B]">
                  <Filter className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-[#17231B]">Filter Dashboard</h3>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg text-[#5F6B63] hover:bg-[#F7F9F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#17231B]">Aktivitas</label>
                <select
                  value={localFilters.aktivitas}
                  onChange={(e) => handleChange("aktivitas", e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg p-2.5 text-xs text-[#17231B] font-medium"
                >
                  {activities.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#17231B]">Status Tanaman</label>
                <select
                  value={localFilters.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg p-2.5 text-xs text-[#17231B] font-medium"
                >
                  {statuses.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-[#DDE5DF]">
              <button
                onClick={() => {
                  handleReset();
                  setMobileOpen(false);
                }}
                className="flex-1 py-2 rounded-lg border border-[#DDE5DF] text-xs font-bold text-[#5F6B63]"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-2 rounded-lg bg-[#16823B] text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

