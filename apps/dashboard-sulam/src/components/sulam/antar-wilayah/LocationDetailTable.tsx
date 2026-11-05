"use client";

import React, { useState, useMemo } from "react";
import { Table as TableIcon, Filter, Search, ArrowUpDown, ChevronUp, ChevronDown, X } from "lucide-react";
import { formatNumberId, formatRatioId, formatDecimal2 } from "@/lib/formatters";

interface LocationItem {
  wilayah: string;
  lokasi: string;
  tk: number;
  batang: number;
  ha: number;
  batangTk: number | null;
}

interface LocationDetailTableProps {
  locations: LocationItem[];
  totalCount?: number;
  locationTotal?: any;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  searchQuery?: string;
  onSearchChange?: (search: string) => void;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (column: string) => void;
  monthName: string;
  loading?: boolean;
}

// Skema warna per Wilayah (AW01--AW07) selaras dengan WIP & HPP
const REGION_COLORS: Record<string, string> = {
  AW01: "#16823B", // Primary Green GGF
  AW02: "#29A9D6", // Cyan Blue
  AW03: "#E5C959", // Yellow WIP / Gold
  AW04: "#A8D437", // Lime Green
  AW05: "#0B6B32", // Forest Dark Green
  AW06: "#1F4E34", // Deep Pine Green
  AW07: "#89938D", // Neutral Gray
};

const WILAYAH_OPTIONS = [
  { id: "all", label: "Semua Wilayah (AW01--AW07)" },
  { id: "AW01", label: "Wilayah AW01" },
  { id: "AW02", label: "Wilayah AW02" },
  { id: "AW03", label: "Wilayah AW03" },
  { id: "AW04", label: "Wilayah AW04" },
  { id: "AW05", label: "Wilayah AW05" },
  { id: "AW06", label: "Wilayah AW06" },
  { id: "AW07", label: "Wilayah AW07" },
];

export default function LocationDetailTable({
  locations,
  monthName,
  loading,
}: LocationDetailTableProps) {
  // Filter Wilayah lokal (Semua / AW01 s/d AW07)
  const [selectedWilayah, setSelectedWilayah] = useState<string>("all");
  const [internalSearch, setInternalSearch] = useState<string>("");
  const [localSortBy, setLocalSortBy] = useState<string>("wilayah");
  const [localSortDir, setLocalSortDir] = useState<"asc" | "desc">("asc");

  // Filter & Sorting data lokasi secara reaktif
  const processedLocations = useMemo(() => {
    let result = [...(locations || [])];

    // 1. Filter Wilayah
    if (selectedWilayah !== "all") {
      result = result.filter((loc) => loc.wilayah === selectedWilayah);
    }

    // 2. Filter Pencarian Lokasi
    if (internalSearch.trim()) {
      const q = internalSearch.toLowerCase().trim();
      result = result.filter(
        (loc) => loc.lokasi.toLowerCase().includes(q) || loc.wilayah.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    result.sort((a, b) => {
      let valA: any = (a as any)[localSortBy];
      let valB: any = (b as any)[localSortBy];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "string") {
        return localSortDir === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return localSortDir === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [locations, selectedWilayah, internalSearch, localSortBy, localSortDir]);

  // Hitung akumulasi Total untuk baris footer sticky
  const calculatedTotal = useMemo(() => {
    if (processedLocations.length === 0) return null;

    let totalTk = 0;
    let totalBatang = 0;
    let totalHa = 0;

    for (const item of processedLocations) {
      totalTk += Number(item.tk) || 0;
      totalBatang += Number(item.batang) || 0;
      totalHa += Number(item.ha) || 0;
    }

    return {
      tk: totalTk,
      batang: totalBatang,
      ha: totalHa,
      batangTk: totalTk > 0 ? Number((totalBatang / totalTk).toFixed(1)) : null,
    };
  }, [processedLocations]);

  // Handler pergantian sorting kolom
  const handleSort = (column: string) => {
    if (localSortBy === column) {
      setLocalSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setLocalSortBy(column);
      setLocalSortDir("asc");
    }
  };

  const renderSortIcon = (column: string) => {
    if (localSortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 text-[#89938D] opacity-50 inline ml-1" />;
    }
    return localSortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#16823B] inline ml-0.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#16823B] inline ml-0.5" />
    );
  };

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs font-sans" suppressHydrationWarning>
      {/* ── Top Bar: Title, Wilayah Sub-Filter & Search Input (Responsive Mobile & Desktop) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B] shrink-0 mt-0.5 sm:mt-0">
            <TableIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#17231B] leading-tight">
              Tabel Detail Seluruh Lokasi --- {monthName}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#5F6B63] mt-0.5 leading-snug">
              Rekapitulasi tenaga kerja, bibit, luas, dan kapasitas per lokasi di PG1 (
              {selectedWilayah === "all" ? "Seluruh Wilayah AW01--AW07" : `Wilayah ${selectedWilayah}`}) pada bulan {monthName}.
            </p>
          </div>
        </div>

        {/* Filter Wilayah Dropdown & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          {/* Dropdown Filter Wilayah */}
          <div className="flex items-center gap-2 bg-[#F7F9F7] px-3 py-2 sm:py-1.5 border border-[#DDE5DF] rounded-xl text-xs font-semibold text-[#17231B] flex-1 sm:flex-initial focus-within:border-[#16823B] focus-within:bg-white transition-all">
            <Filter className="w-3.5 h-3.5 text-[#16823B] shrink-0" />
            <span className="text-[#5F6B63] shrink-0 text-xs">Wilayah:</span>
            <select
              value={selectedWilayah}
              onChange={(e) => setSelectedWilayah(e.target.value)}
              className="w-full sm:w-auto bg-transparent border-0 text-xs font-bold text-[#17231B] focus:outline-none cursor-pointer truncate pr-1"
            >
              {WILAYAH_OPTIONS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pencarian Lokasi */}
          <div className="relative w-full sm:w-56 lg:w-60">
            <Search className="w-3.5 h-3.5 text-[#5F6B63] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari lokasi / wilayah..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full pl-8.5 pr-8 py-2 sm:py-1.5 rounded-xl border border-[#DDE5DF] bg-[#F7F9F7] text-xs font-semibold text-[#17231B] placeholder:text-[#89938D] focus:bg-white focus:outline-none focus:border-[#16823B] transition-all"
            />
            {internalSearch && (
              <button
                type="button"
                onClick={() => setInternalSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#89938D] hover:text-[#17231B] cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick-Filter Pills untuk Wilayah di Tampilan Mobile (< sm) ── */}
      <div className="sm:hidden mb-3.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none flex items-center gap-1.5">
        {WILAYAH_OPTIONS.map((w) => {
          const isSelected = selectedWilayah === w.id;
          const shortLabel = w.id === "all" ? "Semua" : w.id;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedWilayah(w.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B] border border-[#DDE5DF] hover:bg-white active:bg-gray-100"
              }`}
            >
              {w.id !== "all" && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: isSelected ? "#FFFFFF" : REGION_COLORS[w.id] || "#16823B",
                  }}
                />
              )}
              <span>{shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Table: Scrollable Vertikal & Horizontal, Sticky Header & Sticky Footer ── */}
      <div className="rounded-xl border border-[#DDE5DF] overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[520px] scrollbar-thin">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
              <tr>
                <th
                  onClick={() => handleSort("wilayah")}
                  className="py-3 px-3.5 cursor-pointer hover:bg-[#F0F5F2] select-none transition-colors"
                >
                  Wilayah {renderSortIcon("wilayah")}
                </th>
                <th
                  onClick={() => handleSort("lokasi")}
                  className="py-3 px-3.5 cursor-pointer hover:bg-[#F0F5F2] select-none transition-colors"
                >
                  Lokasi {renderSortIcon("lokasi")}
                </th>
                <th
                  onClick={() => handleSort("tk")}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-[#F0F5F2] select-none transition-colors"
                >
                  Tenaga Kerja (TK) {renderSortIcon("tk")}
                </th>
                <th
                  onClick={() => handleSort("batang")}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-[#F0F5F2] select-none transition-colors"
                >
                  Batang Bibit {renderSortIcon("batang")}
                </th>
                <th
                  onClick={() => handleSort("ha")}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-[#F0F5F2] select-none transition-colors"
                >
                  Luas (HA) {renderSortIcon("ha")}
                </th>
                <th
                  onClick={() => handleSort("batangTk")}
                  className="py-3 px-3.5 text-right cursor-pointer hover:bg-[#F0F5F2] select-none transition-colors text-[#16823B]"
                >
                  Batang / TK {renderSortIcon("batangTk")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs text-[#5F6B63]">
                    <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Memuat seluruh data lokasi...
                  </td>
                </tr>
              ) : processedLocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs text-[#5F6B63]">
                    Tidak ada data lokasi yang sesuai kriteria pada bulan {monthName}.
                  </td>
                </tr>
              ) : (
                processedLocations.map((item, idx) => (
                  <tr
                    key={`${item.wilayah}-${item.lokasi}-${idx}`}
                    className="hover:bg-[#F7F9F7] text-[#17231B] transition-all"
                  >
                    <td className="py-2.5 px-3.5 font-bold text-[#16823B]">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: REGION_COLORS[item.wilayah] || "#16823B" }}
                        />
                        {item.wilayah}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-semibold text-[#17231B]">
                      {item.lokasi}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-[#17231B]">
                      {formatNumberId(item.tk, 1)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-[#17231B]">
                      {formatNumberId(item.batang, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-[#17231B]">
                      {formatDecimal2(item.ha)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#16823B]">
                      {item.batangTk !== null ? formatRatioId(item.batangTk, 0) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Sticky Bottom Footer: TOTAL KESELURUHAN LOKASI */}
            {calculatedTotal && (
              <tfoot className="bg-[#EAF3EC] text-[#17231B] font-bold border-t-2 border-[#CBE0D1] sticky bottom-0 z-10 shadow-sm">
                <tr>
                  <td colSpan={2} className="py-3 px-3.5 font-black uppercase tracking-wider text-[#16823B]">
                    TOTAL {selectedWilayah !== "all" ? `WILAYAH ${selectedWilayah}` : "KESELURUHAN LOKASI"}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-[#17231B]">
                    {formatNumberId(calculatedTotal.tk, 1)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-[#17231B]">
                    {formatNumberId(calculatedTotal.batang, 0)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-[#17231B]">
                    {formatDecimal2(calculatedTotal.ha)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-black text-[#16823B]">
                    {calculatedTotal.batangTk !== null ? formatRatioId(calculatedTotal.batangTk, 0) : "-"}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── Status Bar Keterangan Bawah ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#5F6B63] pt-1">
        <span>
          Menampilkan seluruh <strong className="text-[#17231B] font-bold">{processedLocations.length}</strong> lokasi untuk{" "}
          <strong className="text-[#16823B]">
            {selectedWilayah === "all" ? "Seluruh Wilayah (AW01--AW07)" : `Wilayah ${selectedWilayah}`}
          </strong>
        </span>
      </div>
    </div>
  );
}
