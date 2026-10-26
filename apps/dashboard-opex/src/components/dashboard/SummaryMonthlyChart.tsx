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
import { MonthlyChartDataPoint } from "@/types/opex";
import { BarChart3, TrendingUp, TrendingDown, Wallet, Activity } from "lucide-react";

interface SummaryMonthlyChartProps {
  data: MonthlyChartDataPoint[];
  totalActual: number;
  totalBudget: number;
  totalVariance: number | null;
  selectedPeriod: number;
  onSelectPeriod: (period: number) => void;
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

  const actualEntry = payload.find((p: any) => p.dataKey === "actual");
  const budgetEntry = payload.find((p: any) => p.dataKey === "budget");

  const actualVal = actualEntry ? Number(actualEntry.value) : 0;
  const budgetVal = budgetEntry ? Number(budgetEntry.value) : 0;
  const diff = actualVal - budgetVal;
  const variancePct = budgetVal > 0 ? (diff / budgetVal) * 100 : null;

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-lg text-xs min-w-[220px]">
      <div className="font-bold text-[#17231B] pb-2 mb-2 border-b border-[#DDE5DF] flex items-center justify-between">
        <span>Periode: <strong className="text-[#16823B] font-extrabold">{label}</strong></span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16823B] shrink-0" />
            <span className="text-[#5F6B63] font-medium">Actual:</span>
          </div>
          <span className="font-mono font-bold text-[#17231B]">
            Rp {actualVal.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A8D437] shrink-0" />
            <span className="text-[#5F6B63] font-medium">Budget:</span>
          </div>
          <span className="font-mono font-bold text-[#17231B]">
            Rp {budgetVal.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="pt-2 mt-1 border-t border-[#DDE5DF] flex items-center justify-between gap-3">
          <span className="text-[#5F6B63] font-semibold">Variance:</span>
          {variancePct !== null ? (
            <span
              className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                variancePct > 0
                  ? "bg-rose-50 text-rose-600 border border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {variancePct > 0 ? `+${variancePct.toFixed(2)}%` : `${variancePct.toFixed(2)}%`}
            </span>
          ) : (
            <span className="text-[#89938D] font-mono">-</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SummaryMonthlyChart({
  data,
  totalActual,
  totalBudget,
  totalVariance,
  selectedPeriod,
  onSelectPeriod,
  loading,
}: SummaryMonthlyChartProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs h-[420px] flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-3 border-[#16823B] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#5F6B63]">
          Memuat grafik ringkasan Actual vs Budget bulanan...
        </p>
      </div>
    );
  }

  const isOverBudget = totalVariance !== null && totalVariance > 0;

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* ── Header Card & KPI Summary ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DF]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-[#17231B] tracking-tight">
              Ringkasan OPEX PG1 — Actual vs Budget per Bulan
            </h3>
          </div>
          <p className="text-xs text-[#5F6B63]">
            Grafik komparasi pengeluaran riil terhadap pagu anggaran untuk Plantation Group 1 (Klik batang untuk memilih bulan)
          </p>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
          {/* Total Budget */}
          <div className="bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl px-3 py-2">
            <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider">
              <span>Budget (YTD)</span>
              <Wallet className="w-3 h-3 text-[#5F6B63]" />
            </div>
            <div className="mt-1 font-mono font-extrabold text-xs sm:text-sm text-[#17231B]">
              Rp {formatIdrCompact(totalBudget)}
            </div>
          </div>

          {/* Total Actual */}
          <div className="bg-[#EAF3EC] border border-[#CBE0D1] rounded-xl px-3 py-2">
            <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-[#16823B] uppercase tracking-wider">
              <span>Actual (YTD)</span>
              <Activity className="w-3 h-3 text-[#16823B]" />
            </div>
            <div className="mt-1 font-mono font-extrabold text-xs sm:text-sm text-[#16823B]">
              Rp {formatIdrCompact(totalActual)}
            </div>
          </div>

          {/* Variance */}
          <div
            className={`border rounded-xl px-3 py-2 ${
              isOverBudget
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wider">
              <span>Variance Total</span>
              {isOverBudget ? (
                <TrendingUp className="w-3 h-3 text-rose-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-emerald-700" />
              )}
            </div>
            <div className="mt-1 font-mono font-black text-xs sm:text-sm">
              {totalVariance !== null
                ? `${totalVariance > 0 ? "+" : ""}${totalVariance.toFixed(2)}%`
                : "-"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart Container ── */}
      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onClick={(state: any) => {
              const idx = state?.activeTooltipIndex;
              if (typeof idx === "number" && data[idx]) {
                const month = data[idx].month;
                if (month) onSelectPeriod(month);
              }
            }}
          >
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
              formatter={(value) => (
                <span className="text-xs font-semibold text-[#17231B] capitalize">
                  {value === "actual" ? "Nilai Actual" : "Nilai Budget"}
                </span>
              )}
            />
            <Bar
              dataKey="actual"
              name="actual"
              fill="#16823B"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              cursor="pointer"
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-act-${entry.month}`}
                  fill={entry.month === selectedPeriod ? "#16823B" : "#16823B"}
                  opacity={entry.month === selectedPeriod ? 1 : 0.75}
                  stroke={entry.month === selectedPeriod ? "#0F5A28" : "none"}
                  strokeWidth={entry.month === selectedPeriod ? 2 : 0}
                />
              ))}
            </Bar>
            <Bar
              dataKey="budget"
              name="budget"
              fill="#A8D437"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              cursor="pointer"
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-bgt-${entry.month}`}
                  fill="#A8D437"
                  opacity={entry.month === selectedPeriod ? 1 : 0.65}
                  stroke={entry.month === selectedPeriod ? "#7EA822" : "none"}
                  strokeWidth={entry.month === selectedPeriod ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#5F6B63] bg-[#F8FAF9] border border-[#DDE5DF] px-3.5 py-2 rounded-xl">
        <span>
          Bulan aktif: <strong className="text-[#16823B] font-bold">{data.find((d) => d.month === selectedPeriod)?.monthName || selectedPeriod}</strong> (Diberi aksen batas tegas pada grafik)
        </span>
        <span className="text-[#89938D]">
          Variance Total = ((Total Actual − Total Budget) ÷ Total Budget) × 100
        </span>
      </div>
    </div>
  );
}
