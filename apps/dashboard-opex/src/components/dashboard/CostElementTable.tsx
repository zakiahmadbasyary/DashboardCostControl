"use client";

import React, { useMemo } from "react";
import { CostElementSummaryItem, CostCenterSummaryItem } from "@/types/opex";
import { Layers, CheckCircle2, AlertCircle, Building2, ChevronDown } from "lucide-react";

interface CostElementTableProps {
  selectedCostCenter: string | null;
  data: CostElementSummaryItem[];
  selectedCe2: string | null;
  onSelectCe2: (ce2: string) => void;
  loading?: boolean;
  costCenters?: CostCenterSummaryItem[];
  onSelectCostCenter?: (costcenter: string) => void;
}

export default function CostElementTable({
  selectedCostCenter,
  data,
  selectedCe2,
  onSelectCe2,
  loading,
  costCenters = [],
  onSelectCostCenter,
}: CostElementTableProps) {
  const sortedData = useMemo(() => {
    return [...data]
      .map((item) => ({
        ...item,
        // Jika budget 0 atau negatif (-), variancenya otomatis 100%
        variance:
          item.variance !== null
            ? item.variance
            : (!item.budget || item.budget <= 0)
              ? 100
              : null,
      }))
      .sort((a, b) => {
        const vA = a.variance !== null ? a.variance : -Infinity;
        const vB = b.variance !== null ? b.variance : -Infinity;
        return vB - vA;
      });
  }, [data]);

  if (!selectedCostCenter) {
    return (
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs h-full min-h-[580px] flex flex-col items-center justify-center text-center">
        <div className="p-3 rounded-2xl bg-[#F7F9F7] border border-[#DDE5DF] text-[#89938D] mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm text-[#17231B]">Cost Center Belum Dipilih</h4>
        <p className="text-xs text-[#5F6B63] mt-1 max-w-xs leading-relaxed">
          Silakan pilih Cost Center melalui filter di bawah atau klik salah satu baris pada <strong>Tabel Cost Center PG1</strong> di atas.
        </p>
        {costCenters.length > 0 && (
          <div className="mt-4 w-full max-w-xs relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#16823B]">
              <Building2 className="w-4 h-4" />
            </div>
            <select
              value=""
              onChange={(e) => onSelectCostCenter?.(e.target.value)}
              className="w-full text-xs font-semibold text-[#17231B] bg-white border border-[#16823B] rounded-xl py-2 pl-9 pr-8 shadow-xs cursor-pointer outline-none appearance-none"
            >
              <option value="" disabled>-- Pilih Cost Center --</option>
              {costCenters.map((cc) => (
                <option key={cc.costcenter} value={cc.costcenter}>
                  {cc.costcenter} - {cc.deskripsiCostcenter}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#89938D]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    );
  }

  const totalActual = data.reduce((acc, curr) => acc + curr.actual, 0);
  const totalBudget = data.reduce((acc, curr) => acc + curr.budget, 0);

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs h-full flex flex-col justify-between space-y-4">
      <div>
        {/* Header dengan Filter Cost Center Terhubung */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-3 border-b border-[#DDE5DF]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B] shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#17231B] truncate">
                  Cost Element (CE2)
                </h4>
                <span className="text-[10px] font-semibold text-[#89938D] bg-[#F8FAF9] px-2 py-0.5 rounded-md border border-[#DDE5DF] shrink-0">
                  {data.length} Akun
                </span>
              </div>
              <p className="text-[11px] text-[#5F6B63] truncate">
                Rincian akun biaya Cost Center <strong className="text-[#16823B]">{selectedCostCenter}</strong>
              </p>
            </div>
          </div>

          {/* Filter Cost Center Dropdown */}
          {costCenters.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <div className="relative w-full sm:w-[220px]">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#16823B]">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <select
                  id="filter-costcenter-in-ce2"
                  value={selectedCostCenter || ""}
                  onChange={(e) => onSelectCostCenter?.(e.target.value)}
                  className="w-full text-xs font-semibold text-[#17231B] bg-[#F8FAF9] hover:bg-[#F2F6F3] focus:bg-white border border-[#DDE5DF] focus:border-[#16823B] focus:ring-1 focus:ring-[#16823B] rounded-lg py-1.5 pl-8 pr-7 transition-colors cursor-pointer outline-none appearance-none truncate"
                  title="Pilih Cost Center"
                >
                  <option value="" disabled>-- Pilih Cost Center --</option>
                  {costCenters.map((cc) => (
                    <option key={cc.costcenter} value={cc.costcenter}>
                      {cc.costcenter} - {cc.deskripsiCostcenter || cc.costcenter}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-[#89938D]">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content (Scrollable, Ukuran Tetap, Sticky Header) */}
        {loading ? (
          <div className="h-[465px] flex flex-col justify-center items-center rounded-xl border border-[#DDE5DF] bg-[#F8FAF9]/50">
            <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#5F6B63]">Memuat Cost Element...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[465px] flex flex-col justify-center items-center p-6 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF] text-xs text-[#5F6B63]">
            Tidak ada Cost Element yang terdata pada Cost Center ini.
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto rounded-xl border border-[#DDE5DF] h-[465px] max-h-[465px]">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 z-10 bg-[#F7F9F7] text-[#17231B] uppercase text-[10px] font-bold border-b border-[#DDE5DF] shadow-2xs">
                <tr>
                  <th className="py-2.5 px-3 bg-[#F7F9F7]">Kode & Akun Biaya</th>
                  <th className="py-2.5 px-3 text-right bg-[#F7F9F7]">Actual (Rp)</th>
                  <th className="py-2.5 px-3 text-right bg-[#F7F9F7]">Budget (Rp)</th>
                  <th className="py-2.5 px-3 text-right bg-[#F7F9F7]">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]">
                {sortedData.map((row) => {
                  const isSelected = row.ce2 === selectedCe2;
                  const isOver = row.variance !== null && row.variance > 0;

                  return (
                    <tr
                      key={row.ce2}
                      onClick={() => onSelectCe2(row.ce2)}
                      className={`h-[48px] cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#EAF3EC] border-l-4 border-l-[#16823B] font-semibold"
                          : "hover:bg-[#F8FAF9]"
                      }`}
                    >
                      <td className="py-2 px-3">
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
                        className={`py-2 px-3 text-right font-mono whitespace-nowrap ${
                          isOver ? "bg-[#FCE27A]/35 text-[#17231B]" : "text-[#17231B]"
                        }`}
                      >
                        <span className={isSelected ? "font-semibold" : "font-normal"}>
                          {row.actual !== 0 ? row.actual.toLocaleString("id-ID") : "-"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[#5F6B63] whitespace-nowrap">
                        {row.budget !== 0 ? row.budget.toLocaleString("id-ID") : "-"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {row.variance !== null && Math.round(row.variance) !== 0 ? (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
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
        )}
      </div>

      {/* Footer Total Summary */}
      {!loading && data.length > 0 && (
        <div className="pt-2 border-t border-[#DDE5DF] flex items-center justify-between text-xs">
          <span className="font-bold text-[#5F6B63]">Total Cost Center:</span>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-[#17231B]">
              Actual: Rp {totalActual !== 0 ? totalActual.toLocaleString("id-ID") : "-"}
            </span>
            <span className="font-mono text-[#89938D]">
              Bgt: Rp {totalBudget !== 0 ? totalBudget.toLocaleString("id-ID") : "-"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
