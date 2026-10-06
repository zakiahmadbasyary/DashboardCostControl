"use client";

import React, { useState } from "react";
import { Table, Search, Download, FileSpreadsheet, RefreshCw, AlertCircle } from "lucide-react";

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
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs space-y-5 font-sans" suppressHydrationWarning>
      
      {/* 1. Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#16823B]/10 text-[#16823B] rounded-xl shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-[#17231B] tracking-tight">
              CARD 2 — DETAIL HARGA MATERIAL
            </h2>
            <p className="text-xs text-[#5F6B63]">
              Daftar rincian nilai harga material (<span className="font-semibold text-[#16823B]">nilai = price / price_unit</span>) untuk bulan 1 sampai 12
            </p>
          </div>
        </div>

        {/* Table Search Input */}
        <div className="relative min-w-[240px] w-full sm:w-auto">
          <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari material / deskripsi / group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl focus:outline-none focus:border-[#16823B] focus:bg-white text-[#17231B] font-medium"
          />
        </div>
      </div>

      {/* 2. Pivoted Data Table Container */}
      {loading ? (
        <div className="py-16 text-center text-[#5F6B63] space-y-3 bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#16823B]" />
          <p className="text-xs font-semibold">Memuat rincian tabel detail harga material...</p>
        </div>
      ) : error ? (
        <div className="py-12 px-6 text-center bg-red-50 border border-red-200 rounded-xl space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
          <p className="text-xs font-bold text-red-700">Gagal memuat tabel detail harga material.</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Silakan coba lagi
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
              <tr>
                <th className="py-3 px-3.5 sticky left-0 bg-[#F7F9F7] z-10 border-r border-[#DDE5DF] min-w-[110px]">
                  Material
                </th>
                <th className="py-3 px-3.5 min-w-[200px]">Deskripsi</th>
                <th className="py-3 px-3.5 min-w-[110px]">Group</th>
                <th className="py-3 px-3.5 text-center min-w-[70px]">UoM</th>
                
                {/* Columns 1 to 12 */}
                {Array.from({ length: 12 }, (_, i) => (
                  <th key={i + 1} className="py-3 px-3 text-right min-w-[75px] font-mono">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF]/70 text-[#17231B]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-[#89938D] font-medium bg-[#F7F9F7]/50">
                    Tidak ada data material.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.material} className="hover:bg-[#F7F9F7] transition-colors">
                    {/* Material Code (Sticky Left Column) */}
                    <td className="py-3 px-3.5 font-bold font-mono text-[#16823B] sticky left-0 bg-white hover:bg-[#F7F9F7] border-r border-[#DDE5DF] z-10">
                      {row.material}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-3.5 font-semibold text-[#17231B]">
                      {row.materialDescription}
                    </td>

                    {/* Group */}
                    <td className="py-3 px-3.5 font-medium text-[#5F6B63]">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-semibold text-[#17231B]">
                        {row.group}
                      </span>
                    </td>

                    {/* UoM */}
                    <td className="py-3 px-3.5 text-center font-mono text-[#5F6B63]">
                      {row.baseUnitOfMeasure}
                    </td>

                    {/* Monthly Values 1..12 */}
                    {row.months.map((val, monthIdx) => (
                      <td
                        key={monthIdx}
                        className={`py-3 px-3 text-right font-mono font-medium ${
                          val !== null ? "text-[#17231B]" : "text-gray-300 font-light"
                        }`}
                      >
                        {formatNumber(val)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#5F6B63] pt-2">
        <span>Menampilkan {filteredRows.length} dari {rows.length} material master.</span>
        <span>* Format nilai dalam Rupiah (Rp) per unit dasar (UoM).</span>
      </div>

    </div>
  );
}
