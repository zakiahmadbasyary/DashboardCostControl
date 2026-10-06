"use client";

import React, { useState } from "react";
import { Filter, X, SlidersHorizontal } from "lucide-react";

export interface MasterMaterialOption {
  material: string;
  materialDescription: string | null;
  group: string | null;
  baseUnitOfMeasure: string | null;
  abcIndicator: string | null;
}

interface MaterialMainFiltersProps {
  groups: string[];
  materials: MasterMaterialOption[];
  selectedGroup: string;
  selectedMaterial: string;
  onGroupChange: (group: string) => void;
  onMaterialChange: (material: string) => void;
}

export default function MaterialMainFilters({
  groups,
  materials,
  selectedGroup,
  selectedMaterial,
  onGroupChange,
  onMaterialChange,
}: MaterialMainFiltersProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="sticky top-[84px] z-40 font-sans" suppressHydrationWarning>
      {/* ================= DESKTOP INLINE FROZEN FILTER BAR (sm: and larger) ================= */}
      <div className="hidden sm:flex bg-white/95 backdrop-blur-md border border-[#DDE5DF] rounded-xl p-3 sm:p-3.5 shadow-md shadow-[#16823B]/5 flex-col lg:flex-row lg:items-center justify-between gap-3 transition-all">
        
        {/* Title / Badge */}
        <div className="flex items-center gap-2 shrink-0 pr-1">
          <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B] border border-[#E5C959] shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-[#17231B]" />
          </div>
          <span className="font-bold text-xs text-[#17231B] uppercase tracking-wider">Filter Utama</span>
        </div>

        {/* Select Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 gap-2 sm:gap-2.5">
          
          {/* 1. Group Filter */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">Group Material</label>
            <select
              value={selectedGroup}
              onChange={(e) => onGroupChange(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer truncate font-medium"
            >
              {groups.map((grp) => (
                <option key={grp} value={grp}>
                  {grp}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Material Filter */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">Material</label>
            <select
              value={selectedMaterial}
              onChange={(e) => onMaterialChange(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer truncate font-medium"
            >
              {materials.length === 0 ? (
                <option value="">(Tidak ada material pada group ini)</option>
              ) : (
                materials.map((mat) => (
                  <option key={mat.material} value={mat.material}>
                    {mat.material} - {mat.materialDescription || mat.material}
                  </option>
                ))
              )}
            </select>
          </div>

        </div>

      </div>

      {/* ================= MOBILE COMPACT BUTTON TRIGGER (< sm) ================= */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-white/95 backdrop-blur-md border border-[#DDE5DF] rounded-xl p-3 shadow-md flex items-center justify-between text-xs text-[#17231B] font-bold cursor-pointer active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B]">
              <Filter className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xs text-[#17231B] uppercase tracking-wider">Filter Utama Dashboard</span>
              <span className="text-[10px] text-[#5F6B63] font-medium truncate max-w-[200px]">
                {selectedGroup} • {selectedMaterial}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#16823B] bg-[#16823B]/10 px-2.5 py-1 rounded-lg border border-[#16823B]/20 shrink-0">
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
            className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 border border-[#DDE5DF] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DF]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B] border border-[#E5C959] shadow-2xs">
                  <Filter className="w-3.5 h-3.5 text-[#17231B]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#17231B] uppercase tracking-wider">Filter Utama Dashboard</h3>
                  <p className="text-[10px] text-[#5F6B63] font-medium">Pilih group dan material spesifik</p>
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
              
              {/* Group Filter */}
              <div>
                <label className="block text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide mb-1">Group Material</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    onGroupChange(e.target.value);
                  }}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-2 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer font-medium"
                >
                  {groups.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material Filter */}
              <div>
                <label className="block text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide mb-1">Material</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => {
                    onMaterialChange(e.target.value);
                  }}
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-2 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer font-medium"
                >
                  {materials.length === 0 ? (
                    <option value="">(Tidak ada material pada group ini)</option>
                  ) : (
                    materials.map((mat) => (
                      <option key={mat.material} value={mat.material}>
                        {mat.material} - {mat.materialDescription || mat.material}
                      </option>
                    ))
                  )}
                </select>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end pt-3 border-t border-[#DDE5DF] mt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#16823B] hover:bg-[#0B6B32] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>Selesai</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
