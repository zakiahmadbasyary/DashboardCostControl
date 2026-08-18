"use client";

import { useState } from "react";
import { DashboardFilter } from "@/types/dashboard";
import { Filter, RotateCcw, Check } from "lucide-react";

interface GlobalFiltersProps {
  initialFilters: DashboardFilter;
  onApplyFilters: (filters: DashboardFilter) => void;
}

export default function GlobalFilters({ initialFilters, onApplyFilters }: GlobalFiltersProps) {
  const [filters, setFilters] = useState<DashboardFilter>(initialFilters);

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

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-[#16823B]" />
        <h3 className="font-bold text-sm text-[#17231B] uppercase tracking-wider">Filter Utama Dashboard</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filter 1: Status */}
        <div>
          <label className="block text-xs font-semibold text-[#5F6B63] mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-3 py-2 text-sm text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
          >
            <option value="all">Semua Status</option>
            <option value="NS">NS</option>
            <option value="Status lainnya">Status lainnya</option>
          </select>
        </div>

        {/* Filter 2: Jenis Bibit */}
        <div>
          <label className="block text-xs font-semibold text-[#5F6B63] mb-1">Jenis Bibit</label>
          <select
            value={filters.jenisBibit}
            onChange={(e) => handleChange("jenisBibit", e.target.value)}
            className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-3 py-2 text-sm text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
          >
            <option value="all">Semua Jenis</option>
            <option value="Sucker">Sucker</option>
            <option value="Crown">Crown</option>
            <option value="Nursery">Nursery</option>
          </select>
        </div>

        {/* Filter 3: Kelas Bibit */}
        <div>
          <label className="block text-xs font-semibold text-[#5F6B63] mb-1">Kelas Bibit</label>
          <select
            value={filters.kelasBibit}
            onChange={(e) => handleChange("kelasBibit", e.target.value)}
            className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-3 py-2 text-sm text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
          >
            <option value="all">Semua Kelas</option>
            <option value="Besar">Besar</option>
            <option value="Sedang">Sedang</option>
            <option value="Kecil">Kecil</option>
          </select>
        </div>

        {/* Filter 4: Group Cost */}
        <div>
          <label className="block text-xs font-semibold text-[#5F6B63] mb-1">Group Cost</label>
          <select
            value={filters.groupCost}
            onChange={(e) => handleChange("groupCost", e.target.value)}
            className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-3 py-2 text-sm text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
          >
            <option value="all">Total Cost (Semua Group)</option>
            <option value="Fertilization">Fertilization</option>
            <option value="Plant Pest Control">Plant Pest Control</option>
            <option value="Road and Drainage">Road and Drainage</option>
            <option value="Weed Control">Weed Control</option>
            <option value="Planting">Planting</option>
            <option value="Land Preparation">Land Preparation</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Harvesting">Harvesting</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#DDE5DF]/60">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#DDE5DF] text-[#5F6B63] hover:bg-[#F7F9F7] text-xs font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
        <button
          onClick={handleApply}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#16823B] hover:bg-[#0B6B32] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Terapkan Filter</span>
        </button>
      </div>
    </div>
  );
}
