"use client";

import React, { useState } from "react";
import { CostCenterSummaryItem } from "@/types/opex";
import { Building2, Search, CheckCircle2, AlertCircle } from "lucide-react";

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

  const filteredData = data.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.costcenter.toLowerCase().includes(q) ||
      item.deskripsiCostcenter.toLowerCase().includes(q)
    );
  });

  // Bagi seimbang menjadi 2 tabel (kiri dan kanan)
  const midIndex = Math.ceil(filteredData.length / 2);
  const leftTable = filteredData.slice(0, midIndex);
  const rightTable = filteredData.slice(midIndex);

  const renderTable = (items: CostCenterSummaryItem[], titleSuffix: string) => (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#DDE5DF]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#17231B]">
                Cost Center PG1 ({titleSuffix})
              </h4>
              <span className="text-[10px] text-[#5F6B63]">
                {items.length} Pusat Biaya terdaftar
              </span>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#89938D]">
            Tidak ada Cost Center yang cocok dengan pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
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
                          <div>
                            <span className="font-bold text-[#17231B] block">
                              {row.costcenter}
                            </span>
                            <span className="text-[11px] text-[#5F6B63] line-clamp-1">
                              {row.deskripsiCostcenter}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#17231B]">
                        {row.actual.toLocaleString("id-ID")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">
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
      </div>
    </div>
  );

  return (
    <section className="space-y-3">
      {/* Search & Section Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16823B]" />
            Daftar Cost Center PG1 — {selectedPeriodLabel || "Periode Aktif"}
          </h3>
          <p className="text-xs text-[#5F6B63] mt-0.5">
            Pilih salah satu baris Cost Center untuk menelusuri rincian Cost Element & Aktivitas di bawahnya.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#89938D]" />
          <input
            type="text"
            placeholder="Cari Cost Center..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            suppressHydrationWarning
            className="w-full bg-white border border-[#DDE5DF] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors placeholder:text-[#89938D]"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-8 text-center">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#5F6B63]">Memuat tabel Cost Center...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 text-center text-xs text-[#89938D]">
          Tidak ada data Cost Center untuk periode ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderTable(leftTable, "Bagian 1")}
          {renderTable(rightTable, "Bagian 2")}
        </div>
      )}
    </section>
  );
}
