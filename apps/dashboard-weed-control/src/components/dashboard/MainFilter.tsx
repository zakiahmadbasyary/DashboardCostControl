"use client";

import React, { useState, useEffect, useRef } from "react";
import { MainFilterState } from "@/types/dashboard";
import {
  Filter,
  RotateCcw,
  Check,
  X,
  SlidersHorizontal,
  Search,
  ChevronDown,
} from "lucide-react";

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

  // Searchable combobox states for Aktivitas (Desktop)
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [activitySearch, setActivitySearch] = useState("");
  const activityRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Searchable state for Aktivitas (Mobile)
  const [mobileActivitySearch, setMobileActivitySearch] = useState("");

  // Sync state if external filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Click outside to close desktop activity dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        activityRef.current &&
        !activityRef.current.contains(e.target as Node)
      ) {
        setIsActivityOpen(false);
        setActivitySearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto focus search input when dropdown opens
  useEffect(() => {
    if (isActivityOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isActivityOpen]);

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
    setActivitySearch("");
    setMobileActivitySearch("");
    setIsActivityOpen(false);
    onResetFilters();
  };

  const isFiltered =
    localFilters.aktivitas !== "Total Aktivitas" || localFilters.status !== "NS";

  const activeCount =
    (localFilters.aktivitas !== "Total Aktivitas" ? 1 : 0) +
    (localFilters.status !== "NS" ? 1 : 0);

  // Filter activities by search query
  const filteredActivities = activities.filter((act) =>
    act.toLowerCase().includes(activitySearch.toLowerCase())
  );

  const filteredMobileActivities = activities.filter((act) =>
    act.toLowerCase().includes(mobileActivitySearch.toLowerCase())
  );

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
          {/* 1. Filter Aktivitas (Searchable Dropdown) */}
          <div className="flex-1 flex flex-col gap-0.5 relative" ref={activityRef}>
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">
              Aktivitas
            </label>

            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setIsActivityOpen(!isActivityOpen)}
              disabled={loading}
              suppressHydrationWarning
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] hover:border-[#16823B] focus:border-[#16823B] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] flex items-center justify-between transition-colors cursor-pointer h-[31px]"
            >
              <span className="truncate pr-2 font-normal">
                {localFilters.aktivitas}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#5F6B63] shrink-0 transition-transform ${
                  isActivityOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Popover Dropdown Searchable Menu */}
            {isActivityOpen && (
              <div className="absolute left-0 top-full mt-1 w-full min-w-[280px] sm:min-w-[340px] bg-white border border-[#DDE5DF] rounded-xl shadow-xl p-2.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                {/* Search Input Box */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#89938D]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Cari aktivitas..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#17231B] placeholder-[#89938D] focus:outline-none focus:border-[#16823B] transition-colors"
                  />
                  {activitySearch && (
                    <button
                      onClick={() => setActivitySearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#89938D] hover:text-[#17231B] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtered Options List */}
                <div className="max-h-56 overflow-y-auto flex flex-col gap-0.5 pr-0.5">
                  {filteredActivities.length === 0 ? (
                    <p className="py-4 text-center text-xs text-[#89938D]">
                      Tidak ada aktivitas yang cocok
                    </p>
                  ) : (
                    filteredActivities.map((act) => {
                      const isSelected = localFilters.aktivitas === act;
                      return (
                        <button
                          key={act}
                          type="button"
                          onClick={() => {
                            handleChange("aktivitas", act);
                            setIsActivityOpen(false);
                            setActivitySearch("");
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#16823B]/10 text-[#16823B] font-bold"
                              : "text-[#17231B] hover:bg-[#F7F9F7]"
                          }`}
                        >
                          <span className="truncate pr-2">{act}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#16823B] shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
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
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer h-[31px]"
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
              {/* Aktivitas dengan Search Box */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">
                  Aktivitas
                </label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#89938D]" />
                  <input
                    type="text"
                    placeholder="Cari nama aktivitas..."
                    value={mobileActivitySearch}
                    onChange={(e) => setMobileActivitySearch(e.target.value)}
                    className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-8 pr-7 py-2 text-xs text-[#17231B] placeholder-[#89938D] focus:outline-none focus:border-[#16823B] transition-colors"
                  />
                  {mobileActivitySearch && (
                    <button
                      onClick={() => setMobileActivitySearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#89938D] hover:text-[#17231B]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto rounded-xl border border-[#DDE5DF] p-1 flex flex-col gap-0.5 bg-[#F7F9F7]">
                  {filteredMobileActivities.length === 0 ? (
                    <p className="py-3 text-center text-xs text-[#89938D]">
                      Tidak ada aktivitas yang cocok
                    </p>
                  ) : (
                    filteredMobileActivities.map((act) => {
                      const isSelected = localFilters.aktivitas === act;
                      return (
                        <button
                          key={act}
                          type="button"
                          onClick={() => handleChange("aktivitas", act)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-white text-[#16823B] font-bold shadow-2xs border border-[#16823B]/20"
                              : "text-[#17231B] hover:bg-white"
                          }`}
                        >
                          <span className="truncate pr-2">{act}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#16823B] shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
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
