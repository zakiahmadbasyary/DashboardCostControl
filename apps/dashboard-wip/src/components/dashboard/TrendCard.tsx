"use client";

import { useState } from "react";
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
import { BarChart3, Table as TableIcon, LayoutGrid } from "lucide-react";

interface TrendCardProps {
  data: TrendDataPoint[];
  loading?: boolean;
  onSelectUmur?: (umur: number) => void;
}

const REGION_COLORS: Record<string, string> = {
  AW01: "#16823B", // Primary Green
  AW02: "#29A9D6", // Blue
  AW03: "#F9A91B", // Orange
  AW04: "#A8D437", // Light Green
  AW05: "#0B6B32", // Dark Green
  AW06: "#053916ff", // Yellow Green
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
  const validValues = payload
    .map((p) => Number(p.value ?? 0))
    .filter((v) => !isNaN(v) && v > 0);

  const maxValue = validValues.length > 0 ? Math.max(...validValues) : 0;

  return (
    <div
      onClick={() => onSelectUmur?.(ageNum)}
      title={`Klik untuk filter tabel lokasi pada Umur ${ageNum} Bulan (Semua Wilayah)`}
      className="translate-x-6 -translate-y-6 bg-white border border-[#DDE5DF] rounded-xl p-3.5 shadow-xl text-xs min-w-[230px] cursor-pointer hover:border-[#16823B] transition-all group pointer-events-auto z-20"
    >
      <div className="font-bold text-[#17231B] pb-2 mb-2 border-b border-[#DDE5DF] flex items-center justify-between">
        <span>Umur Tanaman: <strong className="text-[#16823B] font-extrabold text-sm">{label} Bulan</strong></span>
        <span className="text-[10px] bg-[#16823B]/10 text-[#16823B] px-1.5 py-0.5 rounded-full font-bold group-hover:bg-[#16823B] group-hover:text-white transition-colors">
          Pilih Umur Ini
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {payload.map((entry, index) => {
          const val = Number(entry.value ?? 0);
          const isMax = maxValue > 0 && val === maxValue;

          return (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between gap-3 p-1 rounded hover:bg-[#F7F9F7]"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-[#5F6B63] font-semibold">
                  Wilayah {entry.name}:
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`font-mono ${
                    isMax
                      ? "text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200"
                      : "text-[#17231B] font-semibold"
                  }`}
                >
                  Rp {val.toLocaleString("id-ID")} Juta
                </span>
                {isMax && (
                  <span className="text-[9px] font-black text-rose-600 bg-rose-100 px-1 rounded uppercase tracking-tighter">
                    MAX
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-[#16823B] font-bold text-center pt-2 mt-2 border-t border-[#DDE5DF]/80 group-hover:underline">
        👇 Klik untuk filter Umur {label} Bulan (Semua Wilayah)
      </div>
    </div>
  );
};

export default function TrendCard({ data, loading, onSelectUmur }: TrendCardProps) {
  const [activeTab, setActiveTab] = useState<"all" | "chart" | "table">("all");

  // Transpose data to region -> ages 0..21
  const regionRows = REGIONS.map((region) => {
    const ageValues = data.map((point) => point[region] ?? 0);
    return {
      region,
      values: ageValues,
    };
  });

  if (loading) {
    return (
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-sm shadow-[#16823B]/5 h-96 flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-3 border-[#16823B] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#5F6B63]">Memuat data trend cost per umur tanaman...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-sm shadow-[#16823B]/5 flex flex-col gap-6">
      {/* Unified Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DF]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B]">Trend Cost per Umur Tanaman</h3>
            <p className="text-xs text-[#5F6B63]">
              Perbandingan diagram batang &amp; tabel data akumulasi cost per Ha berdasarkan umur tanaman (0 - 21 Bulan) per Wilayah. <strong>Klik pada umur di batang atau tabel untuk filter tabel lokasi.</strong>
            </p>
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="inline-flex p-1 rounded-xl bg-[#F7F9F7] border border-[#DDE5DF] self-start sm:self-center shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "all"
              ? "bg-white text-[#16823B] shadow-xs font-bold"
              : "text-[#5F6B63] hover:text-[#17231B]"
              }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Semua</span>
          </button>
          <button
            onClick={() => setActiveTab("chart")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "chart"
              ? "bg-white text-[#16823B] shadow-xs font-bold"
              : "text-[#5F6B63] hover:text-[#17231B]"
              }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Grafik</span>
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "table"
              ? "bg-white text-[#16823B] shadow-xs font-bold"
              : "text-[#5F6B63] hover:text-[#17231B]"
              }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabel</span>
          </button>
        </div>
      </div>

      {/* Chart Section */}
      {(activeTab === "all" || activeTab === "chart") && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#16823B]" />
              Diagram Batang Trend Cost (Juta Rp / Ha)
            </span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                onClick={(e) => {
                  if (e && e.activeLabel !== undefined) {
                    onSelectUmur?.(Number(e.activeLabel));
                  }
                }}
                className="cursor-pointer"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEF" vertical={false} />
                <XAxis
                  dataKey="umur"
                  stroke="#5F6B63"
                  fontSize={12}
                  tickLine={false}
                  label={{ value: "Umur Tanaman (Bulan)", position: "insideBottom", offset: -5, fill: "#5F6B63", fontSize: 11 }}
                />
                <YAxis
                  stroke="#5F6B63"
                  fontSize={12}
                  tickLine={false}
                  unit="M"
                  label={{ value: "Cost / Ha (Juta Rp)", angle: -90, position: "insideLeft", offset: 10, fill: "#5F6B63", fontSize: 11 }}
                />
                <Tooltip
                  content={<CustomTooltip onSelectUmur={onSelectUmur} />}
                  offset={25}
                  wrapperStyle={{ outline: "none", zIndex: 50 }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
                {Object.keys(REGION_COLORS).map((region) => (
                  <Bar
                    key={region}
                    dataKey={region}
                    name={region}
                    fill={REGION_COLORS[region]}
                    radius={[3, 3, 0, 0]}
                    onClick={(_, idx) => {
                      if (data[idx] && data[idx].umur !== undefined) {
                        onSelectUmur?.(Number(data[idx].umur));
                      }
                    }}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Divider if both are shown */}
      {activeTab === "all" && <div className="border-t border-[#DDE5DF]/60 my-1" />}

      {/* Table Section */}
      {(activeTab === "all" || activeTab === "table") && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
              <TableIcon className="w-3.5 h-3.5 text-[#16823B]" />
              Tabel Data Trend Cost per Wilayah (Juta Rp / Ha)
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                <tr>
                  <th className="py-2.5 px-3 sticky left-0 bg-[#F7F9F7] z-10 border-r border-[#DDE5DF]">Wilayah</th>
                  {Array.from({ length: 22 }, (_, i) => (
                    <th
                      key={i}
                      onClick={() => onSelectUmur?.(i)}
                      title={`Klik untuk filter tabel lokasi pada Umur ${i} Bulan (Semua Wilayah)`}
                      className="py-2.5 px-3 text-center border-r border-[#DDE5DF]/60 min-w-[50px] cursor-pointer hover:bg-[#16823B]/10 hover:text-[#16823B] transition-colors"
                    >
                      {i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                {regionRows.map((row) => (
                  <tr key={row.region} className="hover:bg-[#F7F9F7]/80 transition-colors">
                    <td className="py-2 px-3 font-bold sticky left-0 bg-white shadow-xs border-r border-[#DDE5DF] text-[#16823B]">
                      {row.region}
                    </td>
                    {row.values.map((val, idx) => (
                      <td
                        key={idx}
                        onClick={() => onSelectUmur?.(idx)}
                        title={`Klik untuk filter tabel lokasi pada Umur ${idx} Bulan (Semua Wilayah)`}
                        className="py-2 px-2 text-center border-r border-[#DDE5DF]/40 font-mono text-[11px] cursor-pointer hover:bg-[#A8D437]/20 hover:font-bold transition-colors"
                      >
                        {val === 0 ? <span className="text-[#89938D] font-normal">-</span> : val < 0.1 ? val.toFixed(2) : val.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
