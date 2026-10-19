"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Filter, RotateCcw, Check, X, SlidersHorizontal } from "lucide-react";
import { CapexMainFilterValues } from "@/types/capex";
import { getCostCenterLabel } from "@/lib/costCenters";

interface CapexMainFiltersProps {
  kategoris: string[];
  costCenters: string[];
  statusList: string[];
  initialFilters: CapexMainFilterValues;
  onApplyFilters: (filters: CapexMainFilterValues) => void;
  loading?: boolean;
}

export default function CapexMainFilters({
  kategoris,
  costCenters,
  statusList,
  initialFilters,
  onApplyFilters,
  loading = false,
}: CapexMainFiltersProps) {
  const [filters, setFilters] = useState<CapexMainFilterValues>(initialFilters);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Sync internal state if initialFilters changes from outside
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Temporary state for mobile modal
  const [tempFilters, setTempFilters] = useState<CapexMainFilterValues>(initialFilters);

  // Urutkan cost center secara alfabetis berdasarkan artinya
  const sortedCostCenters = useMemo(() => {
    return [...costCenters].sort((a, b) =>
      getCostCenterLabel(a).localeCompare(getCostCenterLabel(b), "id", { sensitivity: "base" })
    );
  }, [costCenters]);

  // Urutkan status CAPEX sesuai alur bisnis yang diminta:
  // 1. Belum Created
  // 2. Sudah Created
  // 3. Final Approve
  // 4. Sudah PO
  // 5. Sudah Close
  const sortedStatusList = useMemo(() => {
    const statusOrder = [
      "belum_created",
      "sudah_created",
      "final_approve",
      "sudah_po",
      "sudah_close",
    ];

    if (statusList && statusList.length > 0) {
      return [...statusList].sort((a, b) => {
        const normA = a.trim().toLowerCase().replace(/[\s-]+/g, "_");
        const normB = b.trim().toLowerCase().replace(/[\s-]+/g, "_");
        const indexA = statusOrder.indexOf(normA);
        const indexB = statusOrder.indexOf(normB);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
    }

    return [
      "Belum_Created",
      "Sudah_Created",
      "Final_Approve",
      "Sudah_PO",
      "Sudah_Close",
    ];
  }, [statusList]);

  const handleOpenMobile = () => {
    setTempFilters(filters);
    setIsOpen(true);
  };

  const handleApplyMobile = () => {
    setFilters(tempFilters);
    onApplyFilters(tempFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultFilters: CapexMainFilterValues = {
      kategori: "Semua",
      costCenter: "Semua",
      statusCapex: "Semua",
    };
    setFilters(defaultFilters);
    setTempFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  // Count active non-default applied filters for mobile badge
  const activeCount =
    (filters.kategori !== "Semua" ? 1 : 0) +
    (filters.costCenter !== "Semua" ? 1 : 0) +
    (filters.statusCapex !== "Semua" ? 1 : 0);

  return (
    <>
      {/* ================= DESKTOP INLINE FILTER BAR (sm: and larger) ================= */}
      <div
        className="hidden sm:flex bg-white border border-[#DDE5DF] rounded-xl p-3 sm:p-3.5 shadow-sm shadow-[#16823B]/5 flex-col lg:flex-row lg:items-center gap-3 font-sans"
        suppressHydrationWarning
      >
        {/* Title / Badge */}
        <div className="flex items-center gap-1.5 shrink-0 pr-1">
          <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B] border border-[#E5C959] shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-[#17231B]" />
          </div>
          <span className="font-bold text-xs text-[#17231B] uppercase tracking-wider">
            Filter Utama
          </span>
        </div>

        {/* 3 Core Selects (Kategori, Cost Center, Status CAPEX) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 flex-1 gap-2 sm:gap-2.5">
          {/* 1. Kategori */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">
              Kategori
            </label>
            <select
              value={filters.kategori}
              onChange={(e) => setFilters((prev) => ({ ...prev, kategori: e.target.value }))}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors truncate"
              suppressHydrationWarning
            >
              <option value="Semua">Semua Kategori</option>
              {kategoris.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Cost Center */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">
              Cost Center
            </label>
            <select
              value={filters.costCenter}
              onChange={(e) => setFilters((prev) => ({ ...prev, costCenter: e.target.value }))}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors truncate"
              suppressHydrationWarning
            >
              <option value="Semua">Semua Cost Center</option>
              {sortedCostCenters.map((cc) => (
                <option key={cc} value={cc}>
                  {getCostCenterLabel(cc)}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Status CAPEX */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">
              Status CAPEX
            </label>
            <select
              value={filters.statusCapex}
              onChange={(e) => setFilters((prev) => ({ ...prev, statusCapex: e.target.value }))}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors truncate"
              suppressHydrationWarning
            >
              <option value="Semua">Semua Status</option>
              {sortedStatusList.map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons Inline */}
        <div className="flex items-center gap-1.5 shrink-0 lg:self-end pt-1 lg:pt-0">
          <button
            type="button"
            onClick={handleReset}
            title="Reset Filter"
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] text-[#5F6B63] hover:bg-[#F7F9F7] text-xs font-semibold transition-colors cursor-pointer"
            suppressHydrationWarning
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#16823B] hover:bg-[#0B6B32] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
            suppressHydrationWarning
          >
            <Check className="w-3.5 h-3.5" />
            <span>{loading ? "Memuat..." : "Terapkan"}</span>
          </button>
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
                    Filter Utama Dashboard
                  </h3>
                  <p className="text-[11px] text-[#5F6B63]">
                    Pilih filter lalu tekan Terapkan untuk memperbarui data
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
              {/* Kategori */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">
                  Kategori
                </label>
                <select
                  value={tempFilters.kategori}
                  onChange={(e) => setTempFilters((prev) => ({ ...prev, kategori: e.target.value }))}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                  suppressHydrationWarning
                >
                  <option value="Semua">Semua Kategori</option>
                  {kategoris.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cost Center */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">
                  Cost Center
                </label>
                <select
                  value={tempFilters.costCenter}
                  onChange={(e) => setTempFilters((prev) => ({ ...prev, costCenter: e.target.value }))}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                  suppressHydrationWarning
                >
                  <option value="Semua">Semua Cost Center</option>
                  {sortedCostCenters.map((cc) => (
                    <option key={cc} value={cc}>
                      {getCostCenterLabel(cc)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status CAPEX */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">
                  Status CAPEX
                </label>
                <select
                  value={tempFilters.statusCapex}
                  onChange={(e) => setTempFilters((prev) => ({ ...prev, statusCapex: e.target.value }))}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                  suppressHydrationWarning
                >
                  <option value="Semua">Semua Status</option>
                  {sortedStatusList.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, " ")}
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
