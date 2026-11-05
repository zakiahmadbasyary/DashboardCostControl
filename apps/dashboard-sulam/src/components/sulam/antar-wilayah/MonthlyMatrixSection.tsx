"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Users, Sprout, BarChart3 } from "lucide-react";
import { formatNumberId, formatRatioId } from "@/lib/formatters";

// Palet warna per wilayah (AW01--AW07) seragam dengan gaya visual WIP (Trend Cost Umur Tanaman)
const REGION_COLORS: Record<string, string> = {
  AW01: "#16823B", // Primary Green GGF
  AW02: "#29A9D6", // Cyan Blue
  AW03: "#E5C959", // Yellow WIP / Gold
  AW04: "#A8D437", // Lime Green
  AW05: "#0B6B32", // Forest Dark Green
  AW06: "#1F4E34", // Deep Pine Green
  AW07: "#89938D", // Neutral Gray
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

  // Floating white card tooltip bergaya Trend Cost per Umur Tanaman WIP dengan penanda nilai terbesar (MAX)
  const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (!active || !payload || !payload.length) return null;
    const fullMonth = payload[0]?.payload?.monthFull || `Bulan ${label}`;

    // Cari nilai terbesar di antara wilayah yang valid (> 0)
    const validValues = payload
      .map((p: any) => Number(p.value ?? 0))
      .filter((v: number) => !isNaN(v) && v > 0);

    const maxValue = validValues.length > 0 ? Math.max(...validValues) : 0;

    return (
      <div className="bg-white border border-[#DDE5DF] rounded-xl p-3.5 shadow-xl text-xs min-w-[220px] font-sans">
        <div className="font-bold text-[#17231B] pb-2 mb-2 border-b border-[#DDE5DF] flex items-center justify-between">
          <div>
            Periode: <strong className="text-[#16823B] font-extrabold">{fullMonth}</strong>
          </div>
          <span className="text-[10px] font-bold bg-[#16823B]/10 text-[#16823B] px-2 py-0.5 rounded-full border border-[#16823B]/20">
            {unit}
          </span>
        </div>
        <div className="space-y-1">
          {payload.map((item: any) => {
            const val = Number(item.value ?? 0);
            const isMax = maxValue > 0 && val === maxValue;
            const isHovered = highlightedRegion === item.dataKey;

            return (
              <div
                key={item.dataKey}
                className={`flex items-center justify-between gap-3 px-2 py-1 rounded transition-colors ${
                  isHovered ? "bg-[#16823B]/10 font-bold" : "hover:bg-[#F7F9F7]"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color || item.fill }}
                  />
                  <span className={isHovered ? "text-[#16823B] font-bold" : "text-[#5F6B63] font-semibold"}>
                    {item.dataKey}:
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-mono ${
                      isMax
                        ? "text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200"
                        : isHovered
                        ? "text-[#16823B] font-extrabold"
                        : "text-[#17231B] font-semibold"
                    }`}
                  >
                    {item.value !== null && item.value !== undefined
                      ? unit === "TK"
                        ? formatNumberId(item.value, 0)
                        : formatRatioId(item.value, 1)
                      : "-"}
                  </span>
                  {isMax && (
                    <span className="text-[9px] font-black text-rose-600 bg-rose-100 px-1 py-0.2 rounded uppercase tracking-tighter">
                      MAX
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header Perbandingan Bulanan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black text-[#17231B] tracking-tight">
            Perbandingan Bulanan Antar Wilayah (PG1: AW01--AW07)
          </h2>
          <p className="text-xs text-[#5F6B63] mt-0.5">
            Menampilkan perbandingan diagram batang dan matriks 12 bulan penuh (Januari--Desember) untuk Penggunaan TK dan Kapasitas Batang/TK.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ================= PANEL KIRI: PENGGUNAAN TK/BULAN ================= */}
        <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 sm:p-6 shadow-sm shadow-[#16823B]/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-[#DDE5DF]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17231B]">
                    Penggunaan TK / Bulan (Tenaga Kerja)
                  </h3>
                  <p className="text-[11px] text-[#5F6B63]">
                    Diagram batang total kebutuhan tenaga kerja per wilayah
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#F8FAF9] text-[#16823B] border border-[#DDE5DF]">
                Satuan: TK
              </span>
            </div>

            {/* Interactive Region Pills (Legend) */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {regions.map((w) => {
                const isSelected = highlightedRegion === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onMouseEnter={() => setHighlightedRegion(w)}
                    onMouseLeave={() => setHighlightedRegion(null)}
                    onClick={() => setHighlightedRegion(highlightedRegion === w ? null : w)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#17231B] text-white border-[#17231B] shadow-xs"
                        : "bg-[#F8FAF9] text-[#5F6B63] border-[#DDE5DF] hover:bg-white hover:text-[#17231B]"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: REGION_COLORS[w] }}
                    />
                    <span>{w}</span>
                  </button>
                );
              })}
            </div>

            {/* Grafik Bar TK (Gaya WIP BarChart) */}
            <div className="w-full overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 scrollbar-thin">
              <div className="min-w-[440px] sm:min-w-0 w-full h-64 sm:h-72 my-1">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#5F6B63]">
                    <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mr-2" />
                    Memuat grafik TK...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={tkChartData}
                      margin={{ top: 12, right: 10, left: -15, bottom: 0 }}
                      barGap={1}
                      barCategoryGap="16%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEF" vertical={false} />
                      <XAxis
                        dataKey="monthName"
                        tick={{ fill: "#5F6B63", fontSize: 11, fontWeight: 600 }}
                        tickLine={false}
                        axisLine={{ stroke: "#DDE5DF" }}
                      />
                      <YAxis
                        tick={{ fill: "#5F6B63", fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: "#DDE5DF" }}
                      />
                      <Tooltip content={<CustomTooltip unit="TK" />} />
                      {regions.map((w) => (
                        <Bar
                          key={w}
                          dataKey={w}
                          name={w}
                          fill={REGION_COLORS[w] || "#16823B"}
                          radius={[2, 2, 0, 0]}
                          maxBarSize={9}
                          opacity={highlightedRegion && highlightedRegion !== w ? 0.25 : 1}
                          className="transition-opacity duration-200"
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Tabel Matriks TK (Gaya Tabel WIP / HPP) */}
          <div className="mt-3 border border-[#DDE5DF] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap">
                <thead className="bg-[#F8FAF9] text-[#17231B] font-bold border-b border-[#DDE5DF] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-2.5 py-2">Wilayah</th>
                    {MONTH_HEADERS.map((m) => (
                      <th key={m} className="px-1.5 py-2 text-right">
                        {m}
                      </th>
                    ))}
                    <th className="px-2.5 py-2 text-right bg-[#EAF3EC] font-bold text-[#16823B] border-l border-[#DDE5DF]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF]/70 font-normal text-[#17231B]">
                  {tkMatrixRows.map((row) => (
                    <tr
                      key={row.wilayah}
                      onMouseEnter={() => setHighlightedRegion(row.wilayah)}
                      onMouseLeave={() => setHighlightedRegion(null)}
                      className={`hover:bg-[#F8FAF9] transition-colors cursor-pointer ${
                        highlightedRegion === row.wilayah ? "bg-emerald-50/70" : ""
                      }`}
                    >
                      <td className="px-2.5 py-1.5 font-semibold flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: REGION_COLORS[row.wilayah] }}
                        />
                        <span>{row.wilayah}</span>
                      </td>
                      {row.months.map((val: number, idx: number) => (
                        <td key={idx} className="px-1.5 py-1.5 text-right font-mono font-normal">
                          {val > 0 ? formatNumberId(val, 1) : "-"}
                        </td>
                      ))}
                      <td className="px-2.5 py-1.5 text-right font-mono font-semibold bg-[#EAF3EC]/60 text-[#16823B] border-l border-[#DDE5DF]">
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
        <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 sm:p-6 shadow-sm shadow-[#16823B]/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-[#DDE5DF]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#17231B]">
                    Kapasitas Batang / TK
                  </h3>
                  <p className="text-[11px] text-[#5F6B63]">
                    Diagram batang rasio bibit tertanam per tenaga kerja
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#F8FAF9] text-[#16823B] border border-[#DDE5DF]">
                Satuan: Btg/TK
              </span>
            </div>

            {/* Interactive Region Pills (Legend) */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {regions.map((w) => {
                const isSelected = highlightedRegion === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onMouseEnter={() => setHighlightedRegion(w)}
                    onMouseLeave={() => setHighlightedRegion(null)}
                    onClick={() => setHighlightedRegion(highlightedRegion === w ? null : w)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#17231B] text-white border-[#17231B] shadow-xs"
                        : "bg-[#F8FAF9] text-[#5F6B63] border-[#DDE5DF] hover:bg-white hover:text-[#17231B]"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: REGION_COLORS[w] }}
                    />
                    <span>{w}</span>
                  </button>
                );
              })}
            </div>

            {/* Grafik Bar Batang/TK (Gaya WIP BarChart) */}
            <div className="w-full overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 scrollbar-thin">
              <div className="min-w-[440px] sm:min-w-0 w-full h-64 sm:h-72 my-1">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#5F6B63]">
                    <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mr-2" />
                    Memuat grafik Batang/TK...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={batangTkChartData}
                      margin={{ top: 12, right: 10, left: -15, bottom: 0 }}
                      barGap={1}
                      barCategoryGap="16%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEF" vertical={false} />
                      <XAxis
                        dataKey="monthName"
                        tick={{ fill: "#5F6B63", fontSize: 11, fontWeight: 600 }}
                        tickLine={false}
                        axisLine={{ stroke: "#DDE5DF" }}
                      />
                      <YAxis
                        tick={{ fill: "#5F6B63", fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: "#DDE5DF" }}
                      />
                      <Tooltip content={<CustomTooltip unit="batang/TK" />} />
                      {regions.map((w) => (
                        <Bar
                          key={w}
                          dataKey={w}
                          name={w}
                          fill={REGION_COLORS[w] || "#16823B"}
                          radius={[2, 2, 0, 0]}
                          maxBarSize={9}
                          opacity={highlightedRegion && highlightedRegion !== w ? 0.25 : 1}
                          className="transition-opacity duration-200"
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Tabel Matriks Batang/TK (Gaya Tabel WIP / HPP) */}
          <div className="mt-3 border border-[#DDE5DF] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap">
                <thead className="bg-[#F8FAF9] text-[#17231B] font-bold border-b border-[#DDE5DF] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-2.5 py-2">Wilayah</th>
                    {MONTH_HEADERS.map((m) => (
                      <th key={m} className="px-1.5 py-2 text-right">
                        {m}
                      </th>
                    ))}
                    <th className="px-2.5 py-2 text-right bg-[#EAF3EC] font-bold text-[#16823B] border-l border-[#DDE5DF]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF]/70 font-normal text-[#17231B]">
                  {batangTkMatrixRows.map((row) => (
                    <tr
                      key={row.wilayah}
                      onMouseEnter={() => setHighlightedRegion(row.wilayah)}
                      onMouseLeave={() => setHighlightedRegion(null)}
                      className={`hover:bg-[#F8FAF9] transition-colors cursor-pointer ${
                        highlightedRegion === row.wilayah ? "bg-emerald-50/70" : ""
                      }`}
                    >
                      <td className="px-2.5 py-1.5 font-semibold flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: REGION_COLORS[row.wilayah] }}
                        />
                        <span>{row.wilayah}</span>
                      </td>
                      {row.months.map((val: number | null, idx: number) => (
                        <td key={idx} className="px-1.5 py-1.5 text-right font-mono font-normal">
                          {val !== null ? formatRatioId(val, 0) : "-"}
                        </td>
                      ))}
                      <td className="px-2.5 py-1.5 text-right font-mono font-semibold bg-[#EAF3EC]/60 text-[#16823B] border-l border-[#DDE5DF]">
                        {row.total !== null ? formatRatioId(row.total, 0) : "-"}
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
