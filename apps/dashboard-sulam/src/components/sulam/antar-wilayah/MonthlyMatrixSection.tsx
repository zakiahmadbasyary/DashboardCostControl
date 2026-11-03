"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Users, Sprout } from "lucide-react";
import { formatNumberId, formatRatioId } from "@/lib/formatters";

const REGION_COLORS: Record<string, string> = {
  AW01: "#16823B", // GGF Green
  AW02: "#29A9D6", // CAPEX Blue
  AW03: "#F9A91B", // CAPEX Orange
  AW04: "#0B6B32", // GGF Dark Green
  AW05: "#6366F1", // Indigo
  AW06: "#A8D437", // Light Green
  AW07: "#89938D", // Gray
};

const MONTH_HEADERS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

interface MonthlyMatrixSectionProps {
  tkChartData: any[];
  tkMatrixRows: any[];
  batangTkChartData: any[];
  batangTkMatrixRows: any[];
  regions: string[];
  loading?: boolean;
}

export default function MonthlyMatrixSection({
  tkChartData,
  tkMatrixRows,
  batangTkChartData,
  batangTkMatrixRows,
  regions,
  loading,
}: MonthlyMatrixSectionProps) {
  const [highlightedRegion, setHighlightedRegion] = useState<string | null>(null);

  const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-[#17231B] text-white p-3 rounded-xl shadow-xl border border-gray-700/60 text-xs min-w-[170px]">
        <div className="border-b border-gray-700 pb-1 mb-2 font-bold flex justify-between">
          <span>Bulan {label}</span>
          <span className="text-gray-300 font-semibold">{unit}</span>
        </div>
        <div className="space-y-1">
          {payload.map((item: any) => (
            <div key={item.dataKey} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-semibold">{item.dataKey}:</span>
              </div>
              <span className="font-mono font-bold">
                {item.value !== null && item.value !== undefined ? item.value : "-"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Judul Bagian 1 */}
      <div>
        <h2 className="text-base font-black text-[#17231B] tracking-tight">
          Bagian 1: Perbandingan Bulanan Antar Wilayah (PG1: AW01--AW07)
        </h2>
        <p className="text-xs text-[#5F6B63] mt-0.5">
          Menampilkan tren 12 bulan penuh (Januari--Desember) untuk Penggunaan TK dan Kapasitas Batang/TK.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ================= PANEL KIRI: PENGGUNAAN TK/BULAN ================= */}
        <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#EAF3EC] text-[#16823B] shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#17231B]">
                  Penggunaan TK / Bulan (Tenaga Kerja)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
                summary_sulam.jumlah_tk
              </span>
            </div>

            {/* Grafik TK */}
            <div className="w-full h-56 sm:h-64 my-2">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-[#5F6B63]">
                  Memuat grafik TK...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tkChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
                    <XAxis dataKey="monthName" tick={{ fill: "#5F6B63", fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fill: "#5F6B63", fontSize: 10 }} tickLine={false} />
                    <Tooltip content={<CustomTooltip unit="TK" />} />
                    {regions.map((w) => (
                      <Line
                        key={w}
                        type="monotone"
                        dataKey={w}
                        stroke={REGION_COLORS[w] || "#16823B"}
                        strokeWidth={highlightedRegion === w ? 3 : 1.5}
                        strokeOpacity={highlightedRegion && highlightedRegion !== w ? 0.3 : 1}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Tabel Matriks TK */}
          <div className="mt-3 border border-[#DDE5DF] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap">
                <thead className="bg-[#F8FAF9] text-[#17231B] font-bold border-b border-[#DDE5DF]">
                  <tr>
                    <th className="px-2.5 py-2">Wilayah</th>
                    {MONTH_HEADERS.map((m) => (
                      <th key={m} className="px-1.5 py-2 text-right">
                        {m}
                      </th>
                    ))}
                    <th className="px-2.5 py-2 text-right bg-[#EAF3EC] font-black text-[#16823B]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF] font-medium text-[#17231B]">
                  {tkMatrixRows.map((row) => (
                    <tr
                      key={row.wilayah}
                      onMouseEnter={() => setHighlightedRegion(row.wilayah)}
                      onMouseLeave={() => setHighlightedRegion(null)}
                      className={`hover:bg-[#F8FAF9] transition-colors ${
                        highlightedRegion === row.wilayah ? "bg-emerald-50/50" : ""
                      }`}
                    >
                      <td className="px-2.5 py-1.5 font-bold flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: REGION_COLORS[row.wilayah] }}
                        />
                        <span>{row.wilayah}</span>
                      </td>
                      {row.months.map((val: number, idx: number) => (
                        <td key={idx} className="px-1.5 py-1.5 text-right font-mono">
                          {val > 0 ? formatNumberId(val, 1) : "-"}
                        </td>
                      ))}
                      <td className="px-2.5 py-1.5 text-right font-mono font-bold bg-[#EAF3EC]/60 text-[#16823B]">
                        {formatNumberId(row.total, 1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= PANEL KANAN: KAPASITAS BATANG/TK ================= */}
        <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#EAF3EC] text-[#16823B] shrink-0">
                  <Sprout className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#17231B]">
                  Kapasitas Batang / TK
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
                batang / jumlah_tk
              </span>
            </div>

            {/* Grafik Batang/TK */}
            <div className="w-full h-56 sm:h-64 my-2">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-[#5F6B63]">
                  Memuat grafik Batang/TK...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={batangTkChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
                    <XAxis dataKey="monthName" tick={{ fill: "#5F6B63", fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fill: "#5F6B63", fontSize: 10 }} tickLine={false} />
                    <Tooltip content={<CustomTooltip unit="batang/TK" />} />
                    {regions.map((w) => (
                      <Line
                        key={w}
                        type="monotone"
                        dataKey={w}
                        stroke={REGION_COLORS[w] || "#16823B"}
                        strokeWidth={highlightedRegion === w ? 3 : 1.5}
                        strokeOpacity={highlightedRegion && highlightedRegion !== w ? 0.3 : 1}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Tabel Matriks Batang/TK */}
          <div className="mt-3 border border-[#DDE5DF] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap">
                <thead className="bg-[#F8FAF9] text-[#17231B] font-bold border-b border-[#DDE5DF]">
                  <tr>
                    <th className="px-2.5 py-2">Wilayah</th>
                    {MONTH_HEADERS.map((m) => (
                      <th key={m} className="px-1.5 py-2 text-right">
                        {m}
                      </th>
                    ))}
                    <th className="px-2.5 py-2 text-right bg-[#EAF3EC] font-black text-[#16823B]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF] font-medium text-[#17231B]">
                  {batangTkMatrixRows.map((row) => (
                    <tr
                      key={row.wilayah}
                      onMouseEnter={() => setHighlightedRegion(row.wilayah)}
                      onMouseLeave={() => setHighlightedRegion(null)}
                      className={`hover:bg-[#F8FAF9] transition-colors ${
                        highlightedRegion === row.wilayah ? "bg-emerald-50/50" : ""
                      }`}
                    >
                      <td className="px-2.5 py-1.5 font-bold flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: REGION_COLORS[row.wilayah] }}
                        />
                        <span>{row.wilayah}</span>
                      </td>
                      {row.months.map((val: number | null, idx: number) => (
                        <td key={idx} className="px-1.5 py-1.5 text-right font-mono">
                          {val !== null ? formatRatioId(val, 1) : "-"}
                        </td>
                      ))}
                      <td className="px-2.5 py-1.5 text-right font-mono font-bold bg-[#EAF3EC]/60 text-[#16823B]">
                        {row.total !== null ? formatRatioId(row.total, 1) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
