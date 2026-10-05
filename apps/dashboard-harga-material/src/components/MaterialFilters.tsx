"use client";

import React from "react";
import { Filter, Search, RotateCcw, Check } from "lucide-react";

export interface MaterialFilterState {
  kategori: string;
  statusFluktuasi: string;
  searchQuery: string;
}

interface MaterialFiltersProps {
  filters: MaterialFilterState;
  onFilterChange: (newFilters: Partial<MaterialFilterState>) => void;
  onReset: () => void;
  categories: string[];
}

export default function MaterialFilters({
  filters,
  onFilterChange,
  onReset,
  categories,
}: MaterialFiltersProps) {
  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 font-sans" suppressHydrationWarning>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4" suppressHydrationWarning>
        
        {/* Title */}
        <div className="flex items-center gap-2.5" suppressHydrationWarning>
          <div className="p-2 bg-[#16823B]/10 text-[#16823B] rounded-xl">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#17231B]">Filter Master Data &amp; Fluktuasi Harga Material</h3>
            <p className="text-xs text-[#5F6B63]">Pilih kategori material, status tren harga, atau cari berdasarkan nama item</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72" suppressHydrationWarning>
          <Search className="w-4 h-4 text-[#8C9890] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama material, kode, spesifikasi..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            suppressHydrationWarning
            className="w-full pl-9 pr-3 py-2 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] transition-all"
          />
        </div>

      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end" suppressHydrationWarning>
        
        {/* Kategori Material */}
        <div suppressHydrationWarning>
          <label className="block text-xs font-bold text-[#5F6B63] uppercase tracking-wider mb-1.5">
            Kategori Material
          </label>
          <select
            value={filters.kategori}
            onChange={(e) => onFilterChange({ kategori: e.target.value })}
            suppressHydrationWarning
            className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-xs font-bold text-[#17231B] focus:outline-none focus:border-[#16823B] transition-all cursor-pointer"
          >
            <option value="all">Semua Kategori (Pupuk, Chemical, BBM, Sparepart)</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Fluktuasi */}
        <div suppressHydrationWarning>
          <label className="block text-xs font-bold text-[#5F6B63] uppercase tracking-wider mb-1.5">
            Tren Fluktuasi Harga
          </label>
          <select
            value={filters.statusFluktuasi}
            onChange={(e) => onFilterChange({ statusFluktuasi: e.target.value })}
            suppressHydrationWarning
            className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-xs font-bold text-[#17231B] focus:outline-none focus:border-[#16823B] transition-all cursor-pointer"
          >
            <option value="all">Semua Tren (Naik, Turun, Stabil)</option>
            <option value="naik">Kenaikan Harga (Naik)</option>
            <option value="turun">Penurunan Harga (Turun)</option>
            <option value="stabil">Harga Stabil</option>
          </select>
        </div>

        {/* Reset Button */}
        <div suppressHydrationWarning>
          <button
            onClick={onReset}
            suppressHydrationWarning
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-bold text-xs transition-all shadow-2xs cursor-pointer h-[38px]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#5F6B63]" />
            <span>Reset Filter</span>
          </button>
        </div>

      </div>
    </div>
  );
}
