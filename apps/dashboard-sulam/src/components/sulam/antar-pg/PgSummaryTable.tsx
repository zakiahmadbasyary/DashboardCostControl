"use client";

import React from "react";
import { Table as TableIcon, Filter } from "lucide-react";
import { formatCurrencyRp, formatNumberId, formatRatioId } from "@/lib/formatters";

interface SummaryRow {
  month: number;
  monthName: string;
  material: number;
  upah: number;
  batang: number;
  jumlahTk: number;
  luas: number;
  upahHa: number | null;
  batangHa: number | null;
  upahBatang: number | null;
  batangTk: number | null;
  tkBulan: number;
  costTkBulan: number;
  hasData: boolean;
}

interface PgSummaryTableProps {
  rows: SummaryRow[];
  total: any;
  selectedPg: string;
  onSelectPg: (pg: string) => void;
  loading?: boolean;
}

export default function PgSummaryTable({
  rows,
  total,
  selectedPg,
  onSelectPg,
  loading,
}: PgSummaryTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs">
      {/* Header Tabel & Filter PG */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#EAF3EC] text-[#16823B] shrink-0">
              <TableIcon className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-[#17231B] tracking-tight">
              Tabel Rekapitulasi Bulanan --- {selectedPg}
            </h2>
          </div>
          <p className="text-xs text-[#5F6B63] mt-0.5">
            Rekap transaksi biaya, resource, luas, dan rasio kinerja bulanan untuk {selectedPg}.
          </p>
        </div>

        {/* Filter PG Tersendiri - CAPEX Style */}
        <div className="flex items-center gap-2 bg-[#F8FAF9] border border-[#DDE5DF] p-1 rounded-xl text-xs">
          <div className="flex items-center gap-1 text-[#5F6B63] px-2 font-bold">
            <Filter className="w-3.5 h-3.5 text-[#16823B]" />
            <span>Pilih PG:</span>
          </div>
          {(["PG1", "PG2", "PG3"] as const).map((pg) => {
            const isSelected = selectedPg === pg;
            return (
              <button
                key={pg}
                type="button"
                onClick={() => onSelectPg(pg)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-[#16823B] text-white shadow-xs"
                    : "text-[#5F6B63] hover:text-[#17231B] hover:bg-white"
                }`}
              >
                {pg}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabel */}
      <div className="border border-[#DDE5DF] rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#F8FAF9] text-[#17231B] font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
              <tr>
                <th className="px-4 py-3 bg-[#F8FAF9]">Bulan</th>
                <th className="px-3 py-3 text-right">Material (Rp)</th>
                <th className="px-3 py-3 text-right">Upah (Rp)</th>
                <th className="px-3 py-3 text-right">Batang</th>
                <th className="px-3 py-3 text-right">Jumlah TK</th>
                <th className="px-3 py-3 text-right">Luas (HA)</th>
                <th className="px-3 py-3 text-right text-[#16823B]">Upah/HA</th>
                <th className="px-3 py-3 text-right text-[#16823B]">Batang/HA</th>
                <th className="px-3 py-3 text-right text-[#16823B]">Upah/Batang</th>
                <th className="px-3 py-3 text-right text-[#16823B]">Batang/TK</th>
                <th className="px-3 py-3 text-right">TK/Bulan</th>
                <th className="px-4 py-3 text-right">Cost TK/Bulan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF] font-medium text-[#17231B]">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-xs text-[#5F6B63]">
                    Memuat data tabel summary...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-xs text-[#5F6B63]">
                    Tidak ada data untuk {selectedPg}.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.month}
                    className={`hover:bg-[#F8FAF9] transition-colors ${
                      !row.hasData ? "opacity-60 text-[#89938D]" : ""
                    }`}
                  >
                    <td className="px-4 py-2.5 font-bold">{row.monthName}</td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      {formatCurrencyRp(row.material)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      {formatCurrencyRp(row.upah)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      {formatNumberId(row.batang, 0)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      {formatNumberId(row.jumlahTk, 1)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      {formatNumberId(row.luas, 2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-[#16823B]">
                      {formatCurrencyRp(row.upahHa)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-[#16823B]">
                      {formatRatioId(row.batangHa, 0)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-[#16823B]">
                      {formatCurrencyRp(row.upahBatang)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-[#16823B]">
                      {formatRatioId(row.batangTk, 1)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      {formatNumberId(row.tkBulan, 1)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {formatCurrencyRp(row.costTkBulan)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Total Akumulasi Tahunan */}
            {total && (
              <tfoot className="bg-[#EAF3EC] font-bold text-[#17231B] border-t-2 border-[#CBE0D1] sticky bottom-0">
                <tr>
                  <td className="px-4 py-3 font-black uppercase tracking-wider">TOTAL / AGREGAT</td>
                  <td className="px-3 py-3 text-right font-mono">{formatCurrencyRp(total.material)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatCurrencyRp(total.upah)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatNumberId(total.batang, 0)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatNumberId(total.jumlahTk, 1)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatNumberId(total.luas, 2)}</td>
                  <td className="px-3 py-3 text-right font-mono font-black text-[#16823B]">{formatCurrencyRp(total.upahHa)}</td>
                  <td className="px-3 py-3 text-right font-mono font-black text-[#16823B]">{formatRatioId(total.batangHa, 0)}</td>
                  <td className="px-3 py-3 text-right font-mono font-black text-[#16823B]">{formatCurrencyRp(total.upahBatang)}</td>
                  <td className="px-3 py-3 text-right font-mono font-black text-[#16823B]">{formatRatioId(total.batangTk, 1)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatNumberId(total.tkBulan, 1)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrencyRp(total.costTkBulan)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
