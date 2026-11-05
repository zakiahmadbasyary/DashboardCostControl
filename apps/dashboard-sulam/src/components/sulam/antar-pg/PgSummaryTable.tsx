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
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs font-sans" suppressHydrationWarning>
      {/* Header & Filter Bar (Style Seragam dengan Analisis Lokasi WIP) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B]">
            <TableIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B]">
              Tabel Rekapitulasi Bulanan - {selectedPg}
            </h3>
            <p className="text-xs text-[#5F6B63]">
              Rekapitulasi biaya, tenaga kerja, luas, dan akumulasi kinerja bulanan s/d Total YTD untuk {selectedPg}.
            </p>
          </div>
        </div>

        {/* Filter PG Sub-nav */}
        <div className="flex items-center gap-2 bg-[#F7F9F7] px-3 py-1.5 border border-[#DDE5DF] rounded-lg text-xs font-semibold text-[#17231B]">
          <Filter className="w-3.5 h-3.5 text-[#16823B]" />
          <span className="text-[#5F6B63]">Pilih PG:</span>
          <div className="flex items-center gap-1">
            {(["PG1", "PG2", "PG3"] as const).map((pg) => {
              const isSelected = selectedPg === pg;
              return (
                <button
                  key={pg}
                  type="button"
                  onClick={() => onSelectPg(pg)}
                  className={`px-2.5 py-0.5 rounded-md font-bold text-xs transition-all cursor-pointer ${
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
      </div>

      {/* Main Table Container (Style Tabel Analisis Lokasi WIP) */}
      <div className="overflow-x-auto lg:overflow-x-visible rounded-xl border border-[#DDE5DF]">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
            <tr>
              <th className="py-3 px-3.5">Bulan</th>
              <th className="py-3 px-2.5 text-right">Material (Rp)</th>
              <th className="py-3 px-2.5 text-right">Upah (Rp)</th>
              <th className="py-3 px-2.5 text-right">Batang</th>
              <th className="py-3 px-2.5 text-right">Jumlah TK</th>
              <th className="py-3 px-2.5 text-right">Luas (HA)</th>
              <th className="py-3 px-2.5 text-right text-[#16823B]">Upah/HA</th>
              <th className="py-3 px-2.5 text-right text-[#16823B]">Batang/HA</th>
              <th className="py-3 px-2.5 text-right text-[#16823B]">Upah/Btg</th>
              <th className="py-3 px-2.5 text-right text-[#16823B]">Batang/TK</th>
              <th className="py-3 px-2.5 text-right">TK/Bulan</th>
              <th className="py-3 px-3 text-right">Cost TK/Bulan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE5DF]/60">
            {loading ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-xs text-[#5F6B63]">
                  <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
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
                  className={`hover:bg-[#F7F9F7] text-[#17231B] transition-all ${
                    !row.hasData ? "opacity-60 text-[#89938D]" : ""
                  }`}
                >
                  <td className="py-3 px-3.5 font-bold text-[#17231B]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#16823B] shrink-0" />
                      <span>{row.monthName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono font-semibold text-[#17231B]">
                    {formatCurrencyRp(row.material)}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono font-semibold text-[#17231B]">
                    {formatCurrencyRp(row.upah)}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono text-[#17231B]">
                    {formatNumberId(row.batang, 0)}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono text-[#17231B]">
                    {formatNumberId(row.jumlahTk, 1)}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono text-[#17231B]">
                    {formatNumberId(row.luas, 2)}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono font-semibold text-[#16823B]">
                    {formatCurrencyRp(row.upahHa)}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono font-semibold text-[#16823B]">
                    {formatRatioId(row.batangHa, 0)}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono font-semibold text-[#16823B]">
                    {formatCurrencyRp(row.upahBatang)}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono font-semibold text-[#16823B]">
                    {formatRatioId(row.batangTk, 1)}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono text-[#17231B]">
                    {formatNumberId(row.tkBulan, 1)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-[#17231B]">
                    {formatCurrencyRp(row.costTkBulan)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {/* Total Akumulasi Tahunan (TOTAL YTD - Style Seragam dengan WIP) */}
          {total && (
            <tfoot className="bg-[#EAF3EC] font-bold text-[#17231B] border-t-2 border-[#16823B]/30">
              <tr>
                <td className="py-3 px-3.5 font-bold text-[#16823B]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#16823B] shrink-0" />
                    <span className="uppercase tracking-wider font-bold">TOTAL YTD</span>
                  </div>
                </td>
                <td className="py-3 px-2.5 text-right font-mono font-bold text-[#17231B]">{formatCurrencyRp(total.material)}</td>
                <td className="py-3 px-2.5 text-right font-mono font-bold text-[#17231B]">{formatCurrencyRp(total.upah)}</td>
                <td className="py-3 px-2.5 text-right font-mono font-bold text-[#17231B]">{formatNumberId(total.batang, 0)}</td>
                <td className="py-3 px-2.5 text-right font-mono font-bold text-[#17231B]">{formatNumberId(total.jumlahTk, 1)}</td>
                <td className="py-3 px-2.5 text-right font-mono font-bold text-[#17231B]">{formatNumberId(total.luas, 2)}</td>
                <td className="py-3 px-2.5 text-right font-mono font-bold text-[#16823B]">{formatCurrencyRp(total.upahHa)}</td>
                <td className="py-3 px-2.5 text-right font-mono font-bold text-[#16823B]">{formatRatioId(total.batangHa, 0)}</td>
                <td className="py-3 px-2.5 text-right font-mono font-bold text-[#16823B]">{formatCurrencyRp(total.upahBatang)}</td>
                <td className="py-3 px-2.5 text-right font-mono font-bold text-[#16823B]">{formatRatioId(total.batangTk, 1)}</td>
                <td className="py-3 px-2.5 text-right font-mono font-bold text-[#17231B]">{formatNumberId(total.tkBulan, 1)}</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-[#17231B]">{formatCurrencyRp(total.costTkBulan)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
