"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  Calendar,
  History,
  Filter,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Sprout,
  ArrowRight,
  MapPin,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { formatNumberId } from "@/lib/formatters";

export interface MandorRekapItem {
  mandor: string;
  tk: number;
  batang: number;
  batangPerTk: number;
}

export interface MandorHistoriItem {
  tanggalRealisasi: string;
  mandor: string;
  tk: number;
  batang: number;
  batangPerTk: number;
  pg?: string;
  wilayah?: string;
  lokasi?: string;
}

interface MandorAnalysisSectionProps {
  selectedLocation?: { wilayah: string; lokasi: string } | null;
  onResetLocation?: () => void;
  selectedYear: number;
  selectedMonth: number;
  monthName: string;
  rekapData: MandorRekapItem[];
  historiData: MandorHistoriItem[];
  loading?: boolean;
}

export default function MandorAnalysisSection({
  selectedLocation,
  onResetLocation,
  selectedYear,
  selectedMonth,
  monthName,
  rekapData = [],
  historiData = [],
  loading,
}: MandorAnalysisSectionProps) {
  // Filter klik mandor dari tabel kiri untuk memfilter tabel kanan
  const [selectedMandor, setSelectedMandor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State Sorting Tabel Kiri (Rekap Mandor)
  const [rekapSortBy, setRekapSortBy] = useState<string>("batang");
  const [rekapSortDir, setRekapSortDir] = useState<"asc" | "desc">("desc");

  // State Sorting Tabel Kanan (Histori Harian)
  const [historiSortBy, setHistoriSortBy] = useState<string>("tanggalRealisasi");
  const [historiSortDir, setHistoriSortDir] = useState<"asc" | "desc">("asc");

  // Reset filter mandor saat lokasi berubah
  useEffect(() => {
    setSelectedMandor(null);
    setSearchQuery("");
  }, [selectedLocation?.wilayah, selectedLocation?.lokasi]);

  // Handler Sorting Tabel Kiri
  const handleRekapSort = (column: string) => {
    if (rekapSortBy === column) {
      setRekapSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setRekapSortBy(column);
      setRekapSortDir(column === "mandor" ? "asc" : "desc");
    }
  };

  const renderRekapSortIcon = (column: string) => {
    if (rekapSortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 text-[#89938D] opacity-50 inline ml-1" />;
    }
    return rekapSortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#16823B] inline ml-0.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#16823B] inline ml-0.5" />
    );
  };

  // Handler Sorting Tabel Kanan
  const handleHistoriSort = (column: string) => {
    if (historiSortBy === column) {
      setHistoriSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setHistoriSortBy(column);
      setHistoriSortDir(column === "tanggalRealisasi" || column === "mandor" ? "asc" : "desc");
    }
  };

  const renderHistoriSortIcon = (column: string) => {
    if (historiSortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 text-[#89938D] opacity-50 inline ml-1" />;
    }
    return historiSortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#16823B] inline ml-0.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#16823B] inline ml-0.5" />
    );
  };

  // Filter & Sorting Tabel Kiri (Rekap Mandor)
  const processedRekap = useMemo(() => {
    if (!selectedLocation) return [];

    let result = [...rekapData];

    // Filter Pencarian
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((r) => r.mandor.toLowerCase().includes(q));
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = (a as any)[rekapSortBy];
      let valB: any = (b as any)[rekapSortBy];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "string") {
        return rekapSortDir === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return rekapSortDir === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [selectedLocation, rekapData, searchQuery, rekapSortBy, rekapSortDir]);

  // Hitung total akumulasi pada tabel kiri
  const totalRekap = useMemo(() => {
    if (!selectedLocation) return { tk: 0, batang: 0, batangPerTk: 0 };

    let tk = 0;
    let batang = 0;
    for (const r of processedRekap) {
      tk += r.tk || 0;
      batang += r.batang || 0;
    }
    const batangPerTk = tk > 0 ? Math.round(batang / tk) : 0;
    return {
      tk,
      batang,
      batangPerTk,
    };
  }, [selectedLocation, processedRekap]);

  // Filter & Sorting Tabel Kanan (Histori Harian)
  const processedHistori = useMemo(() => {
    if (!selectedLocation) return [];

    let result = [...historiData];

    // Filter mandor terpilih dari klik tabel kiri
    if (selectedMandor) {
      result = result.filter((h) => h.mandor === selectedMandor);
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = (a as any)[historiSortBy];
      let valB: any = (b as any)[historiSortBy];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (historiSortBy === "tanggalRealisasi") {
        const timeA = new Date(valA).getTime();
        const timeB = new Date(valB).getTime();
        return historiSortDir === "asc" ? timeA - timeB : timeB - timeA;
      }

      if (typeof valA === "string") {
        return historiSortDir === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return historiSortDir === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [selectedLocation, historiData, selectedMandor, historiSortBy, historiSortDir]);

  // Hitung total akumulasi untuk data histori yang sedang tampil di tabel kanan
  const totalHistori = useMemo(() => {
    if (!selectedLocation) return { tk: 0, batang: 0, batangPerTk: 0, count: 0 };

    let tk = 0;
    let batang = 0;
    for (const h of processedHistori) {
      tk += h.tk || 0;
      batang += h.batang || 0;
    }
    const batangPerTk = tk > 0 ? Math.round(batang / tk) : 0;
    return {
      tk,
      batang,
      batangPerTk,
      count: processedHistori.length,
    };
  }, [selectedLocation, processedHistori]);

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs font-sans space-y-4">
      {/* ── Section Main Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE5DF]/60 pb-3.5">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B] shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base text-[#17231B] leading-tight">
                {selectedLocation ? (
                  <>
                    Analisa Mandor &mdash; Lokasi{" "}
                    <span className="text-[#16823B] font-extrabold underline underline-offset-2">
                      {selectedLocation.lokasi}
                    </span>{" "}
                    ({selectedLocation.wilayah})
                  </>
                ) : (
                  <>Analisa Mandor</>
                )}{" "}
                - Bulan {monthName} {selectedYear}
              </h3>

              {selectedLocation ? (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
                  <MapPin className="w-3 h-3 text-[#16823B]" />
                  <span>Lokasi: {selectedLocation.lokasi}</span>
                  {onResetLocation && (
                    <button
                      type="button"
                      onClick={onResetLocation}
                      className="ml-1 hover:text-rose-600 transition-colors cursor-pointer text-[#5F6B63]"
                      title="Batalkan pilihan lokasi"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0F2F0] text-[#5F6B63] border border-[#DDE5DF]">
                  Belum Ada Lokasi Dipilih
                </span>
              )}

              {selectedLocation && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
                  {rekapData.length} Mandor di Lokasi Ini
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-[#5F6B63] mt-0.5">
              {selectedLocation
                ? `Rekapitulasi rasio penanaman (Batang/TK) dan riwayat kerja harian mandor di lokasi ${selectedLocation.lokasi} (${selectedLocation.wilayah}).`
                : "Silakan pilih salah satu lokasi pada Tabel Detail Seluruh Lokasi untuk melihat analisa mandor."}
            </p>
          </div>
        </div>

        {/* Global summary badge */}
        <div className="flex items-center gap-2 bg-[#F7F9F7] px-3 py-1.5 rounded-xl border border-[#DDE5DF] text-xs font-medium text-[#5F6B63]">
          <span>Rata-rata Rasio:</span>
          <span className="font-mono font-black text-[#16823B] text-sm">
            {selectedLocation && totalRekap.batangPerTk > 0 ? `${formatNumberId(totalRekap.batangPerTk, 0)}` : "-"}
          </span>
          <span className="text-[10px]">btg/TK</span>
        </div>
      </div>

      {/* ── Grid 2 Bagian: Kiri (Rekap Mandor) & Kanan (Histori Harian) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5 sm:gap-5 items-start">
        {/* ========================================================================= */}
        {/* BAGIAN 1 (KIRI): Tabel Rekapitulasi Mandor Bulan Terpilih */}
        {/* ========================================================================= */}
        <div className="rounded-xl border border-[#DDE5DF] bg-[#FAFCFA] flex flex-col overflow-hidden">
          {/* Header Sub-Bagian Kiri */}
          <div className="p-3 sm:p-3.5 border-b border-[#DDE5DF] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#17231B] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#16823B]" />
                <span>
                  Rekap Mandor Bulanan {selectedLocation ? `(${selectedLocation.lokasi})` : ""}
                </span>
              </h4>
              <p className="text-[11px] text-[#5F6B63] mt-0.5">
                Klik baris mandor untuk menyaring histori hariannya di tabel kanan.
              </p>
            </div>

            {/* Input Pencarian Nama Mandor */}
            <div className="relative w-full sm:w-44">
              <Search className="w-3.5 h-3.5 text-[#5F6B63] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                disabled={!selectedLocation}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mandor..."
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16823B] text-[#17231B] placeholder-[#5F6B63]/60 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5F6B63] hover:text-[#17231B]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Table Container Kiri (Scrollable vertikal max-h-[360px]) */}
          <div className="overflow-x-auto overflow-y-auto max-h-[360px] scrollbar-thin">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th
                    onClick={() => selectedLocation && handleRekapSort("mandor")}
                    className={`py-2.5 px-3 select-none transition-colors ${
                      selectedLocation ? "cursor-pointer hover:bg-[#F0F5F2]" : ""
                    }`}
                  >
                    Nama Mandor {selectedLocation && renderRekapSortIcon("mandor")}
                  </th>
                  <th
                    onClick={() => selectedLocation && handleRekapSort("tk")}
                    className={`py-2.5 px-3 text-right select-none transition-colors ${
                      selectedLocation ? "cursor-pointer hover:bg-[#F0F5F2]" : ""
                    }`}
                  >
                    TK {selectedLocation && renderRekapSortIcon("tk")}
                  </th>
                  <th
                    onClick={() => selectedLocation && handleRekapSort("batang")}
                    className={`py-2.5 px-3 text-right select-none transition-colors ${
                      selectedLocation ? "cursor-pointer hover:bg-[#F0F5F2]" : ""
                    }`}
                  >
                    Batang {selectedLocation && renderRekapSortIcon("batang")}
                  </th>
                  <th
                    onClick={() => selectedLocation && handleRekapSort("batangPerTk")}
                    className={`py-2.5 px-3.5 text-right text-[#16823B] select-none transition-colors ${
                      selectedLocation ? "cursor-pointer hover:bg-[#F0F5F2]" : ""
                    }`}
                  >
                    Batang / TK {selectedLocation && renderRekapSortIcon("batangPerTk")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]/60 bg-white">
                {!selectedLocation ? (
                  <tr>
                    <td colSpan={4} className="py-14 text-center text-xs text-[#5F6B63]">
                      <Users className="w-6 h-6 text-[#CBE0D1] mx-auto mb-2" />
                      <p className="font-semibold text-[#17231B]">Belum ada lokasi yang dipilih</p>
                      <p className="text-[11px] mt-0.5">
                        Klik salah satu baris di <strong>Tabel Detail Seluruh Lokasi</strong> di atas untuk melihat rekap mandor.
                      </p>
                    </td>
                  </tr>
                ) : loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-xs text-[#5F6B63]">
                      <div className="w-5 h-5 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Memuat data mandor...
                    </td>
                  </tr>
                ) : processedRekap.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-xs text-[#5F6B63]">
                      {searchQuery
                        ? `Tidak ada mandor dengan nama "${searchQuery}".`
                        : "Tidak ada data mandor untuk lokasi ini."}
                    </td>
                  </tr>
                ) : (
                  processedRekap.map((r) => {
                    const isSelected = selectedMandor === r.mandor;
                    return (
                      <tr
                        key={r.mandor}
                        onClick={() => {
                          // Toggle filter mandor
                          setSelectedMandor((prev) => (prev === r.mandor ? null : r.mandor));
                        }}
                        className={`cursor-pointer transition-colors group ${
                          isSelected
                            ? "bg-[#16823B]/10 font-bold text-[#16823B]"
                            : "hover:bg-[#F7F9F7] text-[#17231B]"
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? "bg-[#16823B]" : "bg-[#DDE5DF] group-hover:bg-[#16823B]"
                              }`}
                            />
                            <span>{r.mandor}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {formatNumberId(r.tk, 1)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {formatNumberId(r.batang, 0)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#16823B]">
                          {r.batangPerTk > 0 ? formatNumberId(r.batangPerTk, 0) : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Sticky Footer Total Rekap */}
              {selectedLocation && processedRekap.length > 0 && (
                <tfoot className="bg-[#EAF3EC] text-[#17231B] font-bold border-t-2 border-[#CBE0D1] sticky bottom-0 z-10 shadow-xs">
                  <tr>
                    <td className="py-2.5 px-3 text-[#16823B] uppercase text-[11px]">
                      TOTAL ({processedRekap.length} MANDOR)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatNumberId(totalRekap.tk, 1)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatNumberId(totalRekap.batang, 0)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-[#16823B]">
                      {totalRekap.batangPerTk > 0 ? formatNumberId(totalRekap.batangPerTk, 0) : "-"}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BAGIAN 2 (KANAN): Tabel Histori Harian Mandor Bulan Terpilih */}
        {/* ========================================================================= */}
        <div className="rounded-xl border border-[#DDE5DF] bg-[#FAFCFA] flex flex-col overflow-hidden">
          {/* Header Sub-Bagian Kanan */}
          <div className="p-3 sm:p-3.5 border-b border-[#DDE5DF] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#17231B] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#16823B]" />
                <span>
                  Histori Harian Mandor {selectedLocation ? `(${selectedLocation.lokasi})` : ""}
                </span>
              </h4>
              <p className="text-[11px] text-[#5F6B63] mt-0.5">
                Rincian transaksi per hari penanaman sulam di lokasi terpilih.
              </p>
            </div>

            {/* Status Filter Mandor yang Aktif */}
            <div className="flex items-center gap-2">
              {selectedMandor ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAF3EC] border border-[#CBE0D1] text-xs font-bold text-[#16823B]">
                  <span>Mandor: {selectedMandor}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedMandor(null)}
                    className="p-0.5 hover:bg-white rounded-md text-[#5F6B63] hover:text-rose-600 transition-colors cursor-pointer"
                    title="Tampilkan semua mandor lokasi ini"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : selectedLocation ? (
                <span className="text-[11px] font-semibold text-[#5F6B63] bg-[#F7F9F7] px-2.5 py-1 rounded-lg border border-[#DDE5DF]">
                  Seluruh Mandor Lokasi ({processedHistori.length} baris)
                </span>
              ) : null}
            </div>
          </div>

          {/* Table Container Kanan (Scrollable vertikal max-h-[360px] persis sama dengan kiri) */}
          <div className="overflow-x-auto overflow-y-auto max-h-[360px] scrollbar-thin">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th
                    onClick={() => selectedLocation && handleHistoriSort("tanggalRealisasi")}
                    className={`py-2.5 px-3 select-none transition-colors ${
                      selectedLocation ? "cursor-pointer hover:bg-[#F0F5F2]" : ""
                    }`}
                  >
                    Tanggal {selectedLocation && renderHistoriSortIcon("tanggalRealisasi")}
                  </th>
                  <th
                    onClick={() => selectedLocation && handleHistoriSort("mandor")}
                    className={`py-2.5 px-3 select-none transition-colors ${
                      selectedLocation ? "cursor-pointer hover:bg-[#F0F5F2]" : ""
                    }`}
                  >
                    Mandor {selectedLocation && renderHistoriSortIcon("mandor")}
                  </th>
                  <th
                    onClick={() => selectedLocation && handleHistoriSort("tk")}
                    className={`py-2.5 px-3 text-right select-none transition-colors ${
                      selectedLocation ? "cursor-pointer hover:bg-[#F0F5F2]" : ""
                    }`}
                  >
                    TK {selectedLocation && renderHistoriSortIcon("tk")}
                  </th>
                  <th
                    onClick={() => selectedLocation && handleHistoriSort("batang")}
                    className={`py-2.5 px-3 text-right select-none transition-colors ${
                      selectedLocation ? "cursor-pointer hover:bg-[#F0F5F2]" : ""
                    }`}
                  >
                    Batang {selectedLocation && renderHistoriSortIcon("batang")}
                  </th>
                  <th
                    onClick={() => selectedLocation && handleHistoriSort("batangPerTk")}
                    className={`py-2.5 px-3.5 text-right text-[#16823B] select-none transition-colors ${
                      selectedLocation ? "cursor-pointer hover:bg-[#F0F5F2]" : ""
                    }`}
                  >
                    Batang / TK {selectedLocation && renderHistoriSortIcon("batangPerTk")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]/60 bg-white">
                {!selectedLocation ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-xs text-[#5F6B63]">
                      <History className="w-6 h-6 text-[#CBE0D1] mx-auto mb-2" />
                      <p className="font-semibold text-[#17231B]">Belum ada lokasi yang dipilih</p>
                      <p className="text-[11px] mt-0.5">
                        Klik salah satu baris di <strong>Tabel Detail Seluruh Lokasi</strong> di atas untuk melihat histori harian.
                      </p>
                    </td>
                  </tr>
                ) : loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-[#5F6B63]">
                      <div className="w-5 h-5 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Memuat histori mandor...
                    </td>
                  </tr>
                ) : processedHistori.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-[#5F6B63]">
                      {selectedMandor
                        ? `Tidak ada transaksi untuk ${selectedMandor} di lokasi ini.`
                        : "Tidak ada riwayat transaksi mandor di lokasi ini."}
                    </td>
                  </tr>
                ) : (
                  processedHistori.map((h, idx) => (
                    <tr
                      key={`${h.tanggalRealisasi}-${h.mandor}-${idx}`}
                      className="hover:bg-[#F7F9F7] text-[#17231B] transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-[#5F6B63]">
                        {h.tanggalRealisasi
                          ? new Date(h.tanggalRealisasi).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#17231B]">
                        {h.mandor}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#17231B]">
                        {formatNumberId(h.tk, 1)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#17231B]">
                        {formatNumberId(h.batang, 0)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#16823B]">
                        {h.batangPerTk > 0 ? formatNumberId(h.batangPerTk, 0) : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Sticky Footer Total Histori */}
              {selectedLocation && processedHistori.length > 0 && (
                <tfoot className="bg-[#EAF3EC] text-[#17231B] font-bold border-t-2 border-[#CBE0D1] sticky bottom-0 z-10 shadow-xs">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 text-[#16823B] uppercase text-[11px]">
                      TOTAL ({totalHistori.count} BARIS HISTORI)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatNumberId(totalHistori.tk, 1)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatNumberId(totalHistori.batang, 0)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-[#16823B]">
                      {totalHistori.batangPerTk > 0 ? formatNumberId(totalHistori.batangPerTk, 0) : "-"}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
