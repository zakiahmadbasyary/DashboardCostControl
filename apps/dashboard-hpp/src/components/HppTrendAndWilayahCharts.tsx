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

  const formatShort = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return `${Math.round(val)}`;
  };

  // Find maximum values for scaling chart bar heights
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
        <div className="bg-white p-6 rounded-2xl border border-[#DDE5DF] animate-pulse h-64"></div>
        <div className="bg-white p-6 rounded-2xl border border-[#DDE5DF] animate-pulse h-64"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. Bar Chart Kiri — Trend HPP Pine PG1 (Jan - Dec | YTD) */}
      <div className="bg-white p-5 rounded-2xl border border-[#DDE5DF] shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-[#EAEFEB] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#17231B] text-sm sm:text-base">
                  Trend HPP Pine PG1 ({unitLabel})
                </h3>
                <p className="text-xs text-[#5F6B63]">
                  Perkembangan bulanan & akumulasi YTD (Terhitung secara weighted)
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#16823B] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {unitLabel}
            </span>
          </div>

          {/* Bar Diagram Container */}
          <div className="pt-2 overflow-x-auto">
            <div className="flex items-end justify-between gap-1.5 min-w-[360px] h-44 pb-2 border-b border-[#E0E8E2]">
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
                    {/* Tooltip value */}
                    <span className="text-[9px] font-bold text-[#17231B] mb-1 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
                      {val > 0 ? formatShort(val) : "-"}
                    </span>

                    {/* Bar */}
                    <div className="w-full bg-[#F0F4F1] rounded-t-md h-32 flex items-end overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-t transition-all duration-300 ${
                          isSelected
                            ? "bg-[#0B6B32] ring-2 ring-amber-400 shadow-md"
                            : "bg-[#16823B] group-hover:bg-[#0B6B32]"
                        }`}
                        style={{ height: `${Math.max(heightPercent, val > 0 ? 4 : 0)}%` }}
                      ></div>
                    </div>

                    {/* Month Label */}
                    <span
                      className={`text-[10px] font-extrabold mt-1.5 ${
                        isSelected ? "text-[#16823B] underline" : "text-[#5F6B63]"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}

              {/* YTD Bar Column */}
              {ytdPoint && (
                <div
                  className="flex-1 flex flex-col items-center group cursor-pointer border-l-2 border-dashed border-[#D5E1D8] pl-1.5"
                  title={`YTD Accumulation: ${formatCurrency(
                    isRpKg ? ytdPoint.valRpKg : ytdPoint.valRpHa
                  )} (${unitLabel})`}
                >
                  <span className="text-[9px] font-black text-amber-700 mb-1">
                    {formatShort(isRpKg ? ytdPoint.valRpKg : ytdPoint.valRpHa)}
                  </span>

                  <div className="w-full bg-amber-50 rounded-t-md h-32 flex items-end overflow-hidden p-0.5 border border-amber-200">
                    <div
                      className="w-full bg-amber-500 hover:bg-amber-600 rounded-t transition-all duration-300 shadow-xs"
                      style={{
                        height: `${Math.max(
                          maxTrendVal > 0
                            ? ((isRpKg ? ytdPoint.valRpKg : ytdPoint.valRpHa) / maxTrendVal) * 100
                            : 0,
                          4
                        )}%`,
                      }}
                    ></div>
                  </div>

                  <span className="text-[10px] font-black text-amber-900 mt-1.5 uppercase">YTD</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-2 text-[11px] text-[#5F6B63] flex justify-between items-center">
          <span>Klik batang bulan untuk memfilter data per periode</span>
          <span className="font-semibold text-[#16823B]">Weighted Aggregation</span>
        </div>
      </div>

      {/* 2. Bar Chart Kanan — HPP Per Wilayah (W01 - W07) */}
      <div className="bg-white p-5 rounded-2xl border border-[#DDE5DF] shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-[#EAEFEB] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#17231B] text-sm sm:text-base">
                  HPP Per Wilayah ({unitLabel})
                </h3>
                <p className="text-xs text-[#5F6B63]">
                  Rincian HPP Wilayah W01 s/d W07 mengikuti filter utama
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              W01 - W07
            </span>
          </div>

          {/* Wilayah Horizontal Bar List */}
          <div className="space-y-2.5 pt-1">
            {wilayahData.map((item) => {
              const val = isRpKg ? item.valRpKg : item.valRpHa;
              const widthPercent = maxWilayahVal > 0 ? (val / maxWilayahVal) * 100 : 0;
              const isSelected = filters.wilayahFilter === item.wilayah;

              return (
                <div
                  key={item.wilayah}
                  onClick={() => onSelectWilayah?.(isSelected ? "all" : item.wilayah)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#EAF3EC] border-[#16823B] shadow-2xs"
                      : "bg-[#F8FAF9] border-[#EAEFEB] hover:bg-[#F0F4F1]"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-extrabold mb-1">
                    <span className="text-[#17231B] flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#16823B] text-white text-[10px]">
                        {item.wilayah}
                      </span>
                      <span>Wilayah {item.wilayah}</span>
                    </span>
                    <span className="text-[#16823B]">
                      {val > 0 ? formatCurrency(val) : "Rp 0"}{" "}
                      <span className="text-[10px] text-[#5F6B63] font-normal">/{isRpKg ? "Kg" : "Ha"}</span>
                    </span>
                  </div>

                  {/* Horizontal Bar Track */}
                  <div className="w-full bg-gray-200/70 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isSelected ? "bg-amber-500" : "bg-[#16823B]"
                      }`}
                      style={{ width: `${Math.min(widthPercent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-[#5F6B63] flex justify-between items-center">
          <span>Klik wilayah untuk memfilter daftar lokasi</span>
          <span className="font-semibold text-emerald-800">Master Sheet Region</span>
        </div>
      </div>

    </div>
  );
}
