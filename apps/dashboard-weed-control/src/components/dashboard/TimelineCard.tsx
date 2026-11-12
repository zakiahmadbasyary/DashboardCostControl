"use client";

import React, { useState, useEffect } from "react";
import { TimelineItem, LocationItem } from "@/types/dashboard";
import {
  Clock,
  Search,
  AlertCircle,
  FlaskConical,
} from "lucide-react";
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

  // Reset search on location change
  useEffect(() => {
    setSearchQuery("");
  }, [selectedLocation]);

  // Sort timeline by date ascending (terkecil ke terbesar / tanggal terlama ke terbaru)
  const sortedTimeline = React.useMemo(() => {
    return [...timeline].sort((a, b) => {
      if (!a.tanggalRealisasi && !b.tanggalRealisasi) return 0;
      if (!a.tanggalRealisasi) return 1;
      if (!b.tanggalRealisasi) return -1;
      const dateA = new Date(a.tanggalRealisasi).getTime();
      const dateB = new Date(b.tanggalRealisasi).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return Number(a.id) - Number(b.id);
    });
  }, [timeline]);

  // Client-side search filtering
  const filteredTimeline = React.useMemo(() => {
    if (!searchQuery.trim()) return sortedTimeline;
    const q = searchQuery.toLowerCase();
    return sortedTimeline.filter((item) => {
      return (
        item.aktivitas.toLowerCase().includes(q) ||
        (item.uom && item.uom.toLowerCase().includes(q)) ||
        (item.tanggalRealisasi && item.tanggalRealisasi.toLowerCase().includes(q))
      );
    });
  }, [sortedTimeline, searchQuery]);

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
              <h3 className="font-bold text-base md:text-md text-[#17231B]">
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

        {/* Search Input Box */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#89938D]" />
            <input
              type="text"
              placeholder="Cari aktivitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#17231B] placeholder-[#89938D] focus:outline-none focus:border-[#16823B] w-48 sm:w-56 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Table Area (Maksimal 8 data tampak, selebihnya scroll vertikal) */}
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
          <div className="overflow-x-auto rounded-xl border border-[#DDE5DF] max-h-[350px] overflow-y-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
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
                {filteredTimeline.map((item) => (
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
                    {/* Hasil */}
                    <td
                      className="py-2.5 px-3 text-right font-mono text-[#17231B]"
                      title={item.hasil !== null ? `Nilai asli: ${item.hasil}` : undefined}
                    >
                      {formatDecimal2(item.hasil)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#5F6B63]">{item.uom || "-"}</td>
                    {/* TK */}
                    <td
                      className="py-2.5 px-3 text-right font-mono text-[#17231B]"
                      title={item.tk !== null ? `Nilai asli: ${item.tk}` : undefined}
                    >
                      {formatDecimal2(item.tk)}
                    </td>
                    {/* Kapasitas/TK */}
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
                    {/* Total Cost */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#17231B]">
                      {formatCurrencyRp(item.totalCost)}
                    </td>
                    {/* Upah */}
                    <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">
                      {formatCurrencyRp(item.upah)}
                    </td>
                    {/* Charge */}
                    <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">
                      {formatCurrencyRp(item.charge)}
                    </td>
                    {/* Material: Hanya bisa dipencet jika ada nilainya (> 0 dan hasMaterials true), jika "-" maka tetap text biasa "-" */}
                    <td className="py-2.5 px-3 text-right font-mono">
                      {item.hasMaterials && typeof item.material === "number" && item.material > 0 ? (
                        <button
                          onClick={() => onOpenMaterialModal(item.id)}
                          title="Klik untuk melihat rincian bahan kimia & material"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#16823B]/10 hover:bg-[#16823B] text-[#16823B] hover:text-white font-bold transition-all cursor-pointer group"
                        >
                          <FlaskConical className="w-3 h-3 text-[#16823B] group-hover:text-white" />
                          <span>{formatCurrencyRp(item.material)}</span>
                        </button>
                      ) : (
                        <span className="text-[#5F6B63]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Summary Footer */}
          <div className="flex items-center justify-between text-xs text-[#5F6B63] pt-2 border-t border-[#DDE5DF]/80">
            <span>
              Menampilkan <strong className="text-[#16823B] font-bold">{filteredTimeline.length}</strong> transaksi
            </span>
            {filteredTimeline.length > 8 && (
              <span className="text-[11px] text-[#89938D]">
                * Scroll ke bawah pada tabel untuk melihat data lainnya
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
