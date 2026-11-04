"use client";

import React, { useState, useEffect } from "react";
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
import { PgIndicatorKey, PG_INDICATORS } from "./IndicatorFilter";
import { formatCurrencyRp, formatNumberId, formatRatioId } from "@/lib/formatters";
import { BarChart3, AlertCircle } from "lucide-react";

interface PgComparisonChartProps {
  data: any[];
  indicator: PgIndicatorKey;
  loading?: boolean;
}

// Skema warna PG persis seperti pada grafik Trend & Komparasi Antar PG proyek OPEX
const PG_COLORS = {
  PG1: "#16823B", // Hijau Tua GGF
  PG2: "#29A9D6", // Biru Terang GGF
  PG3: "#E5C959", // Kuning WIP / Gold
};

// Formatter ringkas horizontal agar nilai terbaca jelas & tidak tumpang tindih
function formatBarValue(val: any, indicatorKey: PgIndicatorKey): string {
  if (val === null || val === undefined || isNaN(val) || val === 0) return "";
  const num = Number(val);

  if (indicatorKey === "upahHa" || indicatorKey === "upahBatang") {
    if (num >= 1_000_000) {
      const formatted = (num / 1_000_000).toFixed(1).replace(".", ",");
      return formatted.endsWith(",0") ? `${(num / 1_000_000).toFixed(0)}jt` : `${formatted}jt`;
    }
    if (num >= 1_000) {
      return `${Math.round(num / 1_000)}k`;
    }
    return `${Math.round(num)}`;
  }

  if (indicatorKey === "costTkBulan") {
    if (num >= 1_000_000_000) {
      const formatted = (num / 1_000_000_000).toFixed(1).replace(".", ",");
      return formatted.endsWith(",0") ? `${(num / 1_000_000_000).toFixed(0)}M` : `${formatted}M`;
    }
    if (num >= 1_000_000) {
      return `${Math.round(num / 1_000_000)}jt`;
    }
    return `${Math.round(num / 1_000)}k`;
  }

  if (indicatorKey === "batangHa" || indicatorKey === "tkBulan") {
    if (num >= 1_000) {
      const formatted = (num / 1_000).toFixed(1).replace(".", ",");
      return formatted.endsWith(",0") ? `${(num / 1_000).toFixed(0)}k` : `${formatted}k`;
    }
    return `${Math.round(num)}`;
  }

  if (indicatorKey === "batangTk") {
    return `${num.toFixed(0)}`;
  }

  return `${num}`;
}

export default function PgComparisonChart({
  data,
  indicator,
  loading,
}: PgComparisonChartProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  // Custom label renderer horizontal di atas setiap bar (hanya tampil di desktop, ringkas & tidak tumpang tindih)
  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (!isDesktop || value === null || value === undefined || value === 0) return null;

    const labelText = formatBarValue(value, indicator);
    if (!labelText) return null;

    const cx = x + width / 2;
    const cy = y - 5;

    return (
      <text
        x={cx}
        y={cy}
        fill="#17231B"
        fontSize={8}
        fontWeight={700}
        fontFamily="system-ui, -apple-system, sans-serif"
        textAnchor="middle"
        className="select-none pointer-events-none"
      >
        {labelText}
      </text>
    );
  };

  // Floating Tooltip bergaya OPEX (Background Putih, Border Lembut, Text Elegan)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const fullMonth = payload[0]?.payload?.monthFull || label;

    return (
      <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-lg text-xs min-w-[210px] sm:min-w-[220px] font-sans">
        {/* Tooltip Header */}
        <div className="font-bold text-[#17231B] pb-2 mb-2 border-b border-[#DDE5DF] flex items-center justify-between">
          <div>
            Periode: <strong className="text-[#16823B]">{fullMonth}</strong>
          </div>
          <span className="text-[10px] font-semibold text-[#89938D] bg-[#F8FAF9] px-1.5 py-0.5 rounded border border-[#DDE5DF]">
            {currentIndicator.unit}
          </span>
        </div>

        {/* Rows for PG1, PG2, PG3 */}
        <div className="space-y-1.5">
          {payload.map((item: any) => (
            <div key={item.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#5F6B63]">{item.dataKey}:</span>
              </div>
              <span className="font-mono font-bold text-[#17231B]">
                {formatValue(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-sm shadow-[#16823B]/5 flex flex-col gap-5 font-sans">
      {/* ── Top Bar: Title, Legend & Unit (Sama persis seperti OPEX) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DF]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B] tracking-tight">
              Grafik Perbandingan Antar-PG --- {currentIndicator.label}
            </h3>
            <p className="text-xs text-[#5F6B63]">
              Perbandingan tren 12 bulan (Januari--Desember) antara PG1, PG2, dan PG3.
            </p>
          </div>
        </div>

        {/* Legend & Unit Pill */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-center shrink-0">
          <div className="flex items-center gap-3 text-xs text-[#5F6B63]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16823B]" />
              <span className="font-semibold text-[#17231B]">PG1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#29A9D6]" />
              <span className="font-semibold text-[#17231B]">PG2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5C959]" />
              <span className="font-semibold text-[#17231B]">PG3</span>
            </div>
          </div>

          <span className="hidden sm:inline-block text-[11px] font-semibold text-[#89938D] bg-[#F8FAF9] px-2 py-0.5 rounded-lg border border-[#DDE5DF]">
            {currentIndicator.unit}
          </span>
        </div>
      </div>

      {/* Sub-header keterangan grafik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 -mt-1">
        <span className="text-xs font-bold text-[#17231B]">
          Grafik Realisasi Bulanan ({currentIndicator.label})
        </span>
        <span className="text-[11px] text-[#5F6B63]">
          {isDesktop
            ? "Label nilai horizontal di atas setiap bar. Sorot batang untuk rincian lengkap."
            : "Geser grafik ke samping untuk melihat seluruh bulan & sorot batang untuk rincian angka."}
        </span>
      </div>

      {/* Chart Canvas: Desktop w-full tanpa scroll, Mobile scrollable tanpa angka nilai */}
      {loading ? (
        <div className="h-80 flex flex-col items-center justify-center gap-2 text-xs font-semibold text-[#5F6B63]">
          <div className="w-7 h-7 border-3 border-[#16823B] border-t-transparent rounded-full animate-spin mb-1" />
          <span>Memuat diagram perbandingan antar PG...</span>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-80 flex flex-col items-center justify-center gap-2 text-xs text-[#5F6B63]">
          <AlertCircle className="w-8 h-8 text-[#E5C959]" />
          <span className="font-bold text-[#17231B]">Tidak ada data untuk periode ini</span>
        </div>
      ) : (
        <div className="w-full overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-thin">
          <div className="min-w-[620px] md:min-w-0 w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 25, right: 10, left: 10, bottom: 20 }}
                barGap={2}
                barCategoryGap="14%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEF" vertical={false} />
                <XAxis
                  dataKey="monthName"
                  tick={{ fill: "#5F6B63", fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: "#DDE5DF" }}
                />
                <YAxis
                  domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]}
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
                <Bar dataKey="PG1" name="PG1" fill={PG_COLORS.PG1} radius={[3, 3, 0, 0]} maxBarSize={28}>
                  {isDesktop && <LabelList content={renderCustomBarLabel} />}
                </Bar>
                <Bar dataKey="PG2" name="PG2" fill={PG_COLORS.PG2} radius={[3, 3, 0, 0]} maxBarSize={28}>
                  {isDesktop && <LabelList content={renderCustomBarLabel} />}
                </Bar>
                <Bar dataKey="PG3" name="PG3" fill={PG_COLORS.PG3} radius={[3, 3, 0, 0]} maxBarSize={28}>
                  {isDesktop && <LabelList content={renderCustomBarLabel} />}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Status Bar Keterangan Bawah (Sama persis seperti OPEX) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#5F6B63] bg-[#F8FAF9] border border-[#DDE5DF] px-3.5 py-2 rounded-xl">
        <span>
          Indikator Terpilih: <strong className="text-[#16823B]">{currentIndicator.label}</strong> ({currentIndicator.desc})
        </span>
        <span className="text-[#89938D]">
          Satuan: <strong className="text-[#16823B] font-mono">{currentIndicator.unit}</strong>
        </span>
      </div>
    </div>
  );
}
