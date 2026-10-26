"use client";

import React, { useState, useRef } from "react";
import { Ce2Option, TrendPgMonthlyPoint } from "@/types/opex";
import { TrendingUp, Filter, Calendar } from "lucide-react";

interface TrendPgChartProps {
  data: TrendPgMonthlyPoint[];
  ce2List: Ce2Option[];
  selectedCe2: string;
  onSelectCe2: (ce2: string) => void;
  selectedPeriod: number;
  onSelectPeriod?: (period: number) => void;
  loading?: boolean;
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

const formatInMillions = (val: number): string => {
  if (val === 0) return "";
  const inMillions = val / 1_000_000;
  if (inMillions >= 100) return inMillions.toFixed(0);
  if (inMillions >= 10) return inMillions.toFixed(1);
  return inMillions.toFixed(2);
};

export default function TrendPgChart({
  data,
  ce2List,
  selectedCe2,
  onSelectCe2,
  selectedPeriod,
  onSelectPeriod,
  loading,
}: TrendPgChartProps) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentCe2 = ce2List.find((c) => c.ce2 === selectedCe2);

  // Total YTD calculations across all 12 months for each PG
  const totalPg1 = data.reduce((acc, curr) => acc + curr.pg1, 0);
  const totalPg2 = data.reduce((acc, curr) => acc + curr.pg2, 0);
  const totalPg3 = data.reduce((acc, curr) => acc + curr.pg3, 0);

  // Maximum value for proportional bar scaling (with 25% overhead for top numbers)
  const maxMonthlyVal =
    Math.max(...data.map((d) => Math.max(d.pg1, d.pg2, d.pg3)), 1) * 1.25;
  const maxTotalVal = Math.max(totalPg1, totalPg2, totalPg3, 1) * 1.25;

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DF]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B] tracking-tight">
              Trend Cost Element Antar PG (Actual Bulanan)
            </h3>
            <p className="text-xs text-[#5F6B63]">
              Perbandingan realisasi biaya operasional murni (Actual) antara PG1, PG2, dan PG3 per bulan.
            </p>
          </div>
        </div>

        {/* Legend, Unit & CE2 Dropdown */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center shrink-0">
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

          {/* Independent CE2 Filter */}
          <div className="flex items-center gap-1.5 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl pl-2.5 pr-1 py-1">
            <Filter className="w-3.5 h-3.5 text-[#16823B]" />
            <select
              value={selectedCe2}
              onChange={(e) => onSelectCe2(e.target.value)}
              suppressHydrationWarning
              className="bg-transparent text-xs font-semibold text-[#17231B] focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[210px] truncate pr-1"
            >
              {ce2List.map((c) => (
                <option key={c.ce2} value={c.ce2}>
                  {c.ce2} — {c.deskripsiCe2}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Content (Loading or Interactive Bar Chart with Total Column) ── */}
      {loading ? (
        <div className="h-64 flex flex-col justify-center items-center">
          <div className="w-7 h-7 border-3 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold text-[#5F6B63]">Memuat diagram tren antar PG...</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="min-w-[700px] sm:min-w-0 w-full flex items-stretch gap-1 sm:gap-2">
            {/* 1. SEKSI 12 BULAN (Januari s.d. Desember) */}
            <div className="flex-1 relative">
              {/* Background Dashed Grid Lines */}
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

                  const pg1Height = (item.pg1 / maxMonthlyVal) * 100;
                  const pg2Height = (item.pg2 / maxMonthlyVal) * 100;
                  const pg3Height = (item.pg3 / maxMonthlyVal) * 100;

                  const pg1Label = formatInMillions(item.pg1);
                  const pg2Label = formatInMillions(item.pg2);
                  const pg3Label = formatInMillions(item.pg3);

                  // Anti-Tabrakan / Vertical Staggering (sama seperti di Ringkasan OPEX PG1)
                  const diff12 = Math.abs(pg1Height - pg2Height);
                  const diff23 = Math.abs(pg2Height - pg3Height);

                  let pg1Lift = "mb-0.5";
                  let pg2Lift = "mb-0.5";
                  let pg3Lift = "mb-0.5";

                  if (diff12 < 14 || diff23 < 14) {
                    if (diff12 < 14 && diff23 < 14) {
                      const sorted = [
                        { key: 1, val: item.pg1 },
                        { key: 2, val: item.pg2 },
                        { key: 3, val: item.pg3 },
                      ].sort((a, b) => b.val - a.val);

                      const lifts = ["mb-6", "mb-3", "mb-0.5"];
                      sorted.forEach((s, idx) => {
                        if (s.key === 1) pg1Lift = lifts[idx];
                        else if (s.key === 2) pg2Lift = lifts[idx];
                        else if (s.key === 3) pg3Lift = lifts[idx];
                      });
                    } else if (diff12 < 14) {
                      if (item.pg1 >= item.pg2) pg1Lift = "mb-3.5";
                      else pg2Lift = "mb-3.5";
                    } else if (diff23 < 14) {
                      if (item.pg2 >= item.pg3) pg2Lift = "mb-3.5";
                      else pg3Lift = "mb-3.5";
                    }
                  }

                  return (
                    <div
                      key={item.month}
                      onClick={() => onSelectPeriod?.(item.month)}
                      onMouseEnter={(e) => showMonthTooltip(item, e)}
                      onMouseLeave={hideTooltip}
                      className={`flex flex-col items-center cursor-pointer transition-all rounded-t-lg pt-1 ${
                        isSelected
                          ? "bg-[#EAF3EC]/70 ring-2 ring-[#16823B]/30"
                          : isHovered
                          ? "bg-[#F8FAF9]"
                          : ""
                      }`}
                      title={`Klik untuk memilih bulan ${item.monthName}`}
                    >
                      {/* Area Batang & Angka di Atas (Tinggi 220px) */}
                      <div className="h-[220px] w-full flex items-end justify-center gap-0.5 sm:gap-1 relative px-0.5">
                        {/* Batang 1: PG1 (#16823B Hijau Tua) */}
                        <div className="flex flex-col items-center justify-end h-full w-2.5 sm:w-3.5 md:w-4 shrink-0 relative">
                          {pg1Label && (
                            <span
                              className={`hidden sm:block font-mono text-[8px] sm:text-[9px] md:text-[10px] text-[#17231B] select-none leading-none -translate-x-0.5 ${pg1Lift}`}
                            >
                              {pg1Label}
                            </span>
                          )}
                          <div
                            style={{ height: `${pg1Height}%` }}
                            className={`w-full bg-[#16823B] transition-all duration-300 rounded-t-xs ${
                              isSelected ? "opacity-100 ring-1 ring-[#0F5A28]" : "opacity-85 hover:opacity-100"
                            }`}
                          />
                        </div>

                        {/* Batang 2: PG2 (#29A9D6 Biru Terang) */}
                        <div className="flex flex-col items-center justify-end h-full w-2.5 sm:w-3.5 md:w-4 shrink-0 relative">
                          {pg2Label && (
                            <span
                              className={`hidden sm:block font-mono text-[8px] sm:text-[9px] md:text-[10px] text-[#17231B] select-none leading-none translate-x-0 ${pg2Lift}`}
                            >
                              {pg2Label}
                            </span>
                          )}
                          <div
                            style={{ height: `${pg2Height}%` }}
                            className={`w-full bg-[#29A9D6] transition-all duration-300 rounded-t-xs ${
                              isSelected ? "opacity-100 ring-1 ring-[#1B7E9F]" : "opacity-85 hover:opacity-100"
                            }`}
                          />
                        </div>

                        {/* Batang 3: PG3 (#E5C959 Kuning WIP) */}
                        <div className="flex flex-col items-center justify-end h-full w-2.5 sm:w-3.5 md:w-4 shrink-0 relative">
                          {pg3Label && (
                            <span
                              className={`hidden sm:block font-mono text-[8px] sm:text-[9px] md:text-[10px] text-[#17231B] select-none leading-none translate-x-0.5 ${pg3Lift}`}
                            >
                              {pg3Label}
                            </span>
                          )}
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
            <div className="w-3 sm:w-4 shrink-0 flex flex-col justify-end">
              <div className="w-full border-r border-[#DDE5DF] h-[220px]" />
            </div>

            {/* 3. SEKSI TOTAL YTD (DI SEBELAH KANAN) */}
            {(() => {
              const totalDiff12 = Math.abs(totalPg1Height - totalPg2Height);
              const totalDiff23 = Math.abs(totalPg2Height - totalPg3Height);

              let totalPg1Lift = "mb-0.5";
              let totalPg2Lift = "mb-0.5";
              let totalPg3Lift = "mb-0.5";

              if (totalDiff12 < 14 || totalDiff23 < 14) {
                if (totalDiff12 < 14 && totalDiff23 < 14) {
                  const sorted = [
                    { key: 1, val: totalPg1 },
                    { key: 2, val: totalPg2 },
                    { key: 3, val: totalPg3 },
                  ].sort((a, b) => b.val - a.val);

                  const lifts = ["mb-6", "mb-3", "mb-0.5"];
                  sorted.forEach((s, idx) => {
                    if (s.key === 1) totalPg1Lift = lifts[idx];
                    else if (s.key === 2) totalPg2Lift = lifts[idx];
                    else if (s.key === 3) totalPg3Lift = lifts[idx];
                  });
                } else if (totalDiff12 < 14) {
                  if (totalPg1 >= totalPg2) totalPg1Lift = "mb-3.5";
                  else totalPg2Lift = "mb-3.5";
                } else if (totalDiff23 < 14) {
                  if (totalPg2 >= totalPg3) totalPg2Lift = "mb-3.5";
                  else totalPg3Lift = "mb-3.5";
                }
              }

              return (
                <div
                  onMouseEnter={showTotalTooltip}
                  onMouseLeave={hideTooltip}
                  className="w-28 sm:w-32 shrink-0 relative flex flex-col cursor-pointer hover:bg-[#F8FAF9]/80 rounded-t-lg transition-colors pt-1"
                >
                  {/* Background Dashed Grid Lines khusus Total */}
                  <div className="absolute inset-0 top-6 bottom-10 pointer-events-none flex flex-col justify-between">
                    <div className="border-b border-dashed border-[#EAEFEF] w-full" />
                    <div className="border-b border-dashed border-[#EAEFEF] w-full" />
                    <div className="border-b border-dashed border-[#EAEFEF] w-full" />
                    <div className="border-b border-dashed border-[#EAEFEF] w-full" />
                  </div>

                  {/* Area Batang Total 3 PG (Tinggi 220px) */}
                  <div className="h-[220px] w-full flex items-end justify-center gap-1 sm:gap-1.5 relative px-1 z-10">
                    {/* Total PG1 */}
                    <div className="flex flex-col items-center justify-end h-full w-3.5 sm:w-4 md:w-5 shrink-0 relative">
                      <span
                        className={`hidden sm:block font-mono text-[8px] sm:text-[9px] md:text-[10px] text-[#17231B] select-none leading-none -translate-x-0.5 ${totalPg1Lift}`}
                      >
                        {formatInMillions(totalPg1)}
                      </span>
                      <div
                        style={{ height: `${totalPg1Height}%` }}
                        className="w-full bg-[#16823B] transition-all duration-300 rounded-t-xs"
                      />
                    </div>

                    {/* Total PG2 */}
                    <div className="flex flex-col items-center justify-end h-full w-3.5 sm:w-4 md:w-5 shrink-0 relative">
                      <span
                        className={`hidden sm:block font-mono text-[8px] sm:text-[9px] md:text-[10px] text-[#17231B] select-none leading-none translate-x-0 ${totalPg2Lift}`}
                      >
                        {formatInMillions(totalPg2)}
                      </span>
                      <div
                        style={{ height: `${totalPg2Height}%` }}
                        className="w-full bg-[#29A9D6] transition-all duration-300 rounded-t-xs"
                      />
                    </div>

                    {/* Total PG3 */}
                    <div className="flex flex-col items-center justify-end h-full w-3.5 sm:w-4 md:w-5 shrink-0 relative">
                      <span
                        className={`hidden sm:block font-mono text-[8px] sm:text-[9px] md:text-[10px] text-[#17231B] select-none leading-none translate-x-0.5 ${totalPg3Lift}`}
                      >
                        {formatInMillions(totalPg3)}
                      </span>
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
                    <span className="text-[10px] sm:text-[11px] md:text-xs font-bold text-[#17231B] block select-none">
                      Total YTD
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Status Bar Keterangan Bawah ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#5F6B63] bg-[#F8FAF9] border border-[#DDE5DF] px-3.5 py-2 rounded-xl">
        <span>
          Filter Cost Element aktif: <strong className="text-[#16823B]">{selectedCe2} ({currentCe2?.deskripsiCe2 || selectedCe2})</strong>
        </span>
        <span className="text-[#89938D]">
          Bulan aktif: <strong className="text-[#16823B]">{data.find((d) => d.month === selectedPeriod)?.monthName || `Bulan ${selectedPeriod}`}</strong> (Klik kolom bulan untuk sinkronisasi Main Filter)
        </span>
      </div>

      {/* ── Floating Tooltip (Konsisten dengan Desain Standar OPEX & WIP) ── */}
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
