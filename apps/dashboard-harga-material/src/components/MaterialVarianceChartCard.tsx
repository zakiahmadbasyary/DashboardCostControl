import React, { useState, useMemo } from "react";
import { LineChart, Layers, AlertCircle, X, Pin } from "lucide-react";
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
  const [pinnedMonthIdx, setPinnedMonthIdx] = useState<number | null>(null);

  const activeMonthIdx = pinnedMonthIdx !== null ? pinnedMonthIdx : hoveredMonthIdx;

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
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(val);
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
          
          {/* Line Chart Area (Full Width Responsive, No Horizontal Scroll on Chart) */}
          <div className="bg-white border border-[#DDE5DF] rounded-xl p-3 relative flex flex-col w-full">
            
            <div className="w-full relative">
              <div className="flex flex-col w-full relative">
                
                {/* Dynamic Hover / Pinned Tooltip Card */}
                {activeMonthIdx !== null && (
                  <div
                    className={`absolute top-1 bg-white border rounded-xl p-3 shadow-xl text-xs min-w-[220px] z-30 transition-all duration-150 ease-out ${
                      pinnedMonthIdx !== null
                        ? "pointer-events-auto border-[#16823B] ring-2 ring-[#16823B]/15"
                        : "pointer-events-none border-[#DDE5DF]"
                    }`}
                    style={{
                      left: `${((padding.left + (activeMonthIdx / 11) * chartWidth) / svgWidth) * 100}%`,
                      transform: activeMonthIdx > 6 ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
                    }}
                  >
                    <div className="font-bold text-[#17231B] pb-2 mb-2 border-b border-[#DDE5DF] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {pinnedMonthIdx !== null && <Pin className="w-3 h-3 text-[#16823B] shrink-0 fill-[#16823B]" />}
                        <span>Bulan: <strong className="text-[#16823B] font-extrabold">{MONTH_ABBR[activeMonthIdx]}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        {pinnedMonthIdx !== null ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPinnedMonthIdx(null);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors pointer-events-auto cursor-pointer"
                            title="Tutup / Lepas Pin"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#5F6B63] bg-[#F7F9F7] px-1.5 py-0.5 rounded border border-[#DDE5DF] font-semibold">
                            Bln {activeMonthIdx + 1}
                          </span>
                        )}
                      </div>
                    </div>

                    {(() => {
                      const activeMonthPrices = materialsWithColor
                        .map((m) => m.months[activeMonthIdx])
                        .filter((v): v is number => v !== null && v !== undefined);
                      const maxMonthPrice = activeMonthPrices.length > 0 ? Math.max(...activeMonthPrices) : 0;

                      return (
                        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                          {materialsWithColor.map((mat) => {
                            const priceVal = mat.months[activeMonthIdx];
                            const isMax = priceVal !== null && priceVal !== undefined && maxMonthPrice > 0 && priceVal === maxMonthPrice;

                            return (
                              <div key={mat.material} className="flex items-center justify-between gap-3 p-1 rounded hover:bg-[#F7F9F7]">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: mat.color }}
                                  />
                                  <span className="text-[#5F6B63] font-medium truncate max-w-[110px]" title={mat.materialDescription || mat.material}>
                                    {mat.material}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span
                                    className={`font-mono text-xs ${
                                      isMax
                                        ? "text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200"
                                        : "text-[#17231B] font-semibold"
                                    }`}
                                  >
                                    {priceVal !== null && priceVal !== undefined ? formatCurrency(priceVal) : "-"}
                                  </span>
                                  {isMax && (
                                    <span className="text-[9px] font-black text-rose-600 bg-rose-100 px-1 rounded uppercase tracking-tighter">
                                      MAX
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
            
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
              onMouseLeave={() => setHoveredMonthIdx(null)}
            >
              {/* Y-Axis Grid Lines & Labels */}
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

              {/* Invisible Full-Height Hover & Click Rectangles */}
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
                    onClick={() => setPinnedMonthIdx((prev) => (prev === idx ? null : idx))}
                  />
                );
              })}

              {/* Active Month Vertical Guide Line */}
              {activeMonthIdx !== null && (
                <line
                  x1={getX(activeMonthIdx)}
                  y1={padding.top}
                  x2={getX(activeMonthIdx)}
                  y2={svgHeight - padding.bottom}
                  stroke="#16823B"
                  strokeWidth={pinnedMonthIdx !== null ? "1.8" : "1.2"}
                  strokeDasharray={pinnedMonthIdx !== null ? "none" : "2 2"}
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
                      const isActive = activeMonthIdx === pt.monthIdx;
                      return (
                        <circle
                          key={pt.monthIdx}
                          cx={pt.x}
                          cy={pt.y}
                          r={isActive ? "4" : "2.5"}
                          fill={mat.color}
                          stroke="#FFFFFF"
                          strokeWidth="1.2"
                          className="transition-all cursor-pointer shadow-2xs"
                          onClick={() => setPinnedMonthIdx((prev) => (prev === pt.monthIdx ? null : pt.monthIdx))}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>

            {/* Solid 2px Baseline */}
            <div className="w-full h-[2px] bg-[#17231B]/20 rounded-full my-1" />

            {/* Month Abbr Labels Axis */}
            <div className="flex items-center justify-between gap-1 sm:gap-1.5 px-0.5 w-full pl-[5.5%] sm:pl-[5.2%]">
              {MONTH_ABBR.map((monthName, idx) => {
                const isSelected = activeMonthIdx === idx;
                return (
                  <div
                    key={idx}
                    className="flex-1 text-center cursor-pointer"
                    onMouseEnter={() => setHoveredMonthIdx(idx)}
                    onClick={() => setPinnedMonthIdx((prev) => (prev === idx ? null : idx))}
                  >
                    <span
                      className={`text-[9px] sm:text-xs font-semibold transition-colors truncate block ${
                        isSelected
                          ? "text-[#16823B] font-extrabold underline underline-offset-2"
                          : "text-[#5F6B63]"
                      }`}
                    >
                      {monthName}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-[#5F6B63] border-t border-[#DDE5DF] pt-3 gap-1">
        <span>* Penggunaan harga terupdate.</span>
        <span className="font-bold text-[#17231B] shrink-0">Jan – Des</span>
      </div>

    </div>
  )}

</div>
  );
}
