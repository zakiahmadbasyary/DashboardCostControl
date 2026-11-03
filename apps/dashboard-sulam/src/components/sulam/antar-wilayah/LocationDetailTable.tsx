"use client";

import React, { useState } from "react";
import { Table as TableIcon, Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { formatNumberId, formatRatioId } from "@/lib/formatters";

interface LocationItem {
  wilayah: string;
  lokasi: string;
  tk: number;
  batang: number;
  ha: number;
  batangTk: number | null;
}

interface LocationDetailTableProps {
  locations: LocationItem[];
  totalCount: number;
  locationTotal: any;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  sortBy: string;
  sortDir: "asc" | "desc";
  onSortChange: (column: string) => void;
  monthName: string;
  loading?: boolean;
}

export default function LocationDetailTable({
  locations,
  totalCount,
  locationTotal,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  searchQuery,
  onSearchChange,
  sortBy,
  sortDir,
  onSortChange,
  monthName,
  loading,
}: LocationDetailTableProps) {
  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 text-[#89938D] opacity-60 inline ml-1" />;
    }
    return (
      <span className="text-[#16823B] font-black inline ml-1">
        {sortDir === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs space-y-4">
      {/* Header Tabel */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-[#16823B]" />
            <h2 className="text-base font-black text-[#17231B] tracking-tight">
              Bagian 3: Tabel Detail Seluruh Lokasi --- {monthName}
            </h2>
          </div>
          <p className="text-xs text-[#5F6B63] mt-0.5">
            Agregasi detail per kombinasi wilayah dan lokasi di PG1 (AW01--AW07) pada bulan {monthName}.
          </p>
        </div>

        {/* Pencarian Lokasi */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-[#5F6B63] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari lokasi / wilayah..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] text-xs font-medium text-[#17231B] placeholder:text-[#89938D] focus:bg-white focus:outline-[#16823B] transition-all"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="border border-[#DDE5DF] rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#F8FAF9] text-[#17231B] font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
              <tr>
                <th
                  onClick={() => onSortChange("wilayah")}
                  className="px-4 py-3 cursor-pointer hover:bg-[#F0F5F2] transition-colors select-none"
                >
                  Wilayah {renderSortIndicator("wilayah")}
                </th>
                <th
                  onClick={() => onSortChange("lokasi")}
                  className="px-4 py-3 cursor-pointer hover:bg-[#F0F5F2] transition-colors select-none"
                >
                  Lokasi {renderSortIndicator("lokasi")}
                </th>
                <th
                  onClick={() => onSortChange("tk")}
                  className="px-4 py-3 text-right cursor-pointer hover:bg-[#F0F5F2] transition-colors select-none"
                >
                  Tenaga Kerja (TK) {renderSortIndicator("tk")}
                </th>
                <th
                  onClick={() => onSortChange("batang")}
                  className="px-4 py-3 text-right cursor-pointer hover:bg-[#F0F5F2] transition-colors select-none"
                >
                  Batang Bibit {renderSortIndicator("batang")}
                </th>
                <th
                  onClick={() => onSortChange("ha")}
                  className="px-4 py-3 text-right cursor-pointer hover:bg-[#F0F5F2] transition-colors select-none"
                >
                  Luas (HA) {renderSortIndicator("ha")}
                </th>
                <th
                  onClick={() => onSortChange("batangTk")}
                  className="px-4 py-3 text-right cursor-pointer hover:bg-[#F0F5F2] transition-colors select-none text-[#16823B]"
                >
                  Batang / TK {renderSortIndicator("batangTk")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF] font-medium text-[#17231B]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#5F6B63]">
                    Memuat data detail lokasi...
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#5F6B63]">
                    Tidak ada lokasi yang ditemukan pada bulan {monthName}.
                  </td>
                </tr>
              ) : (
                locations.map((item, idx) => (
                  <tr key={`${item.wilayah}-${item.lokasi}-${idx}`} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="px-4 py-2.5 font-bold text-[#16823B]">{item.wilayah}</td>
                    <td className="px-4 py-2.5 font-mono font-semibold">{item.lokasi}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{formatNumberId(item.tk, 1)}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{formatNumberId(item.batang, 0)}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{formatNumberId(item.ha, 2)}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-[#16823B]">
                      {item.batangTk !== null ? formatRatioId(item.batangTk, 1) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Total Row */}
            {locationTotal && (
              <tfoot className="bg-[#EAF3EC] font-bold text-[#17231B] border-t-2 border-[#CBE0D1] sticky bottom-0">
                <tr>
                  <td colSpan={2} className="px-4 py-3 font-black uppercase tracking-wider">
                    TOTAL KESELURUHAN LOKASI
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumberId(locationTotal.tk, 1)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumberId(locationTotal.batang, 0)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNumberId(locationTotal.ha, 2)}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-[#16823B]">
                    {locationTotal.batangTk !== null ? formatRatioId(locationTotal.batangTk, 1) : "-"}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#5F6B63] pt-1">
        <span>
          Menampilkan <strong className="text-[#17231B]">{locations.length}</strong> dari total{" "}
          <strong className="text-[#17231B]">{totalCount}</strong> lokasi
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-[#DDE5DF] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2 font-bold text-[#17231B]">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-[#DDE5DF] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

