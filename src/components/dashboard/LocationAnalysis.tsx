"use client";

import { useState, useEffect, useRef } from "react";
import { LocationData, LocationFilter } from "@/types/dashboard";
import {
  MapPin,
  CheckCircle2,
  ChevronDown,
  Check,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";

interface LocationAnalysisProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  locationFilters: LocationFilter;
  onFilterChange: (filters: LocationFilter) => void;
  onSelectLocation: (location: LocationData) => void;
  loading?: boolean;
}

const ALL_UMUR = Array.from({ length: 22 }, (_, i) => i);
const ALL_WILAYAH = ["AW01", "AW02", "AW03", "AW04", "AW05", "AW06", "AW07"];

const parseSelectedUmur = (val: number | number[] | string | string[]): number[] => {
  if (Array.isArray(val)) return val.map(Number).filter((n) => !isNaN(n));
  if (typeof val === "number") return [val];
  if (!val || val === "all") return ALL_UMUR;
  return String(val).split(",").map(Number).filter((n) => !isNaN(n));
};

const parseSelectedWilayah = (val: string | string[]): string[] => {
  if (Array.isArray(val)) return val;
  if (!val || val === "all") return ALL_WILAYAH;
  return val.split(",").map((s) => s.trim()).filter(Boolean);
};

export default function LocationAnalysis({
  locations,
  selectedLocation,
  locationFilters,
  onFilterChange,
  onSelectLocation,
  loading,
}: LocationAnalysisProps) {
  const [tempUmur, setTempUmur] = useState<number[]>(
    parseSelectedUmur(locationFilters.umur)
  );
  const [tempWilayah, setTempWilayah] = useState<string[]>(
    parseSelectedWilayah(locationFilters.wilayah)
  );

  const [isUmurPopoverOpen, setIsUmurPopoverOpen] = useState<boolean>(false);
  const [isWilayahPopoverOpen, setIsWilayahPopoverOpen] = useState<boolean>(false);
  
  const umurPopoverRef = useRef<HTMLDivElement>(null);
  const wilayahPopoverRef = useRef<HTMLDivElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Reset pagination to page 1 whenever locations data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [locations]);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (umurPopoverRef.current && !umurPopoverRef.current.contains(event.target as Node)) {
        setIsUmurPopoverOpen(false);
      }
      if (wilayahPopoverRef.current && !wilayahPopoverRef.current.contains(event.target as Node)) {
        setIsWilayahPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keep local temp filters synced if prop changes externally
  useEffect(() => {
    setTempUmur(parseSelectedUmur(locationFilters.umur));
    setTempWilayah(parseSelectedWilayah(locationFilters.wilayah));
  }, [locationFilters]);

  // Handle Umur Checkboxes
  const handleToggleUmur = (u: number) => {
    setTempUmur((prev) =>
      prev.includes(u) ? prev.filter((item) => item !== u) : [...prev, u]
    );
  };

  const handleToggleSelectAllUmur = () => {
    if (tempUmur.length === ALL_UMUR.length) {
      setTempUmur([]);
    } else {
      setTempUmur([...ALL_UMUR]);
    }
  };

  // Handle Wilayah Checkboxes
  const handleToggleWilayah = (w: string) => {
    setTempWilayah((prev) =>
      prev.includes(w) ? prev.filter((item) => item !== w) : [...prev, w]
    );
  };

  const handleToggleSelectAllWilayah = () => {
    if (tempWilayah.length === ALL_WILAYAH.length) {
      setTempWilayah([]);
    } else {
      setTempWilayah([...ALL_WILAYAH]);
    }
  };

  // Apply Filter Handler
  const handleApply = () => {
    setIsUmurPopoverOpen(false);
    setIsWilayahPopoverOpen(false);
    onFilterChange({
      umur: tempUmur.length === ALL_UMUR.length ? "all" : tempUmur,
      wilayah: tempWilayah.length === ALL_WILAYAH.length ? "all" : tempWilayah,
    });
  };

  // Excel Export Handler
  const handleDownloadExcel = () => {
    if (!locations || locations.length === 0) return;

    const exportData = locations.map((loc) => ({
      "Kode Lokasi": loc.lokasi,
      "Wilayah": loc.wilayah,
      "Umur Tanaman (Bulan)": loc.umur,
      "Cost / Ha (Rp)": loc.costHa,
      "Luas Area (Ha)": loc.luas,
      "Total Biaya Cost (Rp)": loc.cost,
      "Jenis Bibit": loc.jenisBibit,
      "Kelas Bibit": loc.kelas,
      "Status Block": loc.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Analisis Lokasi");

    // Auto-fit column widths
    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 22 },
      { wch: 18 },
      { wch: 15 },
      { wch: 22 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    const todayStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Data_Analisis_Lokasi_WIP_ACC_${todayStr}.xlsx`);
  };

  // Labels for dropdown buttons
  const umurLabel =
    tempUmur.length === ALL_UMUR.length
      ? "Semua Umur"
      : tempUmur.length === 0
      ? "Tidak Ada"
      : tempUmur.length === 1
      ? `${tempUmur[0]} Bulan`
      : `${tempUmur.length} Umur`;

  const wilayahLabel =
    tempWilayah.length === ALL_WILAYAH.length
      ? "Semua Wilayah"
      : tempWilayah.length === 0
      ? "Tidak Ada"
      : tempWilayah.length === 1
      ? tempWilayah[0]
      : `${tempWilayah.length} Wilayah`;

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(locations.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLocations = locations.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div id="location-analysis-section" className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs scroll-mt-24">
      {/* Header & Sub-Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B]">Analisis Lokasi</h3>
            <p className="text-xs text-[#5F6B63]">Pilih salah satu baris lokasi untuk melihat rincian Group Cost</p>
          </div>
        </div>

        {/* Checkbox Sub-Filters & Terapkan & Download Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Umur Checklist Popover */}
          <div className="relative" ref={umurPopoverRef}>
            <button
              onClick={() => {
                setIsUmurPopoverOpen(!isUmurPopoverOpen);
                setIsWilayahPopoverOpen(false);
              }}
              className="bg-[#F7F9F7] border border-[#DDE5DF] hover:border-[#16823B] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#17231B] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-[#16823B]" />
              <span>Umur: <strong>{umurLabel}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5F6B63]" />
            </button>

            {/* Umur Popover Content */}
            {isUmurPopoverOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-1 z-30 w-56 bg-white border border-[#DDE5DF] rounded-xl shadow-xl p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DF]">
                  <span className="text-xs font-bold text-[#17231B] uppercase tracking-wider">Pilih Umur</span>
                  <button
                    onClick={handleToggleSelectAllUmur}
                    className="text-[11px] font-bold text-[#16823B] hover:underline cursor-pointer"
                  >
                    {tempUmur.length === ALL_UMUR.length ? "Hapus Semua" : "Pilih Semua"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {ALL_UMUR.map((u) => {
                    const isChecked = tempUmur.includes(u);
                    return (
                      <label
                        key={u}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F7F9F7] cursor-pointer text-xs transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleUmur(u)}
                          className="w-4 h-4 rounded text-[#16823B] focus:ring-[#16823B] border-[#DDE5DF] accent-[#16823B] cursor-pointer"
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
          <div className="relative" ref={wilayahPopoverRef}>
            <button
              onClick={() => {
                setIsWilayahPopoverOpen(!isWilayahPopoverOpen);
                setIsUmurPopoverOpen(false);
              }}
              className="bg-[#F7F9F7] border border-[#DDE5DF] hover:border-[#16823B] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#17231B] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-[#16823B]" />
              <span>Wilayah: <strong>{wilayahLabel}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5F6B63]" />
            </button>

            {/* Wilayah Popover Content */}
            {isWilayahPopoverOpen && (
              <div className="absolute right-0 mt-1 z-30 w-56 bg-white border border-[#DDE5DF] rounded-xl shadow-xl p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DF]">
                  <span className="text-xs font-bold text-[#17231B] uppercase tracking-wider">Pilih Wilayah</span>
                  <button
                    onClick={handleToggleSelectAllWilayah}
                    className="text-[11px] font-bold text-[#16823B] hover:underline cursor-pointer"
                  >
                    {tempWilayah.length === ALL_WILAYAH.length ? "Hapus Semua" : "Pilih Semua"}
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                  {ALL_WILAYAH.map((w) => {
                    const isChecked = tempWilayah.includes(w);
                    return (
                      <label
                        key={w}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#F7F9F7] cursor-pointer text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleWilayah(w)}
                            className="w-4 h-4 rounded text-[#16823B] focus:ring-[#16823B] border-[#DDE5DF] accent-[#16823B] cursor-pointer"
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

          {/* Terapkan Filter Button */}
          <button
            onClick={handleApply}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#16823B] hover:bg-[#0B6B32] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Terapkan</span>
          </button>

          {/* Download Excel Button */}
          <button
            onClick={handleDownloadExcel}
            disabled={!locations || locations.length === 0}
            title="Download data tabel lokasi ke file Excel"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 ml-1"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      {/* Table & Pagination Content */}
      {loading ? (
        <div className="py-12 flex flex-col justify-center items-center">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-[#5F6B63]">Memuat data lokasi...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="p-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
          <p className="text-sm font-semibold text-[#5F6B63]">Tidak ada hasil filter lokasi</p>
          <p className="text-xs text-[#89938D] mt-1">Coba sesuaikan filter utama atau filter umur/wilayah di atas.</p>
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
                  <th className="py-3 px-4 text-right">Cost / Ha</th>
                  <th className="py-3 px-4 text-right">Luas (Ha)</th>
                  <th className="py-3 px-4 text-right">Total Cost</th>
                  <th className="py-3 px-4">Jenis Bibit</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4 text-center">Status Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]/60">
                {paginatedLocations.map((item) => {
                  const isSelected = selectedLocation?.idLokasi === item.idLokasi;
                  return (
                    <tr
                      key={item.idLokasi}
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
                      <td className="py-3 px-4">{item.wilayah}</td>
                      <td className="py-3 px-4">{item.umur} Bln</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        Rp {item.costHa.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{item.luas}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#16823B] font-bold">
                        Rp {item.cost.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">{item.jenisBibit}</td>
                      <td className="py-3 px-4">{item.kelas}</td>
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

          {/* Pagination Controls (Max 10 per page) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-[#DDE5DF]/80 text-xs text-[#5F6B63]">
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
