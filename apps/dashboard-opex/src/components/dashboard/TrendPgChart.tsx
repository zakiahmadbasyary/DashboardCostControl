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
  Cell,
} from "recharts";
import { Ce2Option, TrendPgMonthlyPoint } from "@/types/opex";
import { TrendingUp, Filter } from "lucide-react";

interface TrendPgChartProps {
  data: TrendPgMonthlyPoint[];
  ce2List: Ce2Option[];
  selectedCe2: string;
  onSelectCe2: (ce2: string) => void;
  selectedPeriod: number;
  loading?: boolean;
}

const formatIdrCompact = (num: number) => {
  if (Math.abs(num) >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)} M`;
  }
  if (Math.abs(num) >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(0)} Jt`;
  }
  return num.toLocaleString("id-ID");
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const pg1 = payload.find((p: any) => p.dataKey === "pg1")?.value ?? 0;
  const pg2 = payload.find((p: any) => p.dataKey === "pg2")?.value ?? 0;
  const pg3 = payload.find((p: any) => p.dataKey === "pg3")?.value ?? 0;

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-lg text-xs min-w-[210px]">
      <div className="font-bold text-[#17231B] pb-2 mb-2 border-b border-[#DDE5DF]">
        Periode: <strong className="text-[#16823B]">{label}</strong>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16823B] shrink-0" />
            <span className="text-[#5F6B63]">Actual PG1:</span>
          </div>
          <span className="font-mono font-bold text-[#17231B]">
            Rp {Number(pg1).toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#29A9D6] shrink-0" />
            <span className="text-[#5F6B63]">Actual PG2:</span>
          </div>
          <span className="font-mono font-bold text-[#17231B]">
            Rp {Number(pg2).toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5C959] shrink-0" />
            <span className="text-[#5F6B63]">Actual PG3:</span>
          </div>
          <span className="font-mono font-bold text-[#17231B]">
            Rp {Number(pg3).toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function TrendPgChart({
  data,
  ce2List,
  selectedCe2,
  onSelectCe2,
  selectedPeriod,
  loading,
}: TrendPgChartProps) {
  const currentCe2 = ce2List.find((c) => c.ce2 === selectedCe2);

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* ── Top Bar: Title & Independent CE2 Selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDE5DF]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-[#17231B] tracking-tight">
              Trend Cost Element Antar PG (Actual Bulanan)
            </h3>
          </div>
          <p className="text-xs text-[#5F6B63]">
            Perbandingan realisasi biaya operasional murni (Actual) antara PG1, PG2, dan PG3 per bulan
          </p>
        </div>

        {/* Independent CE2 Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[11px] font-bold text-[#5F6B63] uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#16823B]" />
            Cost Element:
          </label>
          <select
            value={selectedCe2}
            onChange={(e) => onSelectCe2(e.target.value)}
            suppressHydrationWarning
            className="bg-[#F7F9F7] border border-[#DDE5DF] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors cursor-pointer max-w-[220px]"
          >
            {ce2List.map((c) => (
              <option key={c.ce2} value={c.ce2}>
                {c.ce2} — {c.deskripsiCe2}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col justify-center items-center">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-[#5F6B63]">Memuat diagram tren antar PG...</p>
        </div>
      ) : (
        <div className="h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE7" />
              <XAxis
                dataKey="monthName"
                stroke="#89938D"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#DDE5DF" }}
              />
              <YAxis
                stroke="#89938D"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatIdrCompact(v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: "12px", fontSize: "11px" }}
                formatter={(val) => (
                  <span className="text-xs font-semibold text-[#17231B]">
                    {val === "pg1" ? "Plantation Group 1" : val === "pg2" ? "Plantation Group 2" : "Plantation Group 3"}
                  </span>
                )}
              />
              <Bar
                dataKey="pg1"
                name="pg1"
                fill="#16823B"
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-pg1-${entry.month}`}
                    fill="#16823B"
                    opacity={entry.month === selectedPeriod ? 1 : 0.75}
                    stroke={entry.month === selectedPeriod ? "#0F5A28" : "none"}
                    strokeWidth={entry.month === selectedPeriod ? 2 : 0}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="pg2"
                name="pg2"
                fill="#29A9D6"
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-pg2-${entry.month}`}
                    fill="#29A9D6"
                    opacity={entry.month === selectedPeriod ? 1 : 0.75}
                    stroke={entry.month === selectedPeriod ? "#1B7E9F" : "none"}
                    strokeWidth={entry.month === selectedPeriod ? 2 : 0}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="pg3"
                name="pg3"
                fill="#E5C959"
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-pg3-${entry.month}`}
                    fill="#E5C959"
                    opacity={entry.month === selectedPeriod ? 1 : 0.75}
                    stroke={entry.month === selectedPeriod ? "#B59D38" : "none"}
                    strokeWidth={entry.month === selectedPeriod ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-[#5F6B63] bg-[#F8FAF9] border border-[#DDE5DF] px-3.5 py-2 rounded-xl">
        <span>
          Filter Cost Element aktif: <strong className="text-[#16823B]">{selectedCe2} ({currentCe2?.deskripsiCe2 || selectedCe2})</strong>
        </span>
        <span className="text-[#89938D]">
          Bulan aktif: {data.find((d) => d.month === selectedPeriod)?.monthName || selectedPeriod} (Diberi aksen batas pada batang)
        </span>
      </div>
    </div>
  );
}
