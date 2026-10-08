"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Search,
  AlertCircle,
} from "lucide-react";

export interface PivotedTableRow {
  material: string;
  materialDescription: string;
  group: string;
  baseUnitOfMeasure: string;
  abcIndicator: string;
  months: (number | null)[]; // 12 elements for months 1..12
}

interface MaterialDetailTableCardProps {
  rows: PivotedTableRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function MaterialDetailTableCard({
  rows,
  loading,
  error,
  onRetry,
}: MaterialDetailTableCardProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const formatNumber = (val: number | null) => {
    if (val === null || val === undefined) return "-";
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredRows = rows.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      row.material.toLowerCase().includes(term) ||
      row.materialDescription.toLowerCase().includes(term) ||
      row.group.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs scroll-mt-24 font-sans" suppressHydrationWarning>
      
      {/* 1. Header & Sub-Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 pb-3 border-b border-[#DDE5DF]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B]">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B]">Detail Harga Material</h3>
            <p className="text-xs text-[#5F6B63]">
              Daftar rincian nilai harga material (nilai = price / price_unit) untuk bulan 1 sampai 12.{" "}
              <span className="font-semibold text-[#16823B]">* Seluruh nilai biaya disajikan dalam Rupiah (Rp)</span>
            </p>
          </div>
        </div>

        {/* Table Search Input */}
        <div className="relative min-w-[240px] w-full sm:w-auto">
          <Search className="w-3.5 h-3.5 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari material / deskripsi / group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg focus:outline-none focus:border-[#16823B] focus:bg-white text-[#17231B] font-medium"
          />
        </div>
      </div>

      {/* 2. Pivoted Data Table Container */}
      {loading ? (
        <div className="py-12 flex flex-col justify-center items-center">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-[#5F6B63]">Memuat rincian tabel detail harga material...</p>
        </div>
      ) : error ? (
        <div className="py-10 px-6 text-center bg-red-50 border border-red-200 rounded-xl space-y-3">
          <AlertCircle className="w-7 h-7 mx-auto text-red-600" />
          <p className="text-xs font-bold text-red-700">Gagal memuat tabel detail harga material.</p>
          <button
            onClick={onRetry}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Silakan coba lagi
          </button>
        </div>
      ) : (
        <>
          {/* Scrollable Container showing max ~10 rows vertically with sticky header & frozen columns */}
          <div className="overflow-auto max-h-[480px] rounded-xl border border-[#DDE5DF] relative">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold">
                <tr>
                  {/* Sticky Top-Left Corner Column 1: Deskripsi (Frozen on sm+ desktop only) */}
                  <th className="py-3 px-4 sticky top-0 bg-[#F7F9F7] z-30 min-w-[200px] border-b border-[#DDE5DF] sm:left-0 sm:z-40 sm:min-w-[240px] sm:border-r sm:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]">
                    Deskripsi
                  </th>
                  {/* Column 2: Material (Sticky top only, not left-frozen) */}
                  <th className="py-3 px-4 sticky top-0 bg-[#F7F9F7] z-30 border-b border-[#DDE5DF] min-w-[140px]">
                    Material
                  </th>
                  {/* Sticky Top Headers for rest of columns */}
                  <th className="py-3 px-4 sticky top-0 bg-[#F7F9F7] z-30 border-b border-[#DDE5DF] min-w-[120px]">
                    Group
                  </th>
                  <th className="py-3 px-4 sticky top-0 bg-[#F7F9F7] z-30 border-b border-[#DDE5DF] text-center min-w-[70px]">
                    UoM
                  </th>
                  
                  {/* Columns 1 to 12 */}
                  {Array.from({ length: 12 }, (_, i) => (
                    <th
                      key={i + 1}
                      className="py-3 px-3 sticky top-0 bg-[#F7F9F7] z-30 border-b border-[#DDE5DF] text-right min-w-[90px] font-mono"
                    >
                      Bln {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]/60">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="py-10 text-center text-[#89938D] font-medium bg-[#F7F9F7]/50">
                      Tidak ada data material yang sesuai filter/pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const validVals = row.months.filter((v): v is number => v !== null && v !== undefined);
                    const maxVal = validVals.length > 0 ? Math.max(...validVals) : null;

                    return (
                      <tr key={row.material} className="group hover:bg-[#F7F9F7] text-[#17231B] transition-all">
                        {/* Description (Sticky Left Column 1 - Frozen on sm+ desktop only) */}
                        <td className="py-3 px-4 font-semibold text-[#17231B] bg-white group-hover:bg-[#F7F9F7] min-w-[200px] transition-colors sm:sticky sm:left-0 sm:z-10 sm:min-w-[240px] sm:border-r sm:border-[#DDE5DF] sm:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]">
                          {row.materialDescription || "-"}
                        </td>

                        {/* Material Code (Column 2 - Scrollable) */}
                        <td className="py-3 px-4 font-bold font-mono text-[#17231B] min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#16823B] shrink-0" />
                            <span>{row.material}</span>
                          </div>
                        </td>

                        {/* Group */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#16823B] border border-[#A5D6A7] font-semibold text-[11px]">
                            {row.group || "-"}
                          </span>
                        </td>

                        {/* UoM */}
                        <td className="py-3 px-4 text-center font-mono text-[#5F6B63] font-normal">
                          {row.baseUnitOfMeasure || "-"}
                        </td>

                        {/* Monthly Values 1..12 */}
                        {row.months.map((val, monthIdx) => {
                          const isMax = val !== null && maxVal !== null && val === maxVal;
                          return (
                            <td
                              key={monthIdx}
                              className={`py-3 px-3 text-right font-mono ${
                                val === null
                                  ? "text-gray-300 font-light"
                                  : isMax
                                  ? "font-bold text-[#17231B] bg-[#FEFCE8]/80"
                                  : "font-normal text-[#17231B]"
                              }`}
                              title={isMax ? "Nilai Tertinggi Tahun Ini" : undefined}
                            >
                              {formatNumber(val)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 3. Footer Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 pt-3 border-t border-[#DDE5DF]/80 text-xs text-[#5F6B63]">
            <span>
              Menampilkan <strong className="text-[#16823B] font-bold">{filteredRows.length}</strong> material
            </span>
            <span className="text-[11px] text-[#5F6B63] italic">
              * Scroll vertikal & horizontal untuk melihat selengkapnya
            </span>
          </div>
        </>
      )}

    </div>
  );
}
