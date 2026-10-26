"use client";

import React, { useState, useRef } from "react";
import { MonthlyChartDataPoint } from "@/types/opex";
import { BarChart3, Calendar } from "lucide-react";

interface SummaryMonthlyChartProps {
  data: MonthlyChartDataPoint[];
  totalActual: number;
  totalBudget: number;
  totalVariance: number | null;
  selectedPeriod: number;
  onSelectPeriod: (period: number) => void;
  loading?: boolean;
}

interface TooltipState {
  monthName: string;
  actual: number;
  budget: number;
  variance: number | null;
  periodNum?: number;
  isSelected?: boolean;
  isTotal?: boolean;
  x: number;
  y: number;
}

// Helper untuk memformat angka dalam jutaan rupiah (Per 1 Juta)
const formatInMillions = (val: number): string => {
  if (!val || val <= 0) return "";
  const inJt = Math.round(val / 1_000_000);
  return inJt.toLocaleString("id-ID");
};

// Helper untuk memformat persentase variansi pada badge kuning
const formatVariancePill = (actual: number, budget: number, rawVariance: number | null): string => {
  if (!actual || actual <= 0) return "-";
  if (!budget || budget <= 0) return "-";

  const v = rawVariance !== null ? rawVariance : ((actual - budget) / budget) * 100;

  if (Math.abs(v) >= 10) {
    return `${Math.round(v)}%`;
  }
  return `${v.toFixed(1).replace(".", ",")}%`;
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
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const showMonthTooltip = (item: MonthlyChartDataPoint, e: React.MouseEvent<HTMLDivElement>) => {
    setHoveredMonth(item.month);
    if (!cardRef.current) return;
    const cardRect = cardRef.current.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();
    const centerX = targetRect.left - cardRect.left + targetRect.width / 2;
    const topY = targetRect.top - cardRect.top;

    setTooltip({
      monthName: item.monthName,
      actual: item.actual,
      budget: item.budget,
      variance: item.variance,
      periodNum: item.month,
      isSelected: item.month === selectedPeriod,
      isTotal: false,
      x: centerX,
      y: topY,
    });
  };

  const showTotalTooltip = (e: React.MouseEvent<HTMLDivElement>) => {
    setHoveredMonth(null);
    if (!cardRef.current) return;
    const cardRect = cardRef.current.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();
    const centerX = targetRect.left - cardRect.left + targetRect.width / 2;
    const topY = targetRect.top - cardRect.top;

    setTooltip({
      monthName: "Total YTD PG1",
      actual: totalActual,
      budget: totalBudget,
      variance: totalVariance,
      isSelected: false,
      isTotal: true,
      x: centerX,
      y: topY,
    });
  };

  const hideTooltip = () => {
    setHoveredMonth(null);
    setTooltip(null);
  };

  const getTooltipStyle = (x: number, y: number) => {
    const cardWidth = cardRef.current?.clientWidth || 800;
    const tooltipWidth = 220;
    const halfWidth = tooltipWidth / 2;
    const padding = 16;

    let clampedX = x;
    let arrowOffset = 0;

    if (x - halfWidth < padding) {
      clampedX = halfWidth + padding;
      arrowOffset = x - clampedX;
    } else if (x + halfWidth > cardWidth - padding) {
      clampedX = cardWidth - halfWidth - padding;
      arrowOffset = x - clampedX;
    }

    return {
      left: `${clampedX}px`,
      top: `${Math.max(y - 12, 10)}px`,
      arrowOffset,
    };
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-sm shadow-[#16823B]/5 h-96 flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-3 border-[#16823B] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#5F6B63]">
          Memuat data ringkasan Actual vs Budget bulanan...
        </p>
      </div>
    );
  }

  // Hitung nilai maksimum bulanan untuk skala batang (dengan 20% ruang di atas untuk angka label)
  const maxMonthlyVal =
    Math.max(...data.map((d) => Math.max(d.actual, d.budget)), 1) * 1.2;

  // Hitung nilai maksimum kolom Total (dengan 20% ruang di atas untuk angka label)
  const maxTotalVal = Math.max(totalActual, totalBudget, 1) * 1.2;

  // Cek apakah Total Actual dan Total Budget tingginya hampir sama (selisih < 12%)
  const totalActHeight = (totalActual / maxTotalVal) * 100;
  const totalBgtHeight = (totalBudget / maxTotalVal) * 100;
  const isTotalVeryClose = Math.abs(totalActHeight - totalBgtHeight) < 12;

  return (
    <div
      ref={cardRef}
      onMouseLeave={hideTooltip}
      className="relative bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-sm shadow-[#16823B]/5 flex flex-col gap-6 font-sans"
    >
      {/* ── Unified Card Header (Sama persis dengan Trend Card Dashboard WIP) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DF]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B]">
              Ringkasan OPEX PG1 — Actual vs Budget per Bulan
            </h3>
            <p className="text-xs text-[#5F6B63]">
              Perbandingan diagram batang akumulasi biaya operasional Actual dan Budget per bulan untuk Plantation Group 1.
            </p>
          </div>
        </div>

        {/* Legend & Unit Badge */}
        <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
          <div className="flex items-center gap-3 text-xs text-[#5F6B63]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16823B] shrink-0" />
              <span className="font-semibold text-[#5F6B63]">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8CD16B] shrink-0" />
              <span className="font-semibold text-[#5F6B63]">Budget</span>
            </div>
          </div>

          <div className="px-2.5 py-1 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-xs font-semibold text-[#2C3830]">
            Per 1 Juta
          </div>
        </div>
      </div>

      {/* ── Chart Area Container (Scrollable di Mobile, Fixed di Desktop) ── */}
      <div
        onScroll={hideTooltip}
        className="w-full overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 scrollbar-thin"
      >
        <div className="min-w-[640px] sm:min-w-0 w-full flex items-stretch gap-1 sm:gap-2">
          {/* 1. SEKSI 12 BULAN (Januari s.d. Desember) */}
          <div className="flex-1 relative">
            {/* Background Dashed Grid Lines (Horizontal) */}
            <div className="absolute inset-0 top-6 bottom-10 pointer-events-none flex flex-col justify-between">
              <div className="border-b border-dashed border-[#EAEFEF] w-full" />
              <div className="border-b border-dashed border-[#EAEFEF] w-full" />
              <div className="border-b border-dashed border-[#EAEFEF] w-full" />
              <div className="border-b border-dashed border-[#EAEFEF] w-full" />
            </div>

            {/* Columns Grid 12 Bulan */}
            <div className="grid grid-cols-12 gap-0.5 sm:gap-1 relative z-10 w-full">
              {data.map((item) => {
                const isSelected = item.month === selectedPeriod;
                const isHovered = item.month === hoveredMonth;

                const actHeightPct =
                  item.actual > 0 ? (item.actual / maxMonthlyVal) * 100 : 0;
                const bgtHeightPct =
                  item.budget > 0 ? (item.budget / maxMonthlyVal) * 100 : 0;

                const actLabel = formatInMillions(item.actual);
                const bgtLabel = formatInMillions(item.budget);
                const varianceLabel = formatVariancePill(
                  item.actual,
                  item.budget,
                  item.variance
                );

                // Anti-Tabrakan: Cek selisih ketinggian antara Actual dan Budget
                // Jika selisih < 12%, lakukan vertical staggering agar tidak saling tumpang tindih
                const heightDiffPct = Math.abs(actHeightPct - bgtHeightPct);
                const isVeryClose =
                  item.actual > 0 && item.budget > 0 && heightDiffPct < 12;

                const actExtraLift =
                  isVeryClose && item.actual >= item.budget ? "mb-3.5" : "mb-0.5";
                const bgtExtraLift =
                  isVeryClose && item.budget > item.actual ? "mb-3.5" : "mb-0.5";

                return (
                  <div
                    key={item.month}
                    onClick={() => onSelectPeriod(item.month)}
                    onMouseEnter={(e) => showMonthTooltip(item, e)}
                    onMouseLeave={hideTooltip}
                    className={`flex flex-col items-center cursor-pointer transition-all rounded-t-lg pt-1 ${
                      isSelected
                        ? "bg-[#EAF3EC]/60 ring-2 ring-[#16823B]/30"
                        : isHovered
                        ? "bg-[#F8FAF9]"
                        : ""
                    }`}
                  >
                    {/* Area Batang & Angka di Atas (Tinggi Tetap 230px) */}
                    <div className="h-[230px] w-full flex items-end justify-center gap-1 sm:gap-1.5 relative px-0.5">
                      {/* Batang 1: Actual (Hijau Tua #16823B Capex) */}
                      <div className="flex flex-col items-center justify-end h-full w-3.5 sm:w-5 md:w-6 shrink-0 relative">
                        {actLabel && (
                          <span
                            className={`font-mono text-[9px] sm:text-[10px] md:text-[11px] font-normal text-[#17231B] tracking-tighter select-none -translate-x-0.5 ${actExtraLift}`}
                          >
                            {actLabel}
                          </span>
                        )}
                        <div
                          style={{ height: `${actHeightPct}%` }}
                          className="w-full bg-[#16823B] transition-all duration-300"
                        />
                      </div>

                      {/* Batang 2: Budget (Hijau Muda #8CD16B Capex) */}
                      <div className="flex flex-col items-center justify-end h-full w-3.5 sm:w-5 md:w-6 shrink-0 relative">
                        {bgtLabel && (
                          <span
                            className={`font-mono text-[9px] sm:text-[10px] md:text-[11px] font-normal text-[#17231B] tracking-tighter select-none translate-x-0.5 ${bgtExtraLift}`}
                          >
                            {bgtLabel}
                          </span>
                        )}
                        <div
                          style={{ height: `${bgtHeightPct}%` }}
                          className="w-full bg-[#8CD16B] transition-all duration-300"
                        />
                      </div>

                      {/* Badge Variansi Kuning (Melekat di dasar kedua batang) */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[32px] sm:w-[40px] md:w-[46px] bg-[#FCE27A] text-[#17231B] border border-[#E5C959] font-mono font-bold text-[9px] sm:text-[10px] md:text-[11px] py-0.5 text-center shadow-2xs z-10 pointer-events-none select-none">
                        {varianceLabel}
                      </div>
                    </div>

                    {/* Garis Dasar Bawah Solid Hitam */}
                    <div className="w-full border-b-2 border-[#17231B]" />

                    {/* Label Nama Bulan di Bawah Garis */}
                    <div className="pt-2 pb-1 text-center w-full px-0.5">
                      <span
                        className={`text-[9px] sm:text-[10px] md:text-xs block select-none truncate ${
                          isSelected
                            ? "font-bold text-[#16823B]"
                            : "font-semibold text-[#5F6B63]"
                        }`}
                      >
                        {item.monthName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. PEMISAH VERTIKAL (GAP ANTARA DESEMBER & TOTAL) */}
          <div className="w-3 sm:w-5 shrink-0 flex flex-col justify-end">
            <div className="w-full" />
          </div>

          {/* 3. SEKSI TOTAL (DI SEBELAH KANAN) */}
          <div
            onMouseEnter={showTotalTooltip}
            onMouseLeave={hideTooltip}
            className="w-24 sm:w-28 shrink-0 relative flex flex-col cursor-pointer hover:bg-[#F8FAF9]/80 rounded-t-lg transition-colors"
          >
            {/* Background Dashed Grid Lines (Horizontal khusus Total) */}
            <div className="absolute inset-0 top-6 bottom-10 pointer-events-none flex flex-col justify-between">
              <div className="border-b border-dashed border-[#EAEFEF] w-full" />
              <div className="border-b border-dashed border-[#EAEFEF] w-full" />
              <div className="border-b border-dashed border-[#EAEFEF] w-full" />
              <div className="border-b border-dashed border-[#EAEFEF] w-full" />
            </div>

            {/* Area Batang Total (Tinggi Tetap 230px, leluasa dengan gap-2) */}
            <div className="h-[230px] w-full flex items-end justify-center gap-2 sm:gap-2.5 relative px-1 z-10 pt-1">
              {/* Batang Total Actual (Hijau Tua #16823B Capex) */}
              <div className="flex flex-col items-center justify-end h-full w-5 sm:w-6 md:w-7 shrink-0 relative">
                <span
                  className={`font-mono text-[9px] sm:text-[10px] md:text-[11px] font-normal text-[#17231B] tracking-tighter select-none -translate-x-1 ${
                    isTotalVeryClose && totalActual >= totalBudget ? "mb-3.5" : "mb-0.5"
                  }`}
                >
                  {formatInMillions(totalActual)}
                </span>
                <div
                  style={{
                    height: `${totalActHeight}%`,
                  }}
                  className="w-full bg-[#16823B] transition-all duration-300"
                />
              </div>

              {/* Batang Total Budget (Hijau Muda #8CD16B Capex) */}
              <div className="flex flex-col items-center justify-end h-full w-5 sm:w-6 md:w-7 shrink-0 relative">
                <span
                  className={`font-mono text-[9px] sm:text-[10px] md:text-[11px] font-normal text-[#17231B] tracking-tighter select-none translate-x-1 ${
                    isTotalVeryClose && totalBudget > totalActual ? "mb-3.5" : "mb-0.5"
                  }`}
                >
                  {formatInMillions(totalBudget)}
                </span>
                <div
                  style={{
                    height: `${totalBgtHeight}%`,
                  }}
                  className="w-full bg-[#8CD16B] transition-all duration-300"
                />
              </div>

              {/* Badge Variansi Kuning Total */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[44px] sm:w-[50px] bg-[#FCE27A] text-[#17231B] border border-[#E5C959] font-mono font-bold text-[9px] sm:text-[10px] md:text-[11px] py-0.5 text-center shadow-2xs z-10 select-none">
                {totalVariance !== null
                  ? `${totalVariance.toFixed(1).replace(".", ",")}%`
                  : "-"}
              </div>
            </div>

            {/* Garis Dasar Bawah Solid Hitam Total */}
            <div className="w-full border-b-2 border-[#17231B]" />

            {/* Label "Total" di Bawah Garis */}
            <div className="pt-2 pb-1 text-center">
              <span className="text-[10px] sm:text-[11px] md:text-xs font-bold text-[#17231B] block select-none">
                Total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Tooltip (Sama persis dengan Tooltip Grafik Trend Cost Element Antar PG) ── */}
      {tooltip &&
        (() => {
          const { left, top, arrowOffset } = getTooltipStyle(tooltip.x, tooltip.y);

          return (
            <div
              style={{ left, top }}
              className="absolute -translate-x-1/2 -translate-y-full z-50 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-lg text-xs min-w-[210px] sm:min-w-[220px]"
            >
              {/* Tooltip Header */}
              <div className="font-bold text-[#17231B] pb-2 mb-2 border-b border-[#DDE5DF]">
                Periode: <strong className="text-[#16823B]">{tooltip.isTotal ? tooltip.monthName : tooltip.monthName}</strong>
              </div>

              {/* Rows: Actual, Budget & Variance */}
              <div className="space-y-1.5">
                {/* Actual Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16823B] shrink-0" />
                    <span className="text-[#5F6B63]">Actual:</span>
                  </div>
                  <span className="font-mono font-bold text-[#17231B]">
                    Rp {tooltip.actual.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Budget Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8CD16B] shrink-0" />
                    <span className="text-[#5F6B63]">Budget:</span>
                  </div>
                  <span className="font-mono font-bold text-[#17231B]">
                    Rp {tooltip.budget.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Variance Row */}
                <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-[#DDE5DF]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#5F6B63]">Variance:</span>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      tooltip.variance === null
                        ? "text-[#5F6B63]"
                        : tooltip.variance > 0
                        ? "text-rose-600"
                        : "text-[#16823B]"
                    }`}
                  >
                    {tooltip.variance !== null
                      ? `${tooltip.variance > 0 ? "+" : ""}${tooltip.variance.toFixed(1).replace(".", ",")}%`
                      : "-"}
                  </span>
                </div>
              </div>

              {/* Tooltip triangle arrow at bottom pointing to bar */}
              <div
                style={{ left: `calc(50% + ${arrowOffset}px)` }}
                className="absolute top-full -mt-1 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b border-r border-[#DDE5DF] rotate-45"
              />
            </div>
          );
        })()}
    </div>
  );
}
