"use client";

import React, { useState } from "react";
import { Search, MapPin, Filter, ArrowUpRight, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";

export interface LokasiHppItem {
  idLokasiHpp: string;
  lokasi: string;
  idBudget: string;
  periode: number;
  status: string;
  qtyPanen: number;
  luasPanen: number;
  luasAktif: number;
  group: string;
  descGroup: string;
  jenisBiaya: string;
  biaya: number;
  masterSheet?: {
    wilayah: string;
    kodeBibit: string;
    jenisBibit: string;
    kelasBibit: string;
  };
  budgetItem?: {
    budget: number;
  };
}

interface AggregatedLokasi {
  lokasi: string;
  wilayah: string;
  jenisBibit: string;
  kelasBibit: string;
  luasPanen: number;
  luasAktif: number;
  qtyPanen: number;
  totalBiaya: number;
  taksasi: number;
  yieldVal: number;
  rpKg: number;
  rpHa: number;
  rawItems: LokasiHppItem[];
}

interface HppLokasiTableProps {
  data: LokasiHppItem[];
  loading?: boolean;
  selectedWilayahFilter: string;
  onWilayahFilterChange: (wilayah: string) => void;
  reportFilter: "rp_kg" | "rp_ha";
  selectedLokasiCode: string | null;
  onSelectLokasi: (lokasiCode: string) => void;
}

const ITEMS_PER_PAGE = 5;

export default function HppLokasiTable({
  data,
  loading,
  selectedWilayahFilter,
  onWilayahFilterChange,
  reportFilter,
  selectedLokasiCode,
  onSelectLokasi,
}: HppLokasiTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatNumber = (val: number, decimals = 2) => {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals > 0 ? 1 : 0,
    }).format(val || 0);
  };

  // Group raw items by unique location code
  const lokasiMap: Record<string, AggregatedLokasi> = {};

  data.forEach((item) => {
    const code = item.lokasi;
    if (!lokasiMap[code]) {
      lokasiMap[code] = {
        lokasi: code,
        wilayah: item.masterSheet?.wilayah || "W01",
        jenisBibit: item.masterSheet?.jenisBibit || "-",
        kelasBibit: item.masterSheet?.kelasBibit || "-",
        luasPanen: Number(item.luasPanen || 0),
        luasAktif: Number(item.luasAktif || 0),
        qtyPanen: Number(item.qtyPanen || 0),
        totalBiaya: 0,
        taksasi: Number(item.luasAktif) > 0 ? (Number(item.luasPanen) / Number(item.luasAktif)) * 100 : 0,
        yieldVal: Number(item.luasPanen) > 0 ? Number(item.qtyPanen) / Number(item.luasPanen) : 0,
        rpKg: 0,
        rpHa: 0,
        rawItems: [],
      };
    }
    lokasiMap[code].totalBiaya += Number(item.biaya || 0);
    lokasiMap[code].rawItems.push(item);
  });

  // Calculate aggregated HPP Rp/Kg and Rp/Ha for each location
  const aggregatedList = Object.values(lokasiMap).map((loc) => {
    const rpKg = loc.qtyPanen > 0 ? loc.totalBiaya / loc.qtyPanen : 0;
    const rpHa = loc.luasPanen > 0 ? loc.totalBiaya / loc.luasPanen : 0;
    return {
      ...loc,
      rpKg,
      rpHa,
    };
  });

  // Unique Wilayah list for filter dropdown
  const wilayahOptions = ["W01", "W02", "W03", "W04", "W05", "W06", "W07"];

  // Filter list by searchQuery and selectedWilayahFilter
  const filteredList = aggregatedList.filter((loc) => {
    const matchesSearch =
      loc.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.wilayah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.jenisBibit.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWilayah =
      selectedWilayahFilter === "all" || loc.wilayah.toUpperCase() === selectedWilayahFilter.toUpperCase();

    return matchesSearch && matchesWilayah;
  });

  const isRpKg = reportFilter === "rp_kg";

  // Sort locations descending by HPP (rp_kg or rp_ha): Largest to Smallest
  const sortedFilteredList = [...filteredList].sort((a, b) => {
    const valA = isRpKg ? a.rpKg : a.rpHa;
    const valB = isRpKg ? b.rpKg : b.rpHa;
    return valB - valA;
  });

  // Pagination calculation
  const totalPages = Math.ceil(sortedFilteredList.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, sortedFilteredList.length);
  const paginatedList = sortedFilteredList.slice(startIndex, endIndex);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleWilayahChange = (wilayah: string) => {
    onWilayahFilterChange(wilayah);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#DDE5DF] shadow-2xs overflow-hidden flex flex-col" suppressHydrationWarning>
      {/* Table Header Controls per PRD Section 10 */}
      <div className="p-4 sm:p-5 border-b border-[#EAEFEB] bg-[#F8FAF9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" suppressHydrationWarning>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#16823B] text-white rounded-xl shadow-2xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#17231B] text-sm sm:text-base">Tabel Daftar Lokasi HPP</h3>
            <p className="text-xs text-[#5F6B63]">
              Pilih lokasi untuk melihat rincian detail, Group Cost, dan aktivitas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto" suppressHydrationWarning>
          {/* Sub-filter Wilayah per PRD: [Wilayah: All, W01–W07] */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 border border-[#DDE5DF] rounded-xl" suppressHydrationWarning>
            <Filter className="w-3.5 h-3.5 text-[#16823B]" />
            <span className="text-xs font-bold text-[#5F6B63]">Wilayah:</span>
            <select
              value={selectedWilayahFilter}
              onChange={(e) => handleWilayahChange(e.target.value)}
              suppressHydrationWarning
              className="bg-transparent text-xs font-extrabold text-[#17231B] focus:outline-none cursor-pointer"
            >
              <option value="all">All Wilayah (W01-W07)</option>
              {wilayahOptions.map((w) => (
                <option key={w} value={w}>
                  Wilayah {w}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-52" suppressHydrationWarning>
            <Search className="w-3.5 h-3.5 text-[#8C9890] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari lokasi, bibit..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              suppressHydrationWarning
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DDE5DF] rounded-xl text-xs font-medium text-[#17231B] focus:outline-none focus:border-[#16823B] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Lokasi Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F0F4F1] text-[#455248] uppercase tracking-wider font-extrabold border-b border-[#E0E8E2]">
              <th className="py-3 px-4">Lokasi</th>
              <th className="py-3 px-4 text-center">% Taksasi</th>
              <th className="py-3 px-4 text-right">Yield</th>
              <th className="py-3 px-4 text-right">{isRpKg ? "HPP (Rp/Kg)" : "HPP (Rp/Ha)"}</th>
              <th className="py-3 px-4 text-center">STATUS SELECT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEFEB]">
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="py-4 px-4 bg-gray-50/50">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : sortedFilteredList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#8C9890] font-medium">
                  Tidak ada data Lokasi yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              paginatedList.map((loc) => {
                const isSelected = selectedLokasiCode === loc.lokasi;
                const hppVal = isRpKg ? loc.rpKg : loc.rpHa;

                return (
                  <tr
                    key={loc.lokasi}
                    onClick={() => onSelectLokasi(loc.lokasi)}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#EFF7DB] font-semibold"
                        : "hover:bg-[#F8FAF9]"
                    }`}
                  >
                    {/* 1. Lokasi */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#17231B] text-sm">{loc.lokasi}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {loc.wilayah}
                        </span>
                        <span className="text-[10px] text-[#5F6B63] capitalize">({loc.jenisBibit})</span>
                      </div>
                    </td>

                    {/* 2. % Taksasi */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          loc.taksasi >= 100
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}
                      >
                        {loc.taksasi >= 100 && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {formatNumber(loc.taksasi, 1)}%
                      </span>
                    </td>

                    {/* 3. Yield */}
                    <td className="py-3.5 px-4 text-right font-bold text-[#17231B]">
                      {formatNumber(loc.yieldVal, 1)}
                    </td>

                    {/* 4. HPP (No Rp prefix) */}
                    <td className="py-3.5 px-4 text-right font-black text-[#16823B]">
                      {formatNumber(hppVal, 0)}
                    </td>

                    {/* 5. Status Select Column */}
                    <td className="py-3.5 px-4 text-center">
                      {isSelected ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLokasi(loc.lokasi);
                          }}
                          className="px-3.5 py-1 rounded-full bg-[#0B6B32] text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 hover:bg-[#074f24] transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Selected</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLokasi(loc.lokasi);
                          }}
                          className="text-xs text-[#89958C] hover:text-[#16823B] font-medium transition-colors cursor-pointer"
                        >
                          Klik pilih
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info & Pagination Controls */}
      <div className="p-3.5 bg-[#F8FAF9] border-t border-[#EAEFEB] text-xs text-[#5F6B63] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          {filteredList.length > 0 ? (
            <span>
              Menampilkan <strong className="text-[#17231B]">{startIndex + 1}</strong> - <strong className="text-[#17231B]">{endIndex}</strong> dari <strong className="text-[#17231B]">{filteredList.length}</strong> lokasi perkebunan
            </span>
          ) : (
            <span>Tidak ada data lokasi</span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-xs font-bold text-[#17231B] hover:bg-[#EAF3EC] disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  currentPage === page
                    ? "bg-[#16823B] text-white shadow-2xs"
                    : "bg-white border border-[#DDE5DF] text-[#17231B] hover:bg-[#EAF3EC]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-xs font-bold text-[#17231B] hover:bg-[#EAF3EC] disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

