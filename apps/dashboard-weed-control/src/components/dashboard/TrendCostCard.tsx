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
  Legend,
} from "recharts";
import { TrendDataPoint } from "@/types/dashboard";
import { BarChart3, Table as TableIcon, Tractor, Info, Sparkles } from "lucide-react";
import { formatCurrencyRp, formatNumberId, formatDecimal2 } from "@/lib/formatters";

interface TrendCostCardProps {
  data: TrendDataPoint[];
  loading?: boolean;
  selectedAktivitas: string;
  selectedStatus: string;
  onSelectUmur?: (umur: number) => void;
}

const REGION_COLORS: Record<string, string> = {
  AW01: "#16823B", // Primary Green
  AW02: "#29A9D6", // Blue
  AW03: "#FCE27A", // Secondary Yellow
  AW04: "#A8D437", // Light Green
  AW05: "#0B6B32", // Dark Green
  AW06: "#053916", // Deep Forest Green
  AW07: "#89938D", // Gray
};

const REGIONS = ["AW01", "AW02", "AW03", "AW04", "AW05", "AW06", "AW07"];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  onSelectUmur?: (umur: number) => void;
}

const CustomTooltip = ({ active, payload, label, onSelectUmur }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const ageNum = Number(label ?? 0);
  const validItems = payload.filter((p) => p.value !== null && p.value !== undefined && p.value > 0);
  const maxVal = validItems.length > 0 ? Math.max(...validItems.map((p) => Number(p.value))) : 0;

  return (
    <div
      onClick={() => onSelectUmur?.(ageNum)}
      title={`Klik untuk filter tabel lokasi pada Umur ${ageNum} Bulan (Semua Wilayah)`}
      className="bg-white border border-[#DDE5DF] rounded-xl p-3.5 shadow-xl text-xs min-w-[240px] cursor-pointer hover:border-[#16823B] transition-all group pointer-events-auto z-30"
    >
      <div className="font-bold text-[#17231B] pb-2 mb-2 border-b border-[#DDE5DF] flex items-center justify-between">
        <span>
          Umur Tanaman:{" "}
          <strong className="text-[#16823B] font-extrabold text-sm">{label} Bulan</strong>
        </span>
        <span className="text-[10px] bg-[#16823B]/10 text-[#16823B] px-2 py-0.5 rounded-full font-bold group-hover:bg-[#16823B] group-hover:text-white transition-colors">
          Pilih Umur Ini
        </span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
        {payload.map((entry, idx) => {
          const val = Number(entry.value ?? 0);
          if (val === 0 || isNaN(val)) return null;

          const isMax = maxVal > 0 && val === maxVal;
          const rawItem = entry.payload?.raw?.[entry.name];

          return (
            <div
              key={`tooltip-${idx}`}
              className="flex flex-col p-1.5 rounded-lg hover:bg-[#F7F9F7] transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color || entry.fill }}
                  />
                  <span className="text-[#5F6B63] font-semibold">{entry.name}:</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`font-mono ${
                      isMax
                        ? "text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200"
                        : "text-[#17231B] font-semibold"
                    }`}
                  >
                    {formatCurrencyRp(val)} / Ha
                  </span>
                  {isMax && (
                    <span className="text-[9px] font-black text-rose-600 bg-rose-100 px-1 rounded uppercase tracking-tighter">
                      MAX
                    </span>
                  )}
                </div>
              </div>

              {rawItem && (
                <div className="text-[10px] text-[#89938D] pl-4 flex items-center justify-between mt-0.5">
                  <span>Biaya: {formatCurrencyRp(rawItem.totalBiaya)}</span>
                  <span>Luas: {formatDecimal2(rawItem.totalLuas)} Ha</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function TrendCostCard({
  data,
  loading,
  selectedAktivitas,
  selectedStatus,
  onSelectUmur,
}: TrendCostCardProps) {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDE5DF]/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <Tractor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base sm:text-lg text-[#17231B]">
                Trend Cost Weed Control
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#EAF3EC] text-[#16823B] font-bold text-xs border border-[#CBE0D1]">
                {selectedAktivitas}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FCE27A]/30 text-[#17231B] font-bold text-xs border border-[#FCE27A]">
                Status: {selectedStatus}
              </span>
            </div>
            <p className="text-xs text-[#5F6B63] mt-0.5">
              Analisis Realisasi Biaya Pengendalian Gulma per Hektar (Cost/Ha) berdasarkan Wilayah dan Umur Tanaman
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#F7F9F7] p-1 rounded-xl border border-[#DDE5DF] self-start sm:self-center shrink-0">
          <button
            onClick={() => setViewMode("chart")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "chart"
                ? "bg-white text-[#16823B] shadow-2xs border border-[#DDE5DF]"
                : "text-[#5F6B63] hover:text-[#17231B]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Grafik Batang</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-[#16823B] shadow-2xs border border-[#DDE5DF]"
                : "text-[#5F6B63] hover:text-[#17231B]"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabel Ringkasan</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="h-80 flex flex-col items-center justify-center">
          <div className="w-7 h-7 border-3 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold text-[#5F6B63]">Memuat data trend cost...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
          <Info className="w-8 h-8 text-[#89938D] mb-2" />
          <h4 className="font-bold text-sm text-[#17231B]">Data Trend Tidak Ditemukan</h4>
          <p className="text-xs text-[#5F6B63] max-w-md mt-1">
            Tidak ada transaksi weed control yang cocok dengan kombinasi filter aktivitas{" "}
            <strong>{selectedAktivitas}</strong> dan status <strong>{selectedStatus}</strong>.
          </p>
        </div>
      ) : viewMode === "chart" ? (
        <div className="w-full flex flex-col gap-2">
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 16, right: 16, left: 8, bottom: 24 }}
                barGap={2}
                barCategoryGap="18%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFEB" />
                <XAxis
                  dataKey="umur"
                  tickLine={false}
                  stroke="#5F6B63"
                  fontSize={11}
                  label={{
                    value: "Umur Tanaman (Bulan)",
                    position: "insideBottom",
                    offset: -14,
                    fontSize: 11,
                    fill: "#5F6B63",
                    fontWeight: 600,
                  }}
                />
                <YAxis
                  stroke="#5F6B63"
                  fontSize={11}
                  tickFormatter={(val) =>
                    val >= 1000000
                      ? `${(val / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Jt`
                      : val.toLocaleString("id-ID")
                  }
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  content={<CustomTooltip onSelectUmur={onSelectUmur} />}
                  cursor={{ fill: "rgba(22, 130, 59, 0.05)" }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
                />
                {REGIONS.map((reg) => (
                  <Bar
                    key={reg}
                    dataKey={reg}
                    name={reg}
                    fill={REGION_COLORS[reg] || "#16823B"}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#5F6B63] pt-2 border-t border-[#DDE5DF]/60">
            <span className="font-mono text-[10px]">Satuan: Rp / Ha</span>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Umur (Bln)</th>
                {REGIONS.map((reg) => (
                  <th key={reg} className="py-2.5 px-3 text-right whitespace-nowrap">
                    {reg}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF]/60">
              {data.map((row) => (
                <tr
                  key={row.umur}
                  onClick={() => onSelectUmur?.(row.umur)}
                  className="hover:bg-[#F7F9F7] cursor-pointer transition-colors"
                  title={`Klik untuk filter tabel lokasi pada Umur ${row.umur} Bulan`}
                >
                  <td className="py-2.5 px-3 font-extrabold text-[#16823B] whitespace-nowrap">
                    {row.umur} Bulan
                  </td>
                  {REGIONS.map((reg) => {
                    const val = row[reg];
                    return (
                      <td
                        key={reg}
                        className="py-2.5 px-3 text-right font-mono text-[#17231B] whitespace-nowrap"
                      >
                        {val !== null && val !== undefined && val > 0
                          ? formatCurrencyRp(val)
                          : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

