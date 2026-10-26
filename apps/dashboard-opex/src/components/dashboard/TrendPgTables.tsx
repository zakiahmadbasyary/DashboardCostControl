"use client";

import React from "react";
import { TrendPgCostCenterItem } from "@/types/opex";
import { Building2 } from "lucide-react";

interface TrendPgTablesProps {
  data: TrendPgCostCenterItem[];
  selectedPeriodLabel?: string;
  selectedCe2: string;
  loading?: boolean;
}

export default function TrendPgTables({
  data,
  selectedPeriodLabel,
  selectedCe2,
  loading,
}: TrendPgTablesProps) {
  const midIndex = Math.ceil(data.length / 2);
  const leftTable = data.slice(0, midIndex);
  const rightTable = data.slice(midIndex);

  const renderTable = (items: TrendPgCostCenterItem[], titleSuffix: string) => (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#DDE5DF]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#17231B]">
                Actual per Cost Center Antar PG ({titleSuffix})
              </h4>
              <span className="text-[10px] text-[#5F6B63]">
                Komparasi riil {items.length} Pusat Biaya
              </span>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#89938D]">
            Tidak ada data Cost Center untuk filter ini.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase text-[10px] font-bold border-b border-[#DDE5DF]">
                <tr>
                  <th className="py-2.5 px-3">Cost Center</th>
                  <th className="py-2.5 px-3 text-right text-[#16823B]">PG1 (Rp)</th>
                  <th className="py-2.5 px-3 text-right text-[#29A9D6]">PG2 (Rp)</th>
                  <th className="py-2.5 px-3 text-right text-[#A68817]">PG3 (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]">
                {items.map((row) => (
                  <tr key={row.costcenter} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[#17231B] block">
                        {row.costcenter}
                      </span>
                      <span className="text-[11px] text-[#5F6B63] line-clamp-1">
                        {row.deskripsiCostcenter}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#17231B]">
                      {row.pg1 !== null ? row.pg1.toLocaleString("id-ID") : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#17231B]">
                      {row.pg2 !== null ? row.pg2.toLocaleString("id-ID") : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#17231B]">
                      {row.pg3 !== null ? row.pg3.toLocaleString("id-ID") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-extrabold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16823B]" />
          Tabel Komparasi Cost Center Antar PG — {selectedPeriodLabel} ({selectedCe2})
        </h3>
        <p className="text-xs text-[#5F6B63] mt-0.5">
          Perbandingan nilai Actual murni setiap Cost Center antara Plantation Group 1, 2, dan 3 pada periode dan Cost Element terpilih.
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-8 text-center">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#5F6B63]">Memuat tabel perbandingan antar PG...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 text-center text-xs text-[#89938D]">
          Tidak ada data transaksi perbandingan antar PG.
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
