"use client";

import { useState } from "react";
import { DashboardFilter } from "@/types/dashboard";
import { Filter, RotateCcw, Check, X, SlidersHorizontal } from "lucide-react";

interface GlobalFiltersProps {
  initialFilters: DashboardFilter;
  onApplyFilters: (filters: DashboardFilter) => void;
}

export default function GlobalFilters({ initialFilters, onApplyFilters }: GlobalFiltersProps) {
  const [filters, setFilters] = useState<DashboardFilter>(initialFilters);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleChange = (key: keyof DashboardFilter, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    const defaultFilters: DashboardFilter = {
      status: "all",
      jenisBibit: "all",
      kelasBibit: "all",
      groupCost: "all",
    };
    setFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  // Helper to count active non-all filters for mobile badge
  const activeCount = Object.values(filters).filter((v) => v !== "all").length;

  return (
    <>
      {/* ================= DESKTOP INLINE FILTER BAR (sm: and larger) ================= */}
      <div className="hidden sm:flex bg-white border border-[#DDE5DF] rounded-xl p-3 sm:p-3.5 shadow-sm shadow-[#16823B]/5 flex-col lg:flex-row lg:items-center gap-3">
        {/* Title / Badge */}
        <div className="flex items-center gap-1.5 shrink-0 pr-1">
          <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B]">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs text-[#17231B] uppercase tracking-wider">Filter Utama</span>
        </div>

        {/* Selects Grid / Flex */}
        <div className="grid grid-cols-2 sm:grid-cols-4 flex-1 gap-2 sm:gap-2.5">
          {/* Status */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
            >
              <option value="all">Semua Status</option>
              <option value="NSFC">NSFC</option>
              <option value="NSSC">NSSC</option>
              <option value="NS">NS (NSFC & NSSC)</option>
            </select>
          </div>

          {/* Jenis Bibit */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">Jenis Bibit</label>
            <select
              value={filters.jenisBibit}
              onChange={(e) => handleChange("jenisBibit", e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
            >
              <option value="all">Semua Jenis</option>
              <option value="Sucker">Sucker</option>
              <option value="Crown">Crown</option>
              <option value="Nursery">Nursery</option>
            </select>
          </div>

          {/* Kelas Bibit */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">Kelas Bibit</label>
            <select
              value={filters.kelasBibit}
              onChange={(e) => handleChange("kelasBibit", e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
            >
              <option value="all">Semua Kelas</option>
              <option value="Besar">Besar</option>
              <option value="Sedang">Sedang</option>
              <option value="Kecil">Kecil</option>
            </select>
          </div>

          {/* Group Cost */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">Group Cost</label>
            <select
              value={filters.groupCost}
              onChange={(e) => handleChange("groupCost", e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors truncate"
            >
              <option value="all">Total Cost (Semua)</option>
              <option value="Exclude Land Rehab">Exclude Land Rehab</option>
              <option value="Direct">Direct (Kode ZN)</option>
              <option value="Indirect">Indirect (Kode ZW)</option>
              <optgroup label="Keterangan Group Cost">
                <option value="Land Preparation">Land Preparation</option>
                <option value="Seedling Allocation">Seedling Allocation</option>
                <option value="Planting">Planting</option>
                <option value="Road and Drainage">Road and Drainage</option>
                <option value="Fertilization">Fertilization</option>
                <option value="Weed Control">Weed Control</option>
                <option value="Plant Pest Control">Plant Pest Control</option>
                <option value="Forcing">Forcing</option>
                <option value="Pre Harvesting">Pre Harvesting</option>
                <option value="Harvesting">Harvesting</option>
                <option value="Observation">Observation</option>
                <option value="Plant Selection">Plant Selection</option>
                <option value="Springkle/Irrigation">Springkle/Irrigation</option>
                <option value="Guard/Pull/Labour Transportasion">Guard/Pull/Labour Transportasion</option>
                <option value="Land Rehabilitation">Land Rehabilitation</option>
                <option value="others">others</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Buttons Inline */}
        <div className="flex items-center gap-1.5 shrink-0 lg:self-end pt-1 lg:pt-0">
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
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#16823B] hover:bg-[#0B6B32] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
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
                  <p className="text-[11px] text-[#5F6B63]">Pilih filter untuk memperbarui data dashboard</p>
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
              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                >
                  <option value="all">Semua Status</option>
                  <option value="NSFC">NSFC</option>
                  <option value="NSSC">NSSC</option>
                  <option value="NS">NS (NSFC & NSSC)</option>
                </select>
              </div>

              {/* Jenis Bibit */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">Jenis Bibit</label>
                <select
                  value={filters.jenisBibit}
                  onChange={(e) => handleChange("jenisBibit", e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                >
                  <option value="all">Semua Jenis</option>
                  <option value="Sucker">Sucker</option>
                  <option value="Crown">Crown</option>
                  <option value="Nursery">Nursery</option>
                </select>
              </div>

              {/* Kelas Bibit */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">Kelas Bibit</label>
                <select
                  value={filters.kelasBibit}
                  onChange={(e) => handleChange("kelasBibit", e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                >
                  <option value="all">Semua Kelas</option>
                  <option value="Besar">Besar</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Kecil">Kecil</option>
                </select>
              </div>

              {/* Group Cost */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wide">Group Cost</label>
                <select
                  value={filters.groupCost}
                  onChange={(e) => handleChange("groupCost", e.target.value)}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                >
                  <option value="all">Total Cost (Semua Group)</option>
                  <option value="Exclude Land Rehab">Exclude Land Rehab</option>
                  <option value="Direct">Direct (Kode ZN)</option>
                  <option value="Indirect">Indirect (Kode ZW)</option>
                  <optgroup label="Keterangan Group Cost">
                    <option value="Land Preparation">Land Preparation</option>
                    <option value="Seedling Allocation">Seedling Allocation</option>
                    <option value="Planting">Planting</option>
                    <option value="Road and Drainage">Road and Drainage</option>
                    <option value="Fertilization">Fertilization</option>
                    <option value="Weed Control">Weed Control</option>
                    <option value="Plant Pest Control">Plant Pest Control</option>
                    <option value="Forcing">Forcing</option>
                    <option value="Pre Harvesting">Pre Harvesting</option>
                    <option value="Harvesting">Harvesting</option>
                    <option value="Observation">Observation</option>
                    <option value="Plant Selection">Plant Selection</option>
                    <option value="Springkle/Irrigation">Springkle/Irrigation</option>
                    <option value="Guard/Pull/Labour Transportasion">Guard/Pull/Labour Transportasion</option>
                    <option value="Land Rehabilitation">Land Rehabilitation</option>
                    <option value="others">others</option>
                  </optgroup>
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
                onClick={() => {
                  handleApply();
                  setIsOpen(false);
                }}
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
