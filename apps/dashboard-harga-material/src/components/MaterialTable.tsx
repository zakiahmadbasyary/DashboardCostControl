"use client";

import React, { useState, useEffect } from "react";
import { Boxes, ChevronLeft, ChevronRight, CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MaterialItem {
  idMaterial: string;
  kodeMaterial: string;
  namaMaterial: string;
  kategori: string;
  uom: string;
  hargaAcuan: number;
  hargaRealisasi: number;
  deviasiPercent: number;
  statusFluktuasi: "naik" | "turun" | "stabil";
  tglUpdate: string;
  vendorUtama: string;
  spesifikasi: string;
}

interface MaterialTableProps {
  data: MaterialItem[];
  selectedMaterialCode: string | null;
  onSelectMaterial: (item: MaterialItem) => void;
}

export default function MaterialTable({
  data,
  selectedMaterialCode,
  onSelectMaterial,
}: MaterialTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between font-sans" suppressHydrationWarning>
      <div>
        {/* Table Header Controls */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDE5DF]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#17231B]">
                Tabel Master Data &amp; Harga Material Logistik
              </h3>
              <p className="text-xs text-[#5F6B63]">
                Daftar lengkap harga acuan budget vs realisasi pembelian material (Klik baris untuk detail)
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#16823B] bg-[#16823B]/10 px-3 py-1 rounded-xl border border-[#16823B]/20 shrink-0 hidden sm:inline-block">
            Maksimal 20 Baris / Halaman
          </span>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
              <tr>
                <th className="py-2.5 px-3">Kode / Nama Material</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-center">UoM</th>
                <th className="py-2.5 px-3 text-right">Harga Acuan (Rp)</th>
                <th className="py-2.5 px-3 text-right">Harga Realisasi (Rp)</th>
                <th className="py-2.5 px-3 text-right">Selisih (%)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Pilih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#89938D] font-medium">
                    Tidak ada data material yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const isSelected = selectedMaterialCode === item.kodeMaterial;

                  return (
                    <tr
                      key={item.idMaterial}
                      onClick={() => onSelectMaterial(item)}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#A8D437]/20 border-l-4 border-l-[#16823B] font-semibold text-[#0B6B32]"
                          : "hover:bg-[#F7F9F7] text-[#17231B]"
                      }`}
                    >
                      {/* Kode / Nama Material */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#17231B]">{item.namaMaterial}</div>
                        <div className="text-[10px] text-[#5F6B63] font-mono">Kode: {item.kodeMaterial}</div>
                      </td>

                      {/* Kategori */}
                      <td className="py-2.5 px-3 font-semibold text-[#5F6B63]">{item.kategori}</td>

                      {/* UoM */}
                      <td className="py-2.5 px-3 text-center font-bold text-[#2C3830]">{item.uom}</td>

                      {/* Harga Acuan */}
                      <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">
                        {formatCurrency(item.hargaAcuan)}
                      </td>

                      {/* Harga Realisasi */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                        {formatCurrency(item.hargaRealisasi)}
                      </td>

                      {/* Selisih % */}
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold ${
                          item.deviasiPercent > 0 ? "text-red-600" : item.deviasiPercent < 0 ? "text-emerald-700" : "text-gray-700"
                        }`}
                      >
                        {item.deviasiPercent > 0 ? `+${item.deviasiPercent.toFixed(1)}%` : `${item.deviasiPercent.toFixed(1)}%`}
                      </td>

                      {/* Status Fluktuasi */}
                      <td className="py-2.5 px-3 text-center">
                        {item.statusFluktuasi === "naik" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold">
                            <TrendingUp className="w-3 h-3" /> Naik
                          </span>
                        ) : item.statusFluktuasi === "turun" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <TrendingDown className="w-3 h-3" /> Turun
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-[10px] font-bold">
                            <Minus className="w-3 h-3" /> Stabil
                          </span>
                        )}
                      </td>

                      {/* Select Column */}
                      <td className="py-2.5 px-3 text-center">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16823B] text-white text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Terpilih
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#89938D]">Pilih</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="mt-4 pt-3 border-t border-[#DDE5DF] text-xs text-[#5F6B63] flex flex-col sm:flex-row justify-between items-center gap-2" suppressHydrationWarning>
        <span>
          Menampilkan {data.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, data.length)} dari {data.length} material
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5" suppressHydrationWarning>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              suppressHydrationWarning
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white text-[#17231B] hover:bg-[#F7F9F7] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="px-2.5 py-1 text-xs font-bold text-[#16823B] bg-[#16823B]/10 rounded-lg border border-[#16823B]/20" suppressHydrationWarning>
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              suppressHydrationWarning
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white text-[#17231B] hover:bg-[#F7F9F7] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
              title="Halaman Selanjutnya"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
