"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Filter,
  X,
  Search,
  ChevronDown,
  Check,
  RotateCcw,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

interface OptionItem {
  value: string;
  label: string;
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
  placeholder = "Cari opsi...",
  emptyText = "Tidak ditemukan",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleClose = () => {
    setIsOpen(false);
    setSearch("");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      opt.value.toLowerCase().includes(q) || opt.label.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-1 relative font-sans" ref={containerRef}>
      <label className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-[#F7F9F7] hover:bg-[#EEF2EF] border rounded-xl px-3 py-2 text-xs text-[#17231B] focus:outline-none transition-all flex items-center justify-between gap-2 text-left cursor-pointer font-medium shadow-2xs ${
          isOpen
            ? "border-[#16823B] ring-2 ring-[#16823B]/15 bg-white"
            : value !== "Semua"
            ? "border-[#16823B]/60 bg-[#EAF3EC]/40"
            : "border-[#DDE5DF]"
        }`}
      >
        <span className="truncate">
          {selectedOption ? (
            <span className={value !== "Semua" ? "font-bold text-[#16823B]" : "text-[#17231B]"}>
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-[#5F6B63] italic">Semua</span>
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
        <div className="absolute top-[100%] left-0 right-0 mt-1.5 bg-white border border-[#DDE5DF] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 flex flex-col min-w-[200px]">
          {/* Search Box */}
          <div className="p-2 border-b border-[#DDE5DF] bg-[#F7F9F7] flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#5F6B63] shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent text-xs text-[#17231B] focus:outline-none placeholder:text-[#89938D]"
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
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-[#F0F5F1] font-sans">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#89938D] italic">
                {emptyText}
              </div>
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
                        ? "bg-[#EAF3EC] text-[#16823B] font-bold"
                        : "hover:bg-[#F8FAF9] text-[#2C3830]"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
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
  );
}

interface CapexMainFiltersProps {
  kategoris: string[];
  costCenters: string[];
  statusList: string[];
  tahuns: string[];
  selectedKategori: string;
  selectedCostCenter: string;
  selectedStatus: string;
  selectedTahun: string;
  searchQuery: string;
  onKategoriChange: (val: string) => void;
  onCostCenterChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onTahunChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  onReset: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export default function CapexMainFilters({
  kategoris,
  costCenters,
  statusList,
  tahuns,
  selectedKategori,
  selectedCostCenter,
  selectedStatus,
  selectedTahun,
  searchQuery,
  onKategoriChange,
  onCostCenterChange,
  onStatusChange,
  onTahunChange,
  onSearchChange,
  onReset,
  onRefresh,
  loading = false,
}: CapexMainFiltersProps) {
  const [mobileModalOpen, setMobileModalOpen] = useState(false);

  const kategoriOptions: OptionItem[] = [
    { value: "Semua", label: "Semua Kategori" },
    ...kategoris.map((k) => ({ value: k, label: k })),
  ];

  const costCenterOptions: OptionItem[] = [
    { value: "Semua", label: "Semua Cost Center" },
    ...costCenters.map((cc) => ({ value: cc, label: cc })),
  ];

  const statusOptions: OptionItem[] = [
    { value: "Semua", label: "Semua Status CAPEX" },
    ...statusList.map((st) => ({ value: st, label: st })),
  ];

  const tahunOptions: OptionItem[] = [
    { value: "Semua", label: "Semua Tahun" },
    ...tahuns.map((th) => ({ value: th, label: `Tahun ${th}` })),
  ];

  const activeFilterCount =
    (selectedKategori !== "Semua" ? 1 : 0) +
    (selectedCostCenter !== "Semua" ? 1 : 0) +
    (selectedStatus !== "Semua" ? 1 : 0) +
    (selectedTahun !== "Semua" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="sticky top-[64px] sm:top-[80px] z-30 font-sans" suppressHydrationWarning>
      {/* ── DESKTOP INLINE FILTER BAR ── */}
      <div className="hidden lg:flex bg-white/95 backdrop-blur-md border border-[#DDE5DF] rounded-2xl p-4 shadow-sm shadow-[#16823B]/5 flex-col gap-3 transition-all">
        <div className="flex items-center justify-between gap-3 border-b border-[#E8EFE9] pb-3">
          {/* Badge & Title */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B] border border-[#E5C959] shadow-2xs">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#17231B] uppercase tracking-wider">
                  Main Filter CAPEX
                </span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#16823B] text-white">
                    {activeFilterCount} Aktif
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#5F6B63]">
                Memfilter Daftar CAPEX, Detail, dan Tracking (tidak memengaruhi User Approver)
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-[#F7F9F7] hover:bg-[#EEF2EF] text-[#5F6B63] hover:text-[#17231B] text-xs font-semibold transition-all cursor-pointer"
                title="Reset seluruh filter ke default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}

            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#16823B] text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Perbarui data dari database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Memuat..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* 3 Main Filters + Search + Tahun */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          {/* 1. Kategori Filter (Total.kategori) */}
          <SearchableSelect
            label="Kategori"
            value={selectedKategori}
            options={kategoriOptions}
            onChange={onKategoriChange}
            placeholder="Cari Kategori..."
            emptyText="Kategori tidak ditemukan"
          />

          {/* 2. Cost Center Filter (Total.cost_center) */}
          <SearchableSelect
            label="Cost Center"
            value={selectedCostCenter}
            options={costCenterOptions}
            onChange={onCostCenterChange}
            placeholder="Cari Cost Center..."
            emptyText="Cost Center tidak ditemukan"
          />

          {/* 3. Status CAPEX Filter (Total.status_capex) */}
          <SearchableSelect
            label="Status CAPEX"
            value={selectedStatus}
            options={statusOptions}
            onChange={onStatusChange}
            placeholder="Cari Status..."
            emptyText="Status tidak ditemukan"
          />

          {/* 4. Tahun Filter */}
          <SearchableSelect
            label="Tahun Anggaran"
            value={selectedTahun}
            options={tahunOptions}
            onChange={onTahunChange}
            placeholder="Cari Tahun..."
            emptyText="Tahun tidak ditemukan"
          />

          {/* 5. Search Bar */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider">
              Pencarian
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari No CAPEX, IO/WBS..."
                className="w-full pl-8.5 pr-8 py-2 text-xs bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl focus:outline-none focus:border-[#16823B] focus:ring-2 focus:ring-[#16823B]/15 text-[#17231B] font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#89938D] hover:text-[#17231B] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE & TABLET COMPACT TRIGGER BUTTON (< lg) ── */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileModalOpen(true)}
          className="w-full bg-white/95 backdrop-blur-md border border-[#DDE5DF] rounded-xl p-3 shadow-sm flex items-center justify-between text-xs text-[#17231B] font-bold cursor-pointer active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B] shrink-0 border border-[#E5C959]">
              <Filter className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-[#17231B] uppercase tracking-wider">
                  Main Filter CAPEX
                </span>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#16823B] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#5F6B63] font-medium truncate">
                {selectedKategori !== "Semua" ? selectedKategori : "Semua Kategori"} •{" "}
                {selectedCostCenter !== "Semua" ? selectedCostCenter : "Semua CC"} •{" "}
                {selectedStatus !== "Semua" ? selectedStatus : "Semua Status"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#16823B] bg-[#EAF3EC] px-3 py-1.5 rounded-lg border border-[#CBE0D1] shrink-0">
            <span>Filter</span>
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* ── MOBILE POP-UP FILTER MODAL ── */}
      {mobileModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setMobileModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 border border-[#DDE5DF] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DF]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#FCE27A] text-[#17231B] border border-[#E5C959]">
                  <Filter className="w-4 h-4 text-[#17231B]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#17231B] uppercase tracking-wider">
                    Main Filter CAPEX
                  </h3>
                  <p className="text-[10px] text-[#5F6B63] font-medium">
                    Filter area CAPEX (Kategori, Cost Center, Status)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileModalOpen(false)}
                className="p-1.5 rounded-lg text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F7F9F7] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selects Body */}
            <div className="flex flex-col gap-3.5">
              <SearchableSelect
                label="Kategori"
                value={selectedKategori}
                options={kategoriOptions}
                onChange={onKategoriChange}
                placeholder="Cari Kategori..."
              />

              <SearchableSelect
                label="Cost Center"
                value={selectedCostCenter}
                options={costCenterOptions}
                onChange={onCostCenterChange}
                placeholder="Cari Cost Center..."
              />

              <SearchableSelect
                label="Status CAPEX"
                value={selectedStatus}
                options={statusOptions}
                onChange={onStatusChange}
                placeholder="Cari Status..."
              />

              <SearchableSelect
                label="Tahun Anggaran"
                value={selectedTahun}
                options={tahunOptions}
                onChange={onTahunChange}
                placeholder="Cari Tahun..."
              />

              {/* Search */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider">
                  Pencarian
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Cari No CAPEX, IO/WBS..."
                    className="w-full pl-8.5 pr-8 py-2 text-xs bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl focus:outline-none focus:border-[#16823B] text-[#17231B] font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onSearchChange("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#89938D] hover:text-[#17231B]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#DDE5DF] mt-2 gap-2">
              <button
                type="button"
                onClick={onReset}
                className="px-4 py-2 rounded-xl border border-[#DDE5DF] text-xs font-semibold text-[#5F6B63] hover:text-[#17231B]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileModalOpen(false)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>Terapkan Filter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
