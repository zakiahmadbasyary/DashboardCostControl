"use client";

import React from "react";
import { TrendingUp, MapPin } from "lucide-react";
import { HppFilterState } from "./HppMainFilters";

export interface TrendPoint {
  month: number;
  label: string;
  cost: number;
  qty: number;
  luas: number;
  valRpKg: number;
  valRpHa: number;
}

export interface WilayahPoint {
  wilayah: string;
  cost: number;
  qty: number;
  luas: number;
  valRpKg: number;
  valRpHa: number;
}

interface HppTrendAndWilayahChartsProps {
  trendData: TrendPoint[];
  ytdPoint: TrendPoint | null;
  wilayahData: WilayahPoint[];
  filters: HppFilterState;
  onSelectMonth?: (month: number) => void;
  onSelectWilayah?: (wilayah: string) => void;
  loading?: boolean;
}

// Curated GGF AgroMetric palette for Wilayah Bars
const WILAYAH_COLORS: Record<string, { bg: string; hover: string }> = {
  W01: { bg: "bg-[#00A896]", hover: "hover:bg-[#008f80]" }, // Teal Cyan
  W02: { bg: "bg-[#F9A91B]", hover: "hover:bg-[#e09412]" }, // GGF Orange
  W03: { bg: "bg-[#29A9D6]", hover: "hover:bg-[#208bb2]" }, // GGF Cyan Blue
  W04: { bg: "bg-[#A8D437]", hover: "hover:bg-[#92ba2b]" }, // GGF Light Green
  W05: { bg: "bg-[#0B6B32]", hover: "hover:bg-[#074f24]" }, // GGF Dark Green
  W06: { bg: "bg-[#FCE27A]", hover: "hover:bg-[#e5ca59]" }, // GGF Yellow
  W07: { bg: "bg-[#16823B]", hover: "hover:bg-[#11682f]" }, // GGF Primary Green
};

export default function HppTrendAndWilayahCharts({
  trendData,
  ytdPoint,
  wilayahData,
  filters,
  onSelectMonth,
  onSelectWilayah,
  loading,
}: HppTrendAndWilayahChartsProps) {
  const isRpKg = filters.reportFilter === "rp_kg";
  const unitLabel = isRpKg ? "Rp/Kg" : "Rp/Ha";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatValNumber = (val: number) => {
    if (!val || val <= 0) return "-";
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  // Calculate scaling max values for both bar charts
  const allTrendVals = [
    ...trendData.map((t) => (isRpKg ? t.valRpKg : t.valRpHa)),
    ytdPoint ? (isRpKg ? ytdPoint.valRpKg : ytdPoint.valRpHa) : 0,
  ];
  const maxTrendVal = Math.max(...allTrendVals, 10);

  const allWilayahVals = wilayahData.map((w) => (isRpKg ? w.valRpKg : w.valRpHa));
  const maxWilayahVal = Math.max(...allWilayahVals, 10);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#DDE5DF] animate-pulse h-80"></div>
        <div className="bg-white p-6 rounded-2xl border border-[#DDE5DF] animate-pulse h-80"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ----------------------------------------------------------------- */}
      {/* CHART 1 (LEFT): Trend HPP Pine PG1 (Vertical Bar Chart)           */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white p-5 rounded-2xl border border-[#DDE5DF] shadow-2xs flex flex-col justify-between">
        <div>
          {/* Card Header Title */}
          <div className="flex items-center justify-between mb-4 border-b border-[#EAEFEB] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#17231B] tracking-tight">
                  Trend HPP Pine PG1
                </h2>
                <p className="text-xs text-[#5F6B63] font-medium">
                  Rincian per bulan (Jan - Des) & Akumulasi YTD ({unitLabel})
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#16823B] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {unitLabel}
            </span>
          </div>

          {/* Vertical Bar Chart Container */}
          <div className="pt-2 overflow-x-auto">
            <div className="min-w-[440px]">

              {/* Bars Area */}
              <div className="flex items-end justify-between gap-1.5 h-48 pb-1">
                {trendData.map((item) => {
                  const val = isRpKg ? item.valRpKg : item.valRpHa;
                  const heightPercent = maxTrendVal > 0 ? (val / maxTrendVal) * 100 : 0;
                  const isSelected = filters.periodeFilter === item.month;

                  return (
                    <div
                      key={item.month}
                      onClick={() => onSelectMonth?.(item.month)}
                      className="flex-1 flex flex-col items-center group cursor-pointer"
                      title={`${item.label}: ${formatCurrency(val)} (${unitLabel})`}
                    >
                      {/* Number value label on top of bar */}
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold mb-1 transition-all truncate ${isSelected ? "text-[#B45309] scale-110 font-black" : "text-[#17231B] opacity-90 group-hover:opacity-100"
                          }`}
                      >
                        {formatValNumber(val)}
                      </span>

                      {/* Bar Track Container */}
                      <div className="w-full bg-[#F2F6F3] rounded-t-md h-36 flex items-end overflow-hidden p-0.5">
                        <div
                          className={`w-full rounded-t transition-all duration-300 ${isSelected
                              ? "bg-[#FCE27A] ring-2 ring-[#E5C959] shadow-md"
                              : "bg-[#8CC63F] group-hover:bg-[#16823B]"
                            }`}
                          style={{ height: `${Math.max(heightPercent, val > 0 ? 5 : 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}

                {/* YTD Bar Column */}
                {ytdPoint && (
                  <div
                    className="flex-1 flex flex-col items-center group cursor-pointer border-l border-dashed border-[#D5E1D8] pl-1.5"
                    title={`YTD Accumulation: ${formatCurrency(
                      isRpKg ? ytdPoint.valRpKg : ytdPoint.valRpHa
                    )} (${unitLabel})`}
                  >
                    <span className="text-[10px] sm:text-[11px] font-black text-[#17231B] mb-1">
                      {formatValNumber(isRpKg ? ytdPoint.valRpKg : ytdPoint.valRpHa)}
                    </span>

                    <div className="w-full bg-emerald-50 rounded-t-md h-36 flex items-end overflow-hidden p-0.5 border border-emerald-200">
                      <div
                        className="w-full bg-[#8CC63F] hover:bg-[#16823B] rounded-t transition-all duration-300 shadow-xs"
                        style={{
                          height: `${Math.max(
                            maxTrendVal > 0
                              ? ((isRpKg ? ytdPoint.valRpKg : ytdPoint.valRpHa) / maxTrendVal) * 100
                              : 0,
                            5
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Solid Base Baseline */}
              <div className="w-full h-[2px] bg-[#17231B]/20 rounded-full"></div>

              {/* Month Labels Axis */}
              <div className="flex justify-between gap-1.5 mt-2">
                {trendData.map((item) => {
                  const isSelected = filters.periodeFilter === item.month;
                  return (
                    <span
                      key={item.month}
                      onClick={() => onSelectMonth?.(item.month)}
                      className={`flex-1 text-center text-xs font-bold cursor-pointer transition-colors ${isSelected ? "text-[#B45309] underline font-extrabold" : "text-[#17231B]"
                        }`}
                    >
                      {item.label}
                    </span>
                  );
                })}
                {ytdPoint && (
                  <span className="flex-1 text-center text-xs font-black text-[#17231B] uppercase pl-1.5">
                    YTD
                  </span>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-2 border-t border-[#EAEFEB] text-[11px] text-[#5F6B63] flex justify-between items-center">
          <span>Klik batang bulan untuk memilih periode</span>
          <span className="font-bold text-[#16823B]">PG1 Pine Trend</span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* CHART 2 (RIGHT): HPP Per Wilayah (Vertical Bar Chart)            */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white p-5 rounded-2xl border border-[#DDE5DF] shadow-2xs flex flex-col justify-between">
        <div>
          {/* Card Header Title */}
          <div className="flex items-center justify-between mb-4 border-b border-[#EAEFEB] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#17231B] tracking-tight">
                  HPP Per Wilayah
                </h2>
                <p className="text-xs text-[#5F6B63] font-medium">
                  Perbandingan HPP Wilayah W01 s/d W07 ({unitLabel})
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              W01 - W07
            </span>
          </div>

          {/* Vertical Bar Chart Container */}
          <div className="pt-2 overflow-x-auto">
            <div className="min-w-[360px]">

              {/* Bars Area */}
              <div className="flex items-end justify-between gap-2.5 h-48 pb-1">
                {wilayahData.map((item) => {
                  const val = isRpKg ? item.valRpKg : item.valRpHa;
                  const heightPercent = maxWilayahVal > 0 ? (val / maxWilayahVal) * 100 : 0;
                  const isSelected = filters.wilayahFilter === item.wilayah;
                  const palette = WILAYAH_COLORS[item.wilayah] || { bg: "bg-[#16823B]", hover: "hover:bg-[#0B6B32]" };

                  return (
                    <div
                      key={item.wilayah}
                      onClick={() => onSelectWilayah?.(isSelected ? "all" : item.wilayah)}
                      className="flex-1 flex flex-col items-center group cursor-pointer"
                      title={`Wilayah ${item.wilayah}: ${formatCurrency(val)} (${unitLabel})`}
                    >
                      {/* Number value label on top of bar */}
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold mb-1 transition-all truncate ${isSelected ? "text-[#17231B] scale-110 underline font-black" : "text-[#17231B] opacity-90 group-hover:opacity-100"
                          }`}
                      >
                        {formatValNumber(val)}
                      </span>

                      {/* Bar Track Container */}
                      <div className="w-full bg-[#F2F6F3] rounded-t-md h-36 flex items-end overflow-hidden p-0.5">
                        <div
                          className={`w-full rounded-t transition-all duration-300 ${palette.bg} ${palette.hover} ${isSelected ? "ring-2 ring-[#17231B] shadow-md scale-[1.02]" : ""
                            }`}
                          style={{ height: `${Math.max(heightPercent, val > 0 ? 5 : 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Solid Base Baseline */}
              <div className="w-full h-[2px] bg-[#17231B]/20 rounded-full"></div>

              {/* Wilayah Labels Axis */}
              <div className="flex justify-between gap-2.5 mt-2">
                {wilayahData.map((item) => {
                  const isSelected = filters.wilayahFilter === item.wilayah;
                  return (
                    <span
                      key={item.wilayah}
                      onClick={() => onSelectWilayah?.(isSelected ? "all" : item.wilayah)}
                      className={`flex-1 text-center text-xs font-extrabold cursor-pointer transition-colors ${isSelected ? "text-[#16823B] underline" : "text-[#17231B]"
                        }`}
                    >
                      {item.wilayah}
                    </span>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-2 border-t border-[#EAEFEB] text-[11px] text-[#5F6B63] flex justify-between items-center">
          <span>Klik batang wilayah untuk menyaring daftar lokasi</span>
          <span className="font-bold text-[#16823B]">GGF Region Summary</span>
        </div>
      </div>

    </div>
  );
}
