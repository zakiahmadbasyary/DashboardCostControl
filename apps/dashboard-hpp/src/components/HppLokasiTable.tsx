"use client";

import React, { useState } from "react";
import { Search, MapPin, Filter, CheckCircle2, ChevronRight, ChevronLeft, Calendar } from "lucide-react";

export interface LokasiHppItem {
  idLokasiHpp: string;
  idMaster?: string | null;
  lokasi: string;
  idBudget: string;
  periode: number;
  tahun?: number | null;
  tanggalRawat?: string | null;
  status: string;
  jenisBibit?: string | null;
  kelasBibit?: string | null;
  qtyPanen: number;
  luasPanen: number;
  luasAktif: number;
  group: string;
  descGroup: string;
  jenisBiaya: string;
  biaya: number;
  masterSheet?: {
    idMaster?: string;
    lokasi?: string;
    wilayah: string;
    jenisBibit: string;
    kelasBibit: string;
    status?: string;
    tanggalRawat?: string;
    tanggalTanam?: string;
    tanggalForcingStandard?: string;
    tanggalRenForcing?: string;
    tanggalRealForcing?: string;
    tanggalSelesaiPanen?: string;
  };
  budgetItem?: {
    budget: number;
  };
}

interface AggregatedLokasi {
  idMaster: string;
  lokasi: string;
  tanggalRawat: string;
  wilayah: string;
  jenisBibit: string;
  kelasBibit: string;
  status: string;
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
  onSelectLokasi: (lokasiKey: string) => void;
}

const ITEMS_PER_PAGE = 10;

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

  const formatNumber = (val: number, decimals = 2) => {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(val || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Group raw items by unique cycle key (idMaster or lokasi) - Option A
  const lokasiMap: Record<string, AggregatedLokasi> = {};

  data.forEach((item) => {
    const key = item.idMaster || item.masterSheet?.idMaster || item.lokasi;
    const dateRawat = item.tanggalRawat || item.masterSheet?.tanggalRawat || "";

    if (!lokasiMap[key]) {
      lokasiMap[key] = {
        idMaster: key,
        lokasi: item.lokasi,
        tanggalRawat: dateRawat,
        wilayah: item.masterSheet?.wilayah || "W01",
        jenisBibit: item.jenisBibit || item.masterSheet?.jenisBibit || "-",
        kelasBibit: item.kelasBibit || item.masterSheet?.kelasBibit || "-",
        status: item.status || item.masterSheet?.status || "NSSC",
        luasPanen: Number(item.luasPanen || 0),
        luasAktif: Number(item.luasAktif || 0),
        qtyPanen: Number(item.qtyPanen || 0),
        totalBiaya: 0,
        taksasi: 0,
        yieldVal: 0,
        rpKg: 0,
        rpHa: 0,
        rawItems: [],
      };
    } else {
      if ((!lokasiMap[key].jenisBibit || lokasiMap[key].jenisBibit === "-") && item.jenisBibit && item.jenisBibit !== "-") {
        lokasiMap[key].jenisBibit = item.jenisBibit;
      }
      if ((!lokasiMap[key].kelasBibit || lokasiMap[key].kelasBibit === "-") && item.kelasBibit && item.kelasBibit !== "-") {
        lokasiMap[key].kelasBibit = item.kelasBibit;
      }
      if (lokasiMap[key].luasPanen === 0 && Number(item.luasPanen || 0) > 0) {
        lokasiMap[key].luasPanen = Number(item.luasPanen);
      }
      if (lokasiMap[key].luasAktif === 0 && Number(item.luasAktif || 0) > 0) {
        lokasiMap[key].luasAktif = Number(item.luasAktif);
      }
      if (lokasiMap[key].qtyPanen === 0 && Number(item.qtyPanen || 0) > 0) {
        lokasiMap[key].qtyPanen = Number(item.qtyPanen);
      }
    }
    lokasiMap[key].totalBiaya += Number(item.biaya || 0);
    lokasiMap[key].rawItems.push(item);
  });

  // Calculate aggregated HPP Rp/Kg and Rp/Ha for each location cycle
  const aggregatedList = Object.values(lokasiMap).map((loc) => {
    const taksasi = loc.luasAktif > 0 ? (loc.luasPanen / loc.luasAktif) * 100 : 0;
    const yieldVal = loc.luasPanen > 0 ? (loc.qtyPanen / loc.luasPanen) / 1000 : 0;
    const rpKg = loc.qtyPanen > 0 ? loc.totalBiaya / loc.qtyPanen : 0;
    const rpHa = loc.luasPanen > 0 ? loc.totalBiaya / loc.luasPanen : 0;
    return {
      ...loc,
      taksasi,
      yieldVal,
      rpKg,
      rpHa,
    };
  });

  // Unique Wilayah list for filter dropdown
  const wilayahOptions = ["W01", "W02", "W03", "W04", "W05", "W06", "W07"];

  // Filter list by searchQuery, selectedWilayahFilter, and exclude taksasi 0%
  const filteredList = aggregatedList.filter((loc) => {
    // Exclude location data with 0% taksasi
    if (loc.taksasi <= 0) return false;

    const matchesSearch =
      loc.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.wilayah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.jenisBibit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.idMaster.toLowerCase().includes(searchQuery.toLowerCase());

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
  const totalPages = Math.max(1, Math.ceil(sortedFilteredList.length / ITEMS_PER_PAGE));
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
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs" suppressHydrationWarning>
      {/* Header & Sub-Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4" suppressHydrationWarning>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B]">Tabel Daftar Lokasi HPP (Per Siklus Tanam)</h3>
            <p className="text-xs text-[#5F6B63]">
              Pilih salah satu baris siklus lokasi untuk melihat rincian detail, Group Cost, dan aktivitas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto" suppressHydrationWarning>
          {/* Sub-filter Wilayah */}
          <div className="flex items-center gap-1.5 bg-[#F7F9F7] px-3 py-1.5 border border-[#DDE5DF] rounded-lg text-xs font-semibold text-[#17231B]" suppressHydrationWarning>
            <Filter className="w-3.5 h-3.5 text-[#16823B]" />
            <span className="text-[#5F6B63]">Wilayah:</span>
            <select
              value={selectedWilayahFilter}
              onChange={(e) => handleWilayahChange(e.target.value)}
              suppressHydrationWarning
              className="bg-transparent font-bold text-[#17231B] focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Wilayah (W01-W07)</option>
              {wilayahOptions.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-48" suppressHydrationWarning>
            <Search className="w-3.5 h-3.5 text-[#5F6B63] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari lokasi, bibit..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              suppressHydrationWarning
              className="w-full pl-8 pr-3 py-1.5 bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Lokasi Table Container */}
      {loading ? (
        <div className="py-12 flex flex-col justify-center items-center">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-[#5F6B63]">Memuat data lokasi HPP...</p>
        </div>
      ) : sortedFilteredList.length === 0 ? (
        <div className="p-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
          <p className="text-sm font-semibold text-[#5F6B63]">Tidak ada data Lokasi HPP</p>
          <p className="text-xs text-[#89938D] mt-1">Coba sesuaikan filter wilayah atau pencarian di atas.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                <tr>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4">Tgl Rawat</th>
                  <th className="py-3 px-4 text-center">% Taksasi</th>
                  <th className="py-3 px-4 text-right">Yield (Ton/Ha)</th>
                  <th className="py-3 px-4 text-right">{isRpKg ? "HPP (Rp/Kg)" : "HPP (Rp/Ha)"}</th>
                  <th className="py-3 px-4 text-center">Status Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]/60">
                {paginatedList.map((loc) => {
                  const isSelected = selectedLokasiCode === loc.idMaster || selectedLokasiCode === loc.lokasi;
                  const hppVal = isRpKg ? loc.rpKg : loc.rpHa;

                  return (
                    <tr
                      key={loc.idMaster}
                      onClick={() => onSelectLokasi(loc.idMaster)}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#A8D437]/20 border-l-4 border-l-[#16823B] font-medium text-[#0B6B32]"
                          : "hover:bg-[#F7F9F7] text-[#17231B]"
                      }`}
                    >
                      {/* 1. Lokasi */}
                      <td className="py-3 px-4 font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#16823B]" />
                          <span className="font-bold text-[#17231B]">{loc.lokasi}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16823B]/10 text-[#16823B] border border-[#16823B]/20">
                            {loc.wilayah}
                          </span>
                          <span className="text-xs text-[#5F6B63] font-normal">({loc.jenisBibit})</span>
                        </div>
                      </td>

                      {/* 2. Tanggal Rawat */}
                      <td className="py-3 px-4 font-mono font-medium text-[#17231B]">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-[#16823B]" />
                          <span>{formatDate(loc.tanggalRawat)}</span>
                        </div>
                      </td>

                      {/* 3. % Taksasi */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            loc.taksasi >= 100
                              ? "bg-[#16823B] text-white"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {loc.taksasi >= 100 && <CheckCircle2 className="w-3 h-3 text-white" />}
                          {formatNumber(loc.taksasi, 1)}%
                        </span>
                      </td>

                      {/* 4. Yield */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#17231B]">
                        {formatNumber(loc.yieldVal, 2)}
                      </td>

                      {/* 5. HPP */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#16823B]">
                        {formatNumber(hppVal, 0)}
                      </td>

                      {/* 6. Status Select */}
                      <td className="py-3 px-4 text-center">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16823B] text-white text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Selected
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#89938D]">Klik pilih</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-[#DDE5DF]/80 text-xs text-[#5F6B63]">
            <span>
              Menampilkan <strong className="text-[#17231B]">{startIndex + 1}</strong> -{" "}
              <strong className="text-[#17231B]">{endIndex}</strong> dari{" "}
              <strong className="text-[#16823B] font-bold">{filteredList.length}</strong> siklus lokasi perkebunan
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-[#17231B] hover:bg-[#F7F9F7] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              <span className="px-2.5 py-1 text-xs font-bold text-[#16823B] bg-[#16823B]/10 rounded-lg border border-[#16823B]/20">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-[#17231B] hover:bg-[#F7F9F7] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

