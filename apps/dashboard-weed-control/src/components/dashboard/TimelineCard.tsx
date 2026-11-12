"use client";

import React, { useState, useEffect } from "react";
import { TimelineItem, LocationItem } from "@/types/dashboard";
import {
  Clock,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Search,
  ExternalLink,
  AlertCircle,
  FlaskConical,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  formatCurrencyRp,
  formatDecimal2,
  formatDateShort,
} from "@/lib/formatters";

interface TimelineCardProps {
  selectedLocation: LocationItem | null;
  timeline: TimelineItem[];
  onOpenMaterialModal: (timelineId: string) => void;
  loading?: boolean;
}

export default function TimelineCard({
  selectedLocation,
  timeline,
  onOpenMaterialModal,
  loading,
}: TimelineCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination on location change
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
  }, [selectedLocation]);

  if (!selectedLocation) {
    return (
      <div className="bg-white border border-dashed border-[#DDE5DF] rounded-2xl p-6 text-center shadow-xs">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-2.5 rounded-full bg-[#F7F9F7] text-[#89938D] border border-[#DDE5DF]">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-[#5F6B63]">
            Pilih salah satu baris lokasi pada tabel{" "}
            <strong className="text-[#16823B]">List Lokasi</strong> untuk melihat riwayat aktivitas dan aplikasi material.
          </p>
        </div>
      </div>
    );
  }

  // Client-side search filtering
  const filteredTimeline = timeline.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.aktivitas.toLowerCase().includes(q) ||
      (item.uom && item.uom.toLowerCase().includes(q)) ||
      (item.tanggalRealisasi && item.tanggalRealisasi.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredTimeline.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTimeline = filteredTimeline.slice(startIndex, startIndex + itemsPerPage);

  const handleDownloadExcel = () => {
    if (!filteredTimeline || filteredTimeline.length === 0) return;

    const exportData = filteredTimeline.map((item) => ({
      Lokasi: item.lokasi,
      Aktivitas: item.aktivitas,
      "Tanggal Realisasi": formatDateShort(item.tanggalRealisasi),
      "Umur (Bln)": item.umur,
      Hasil: item.hasil ?? "-",
      UoM: item.uom || "-",
      TK: item.tk ?? "-",
      "Kapasitas/TK": item.kapasitasPerTk ?? "-",
      "Total Cost (Rp)": item.totalCost ?? "-",
      "Upah (Rp)": item.upah ?? "-",
      "Charge (Rp)": item.charge ?? "-",
      "Material (Rp)": item.material ?? "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timeline Weed Control");

    const todayStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Timeline_Weed_Control_${selectedLocation.lokasi}_${todayStr}.xlsx`);
  };

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDE5DF]/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base sm:text-lg text-[#17231B]">
                Timeline Aktivitas & Aplikasi Lapangan
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3EC] text-[#16823B] font-bold text-xs border border-[#CBE0D1]">
                Lokasi: {selectedLocation.lokasi}
              </span>
            </div>
            <p className="text-xs text-[#5F6B63] mt-0.5">
              Riwayat lengkap aplikasi lapangan, tenaga kerja, upah, charge, dan pemakaian bahan kimia
            </p>
          </div>
        </div>

        {/* Search & Export Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#89938D]" />
            <input
              type="text"
              placeholder="Cari aktivitas..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#17231B] placeholder-[#89938D] focus:outline-none focus:border-[#16823B] w-36 sm:w-44 transition-colors"
            />
          </div>

          <button
            onClick={handleDownloadExcel}
            disabled={filteredTimeline.length === 0}
            title="Download data timeline ke Excel"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Table Area */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold text-[#5F6B63]">Memuat riwayat timeline...</p>
        </div>
      ) : filteredTimeline.length === 0 ? (
        <div className="py-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
          <p className="text-xs text-[#5F6B63]">
            {searchQuery
              ? "Tidak ada transaksi yang cocok dengan pencarian."
              : "Belum ada riwayat aktivitas untuk lokasi ini."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                <tr>
                  <th className="py-2.5 px-3">Aktivitas</th>
                  <th className="py-2.5 px-3">Tgl Realisasi</th>
                  <th className="py-2.5 px-3 text-center">Umur</th>
                  <th className="py-2.5 px-3 text-right">Hasil</th>
                  <th className="py-2.5 px-3 text-center">UoM</th>
                  <th className="py-2.5 px-3 text-right">TK</th>
                  <th className="py-2.5 px-3 text-right">Kapasitas/TK</th>
                  <th className="py-2.5 px-3 text-right">Total Cost</th>
                  <th className="py-2.5 px-3 text-right">Upah</th>
                  <th className="py-2.5 px-3 text-right">Charge</th>
                  <th className="py-2.5 px-3 text-right">Material</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]/60">
                {paginatedTimeline.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F9F7] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#17231B]">
                      {item.aktivitas}
                    </td>
                    <td className="py-2.5 px-3 text-[#5F6B63]">
                      {formatDateShort(item.tanggalRealisasi)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-medium">
                      {item.umur !== null && item.umur !== undefined ? `${item.umur} Bln` : "-"}
                    </td>
                    {/* Hasil: 2 decimal places, tooltip raw value, 0 as - */}
                    <td
                      className="py-2.5 px-3 text-right font-mono text-[#17231B]"
                      title={item.hasil !== null ? `Nilai asli: ${item.hasil}` : undefined}
                    >
                      {formatDecimal2(item.hasil)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#5F6B63]">{item.uom || "-"}</td>
                    {/* TK: 2 decimal places, tooltip raw value, 0 as - */}
                    <td
                      className="py-2.5 px-3 text-right font-mono text-[#17231B]"
                      title={item.tk !== null ? `Nilai asli: ${item.tk}` : undefined}
                    >
                      {formatDecimal2(item.tk)}
                    </td>
                    {/* Kapasitas/TK: 2 decimal places, tooltip raw value, 0 as - */}
                    <td
                      className="py-2.5 px-3 text-right font-mono text-[#17231B]"
                      title={
                        item.kapasitasPerTk !== null
                          ? `Nilai asli: ${item.kapasitasPerTk}`
                          : undefined
                      }
                    >
                      {formatDecimal2(item.kapasitasPerTk)}
                    </td>
                    {/* Total Cost: Rupiah, 0 as - */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#17231B]">
                      {formatCurrencyRp(item.totalCost)}
                    </td>
                    {/* Upah: Rupiah, 0 as - */}
                    <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">
                      {formatCurrencyRp(item.upah)}
                    </td>
                    {/* Charge: Rupiah, 0 as - */}
                    <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">
                      {formatCurrencyRp(item.charge)}
                    </td>
                    {/* Material: Clickable if hasMaterials is true! */}
                    <td className="py-2.5 px-3 text-right font-mono">
                      {item.hasMaterials ? (
                        <button
                          onClick={() => onOpenMaterialModal(item.id)}
                          title="Klik untuk melihat rincian bahan kimia & material"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#16823B]/10 hover:bg-[#16823B] text-[#16823B] hover:text-white font-bold transition-all cursor-pointer group"
                        >
                          <FlaskConical className="w-3 h-3 text-[#16823B] group-hover:text-white" />
                          <span>{formatCurrencyRp(item.material)}</span>
                        </button>
                      ) : (
                        <span className="text-[#5F6B63]">
                          {formatCurrencyRp(item.material)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#DDE5DF]/80 text-xs text-[#5F6B63]">
            <span>
              Menampilkan <strong className="text-[#17231B]">{startIndex + 1}</strong> -{" "}
              <strong className="text-[#17231B]">
                {Math.min(startIndex + itemsPerPage, filteredTimeline.length)}
              </strong>{" "}
              dari <strong className="text-[#16823B] font-bold">{filteredTimeline.length}</strong> transaksi
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

