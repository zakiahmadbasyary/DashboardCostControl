"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { CostCenterSummaryItem } from "@/types/opex";
import { Building2, Search, CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";

interface CostCenterTablesProps {
  data: CostCenterSummaryItem[];
  selectedCostCenter: string | null;
  onSelectCostCenter: (costcenter: string) => void;
  selectedPeriodLabel?: string;
  loading?: boolean;
}

export default function CostCenterTables({
  data,
  selectedCostCenter,
  onSelectCostCenter,
  selectedPeriodLabel,
  loading,
}: CostCenterTablesProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return [...data]
      .filter((item) => {
        // Sembunyikan data jika nilai budget 0 atau tidak ada
        if (!item.budget || item.budget <= 0) {
          return false;
        }

        const q = search.toLowerCase();
        return (
          item.costcenter.toLowerCase().includes(q) ||
          item.deskripsiCostcenter.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const vA = a.variance ?? -Infinity;
        const vB = b.variance ?? -Infinity;
        return vB - vA; // Urutkan variance dari terbesar ke terkecil
      });
  }, [data, search]);

  // Konfigurasi Pagination: 16 data per halaman (8 Kiri + 8 Kanan)
  const PAGE_SIZE = 16;
  const COLUMN_SIZE = 8;
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE) || 1;

  const lastSelectedCostCenterRef = useRef<string | null>(selectedCostCenter);
  const lastPeriodRef = useRef<string | undefined>(selectedPeriodLabel);

  // Sinkronkan halaman pagination HANYA jika costcenter berubah dari luar atau periode berubah
  useEffect(() => {
    const isPeriodChanged = lastPeriodRef.current !== selectedPeriodLabel;
    const isCostCenterChanged = lastSelectedCostCenterRef.current !== selectedCostCenter;

    if (isPeriodChanged) {
      lastPeriodRef.current = selectedPeriodLabel;
    }

    if (isCostCenterChanged) {
      lastSelectedCostCenterRef.current = selectedCostCenter;
    }

    if (isPeriodChanged || isCostCenterChanged) {
      if (!selectedCostCenter) {
        if (isPeriodChanged) setCurrentPage(1);
        return;
      }
      const index = filteredData.findIndex((c) => c.costcenter === selectedCostCenter);
      if (index !== -1) {
        const targetPage = Math.floor(index / PAGE_SIZE) + 1;
        setCurrentPage(targetPage);
      } else if (isPeriodChanged) {
        setCurrentPage(1);
      }
    }
  }, [selectedCostCenter, selectedPeriodLabel, filteredData]);

  // Jaga agar currentPage tidak melebihi totalPages (misal saat search memfilter data)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentSlice = filteredData.slice(startIndex, startIndex + PAGE_SIZE);

  // 8 data di tabel kiri, 8 data di tabel kanan
  const leftItems = currentSlice.slice(0, COLUMN_SIZE);
  const rightItems = currentSlice.slice(COLUMN_SIZE, PAGE_SIZE);

  const getPaginationItems = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage, "...", totalPages];
  };

  const renderSingleTable = (items: CostCenterSummaryItem[], columnIndex: number) => {
    if (items.length === 0) {
      return (
        <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 border border-dashed border-[#DDE5DF] rounded-xl text-center bg-[#F8FAF9]/50">
          <Building2 className="w-8 h-8 text-[#89938D]/40 mb-2" />
          <p className="text-xs font-semibold text-[#5F6B63]">
            Tidak ada data tambahan di kolom ini
          </p>
          <p className="text-[11px] text-[#89938D] mt-0.5">
            Maksimal 8 Cost Center ditampilkan per kolom
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-[#DDE5DF] bg-white shadow-2xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F7F9F7] text-[#17231B] uppercase text-[10px] font-bold border-b border-[#DDE5DF]">
            <tr>
              <th className="py-2.5 px-3">Cost Center</th>
              <th className="py-2.5 px-3 text-right">Actual (Rp)</th>
              <th className="py-2.5 px-3 text-right">Budget (Rp)</th>
              <th className="py-2.5 px-3 text-right">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE5DF]">
            {items.map((row) => {
              const isSelected = row.costcenter === selectedCostCenter;
              const isOver = row.variance !== null && row.variance > 0;

              return (
                <tr
                  key={row.costcenter}
                  onClick={() => onSelectCostCenter(row.costcenter)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#EAF3EC] border-l-4 border-l-[#16823B] font-semibold"
                      : "hover:bg-[#F8FAF9]"
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16823B] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-[#17231B] block">
                          {row.costcenter}
                        </span>
                        <span
                          className="text-[11px] text-[#5F6B63] line-clamp-1"
                          title={row.deskripsiCostcenter}
                        >
                          {row.deskripsiCostcenter}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono whitespace-nowrap ${
                      isOver ? "bg-[#FCE27A]/35 text-[#17231B]" : "text-[#17231B]"
                    }`}
                  >
                    <span className={isSelected ? "font-semibold" : "font-normal"}>
                      {row.actual !== 0 ? row.actual.toLocaleString("id-ID") : "-"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63] whitespace-nowrap">
                    {row.budget !== 0 ? row.budget.toLocaleString("id-ID") : "-"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                    {row.variance !== null && Math.round(row.variance) !== 0 ? (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isOver
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {Math.round(row.variance) > 0
                          ? `+${Math.round(row.variance)}%`
                          : `${Math.round(row.variance)}%`}
                      </span>
                    ) : (
                      <span className="text-[#89938D]">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-sm shadow-[#16823B]/5 flex flex-col gap-5 font-sans">
      {/* ── Unified Card Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DF]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B]">
              Daftar Cost Center PG1 — {selectedPeriodLabel || "Periode Aktif"}
            </h3>
            <p className="text-xs text-[#5F6B63]">
              Pilih salah satu baris Cost Center untuk menelusuri rincian Cost Element & Aktivitas di bawahnya.
            </p>
          </div>
        </div>

        {/* Search Input & Total Badge */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#89938D]" />
            <input
              type="text"
              placeholder="Cari Cost Center..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              suppressHydrationWarning
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-9 pr-7 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors placeholder:text-[#89938D]"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#89938D] hover:text-[#17231B] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <span className="hidden md:inline-block px-2.5 py-1 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-xs font-semibold text-[#2C3830] whitespace-nowrap">
            {filteredData.length} Pusat Biaya
          </span>
        </div>
      </div>

      {/* ── Content (Loading, Empty, or Dual Table 8 Kiri + 8 Kanan) ── */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-7 h-7 border-3 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
          <p className="text-xs font-semibold text-[#5F6B63]">Memuat daftar Cost Center...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#89938D]">
          {search
            ? `Tidak ada Cost Center yang cocok dengan kata kunci "${search}".`
            : "Tidak ada data Cost Center dengan anggaran (budget) aktif pada periode ini."}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Dual Column Tables (8 Kiri + 8 Kanan) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
            {/* Sisi Kiri (Maks 8 Data) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-[#5F6B63] uppercase tracking-wider">
                  Cost Center PG1 (Bagian 1)
                </span>
                <span className="text-[10px] text-[#89938D]">
                  {leftItems.length} dari 8 ditampilkan
                </span>
              </div>
              {renderSingleTable(leftItems, 1)}
            </div>

            {/* Sisi Kanan (Maks 8 Data) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-[#5F6B63] uppercase tracking-wider">
                  Cost Center PG1 (Bagian 2)
                </span>
                <span className="text-[10px] text-[#89938D]">
                  {rightItems.length} dari 8 ditampilkan
                </span>
              </div>
              {renderSingleTable(rightItems, 2)}
            </div>
          </div>

          {/* ── Pagination Footer (Jika data lebih dari 16) ── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#DDE5DF]">
              <div className="text-xs text-[#5F6B63]">
                Menampilkan <strong className="text-[#17231B]">{startIndex + 1}</strong>–
                <strong className="text-[#17231B]">{Math.min(startIndex + PAGE_SIZE, filteredData.length)}</strong> dari{" "}
                <strong className="text-[#17231B]">{filteredData.length}</strong> Cost Center
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-xs font-semibold text-[#17231B] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPaginationItems().map((item, idx) => {
                    if (item === "...") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-7 h-7 flex items-center justify-center text-xs text-[#89938D]"
                        >
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCurrentPage(item as number)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === item
                            ? "bg-[#16823B] text-white shadow-xs"
                            : "bg-white border border-[#DDE5DF] text-[#5F6B63] hover:bg-[#F8FAF9]"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-xs font-semibold text-[#17231B] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
