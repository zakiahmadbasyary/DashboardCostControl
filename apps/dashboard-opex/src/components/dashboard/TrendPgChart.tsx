"use client";

import React, { useState, useRef } from "react";
import { Ce2Option, TrendPgCostCenterItem, TrendPgMonthlyPoint } from "@/types/opex";
import { TrendingUp, Filter, ChevronDown } from "lucide-react";
import TrendPgTables from "./TrendPgTables";

interface TrendPgChartProps {
  data: TrendPgMonthlyPoint[];
  ce2List: Ce2Option[];
  selectedCe2: string;
  onSelectCe2: (ce2: string) => void;
  selectedPeriod: number;
  onSelectPeriod?: (period: number) => void;
  loading?: boolean;
  costCentersData?: TrendPgCostCenterItem[];
  selectedPeriodLabel?: string;
}

interface TooltipState {
  monthName: string;
  pg1: number;
  pg2: number;
  pg3: number;
  isSelected: boolean;
  isTotal: boolean;
  x: number;
  y: number;
}

export default function TrendPgChart({
  data,
  ce2List,
  selectedCe2,
  onSelectCe2,
  selectedPeriod,
  onSelectPeriod,
  loading,
  costCentersData = [],
  selectedPeriodLabel,
}: TrendPgChartProps) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentCe2 = ce2List.find((c) => c.ce2 === selectedCe2);

  // Total YTD calculations across all 12 months for each PG
  const totalPg1 = data.reduce((acc, curr) => acc + curr.pg1, 0);
  const totalPg2 = data.reduce((acc, curr) => acc + curr.pg2, 0);
  const totalPg3 = data.reduce((acc, curr) => acc + curr.pg3, 0);

  // Maximum value for proportional bar scaling (overhead 6% agar bar proporsional dan tidak terpotong)
  const maxMonthlyVal =
    Math.max(...data.map((d) => Math.max(d.pg1, d.pg2, d.pg3)), 1) * 1.06;
  const maxTotalVal = Math.max(totalPg1, totalPg2, totalPg3, 1) * 1.06;

  const totalPg1Height = (totalPg1 / maxTotalVal) * 100;
  const totalPg2Height = (totalPg2 / maxTotalVal) * 100;
  const totalPg3Height = (totalPg3 / maxTotalVal) * 100;

  const showMonthTooltip = (item: TrendPgMonthlyPoint, e: React.MouseEvent<HTMLDivElement>) => {
    setHoveredMonth(item.month);
    if (!cardRef.current) return;
    const cardRect = cardRef.current.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();
    const centerX = targetRect.left - cardRect.left + targetRect.width / 2;
    const topY = targetRect.top - cardRect.top;

    setTooltip({
      monthName: item.monthName,
      pg1: item.pg1,
      pg2: item.pg2,
      pg3: item.pg3,
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
      monthName: "Total YTD",
      pg1: totalPg1,
      pg2: totalPg2,
      pg3: totalPg3,
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
    const tooltipWidth = 230;
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

  return (
    <div
      ref={cardRef}
      onMouseLeave={hideTooltip}
      className="relative bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-sm shadow-[#16823B]/5 flex flex-col gap-5 font-sans"
    >
      {/* ── Top Bar: Title, Legend, Unit & Independent CE2 Selector ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DF]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B] tracking-tight">
              Trend & Komparasi Cost Element Antar PG
            </h3>
            <p className="text-xs text-[#5F6B63]">
              Perbandingan tren bulanan dan komparasi realisasi biaya per Cost Center antara PG1, PG2, dan PG3.
            </p>
          </div>
        </div>

        {/* Legend, Unit & CE2 Dropdown */}
        <div className="flex flex-wrap items-center gap-3 self-start xl:self-center shrink-0">
          {/* Legend */}
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
            Juta (Rp)
          </span>

          {/* Independent CE2 Filter (Diperbesar & Lebih Jelas) */}
          <div className="relative flex items-center gap-2 bg-[#F8FAF9] hover:bg-[#EEF4F0]/60 border border-[#DDE5DF] hover:border-[#CBE0D1] rounded-xl pl-3 pr-2.5 py-1.5 shadow-2xs transition-all w-full sm:w-auto min-w-[280px] sm:min-w-[340px] md:min-w-[400px] max-w-[500px]">
            <Filter className="w-4 h-4 text-[#16823B] shrink-0" />
            <select
              value={selectedCe2}
              onChange={(e) => onSelectCe2(e.target.value)}
              suppressHydrationWarning
              title={currentCe2 ? `${currentCe2.ce2} — ${currentCe2.deskripsiCe2}` : selectedCe2}
              className="bg-transparent text-xs sm:text-[13px] font-semibold text-[#17231B] focus:outline-none cursor-pointer w-full pr-6 appearance-none truncate"
            >
              {ce2List.map((c) => (
                <option key={c.ce2} value={c.ce2} className="text-[#17231B] bg-white py-1">
                  {c.ce2} — {c.deskripsiCe2}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#5F6B63]">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Card Body: Layout Kanan Kiri (Kiri 60%, Kanan Menyesuaikan 40%) ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* ── SISI KIRI (60%): Grafik Trend Bulanan Antar PG ── */}
        <div className="w-full lg:w-[60%] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DDE5DF]/80">
            <span className="text-xs font-bold text-[#17231B]">
              Grafik Realisasi Bulanan & Total YTD
            </span>
            <span className="text-[11px] text-[#5F6B63]">
              Sorot batang untuk melihat detail angka
            </span>
          </div>

          {loading ? (
            <div className="h-[320px] flex flex-col justify-center items-center">
              <div className="w-7 h-7 border-3 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs font-semibold text-[#5F6B63]">Memuat diagram tren antar PG...</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-1 scrollbar-thin">
              <div className="min-w-[560px] sm:min-w-0 w-full flex items-stretch gap-1 sm:gap-2">
                {/* 1. SEKSI 12 BULAN (Januari s.d. Desember) */}
                <div className="flex-1 relative">
                  {/* Background Dashed Grid Lines */}
                  <div className="absolute inset-0 top-3 bottom-8 pointer-events-none flex flex-col justify-between">
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

                      const pg1Height = (item.pg1 / maxMonthlyVal) * 100;
                      const pg2Height = (item.pg2 / maxMonthlyVal) * 100;
                      const pg3Height = (item.pg3 / maxMonthlyVal) * 100;

                      return (
                        <div
                          key={item.month}
                          onClick={() => onSelectPeriod?.(item.month)}
                          onMouseEnter={(e) => showMonthTooltip(item, e)}
                          onMouseLeave={hideTooltip}
                          className={`flex flex-col items-center cursor-pointer transition-all rounded-t-lg pt-2 ${
                            isSelected
                              ? "bg-[#EAF3EC]/70 ring-2 ring-[#16823B]/30"
                              : isHovered
                              ? "bg-[#F8FAF9]"
                              : ""
                          }`}
                          title={`Klik untuk memilih bulan ${item.monthName}`}
                        >
                          {/* Area Batang Murni (Tinggi 240px - Angka dihilangkan, hanya visual bar & tooltip) */}
                          <div className="h-[240px] w-full flex items-end justify-center gap-0.5 sm:gap-1 relative px-0.5">
                            {/* Batang 1: PG1 (#16823B Hijau Tua) */}
                            <div className="flex flex-col items-center justify-end h-full w-2 sm:w-2.5 md:w-3.5 shrink-0 relative">
                              <div
                                style={{ height: `${pg1Height}%` }}
                                className={`w-full bg-[#16823B] transition-all duration-300 rounded-t-xs ${
                                  isSelected ? "opacity-100 ring-1 ring-[#0F5A28]" : "opacity-85 hover:opacity-100"
                                }`}
                              />
                            </div>

                            {/* Batang 2: PG2 (#29A9D6 Biru Terang) */}
                            <div className="flex flex-col items-center justify-end h-full w-2 sm:w-2.5 md:w-3.5 shrink-0 relative">
                              <div
                                style={{ height: `${pg2Height}%` }}
                                className={`w-full bg-[#29A9D6] transition-all duration-300 rounded-t-xs ${
                                  isSelected ? "opacity-100 ring-1 ring-[#1B7E9F]" : "opacity-85 hover:opacity-100"
                                }`}
                              />
                            </div>

                            {/* Batang 3: PG3 (#E5C959 Kuning WIP) */}
                            <div className="flex flex-col items-center justify-end h-full w-2 sm:w-2.5 md:w-3.5 shrink-0 relative">
                              <div
                                style={{ height: `${pg3Height}%` }}
                                className={`w-full bg-[#E5C959] transition-all duration-300 rounded-t-xs ${
                                  isSelected ? "opacity-100 ring-1 ring-[#B59D38]" : "opacity-85 hover:opacity-100"
                                }`}
                              />
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
                <div className="w-2 sm:w-3 shrink-0 flex flex-col justify-end">
                  <div className="w-full border-r border-[#DDE5DF] h-[240px]" />
                </div>

                {/* 3. SEKSI TOTAL YTD (DI SEBELAH KANAN) */}
                <div
                  onMouseEnter={showTotalTooltip}
                  onMouseLeave={hideTooltip}
                  className="w-20 sm:w-24 shrink-0 relative flex flex-col cursor-pointer hover:bg-[#F8FAF9]/80 rounded-t-lg transition-colors pt-2"
                >
                  {/* Background Dashed Grid Lines khusus Total */}
                  <div className="absolute inset-0 top-3 bottom-8 pointer-events-none flex flex-col justify-between">
                    <div className="border-b border-dashed border-[#EAEFEF] w-full" />
                    <div className="border-b border-dashed border-[#EAEFEF] w-full" />
                    <div className="border-b border-dashed border-[#EAEFEF] w-full" />
                    <div className="border-b border-dashed border-[#EAEFEF] w-full" />
                  </div>

                  {/* Area Batang Total 3 PG (Tinggi 240px - Angka dihilangkan, hanya visual bar & tooltip) */}
                  <div className="h-[240px] w-full flex items-end justify-center gap-1 relative px-1 z-10">
                    {/* Total PG1 */}
                    <div className="flex flex-col items-center justify-end h-full w-2.5 sm:w-3.5 shrink-0 relative">
                      <div
                        style={{ height: `${totalPg1Height}%` }}
                        className="w-full bg-[#16823B] transition-all duration-300 rounded-t-xs"
                      />
                    </div>

                    {/* Total PG2 */}
                    <div className="flex flex-col items-center justify-end h-full w-2.5 sm:w-3.5 shrink-0 relative">
                      <div
                        style={{ height: `${totalPg2Height}%` }}
                        className="w-full bg-[#29A9D6] transition-all duration-300 rounded-t-xs"
                      />
                    </div>

                    {/* Total PG3 */}
                    <div className="flex flex-col items-center justify-end h-full w-2.5 sm:w-3.5 shrink-0 relative">
                      <div
                        style={{ height: `${totalPg3Height}%` }}
                        className="w-full bg-[#E5C959] transition-all duration-300 rounded-t-xs"
                      />
                    </div>
                  </div>

                  {/* Garis Dasar Bawah Solid Hitam Total */}
                  <div className="w-full border-b-2 border-[#17231B]" />

                  {/* Label "Total YTD" di Bawah Garis */}
                  <div className="pt-2 pb-1 text-center">
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#17231B] block select-none">
                      Total YTD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Bar Keterangan Bawah */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#5F6B63] bg-[#F8FAF9] border border-[#DDE5DF] px-3.5 py-2 rounded-xl">
            <span>
              Cost Element: <strong className="text-[#16823B]">{selectedCe2} ({currentCe2?.deskripsiCe2 || selectedCe2})</strong>
            </span>
            <span className="text-[#89938D]">
              Bulan aktif: <strong className="text-[#16823B]">{data.find((d) => d.month === selectedPeriod)?.monthName || `Bulan ${selectedPeriod}`}</strong> (Klik kolom untuk filter bulan)
            </span>
          </div>
        </div>

        {/* ── SISI KANAN (MENYESUAIKAN / 40%): Tabel Komparasi Cost Center Antar PG ── */}
        <div className="w-full lg:w-[40%] flex-1 border-t lg:border-t-0 lg:border-l border-[#DDE5DF] pt-5 lg:pt-0 lg:pl-6 flex flex-col justify-between">
          <TrendPgTables
            data={costCentersData}
            selectedPeriodLabel={selectedPeriodLabel}
            selectedCe2={selectedCe2}
            loading={loading}
          />
        </div>
      </div>

      {/* ── Floating Tooltip (Muncul saat hover batang bulan / Total YTD) ── */}
      {tooltip &&
        (() => {
          const { left, top, arrowOffset } = getTooltipStyle(tooltip.x, tooltip.y);

          return (
            <div
              style={{ left, top }}
              className="absolute -translate-x-1/2 -translate-y-full z-50 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 bg-white border border-[#DDE5DF] rounded-xl p-3 shadow-lg text-xs min-w-[210px] sm:min-w-[220px]"
            >
              {/* Tooltip Header */}
              <div className="font-bold text-[#17231B] pb-2 mb-2 border-b border-[#DDE5DF] flex items-center justify-between">
                <div>
                  Periode: <strong className="text-[#16823B]">{tooltip.monthName}</strong>
                </div>
                {tooltip.isSelected && (
                  <span className="text-[9px] bg-[#16823B] text-white px-1.5 py-0.5 rounded font-bold">
                    Aktif
                  </span>
                )}
              </div>

              {/* Rows for PG1, PG2, PG3 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16823B] shrink-0" />
                    <span className="text-[#5F6B63]">Actual PG1:</span>
                  </div>
                  <span className="font-mono font-bold text-[#17231B]">
                    Rp {Number(tooltip.pg1).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#29A9D6] shrink-0" />
                    <span className="text-[#5F6B63]">Actual PG2:</span>
                  </div>
                  <span className="font-mono font-bold text-[#17231B]">
                    Rp {Number(tooltip.pg2).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5C959] shrink-0" />
                    <span className="text-[#5F6B63]">Actual PG3:</span>
                  </div>
                  <span className="font-mono font-bold text-[#17231B]">
                    Rp {Number(tooltip.pg3).toLocaleString("id-ID")}
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
