"use client";

import React, { useState, useEffect, useRef } from "react";
import { LocationItem } from "@/types/dashboard";
import {
  MapPin,
  CheckCircle2,
  ChevronDown,
  Check,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Search,
  RotateCcw,
} from "lucide-react";
import * as XLSX from "xlsx";
import { formatCurrencyRp, formatDecimal2 } from "@/lib/formatters";

interface LocationListCardProps {
  locations: LocationItem[];
  selectedLocation: LocationItem | null;
  onSelectLocation: (location: LocationItem) => void;
  umurList: number[];
  wilayahList: string[];
  selectedUmur: number[] | "all";
  selectedWilayah: string[] | "all";
  onFilterChange: (filters: {
    umur: number[] | "all";
    wilayah: string[] | "all";
    search: string;
  }) => void;
  loading?: boolean;
}

export default function LocationListCard({
  locations,
  selectedLocation,
  onSelectLocation,
  umurList,
  wilayahList,
  selectedUmur,
  selectedWilayah,
  onFilterChange,
  loading,
}: LocationListCardProps) {
  // Local state for filter popovers
  const [tempUmur, setTempUmur] = useState<number[]>(
    selectedUmur === "all" ? umurList : selectedUmur
  );
  const [tempWilayah, setTempWilayah] = useState<string[]>(
    selectedWilayah === "all" ? wilayahList : selectedWilayah
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isUmurOpen, setIsUmurOpen] = useState(false);
  const [isWilayahOpen, setIsWilayahOpen] = useState(false);

  const umurRef = useRef<HTMLDivElement>(null);
  const wilayahRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Sync temp state with props
  useEffect(() => {
    setTempUmur(selectedUmur === "all" ? umurList : selectedUmur);
  }, [selectedUmur, umurList]);

  useEffect(() => {
    setTempWilayah(selectedWilayah === "all" ? wilayahList : selectedWilayah);
  }, [selectedWilayah, wilayahList]);

  // Reset pagination on locations change
  useEffect(() => {
    setCurrentPage(1);
  }, [locations]);

  // Handle outside click for popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (umurRef.current && !umurRef.current.contains(e.target as Node)) {
        setIsUmurOpen(false);
      }
      if (wilayahRef.current && !wilayahRef.current.contains(e.target as Node)) {
        setIsWilayahOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleUmur = (u: number) => {
    setTempUmur((prev) =>
      prev.includes(u) ? prev.filter((item) => item !== u) : [...prev, u]
    );
  };

  const handleToggleAllUmur = () => {
    if (tempUmur.length === umurList.length) {
      setTempUmur([]);
    } else {
      setTempUmur([...umurList]);
    }
  };

  const handleToggleWilayah = (w: string) => {
    setTempWilayah((prev) =>
      prev.includes(w) ? prev.filter((item) => item !== w) : [...prev, w]
    );
  };

  const handleToggleAllWilayah = () => {
    if (tempWilayah.length === wilayahList.length) {
      setTempWilayah([]);
    } else {
      setTempWilayah([...wilayahList]);
    }
  };

  const handleApply = () => {
    setIsUmurOpen(false);
    setIsWilayahOpen(false);
    onFilterChange({
      umur: tempUmur.length === umurList.length ? "all" : tempUmur,
      wilayah: tempWilayah.length === wilayahList.length ? "all" : tempWilayah,
      search: searchQuery.trim(),
    });
  };

  const handleResetLocal = () => {
    setTempUmur([...umurList]);
    setTempWilayah([...wilayahList]);
    setSearchQuery("");
    setIsUmurOpen(false);
    setIsWilayahOpen(false);
    onFilterChange({
      umur: "all",
      wilayah: "all",
      search: "",
    });
  };

  const handleDownloadExcel = () => {
    if (!locations || locations.length === 0) return;

    const exportData = locations.map((loc) => ({
      "Kode Lokasi": loc.lokasi,
      Wilayah: loc.wilayah,
      "Umur (Bulan)": loc.umur,
      "Cost / Ha (Rp)": loc.costHa,
      "Luas (Ha)": loc.luas,
      Status: loc.status,
      "Jenis Bibit": loc.jenis,
      "Kelas Bibit": loc.kelas,
      "Total Cost (Rp)": loc.totalCost,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "List Lokasi Weed Control");

    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 14 },
      { wch: 18 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
    ];

    const todayStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `List_Lokasi_Weed_Control_${todayStr}.xlsx`);
  };

  const umurLabel =
    tempUmur.length === umurList.length
      ? "Semua Umur"
      : tempUmur.length === 0
      ? "Tidak Ada"
      : tempUmur.length === 1
      ? `${tempUmur[0]} Bulan`
      : `${tempUmur.length} Umur`;

  const wilayahLabel =
    tempWilayah.length === wilayahList.length
      ? "Semua Wilayah"
      : tempWilayah.length === 0
      ? "Tidak Ada"
      : tempWilayah.length === 1
      ? tempWilayah[0]
      : `${tempWilayah.length} Wilayah`;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(locations.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLocations = locations.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div
      id="location-list-section"
      className="bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-xs scroll-mt-24 flex flex-col gap-4"
    >
      {/* Header & Sub-Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#DDE5DF]/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#17231B]">
              List Lokasi per Wilayah
            </h3>
            <p className="text-xs text-[#5F6B63] mt-0.5">
              Pilih salah satu baris lokasi untuk melihat rincian detail, aktivitas, dan riwayat timeline.{" "}
              <span className="font-semibold text-[#16823B]">
                * Seluruh nilai disajikan dalam Rupiah (Rp)
              </span>
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#89938D]" />
            <input
              type="text"
              placeholder="Cari lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              className="bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#17231B] placeholder-[#89938D] focus:outline-none focus:border-[#16823B] w-32 sm:w-36 transition-colors"
            />
          </div>

          {/* Umur Checklist Popover */}
          <div className="relative" ref={umurRef}>
            <button
              onClick={() => {
                setIsUmurOpen(!isUmurOpen);
                setIsWilayahOpen(false);
              }}
              className="bg-[#F7F9F7] border border-[#DDE5DF] hover:border-[#16823B] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#17231B] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-[#16823B]" />
              <span>
                Umur: <strong>{umurLabel}</strong>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5F6B63]" />
            </button>

            {isUmurOpen && (
              <div className="absolute right-0 sm:left-0 mt-1 z-30 w-56 bg-white border border-[#DDE5DF] rounded-xl shadow-xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DF]">
                  <span className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
                    Pilih Umur
                  </span>
                  <button
                    onClick={handleToggleAllUmur}
                    className="text-[11px] font-bold text-[#16823B] hover:underline cursor-pointer"
                  >
                    {tempUmur.length === umurList.length ? "Hapus Semua" : "Pilih Semua"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                  {umurList.map((u) => {
                    const isChecked = tempUmur.includes(u);
                    return (
                      <label
                        key={u}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F7F9F7] cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleUmur(u)}
                          className="w-3.5 h-3.5 rounded text-[#16823B] focus:ring-[#16823B] border-[#DDE5DF] accent-[#16823B] cursor-pointer"
                        />
                        <span className="font-semibold text-[#17231B]">{u} Bulan</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Wilayah Checklist Popover */}
          <div className="relative" ref={wilayahRef}>
            <button
              onClick={() => {
                setIsWilayahOpen(!isWilayahOpen);
                setIsUmurOpen(false);
              }}
              className="bg-[#F7F9F7] border border-[#DDE5DF] hover:border-[#16823B] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#17231B] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-[#16823B]" />
              <span>
                Wilayah: <strong>{wilayahLabel}</strong>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5F6B63]" />
            </button>

            {isWilayahOpen && (
              <div className="absolute right-0 mt-1 z-30 w-52 bg-white border border-[#DDE5DF] rounded-xl shadow-xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DF]">
                  <span className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
                    Pilih Wilayah
                  </span>
                  <button
                    onClick={handleToggleAllWilayah}
                    className="text-[11px] font-bold text-[#16823B] hover:underline cursor-pointer"
                  >
                    {tempWilayah.length === wilayahList.length ? "Hapus Semua" : "Pilih Semua"}
                  </button>
                </div>

                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                  {wilayahList.map((w) => {
                    const isChecked = tempWilayah.includes(w);
                    return (
                      <label
                        key={w}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#F7F9F7] cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleWilayah(w)}
                            className="w-3.5 h-3.5 rounded text-[#16823B] focus:ring-[#16823B] border-[#DDE5DF] accent-[#16823B] cursor-pointer"
                          />
                          <span className="font-semibold text-[#17231B]">{w}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Terapkan Button */}
          <button
            onClick={handleApply}
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#16823B] hover:bg-[#126B30] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Terapkan</span>
          </button>

          {/* Reset Local Button */}
          <button
            onClick={handleResetLocal}
            title="Reset filter umur dan wilayah lokal"
            className="p-1.5 rounded-lg border border-[#DDE5DF] hover:bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Download Excel */}
          <button
            onClick={handleDownloadExcel}
            disabled={!locations || locations.length === 0}
            title="Download data tabel lokasi ke Excel"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download Excel</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold text-[#5F6B63]">Memuat data lokasi...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="p-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
          <p className="text-sm font-semibold text-[#5F6B63]">Tidak ada lokasi yang cocok</p>
          <p className="text-xs text-[#89938D] mt-1">
            Coba sesuaikan kata kunci pencarian, filter umur, atau filter wilayah di atas.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                <tr>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4">Wilayah</th>
                  <th className="py-3 px-4">Umur</th>
                  <th className="py-3 px-4 text-right">Cost / Ha (Rp)</th>
                  <th className="py-3 px-4 text-right">Luas (Ha)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Jenis Bibit</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4 text-center">Status Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]/60">
                {paginatedLocations.map((item) => {
                  const isSelected = selectedLocation?.lokasi === item.lokasi;
                  return (
                    <tr
                      key={item.lokasi}
                      onClick={() => onSelectLocation(item)}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#A8D437]/20 border-l-4 border-l-[#16823B] font-medium text-[#0B6B32]"
                          : "hover:bg-[#F7F9F7] text-[#17231B]"
                      }`}
                    >
                      <td className="py-3 px-4 font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#16823B]" />
                        {item.lokasi}
                      </td>
                      <td className="py-3 px-4 font-semibold">{item.wilayah}</td>
                      <td className="py-3 px-4">{item.umur} Bln</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#16823B]">
                        {formatCurrencyRp(item.costHa)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {formatDecimal2(item.luas)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-[#16823B]/10 text-[#16823B] font-bold text-[11px] border border-[#16823B]/20">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{item.jenis}</td>
                      <td className="py-3 px-4">{item.kelas}</td>
                      <td className="py-3 px-4 text-center">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#16823B] text-white text-[10px] font-bold shadow-2xs">
                            <CheckCircle2 className="w-3 h-3" /> Selected
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#89938D] hover:text-[#16823B]">
                            Klik pilih
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#DDE5DF]/80 text-xs text-[#5F6B63]">
            <span>
              Menampilkan <strong className="text-[#17231B]">{startIndex + 1}</strong> -{" "}
              <strong className="text-[#17231B]">
                {Math.min(startIndex + itemsPerPage, locations.length)}
              </strong>{" "}
              dari <strong className="text-[#16823B] font-bold">{locations.length}</strong> lokasi
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

