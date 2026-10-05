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

// Curated Green Gradient Palette for Wilayah Bars (Hijau Muda -> Hijau Tua)
const WILAYAH_COLORS: Record<string, string> = {
  W01: "#B5E397",  // Hijau Muda (Light Green)
  AW01: "#B5E397",
  W02: "#8CD16B",  // Hijau Cerah
  AW02: "#8CD16B",
  W03: "#60B647",  // Hijau Sedang-Muda
  AW03: "#60B647",
  W04: "#3B9C3D",  // Hijau Sedang
  AW04: "#3B9C3D",
  W05: "#16823B",  // Hijau Utama
  AW05: "#16823B",
  W06: "#0E632A",  // Hijau Tua
  AW06: "#0E632A",
  W07: "#06451B",  // Hijau Sangat Tua (Dark Green)
  AW07: "#06451B",
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
    if (isRpKg) {
      return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0,
      }).format(Math.round(val));
    } else {
      const valJuta = val / 1_000_000;
      return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      }).format(valJuta);
    }
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
      <div className="bg-white p-5 rounded-2xl border border-[#DDE5DF] shadow-sm shadow-[#16823B]/5 flex flex-col justify-between">
        <div>
          {/* Card Header Title */}
          <div className="flex items-center justify-between mb-4 border-b border-[#DDE5DF] pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#17231B]">
                  Trend HPP Pine PG1
                </h3>
                <p className="text-xs text-[#5F6B63]">
                  Rincian per bulan (Jan - Des) &amp; Akumulasi YTD ({unitLabel})
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#16823B] bg-[#16823B]/10 px-2.5 py-1 rounded-lg border border-[#16823B]/20">
              {unitLabel}
            </span>
          </div>

          {/* Vertical Bar Chart Container */}
          <div className="pt-2 w-full">
            <div className="w-full">

              {/* Bars Area */}
              <div className="flex items-end justify-between gap-0.5 sm:gap-1.5 h-48 pb-1 w-full">
                {trendData.map((item) => {
                  const val = isRpKg ? item.valRpKg : item.valRpHa;
                  const heightPercent = maxTrendVal > 0 ? (val / maxTrendVal) * 100 : 0;
                  const isSelected = filters.periodeFilter === item.month;

                  return (
                    <div
                      key={item.month}
                      onClick={() => onSelectMonth?.(item.month)}
                      className="flex-1 flex flex-col items-center group cursor-pointer min-w-0"
                      title={`${item.label}: ${formatCurrency(val)} (${unitLabel})`}
                    >
                      {/* Number value label on top of bar */}
                      <span
                        className={`text-[8px] min-[380px]:text-[9px] sm:text-[11px] font-mono mb-1 transition-all truncate tracking-tighter w-full text-center ${
                          isSelected ? "text-[#16823B] font-bold scale-105" : "text-[#17231B] font-semibold opacity-90 group-hover:opacity-100"
                        }`}
                      >
                        {formatValNumber(val)}
                      </span>

                      {/* Bar Track Container */}
                      <div className="w-full bg-[#F2F6F3] rounded-t-md h-36 flex items-end overflow-hidden p-0.5">
                        <div
                          className={`w-full rounded-t transition-all duration-300 ${
                            isSelected
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
                    className="flex-1 flex flex-col items-center group cursor-pointer border-l border-dashed border-[#D5E1D8] pl-0.5 sm:pl-1.5 min-w-0"
                    title={`YTD Accumulation: ${formatCurrency(
                      isRpKg ? ytdPoint.valRpKg : ytdPoint.valRpHa
                    )} (${unitLabel})`}
                  >
                    <span className="text-[8px] min-[380px]:text-[9px] sm:text-[11px] font-mono font-bold text-[#16823B] mb-1 truncate tracking-tighter w-full text-center">
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
              <div className="flex justify-between gap-0.5 sm:gap-1.5 mt-2 w-full">
                {trendData.map((item) => {
                  const isSelected = filters.periodeFilter === item.month;
                  return (
                    <span
                      key={item.month}
                      onClick={() => onSelectMonth?.(item.month)}
                      className={`flex-1 text-center text-[9px] sm:text-xs transition-colors truncate ${
                        isSelected ? "text-[#16823B] underline font-bold" : "text-[#5F6B63] font-semibold hover:text-[#17231B]"
                      }`}
                    >
                      {item.label}
                    </span>
                  );
                })}
                {ytdPoint && (
                  <span className="flex-1 text-center text-[9px] sm:text-xs font-bold text-[#16823B] uppercase pl-0.5 sm:pl-1.5 truncate">
                    YTD
                  </span>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-[#DDE5DF]/60 text-xs text-[#5F6B63] flex justify-between items-center">
          <span>Klik batang bulan untuk menyaring periode</span>
          <span className="font-semibold text-[#16823B]">PG1 Pine Trend</span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* CHART 2 (RIGHT): HPP Per Wilayah (Vertical Bar Chart)            */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white p-5 rounded-2xl border border-[#DDE5DF] shadow-sm shadow-[#16823B]/5 flex flex-col justify-between">
        <div>
          {/* Card Header Title */}
          <div className="flex items-center justify-between mb-4 border-b border-[#DDE5DF] pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#17231B]">
                  HPP Per Wilayah
                </h3>
                <p className="text-xs text-[#5F6B63]">
                  Perbandingan HPP Wilayah W01 s/d W07 ({unitLabel})
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#16823B] bg-[#16823B]/10 px-2.5 py-1 rounded-lg border border-[#16823B]/20">
              W01 - W07
            </span>
          </div>

          {/* Vertical Bar Chart Container */}
          <div className="pt-2 w-full">
            <div className="w-full">

              {/* Bars Area */}
              <div className="flex items-end justify-between gap-1.5 sm:gap-2.5 h-48 pb-1 w-full">
                {wilayahData.map((item) => {
                  const val = isRpKg ? item.valRpKg : item.valRpHa;
                  const heightPercent = maxWilayahVal > 0 ? (val / maxWilayahVal) * 100 : 0;
                  const isSelected = filters.wilayahFilter === item.wilayah;
                  const defaultColor = WILAYAH_COLORS[item.wilayah] || WILAYAH_COLORS[`A${item.wilayah}`] || "#16823B";
                  const barColor = isSelected ? "#FCE27A" : defaultColor;

                  return (
                    <div
                      key={item.wilayah}
                      onClick={() => onSelectWilayah?.(isSelected ? "all" : item.wilayah)}
                      className="flex-1 flex flex-col items-center group cursor-pointer min-w-0"
                      title={`Wilayah ${item.wilayah}: ${formatCurrency(val)} (${unitLabel})`}
                    >
                      {/* Number value label on top of bar */}
                      <span
                        className={`text-[9px] sm:text-[11px] font-mono mb-1 transition-all truncate tracking-tighter w-full text-center ${
                          isSelected ? "text-[#16823B] font-bold scale-105" : "text-[#17231B] font-semibold opacity-90 group-hover:opacity-100"
                        }`}
                      >
                        {formatValNumber(val)}
                      </span>

                      {/* Bar Track Container */}
                      <div className="w-full bg-[#F2F6F3] rounded-t-md h-36 flex items-end overflow-hidden p-0.5">
                        <div
                          className={`w-full rounded-t transition-all duration-300 hover:brightness-95 ${
                            isSelected ? "ring-2 ring-[#E5C959] shadow-md scale-[1.02]" : ""
                          }`}
                          style={{
                            height: `${Math.max(heightPercent, val > 0 ? 5 : 0)}%`,
                            backgroundColor: barColor,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Solid Base Baseline */}
              <div className="w-full h-[2px] bg-[#17231B]/20 rounded-full"></div>

              {/* Wilayah Labels Axis */}
              <div className="flex justify-between gap-1.5 sm:gap-2.5 mt-2 w-full">
                {wilayahData.map((item) => {
                  const isSelected = filters.wilayahFilter === item.wilayah;
                  return (
                    <span
                      key={item.wilayah}
                      onClick={() => onSelectWilayah?.(isSelected ? "all" : item.wilayah)}
                      className={`flex-1 text-center text-[10px] sm:text-xs transition-colors truncate ${
                        isSelected ? "text-[#16823B] underline font-bold" : "text-[#5F6B63] font-semibold hover:text-[#17231B]"
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
        <div className="mt-4 pt-3 border-t border-[#DDE5DF]/60 text-xs text-[#5F6B63] flex justify-between items-center">
          <span>Klik batang wilayah untuk menyaring daftar lokasi</span>
          <span className="font-semibold text-[#16823B]">GGF Region Summary</span>
        </div>
      </div>

    </div>
  );
}
