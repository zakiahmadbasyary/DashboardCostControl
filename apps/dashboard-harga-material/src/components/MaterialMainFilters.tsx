"use client";

import React, { useState, useEffect, useRef } from "react";
import { Filter, X, SlidersHorizontal, Search, ChevronDown, Check } from "lucide-react";

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
  years: string[];
  selectedGroup: string;
  selectedMaterial: string;
  selectedYear: string;
  onGroupChange: (group: string) => void;
  onMaterialChange: (material: string) => void;
  onYearChange: (year: string) => void;
}

interface OptionItem {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  label: string;
  value: string;
  options: OptionItem[];
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
}

function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Cari...",
  emptyText = "Tidak ada data ditemukan",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Selected option text display
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      opt.value.toLowerCase().includes(q) ||
      opt.label.toLowerCase().includes(q) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-0.5 relative font-sans" ref={containerRef}>
      <label className="text-[10px] font-semibold text-[#5F6B63] uppercase tracking-wide">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-[#F7F9F7] hover:bg-[#EEF2EF] border border-[#DDE5DF] hover:border-[#16823B]/40 rounded-lg px-2.5 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] focus:ring-1 focus:ring-[#16823B]/20 transition-all flex items-center justify-between gap-2 text-left cursor-pointer font-medium"
      >
        <span className="truncate">
          {selectedOption ? (
            selectedOption.sublabel ? (
              <span>
                <strong className="font-semibold text-[#17231B]">{selectedOption.label}</strong>
                <span className="text-[#5F6B63] ml-1"> - {selectedOption.sublabel}</span>
              </span>
            ) : (
              selectedOption.label
            )
          ) : (
            <span className="text-[#5F6B63] italic">Pilih {label}...</span>
          )}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#5F6B63] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#16823B]" : ""
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-[100%] left-0 right-0 mt-1 bg-white border border-[#DDE5DF] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col">
          {/* Search Box */}
          <div className="p-2 border-b border-[#DDE5DF] bg-[#F7F9F7] flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#5F6B63] shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent text-xs text-[#17231B] focus:outline-none placeholder:text-[#5F6B63]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-0.5 text-[#5F6B63] hover:text-[#17231B] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-gray-50 font-sans">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#5F6B63] italic">{emptyText}</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-[#16823B]/10 text-[#16823B] font-bold"
                        : "hover:bg-[#F0F7F2] text-[#17231B]"
                    }`}
                  >
                    <div className="truncate">
                      {opt.sublabel ? (
                        <span>
                          <strong className="font-semibold">{opt.label}</strong>
                          <span className="text-[#5F6B63] font-normal ml-1"> - {opt.sublabel}</span>
                        </span>
                      ) : (
                        <span>{opt.label}</span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#16823B] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaterialMainFilters({
  groups,
  materials,
  years,
  selectedGroup,
  selectedMaterial,
  selectedYear,
  onGroupChange,
  onMaterialChange,
  onYearChange,
}: MaterialMainFiltersProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const validGroups = groups.filter((grp) => grp && grp !== "-");

  const groupOptions: OptionItem[] = validGroups.map((grp) => ({
    value: grp,
    label: grp,
  }));

  const materialOptions: OptionItem[] = materials.map((mat) => ({
    value: mat.material,
    label: mat.material,
    sublabel: mat.materialDescription || mat.material,
  }));

  const yearOptions: OptionItem[] = years.map((y) => ({
    value: y,
    label: `Tahun ${y}`,
  }));

  return (
    <div className="sticky top-[84px] z-40 font-sans" suppressHydrationWarning>
      {/* ================= DESKTOP INLINE FROZEN FILTER BAR (sm: and larger) ================= */}
      <div className="hidden sm:flex bg-white/95 backdrop-blur-md border border-[#DDE5DF] rounded-xl p-3 sm:p-3.5 shadow-md shadow-[#16823B]/5 flex-col lg:flex-row lg:items-center justify-between gap-3 transition-all">
        {/* Title / Badge */}
        <div className="flex items-center gap-2 shrink-0 pr-1">
          <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B] border border-[#E5C959] shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-[#17231B]" />
          </div>
          <span className="font-bold text-xs text-[#17231B] uppercase tracking-wider">
            Filter Utama
          </span>
        </div>

        {/* Select Dropdowns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 gap-2 sm:gap-2.5">
          {/* 1. Group Filter */}
          <SearchableSelect
            label="Group Material"
            value={selectedGroup}
            options={groupOptions}
            onChange={onGroupChange}
            placeholder="Cari Group Material..."
            emptyText="Group tidak ditemukan"
          />

          {/* 2. Material Filter */}
          <SearchableSelect
            label="Material"
            value={selectedMaterial}
            options={materialOptions}
            onChange={onMaterialChange}
            placeholder="Cari Kode / Deskripsi Material..."
            emptyText="Material tidak ditemukan"
          />

          {/* 3. Year Filter */}
          <SearchableSelect
            label="Tahun"
            value={selectedYear}
            options={yearOptions}
            onChange={onYearChange}
            placeholder="Cari Tahun..."
            emptyText="Tahun tidak ditemukan"
          />
        </div>
      </div>

      {/* ================= MOBILE COMPACT BUTTON TRIGGER (< sm) ================= */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full bg-white/95 backdrop-blur-md border border-[#DDE5DF] rounded-xl p-3 shadow-md flex items-center justify-between text-xs text-[#17231B] font-bold cursor-pointer active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B]">
              <Filter className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xs text-[#17231B] uppercase tracking-wider">
                Filter Utama Dashboard
              </span>
              <span className="text-[10px] text-[#5F6B63] font-medium truncate max-w-[200px]">
                {selectedGroup || "Group"} • {selectedMaterial || "Material"} • {selectedYear || "Tahun"}
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
                  <h3 className="font-bold text-xs text-[#17231B] uppercase tracking-wider">
                    Filter Utama Dashboard
                  </h3>
                  <p className="text-[10px] text-[#5F6B63] font-medium">
                    Pilih & cari group, material, dan tahun
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F7F9F7] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selects Body */}
            <div className="flex flex-col gap-3.5">
              {/* Group Filter */}
              <SearchableSelect
                label="Group Material"
                value={selectedGroup}
                options={groupOptions}
                onChange={onGroupChange}
                placeholder="Cari Group Material..."
                emptyText="Group tidak ditemukan"
              />

              {/* Material Filter */}
              <SearchableSelect
                label="Material"
                value={selectedMaterial}
                options={materialOptions}
                onChange={onMaterialChange}
                placeholder="Cari Kode / Deskripsi Material..."
                emptyText="Material tidak ditemukan"
              />

              {/* Year Filter */}
              <SearchableSelect
                label="Tahun"
                value={selectedYear}
                options={yearOptions}
                onChange={onYearChange}
                placeholder="Cari Tahun..."
                emptyText="Tahun tidak ditemukan"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end pt-3 border-t border-[#DDE5DF] mt-2">
              <button
                type="button"
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
