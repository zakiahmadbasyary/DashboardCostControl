"use client";

import React, { useState, useMemo } from "react";
import { LineChart, Layers, AlertCircle } from "lucide-react";
import { PivotedTableRow } from "./MaterialDetailTableCard";

interface MaterialVarianceChartCardProps {
  rows: PivotedTableRow[];
  selectedGroup: string;
  loading: boolean;
  error: string | null;
}

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agst", "Sep", "Okt", "Nov", "Des"
];

const COLOR_PALETTE = [
  "#16823B", // Green
  "#D97706", // Amber / Warm Yellow
  "#2563EB", // Royal Blue
  "#9333EA", // Purple
  "#0D9488", // Teal
  "#DC2626", // Red
  "#EA580C", // Orange
  "#0284C7", // Sky Blue
];

export default function MaterialVarianceChartCard({
  rows,
  selectedGroup,
  loading,
  error,
}: MaterialVarianceChartCardProps) {
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);

  // Group materials (all materials belonging to selectedGroup)
  const groupMaterials = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    if (selectedGroup) {
      const filtered = rows.filter(
        (r) => r.group.toLowerCase() === selectedGroup.toLowerCase()
      );
      return filtered.length > 0 ? filtered : rows;
    }
    return rows;
  }, [rows, selectedGroup]);

  // Assign a distinct color to each material in the group
  const materialsWithColor = useMemo(() => {
    return groupMaterials.map((mat, idx) => ({
      ...mat,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
    }));
  }, [groupMaterials]);

  // Compute overall min & max price across all materials in the group for 12 months
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    groupMaterials.forEach((mat) => {
      mat.months.forEach((val) => {
        if (val !== null && val !== undefined) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      });
    });

    if (min === Infinity || max === -Infinity) {
      return { minPrice: 0, maxPrice: 100, priceRange: 100 };
    }

    if (min === max) {
      min = Math.max(0, min - min * 0.1);
      max = max + max * 0.1 || 100;
    }

    // Add 5% top and bottom padding
    const diff = max - min;
    const paddedMin = Math.max(0, min - diff * 0.05);
    const paddedMax = max + diff * 0.05;

    return {
      minPrice: paddedMin,
      maxPrice: paddedMax,
      priceRange: paddedMax - paddedMin || 1,
    };
  }, [groupMaterials]);

  // SVG Chart inner dimensions (X-axis Month labels placed in HTML flexbox below SVG)
  const svgWidth = 800;
  const svgHeight = 110;
  const padding = { top: 10, right: 20, bottom: 10, left: 45 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Helper functions for coordinates
  const getX = (monthIndex: number) => {
    return padding.left + (monthIndex / 11) * chartWidth;
  };

  const getY = (val: number) => {
    const norm = (val - minPrice) / priceRange;
    return padding.top + chartHeight - norm * chartHeight;
  };

  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return "-";
    return `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(val)}`;
  };

  const formatYAxisLabel = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}Jt`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return val.toFixed(0);
  };

  // Generate 3 Y-axis ticks
  const yAxisTicks = useMemo(() => {
    const ticks = [];
    const step = priceRange / 3;
    for (let i = 0; i <= 3; i++) {
      const val = minPrice + step * i;
      const y = getY(val);
      ticks.push({ val, y });
    }
    return ticks;
  }, [minPrice, priceRange, chartHeight, padding.top]);

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs space-y-3 font-sans" suppressHydrationWarning>
      
      {/* 1. Header Bar (Matched 1:1 to Card 1 Bar Chart Header Style) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#DDE5DF] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B]">
            <LineChart className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-[#17231B]">
                Grafik Perbandingan Trend Harga Material
              </h3>
              {selectedGroup && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#16823B] border border-[#A5D6A7] font-semibold text-xs">
                  Group: {selectedGroup}
                </span>
              )}
            </div>
            <p className="text-xs text-[#5F6B63] mt-0.5">
              Tren pergerakan harga (<span className="font-semibold text-[#16823B]">naik/turun</span>) seluruh <strong className="text-[#17231B]">{groupMaterials.length} material</strong> dalam group <span className="font-semibold text-[#16823B]">{selectedGroup || "terpilih"}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#5F6B63] bg-[#F7F9F7] px-3 py-1 rounded-lg border border-[#DDE5DF] shrink-0">
          <Layers className="w-3.5 h-3.5 text-[#16823B]" />
          <span>Total: <strong className="text-[#17231B] font-bold">{groupMaterials.length} Item</strong></span>
        </div>
      </div>

      {/* 2. Content Section */}
      {loading ? (
        <div className="py-8 flex flex-col justify-center items-center">
          <div className="w-5 h-5 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-1.5" />
          <p className="text-xs text-[#5F6B63]">Memuat grafik perbandingan harga material...</p>
        </div>
      ) : error ? (
        <div className="py-6 px-4 text-center bg-red-50 border border-red-200 rounded-xl space-y-1.5">
          <AlertCircle className="w-5 h-5 mx-auto text-red-600" />
          <p className="text-xs font-bold text-red-700">Gagal memuat grafik harga material.</p>
        </div>
      ) : groupMaterials.length === 0 ? (
        <div className="p-6 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
          <p className="text-xs font-semibold text-[#5F6B63]">Tidak ada data material untuk group ini.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          
          {/* Material Legend Pills Bar */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#F8FAF9] p-2 rounded-xl border border-[#DDE5DF] max-h-24 sm:max-h-none overflow-y-auto">
            <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider mr-1">Legend:</span>
            {materialsWithColor.map((mat) => (
              <div
                key={mat.material}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-[#DDE5DF] shadow-2xs text-[10px] font-semibold text-[#17231B]"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: mat.color }}
                />
                <span className="font-mono font-bold text-[#17231B]">{mat.material}</span>
                <span className="text-[#5F6B63] text-[9.5px] truncate max-w-[100px] sm:max-w-[120px]" title={mat.materialDescription}>
                  ({mat.materialDescription})
                </span>
              </div>
            ))}
          </div>

          {/* Line Chart Area */}
          <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 relative overflow-hidden flex flex-col w-full">
            
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
              onMouseLeave={() => setHoveredMonthIdx(null)}
            >
              {/* Y-Axis Grid Lines & Labels (Font size matched to Bar Chart y-labels) */}
              {yAxisTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={tick.y}
                    x2={svgWidth - padding.right}
                    y2={tick.y}
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 6}
                    y={tick.y + 3}
                    textAnchor="end"
                    fontSize="7.5"
                    fontWeight="600"
                    fill="#5F6B63"
                    fontFamily="var(--font-mono), monospace"
                  >
                    {formatYAxisLabel(tick.val)}
                  </text>
                </g>
              ))}

              {/* Invisible Full-Height Hover Rectangles */}
              {MONTH_ABBR.map((_, idx) => {
                const x = getX(idx);
                const stepX = chartWidth / 11;
                return (
                  <rect
                    key={`hover-rect-${idx}`}
                    x={x - stepX / 2}
                    y={padding.top}
                    width={stepX}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredMonthIdx(idx)}
                  />
                );
              })}

              {/* Hover Vertical Guide Line */}
              {hoveredMonthIdx !== null && (
                <line
                  x1={getX(hoveredMonthIdx)}
                  y1={padding.top}
                  x2={getX(hoveredMonthIdx)}
                  y2={svgHeight - padding.bottom}
                  stroke="#16823B"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
              )}

              {/* Material Trend Lines & Points */}
              {materialsWithColor.map((mat) => {
                const validPoints: { monthIdx: number; x: number; y: number; val: number }[] = [];

                mat.months.forEach((val, mIdx) => {
                  if (val !== null && val !== undefined) {
                    validPoints.push({
                      monthIdx: mIdx,
                      x: getX(mIdx),
                      y: getY(val),
                      val,
                    });
                  }
                });

                if (validPoints.length === 0) return null;

                let pathD = "";
                validPoints.forEach((pt, i) => {
                  if (i === 0) {
                    pathD += `M ${pt.x} ${pt.y}`;
                  } else {
                    pathD += ` L ${pt.x} ${pt.y}`;
                  }
                });

                return (
                  <g key={mat.material}>
                    {/* Path Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={mat.color}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300 hover:stroke-width-2.5"
                    />

                    {/* Data Point Circles */}
                    {validPoints.map((pt) => {
                      const isHovered = hoveredMonthIdx === pt.monthIdx;
                      return (
                        <circle
                          key={pt.monthIdx}
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? "4" : "2.5"}
                          fill={mat.color}
                          stroke="#FFFFFF"
                          strokeWidth="1.2"
                          className="transition-all cursor-pointer shadow-2xs"
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>

            {/* Solid 2px Baseline (1:1 with Bar Chart Baseline in Card 1) */}
            <div className="w-full h-[2px] bg-[#17231B]/20 rounded-full my-1" />

            {/* Month Abbr Labels Axis (1:1 with Bar Chart Month Axis in Card 1) */}
            <div className="flex items-center justify-between gap-1 sm:gap-1.5 px-0.5 w-full pl-[5.5%] sm:pl-[5.2%]">
              {MONTH_ABBR.map((monthName, idx) => {
                const isHovered = hoveredMonthIdx === idx;
                return (
                  <div key={idx} className="flex-1 text-center cursor-pointer" onMouseEnter={() => setHoveredMonthIdx(idx)}>
                    <span className={`text-[9px] sm:text-xs font-semibold transition-colors truncate block ${isHovered ? "text-[#17231B] font-bold" : "text-[#5F6B63]"}`}>
                      {monthName}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Interactive Tooltip Card on Hover (Font matching Card 1 bar chart tooltip) */}
            {hoveredMonthIdx !== null && (
              <div className="absolute top-2.5 right-2.5 bg-[#17231B] text-white p-2 rounded-md shadow-lg transition-opacity whitespace-nowrap z-20 font-mono text-[10px] min-w-[180px]">
                <div className="font-bold border-b border-white/20 pb-1 flex items-center justify-between text-[#84E09B]">
                  <span>Bulan {MONTH_ABBR[hoveredMonthIdx]}</span>
                  <span className="text-[9px] text-gray-300">Bln {hoveredMonthIdx + 1}</span>
                </div>
                <div className="space-y-1 mt-1.5 max-h-40 overflow-y-auto pr-0.5">
                  {materialsWithColor.map((mat) => {
                    const priceVal = mat.months[hoveredMonthIdx];
                    return (
                      <div key={mat.material} className="flex items-center justify-between gap-3 text-[10px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: mat.color }} />
                          <span className="font-mono font-semibold truncate" title={mat.materialDescription}>
                            {mat.material}
                          </span>
                        </div>
                        <span className="font-mono font-bold shrink-0 text-[#84E09B]">
                          {priceVal !== null ? formatCurrency(priceVal) : "-"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Footer Note (Matched 1:1 to Card 1 Footer) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-[#5F6B63] border-t border-[#DDE5DF] pt-3 gap-1">
            <span>* Apabila terdapat beberapa update di bulan yang sama, menggunakan data <code className="font-semibold text-[#16823B]">MAX(update)</code>.</span>
            <span className="font-bold text-[#17231B] shrink-0">Jan – Des</span>
          </div>

        </div>
      )}

    </div>
  );
}
