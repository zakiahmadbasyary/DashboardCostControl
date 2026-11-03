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
} from "recharts";
import { PgIndicatorKey, PG_INDICATORS } from "./IndicatorFilter";
import { formatCurrencyRp, formatNumberId, formatRatioId } from "@/lib/formatters";
import { BarChart3, AlertCircle } from "lucide-react";

interface PgComparisonChartProps {
  data: any[];
  indicator: PgIndicatorKey;
  loading?: boolean;
}

const PG_COLORS = {
  PG1: "#2563EB", // Blue
  PG2: "#16823B", // GGF Green
  PG3: "#F9A91B", // CAPEX Orange / Gold
};

export default function PgComparisonChart({
  data,
  indicator,
  loading,
}: PgComparisonChartProps) {
  const currentIndicator = PG_INDICATORS.find((i) => i.key === indicator) || PG_INDICATORS[0];

  const chartData = (data || []).map((row) => ({
    monthName: row.monthName,
    monthFull: row.monthFull,
    PG1: row.PG1 ? row.PG1[indicator] : null,
    PG2: row.PG2 ? row.PG2[indicator] : null,
    PG3: row.PG3 ? row.PG3[indicator] : null,
  }));

  const formatValue = (val: any) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    if (indicator === "costTkBulan" || indicator === "upahHa" || indicator === "upahBatang") {
      return formatCurrencyRp(val);
    }
    if (indicator === "batangHa" || indicator === "tkBulan") {
      return formatNumberId(val, 0);
    }
    return formatRatioId(val, 1);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const fullMonth = payload[0]?.payload?.monthFull || label;

    return (
      <div className="bg-[#17231B] text-white p-3 rounded-xl shadow-xl border border-gray-700/60 text-xs min-w-[200px]">
        <div className="border-b border-gray-700/80 pb-1.5 mb-2 flex items-center justify-between">
          <span className="font-bold">{fullMonth}</span>
          <span className="text-gray-300 font-semibold">{currentIndicator.label}</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((item: any) => (
            <div key={item.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-bold">{item.dataKey}:</span>
              </div>
              <span className="font-mono font-bold text-white">
                {formatValue(item.value)} {item.value !== null && currentIndicator.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#EAF3EC] text-[#16823B] shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-[#17231B] tracking-tight">
              Grafik Perbandingan Antar-PG --- {currentIndicator.label}
            </h2>
          </div>
          <p className="text-xs text-[#5F6B63] mt-0.5">
            Menampilkan perbandingan 12 bulan (Januari--Desember) untuk PG1, PG2, dan PG3 ({currentIndicator.unit}).
          </p>
        </div>

        {/* Legend Custom CAPEX Style */}
        <div className="flex items-center gap-3 text-xs font-bold bg-[#F8FAF9] border border-[#DDE5DF] px-3 py-1.5 rounded-xl shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#2563EB]" />
            <span className="text-[#17231B]">PG1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#16823B]" />
            <span className="text-[#17231B]">PG2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#F9A91B]" />
            <span className="text-[#17231B]">PG3</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex flex-col items-center justify-center gap-3 text-xs font-semibold text-[#5F6B63]">
          <div className="w-8 h-8 border-3 border-[#16823B] border-t-transparent rounded-full animate-spin" />
          <span>Memuat grafik perbandingan...</span>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-80 flex flex-col items-center justify-center gap-2 text-xs text-[#5F6B63]">
          <AlertCircle className="w-8 h-8 text-[#F9A91B]" />
          <span className="font-bold text-[#17231B]">Tidak ada data untuk periode ini</span>
        </div>
      ) : (
        <div className="w-full h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              barGap={3}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
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
                tickFormatter={(val) => {
                  if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
                  if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                  return val;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="PG1" fill={PG_COLORS.PG1} radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="PG2" fill={PG_COLORS.PG2} radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="PG3" fill={PG_COLORS.PG3} radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
