"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CostElementSummaryItem } from "@/types/opex";
import { Layers, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface CostElementTableProps {
  selectedCostCenter: string | null;
  data: CostElementSummaryItem[];
  selectedCe2: string | null;
  onSelectCe2: (ce2: string) => void;
  loading?: boolean;
}

export default function CostElementTable({
  selectedCostCenter,
  data,
  selectedCe2,
  onSelectCe2,
  loading,
}: CostElementTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Reset page when selectedCostCenter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCostCenter]);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const vA = a.variance !== null ? a.variance : -Infinity;
      const vB = b.variance !== null ? b.variance : -Infinity;
      return vB - vA;
    });
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedData = sortedData.slice(startIndex, startIndex + PAGE_SIZE);
  if (!selectedCostCenter) {
    return (
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs h-full min-h-[340px] flex flex-col items-center justify-center text-center">
        <div className="p-3 rounded-2xl bg-[#F7F9F7] border border-[#DDE5DF] text-[#89938D] mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm text-[#17231B]">Cost Center Belum Dipilih</h4>
        <p className="text-xs text-[#5F6B63] mt-1 max-w-xs leading-relaxed">
          Silakan klik salah satu baris pada <strong>Tabel Cost Center PG1</strong> di atas untuk memuat rincian Cost Element (CE2).
        </p>
      </div>
    );
  }

  const totalActual = data.reduce((acc, curr) => acc + curr.actual, 0);
  const totalBudget = data.reduce((acc, curr) => acc + curr.budget, 0);
  const totalVariance =
    totalBudget > 0
      ? Number((((totalActual - totalBudget) / totalBudget) * 100).toFixed(2))
      : null;

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs h-full flex flex-col justify-between space-y-4">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#DDE5DF]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#17231B]">
                Cost Element (CE2)
              </h4>
              <p className="text-[11px] text-[#5F6B63]">
                Rincian akun biaya untuk Cost Center <strong className="text-[#16823B]">{selectedCostCenter}</strong>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#89938D] bg-[#F8FAF9] px-2 py-0.5 rounded-lg border border-[#DDE5DF]">
            {data.length} Akun
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-5 h-5 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#5F6B63]">Memuat Cost Element...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF] text-xs text-[#5F6B63]">
            Tidak ada Cost Element yang terdata pada Cost Center ini.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase text-[10px] font-bold border-b border-[#DDE5DF]">
                <tr>
                  <th className="py-2.5 px-3">Kode & Akun Biaya</th>
                  <th className="py-2.5 px-3 text-right">Actual (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Budget (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]">
                {paginatedData.map((row) => {
                  const isSelected = row.ce2 === selectedCe2;
                  const isOver = row.variance !== null && row.variance > 0;

                  return (
                    <tr
                      key={row.ce2}
                      onClick={() => onSelectCe2(row.ce2)}
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
                          <div>
                            <span className="font-bold text-[#17231B] block">
                              {row.ce2}
                            </span>
                            <span className="text-[11px] text-[#5F6B63] line-clamp-1">
                              {row.deskripsiCe2}
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
                          {row.actual.toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63] whitespace-nowrap">
                        {row.budget.toLocaleString("id-ID")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {row.variance !== null ? (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isOver
                                ? "bg-rose-50 text-rose-600 border border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {row.variance > 0 ? `+${row.variance.toFixed(1)}%` : `${row.variance.toFixed(1)}%`}
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
        )}

        {/* Pagination Controls (Maks 8 Data per Halaman) */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-3 pt-3 border-t border-[#DDE5DF]">
            <div className="text-[11px] text-[#5F6B63]">
              Menampilkan <strong className="text-[#17231B]">{startIndex + 1}</strong>–
              <strong className="text-[#17231B]">{Math.min(startIndex + PAGE_SIZE, sortedData.length)}</strong> dari{" "}
              <strong className="text-[#17231B]">{sortedData.length}</strong> Akun
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#DDE5DF] bg-white text-xs font-semibold text-[#17231B] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pgNum) => (
                  <button
                    key={pgNum}
                    type="button"
                    onClick={() => setCurrentPage(pgNum)}
                    className={`w-6 h-6 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pgNum
                        ? "bg-[#16823B] text-white shadow-xs"
                        : "bg-white border border-[#DDE5DF] text-[#5F6B63] hover:bg-[#F8FAF9]"
                    }`}
                  >
                    {pgNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#DDE5DF] bg-white text-xs font-semibold text-[#17231B] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Total Summary */}
      {!loading && data.length > 0 && (
        <div className="pt-2 border-t border-[#DDE5DF] flex items-center justify-between text-xs">
          <span className="font-bold text-[#5F6B63]">Total Cost Center:</span>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-[#17231B]">
              Actual: Rp {totalActual.toLocaleString("id-ID")}
            </span>
            <span className="font-mono text-[#89938D]">
              Bgt: Rp {totalBudget.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
