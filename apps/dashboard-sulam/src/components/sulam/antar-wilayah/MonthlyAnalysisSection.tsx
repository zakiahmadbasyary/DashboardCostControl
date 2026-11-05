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
  LabelList,
} from "recharts";
import { DollarSign, TrendingUp, Users, Sprout } from "lucide-react";
import { formatCurrencyRp, formatNumberId } from "@/lib/formatters";

const MONTH_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

interface MonthlyAnalysisSectionProps {
  selectedMonth: number;
  onMonthChange?: (month: number) => void;
  monthsWithData?: number[];
  chartsData: any[];
  loading?: boolean;
}

// ── Custom Label Renderers (Horizontal, Ringkas, Tidak Tumpang Tindih) ──

// 1. Label untuk Cost per Wilayah (contoh: "198 Jt", "56 Jt", "117 Jt")
const renderCostLabel = (props: any) => {
  const { x, y, width, value } = props;
  const num = Number(value);
  if (!num || isNaN(num) || num <= 0) return null;

  let labelText = "";
  if (num >= 1_000_000_000) {
    const formatted = (num / 1_000_000_000).toFixed(1).replace(".", ",");
    labelText = formatted.endsWith(",0")
      ? `${(num / 1_000_000_000).toFixed(0)} M`
      : `${formatted} M`;
  } else if (num >= 1_000_000) {
    labelText = `${Math.round(num / 1_000_000)} Jt`;
  } else if (num >= 1_000) {
    labelText = `${Math.round(num / 1_000)} rb`;
  } else {
    labelText = `${Math.round(num)}`;
  }

  const cx = x + width / 2;
  const cy = y - 5;

  return (
    <text
      x={cx}
      y={cy}
      fill="#17231B"
      fontSize={9.5}
      fontWeight={700}
      fontFamily="system-ui, -apple-system, sans-serif"
      textAnchor="middle"
      className="select-none pointer-events-none"
    >
      {labelText}
    </text>
  );
};

// 2. Label untuk Cost / HA per Wilayah (contoh: "31,9", "20,0", "12,4")
const renderCostHaLabel = (props: any) => {
  const { x, y, width, value } = props;
  const num = Number(value);
  if (!num || isNaN(num) || num <= 0) return null;

  const labelText = num.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const cx = x + width / 2;
  const cy = y - 5;

  return (
    <text
      x={cx}
      y={cy}
      fill="#17231B"
      fontSize={9.5}
      fontWeight={700}
      fontFamily="system-ui, -apple-system, sans-serif"
      textAnchor="middle"
      className="select-none pointer-events-none"
    >
      {labelText}
    </text>
  );
};

// 3. Label untuk Penggunaan TK Sulam (contoh: "3.053", "544", "141")
const renderTkLabel = (props: any) => {
  const { x, y, width, value } = props;
  const num = Number(value);
  if (!num || isNaN(num) || num <= 0) return null;

  const labelText = Math.round(num).toLocaleString("id-ID");

  const cx = x + width / 2;
  const cy = y - 5;

  return (
    <text
      x={cx}
      y={cy}
      fill="#17231B"
      fontSize={9.5}
      fontWeight={700}
      fontFamily="system-ui, -apple-system, sans-serif"
      textAnchor="middle"
      className="select-none pointer-events-none"
    >
      {labelText}
    </text>
  );
};

// 4. Label untuk Penggunaan Batang Sulam (contoh: "875k", "668k", "250k", "1.001k")
const renderBatangLabel = (props: any) => {
  const { x, y, width, value } = props;
  const num = Number(value);
  if (!num || isNaN(num) || num <= 0) return null;

  let labelText = "";
  if (num >= 1_000) {
    labelText = `${Math.round(num / 1_000).toLocaleString("id-ID")}k`;
  } else {
    labelText = Math.round(num).toLocaleString("id-ID");
  }

  const cx = x + width / 2;
  const cy = y - 5;

  return (
    <text
      x={cx}
      y={cy}
      fill="#17231B"
      fontSize={9.5}
      fontWeight={700}
      fontFamily="system-ui, -apple-system, sans-serif"
      textAnchor="middle"
      className="select-none pointer-events-none"
    >
      {labelText}
    </text>
  );
};

export default function MonthlyAnalysisSection({
  selectedMonth,
  chartsData,
  loading,
}: MonthlyAnalysisSectionProps) {
  const currentMonthName = MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || "";

  return (
    <div className="space-y-4 font-sans">
      {/* Header Analisis per Wilayah (Style seragam dengan Perbandingan Bulanan) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black text-[#17231B] tracking-tight">
            Analisis per Wilayah --- {currentMonthName}
          </h2>
          <p className="text-xs text-[#5F6B63] mt-0.5">
            Analisis biaya, cost per hektar, tenaga kerja, dan batang bibit pada bulan {currentMonthName}.
          </p>
        </div>
      </div>

      {/* Grid 2x2 Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grafik 1: Cost per Wilayah */}
        <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#EAF3EC] text-[#16823B] shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#17231B]">
                Cost per Wilayah
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
              Rupiah
            </span>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData} margin={{ top: 22, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
                <XAxis dataKey="wilayah" tick={{ fill: "#5F6B63", fontSize: 10 }} tickLine={false} />
                <YAxis
                  tick={{ fill: "#5F6B63", fontSize: 9 }}
                  tickLine={false}
                  domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.18) : 10)]}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-[#17231B] text-white p-2.5 rounded-xl shadow-xl text-xs">
                        <div className="font-bold border-b border-gray-700 pb-1 mb-1">
                          {label} --- {currentMonthName}
                        </div>
                        <div>Total Biaya: {formatCurrencyRp(payload[0].value as number)}</div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="costTotal" name="Total Biaya" fill="#16823B" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  <LabelList dataKey="costTotal" content={renderCostLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: Cost/HA per Wilayah */}
        <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#EAF3EC] text-[#16823B] shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#17231B]">
                Cost / HA per Wilayah
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#29A9D6] border border-blue-200">
              Juta Rp / HA
            </span>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData} margin={{ top: 22, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
                <XAxis dataKey="wilayah" tick={{ fill: "#5F6B63", fontSize: 10 }} tickLine={false} />
                <YAxis
                  tick={{ fill: "#5F6B63", fontSize: 9 }}
                  tickLine={false}
                  domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.18) : 10)]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const val = payload[0].value;
                    return (
                      <div className="bg-[#17231B] text-white p-2.5 rounded-xl shadow-xl text-xs">
                        <div className="font-bold border-b border-gray-700 pb-1 mb-1">
                          {label} --- {currentMonthName}
                        </div>
                        <div>
                          Cost/HA: {val !== null ? `${formatNumberId(val as number, 2)} Juta Rp/HA` : "-"}
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="costPerHaJuta" name="Cost/HA" fill="#29A9D6" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  <LabelList dataKey="costPerHaJuta" content={renderCostHaLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 3: Penggunaan TK Sulam */}
        <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-[#F9A91B] shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#17231B]">
                Penggunaan TK Sulam
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Tenaga Kerja (TK)
            </span>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData} margin={{ top: 22, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
                <XAxis dataKey="wilayah" tick={{ fill: "#5F6B63", fontSize: 10 }} tickLine={false} />
                <YAxis
                  tick={{ fill: "#5F6B63", fontSize: 9 }}
                  tickLine={false}
                  domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.18) : 10)]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-[#17231B] text-white p-2.5 rounded-xl shadow-xl text-xs">
                        <div className="font-bold border-b border-gray-700 pb-1 mb-1">
                          {label} --- {currentMonthName}
                        </div>
                        <div>Total TK: {formatNumberId(payload[0].value as number, 1)} TK</div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="penggunaanTk" name="Total TK" fill="#F9A91B" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  <LabelList dataKey="penggunaanTk" content={renderTkLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 4: Penggunaan Batang Sulam */}
        <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-[#0B6B32] shrink-0">
                <Sprout className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#17231B]">
                Penggunaan Batang Sulam
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Batang Bibit
            </span>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData} margin={{ top: 22, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
                <XAxis dataKey="wilayah" tick={{ fill: "#5F6B63", fontSize: 10 }} tickLine={false} />
                <YAxis
                  tick={{ fill: "#5F6B63", fontSize: 9 }}
                  tickLine={false}
                  domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.18) : 10)]}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-[#17231B] text-white p-2.5 rounded-xl shadow-xl text-xs">
                        <div className="font-bold border-b border-gray-700 pb-1 mb-1">
                          {label} --- {currentMonthName}
                        </div>
                        <div>Total Batang: {formatNumberId(payload[0].value as number, 0)} Btg</div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="penggunaanBatang" name="Total Batang" fill="#0B6B32" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  <LabelList dataKey="penggunaanBatang" content={renderBatangLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
