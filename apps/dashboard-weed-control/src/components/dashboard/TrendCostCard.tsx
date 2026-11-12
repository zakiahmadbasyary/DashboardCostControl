"use client";

import React from "react";
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
import { BarChart3, Info } from "lucide-react";
import { formatCurrencyRp } from "@/lib/formatters";

interface TrendCostCardProps {
  data: TrendDataPoint[];
  loading?: boolean;
  selectedAktivitas?: string;
  selectedStatus?: string;
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
        <span>
          Umur Tanaman:{" "}
          <strong className="text-[#16823B] font-extrabold text-sm">{label} Bulan</strong>
        </span>
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
                  {val > 0 ? formatCurrencyRp(val) : "-"}
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

export default function TrendCostCard({
  data,
  loading,
  onSelectUmur,
}: TrendCostCardProps) {
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
      {/* Unified Card Header matching WIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DF]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B]">Trend Cost Weed Control</h3>
            <p className="text-xs text-[#5F6B63]">
              Perbandingan diagram batang akumulasi cost per Ha berdasarkan umur tanaman per Wilayah. <strong>Klik pada umur di batang untuk filter tabel lokasi.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {data.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
          <Info className="w-8 h-8 text-[#89938D] mb-2" />
          <h4 className="font-bold text-sm text-[#17231B]">Data Trend Tidak Ditemukan</h4>
          <p className="text-xs text-[#5F6B63] max-w-md mt-1">
            Tidak ada transaksi weed control yang cocok dengan kombinasi filter yang dipilih.
          </p>
        </div>
      ) : (
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#16823B]" />
              Diagram Batang Trend Cost (Rp / Ha)
            </span>
          </div>

          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                barGap={2}
                barCategoryGap="18%"
                onClick={(e) => {
                  if (e && e.activeLabel !== undefined) {
                    onSelectUmur?.(Number(e.activeLabel));
                  }
                }}
                className="cursor-pointer"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFEF" />
                <XAxis
                  dataKey="umur"
                  tickLine={false}
                  stroke="#5F6B63"
                  fontSize={12}
                  label={{
                    value: "Umur Tanaman (Bulan)",
                    position: "insideBottom",
                    offset: -5,
                    fontSize: 11,
                    fill: "#5F6B63",
                    fontWeight: 600,
                  }}
                />
                <YAxis
                  stroke="#5F6B63"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) =>
                    val >= 1000000
                      ? `${(val / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Jt`
                      : val.toLocaleString("id-ID")
                  }
                  label={{
                    value: "Cost / Ha (Rp)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    fontSize: 11,
                    fill: "#5F6B63",
                    fontWeight: 600,
                  }}
                  width={68}
                />
                <Tooltip
                  content={<CustomTooltip onSelectUmur={onSelectUmur} />}
                  cursor={{ fill: "rgba(22, 130, 59, 0.05)" }}
                  offset={25}
                  wrapperStyle={{ outline: "none", zIndex: 50 }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: "10px", fontSize: "12px", paddingBottom: "12px" }}
                />
                {REGIONS.map((reg) => (
                  <Bar
                    key={reg}
                    dataKey={reg}
                    name={reg}
                    fill={REGION_COLORS[reg] || "#16823B"}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={22}
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

          <div className="flex items-center justify-between text-[11px] text-[#5F6B63] pt-2 border-t border-[#DDE5DF]/60">
            <span className="font-mono text-[10px]">Satuan: Rp / Ha</span>
          </div>
        </div>
      )}
    </div>
  );
}
