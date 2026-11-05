"use client";

import React, { useState, useMemo } from "react";
import { DollarSign, TrendingUp, Users, Sprout, AlertCircle } from "lucide-react";
import { formatCurrencyRp, formatNumberId } from "@/lib/formatters";

// 7 Wilayah PG1 (AW01--AW07) dengan skema warna yang persis sama dengan barchart Perbandingan Bulanan Antar Wilayah
const REGION_COLORS: Record<string, string> = {
  AW01: "#16823B", // Primary Green GGF
  AW02: "#29A9D6", // Cyan Blue
  AW03: "#E5C959", // Yellow WIP / Gold
  AW04: "#A8D437", // Lime Green
  AW05: "#0B6B32", // Forest Dark Green
  AW06: "#1F4E34", // Deep Pine Green
  AW07: "#89938D", // Neutral Gray
};

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
  chartsData: any[];
  loading?: boolean;
}

// ── Formatters Khusus untuk Top Bar Label (Gaya Amount CAPEX per Status) ──
function formatCostTop(val: number): string {
  if (!val || val <= 0) return "-";
  if (val >= 1_000_000_000) {
    const formatted = (val / 1_000_000_000).toFixed(1).replace(".", ",");
    return formatted.endsWith(",0") ? `${(val / 1_000_000_000).toFixed(0)} M` : `${formatted} M`;
  }
  if (val >= 1_000_000) {
    return `${Math.round(val / 1_000_000)} Jt`;
  }
  if (val >= 1_000) {
    return `${Math.round(val / 1_000)} rb`;
  }
  return `${Math.round(val)}`;
}

function formatTkTop(val: number): string {
  if (!val || val <= 0) return "-";
  return Math.round(val).toLocaleString("id-ID");
}

function formatBatangTop(val: number): string {
  if (!val || val <= 0) return "-";
  if (val >= 1_000) {
    return `${Math.round(val / 1_000).toLocaleString("id-ID")}k`;
  }
  return Math.round(val).toLocaleString("id-ID");
}

function formatCostHaTop(val: number | null): string {
  if (!val || val <= 0) return "-";
  return val.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

// ── Reusable Capex-Style Bar Chart Component ──
interface CapexBarItem {
  wilayah: string;
  value: number;
  topLabel: string;
  subLabel: string;
  insideLabel?: string;
  tooltipText: string;
}

interface CapexRegionalChartCardProps {
  icon: React.ReactNode;
  iconBgClass?: string;
  iconTextClass?: string;
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeClass?: string;
  items: CapexBarItem[];
  summaryTopLabel: string;
  summarySubLabel: string;
  summaryInsideLabel?: string;
  summaryColumnLabel: string;
  summaryTooltipText: string;
  hoveredWilayah: string | null;
  onHoverWilayah: (w: string | null) => void;
}

function CapexRegionalChartCard({
  icon,
  iconBgClass = "bg-[#16823B]/10",
  iconTextClass = "text-[#16823B]",
  title,
  subtitle,
  badgeLabel,
  badgeClass = "bg-[#16823B]/10 text-[#16823B] border-[#16823B]/20",
  items,
  summaryTopLabel,
  summarySubLabel,
  summaryInsideLabel = "100%",
  summaryColumnLabel,
  summaryTooltipText,
  hoveredWilayah,
  onHoverWilayah,
}: CapexRegionalChartCardProps) {
  // Hitung nilai maksimum untuk persentase tinggi bar
  const maxValue = useMemo(() => {
    return Math.max(...items.map((i) => i.value), 0.001);
  }, [items]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#DDE5DF] shadow-sm shadow-[#16823B]/5 flex flex-col justify-between font-sans">
      <div>
        {/* Card Header Title & Unit Badge (Gaya Amount CAPEX per Status) */}
        <div className="flex items-center justify-between mb-4 border-b border-[#DDE5DF] pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${iconBgClass} ${iconTextClass} shrink-0`}>
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-base text-[#17231B] flex items-center gap-2">
                <span>{title}</span>
              </h3>
              <p className="text-xs text-[#5F6B63]">{subtitle}</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${badgeClass}`}>
            {badgeLabel}
          </span>
        </div>

        {/* Vertical Bar Chart Container */}
        <div className="pt-2 w-full">
          <div className="w-full">
            {/* Bars Area */}
            <div className="flex items-end justify-between gap-1.5 sm:gap-2.5 h-48 pb-1 w-full">
              {items.map((item) => {
                const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                const isHovered = hoveredWilayah === item.wilayah;
                const regionColor = REGION_COLORS[item.wilayah] || "#16823B";

                return (
                  <div
                    key={item.wilayah}
                    onMouseEnter={() => onHoverWilayah(item.wilayah)}
                    onMouseLeave={() => onHoverWilayah(null)}
                    className="flex-1 flex flex-col items-center group cursor-pointer min-w-0 transition-opacity"
                    title={item.tooltipText}
                  >
                    {/* Number value & percentage label on top of bar */}
                    <div className="flex flex-col items-center mb-1 w-full min-w-0">
                      <span
                        className={`text-[8px] min-[380px]:text-[9px] sm:text-[11px] font-mono leading-tight transition-all truncate tracking-tighter w-full text-center ${
                          isHovered
                            ? "text-[#16823B] font-bold scale-105"
                            : "text-[#17231B] font-semibold opacity-90 group-hover:opacity-100"
                        }`}
                      >
                        {item.topLabel}
                      </span>
                      <span
                        className={`text-[7px] min-[380px]:text-[8px] sm:text-[9.5px] font-mono leading-tight transition-colors truncate w-full text-center ${
                          isHovered ? "text-[#16823B] font-bold" : "text-[#5F6B63] font-medium"
                        }`}
                      >
                        {item.subLabel}
                      </span>
                    </div>

                    {/* Bar Track Container (Gaya HPP / Amount CAPEX per Status) */}
                    <div className="w-full bg-[#F2F6F3] rounded-t-md h-36 flex items-end overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-t transition-all duration-300 hover:brightness-95 flex items-center justify-center overflow-hidden ${
                          isHovered ? "ring-2 ring-emerald-600/50 brightness-105 shadow-md" : ""
                        }`}
                        style={{
                          height: `${Math.max(heightPercent, item.value > 0 ? 5 : 0)}%`,
                          backgroundColor: regionColor,
                        }}
                      >
                        {heightPercent >= 24 && item.value > 0 && item.insideLabel && (
                          <span className="text-[7px] sm:text-[9px] font-mono font-bold select-none truncate px-0.5 text-white drop-shadow-xs">
                            {item.insideLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Total / Accumulation Bar Column (seperti kolom Total YTD di Amount CAPEX per Status) */}
              <div
                className="flex-1 flex flex-col items-center group cursor-pointer border-l border-dashed border-[#D5E1D8] pl-1 sm:pl-2 min-w-0"
                title={summaryTooltipText}
              >
                <div className="flex flex-col items-center mb-1 w-full min-w-0">
                  <span className="text-[8px] min-[380px]:text-[9px] sm:text-[11px] font-mono font-bold text-[#16823B] leading-tight truncate tracking-tighter w-full text-center">
                    {summaryTopLabel}
                  </span>
                  <span className="text-[7px] min-[380px]:text-[8px] sm:text-[9.5px] font-mono font-bold text-[#16823B] leading-tight truncate w-full text-center">
                    {summarySubLabel}
                  </span>
                </div>

                <div className="w-full bg-emerald-50 rounded-t-md h-36 flex items-end overflow-hidden p-0.5 border border-emerald-200">
                  <div
                    className="w-full bg-[#16823B] hover:bg-[#0B6B32] rounded-t transition-all duration-300 shadow-xs flex items-center justify-center overflow-hidden"
                    style={{ height: "100%" }}
                  >
                    <span className="text-[7px] sm:text-[9px] font-mono font-bold text-white select-none">
                      {summaryInsideLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Solid Base Baseline */}
            <div className="w-full h-[2px] bg-[#17231B]/20 rounded-full" />

            {/* Region Labels Axis (AW01--AW07 & TOTAL) */}
            <div className="flex justify-between gap-1.5 sm:gap-2.5 mt-2 w-full">
              {items.map((item) => {
                const isHovered = hoveredWilayah === item.wilayah;
                const regionColor = REGION_COLORS[item.wilayah] || "#16823B";

                return (
                  <div
                    key={item.wilayah}
                    onMouseEnter={() => onHoverWilayah(item.wilayah)}
                    onMouseLeave={() => onHoverWilayah(null)}
                    className={`flex-1 text-center text-[9px] sm:text-[11px] transition-colors truncate cursor-pointer flex items-center justify-center gap-1 ${
                      isHovered
                        ? "text-[#16823B] font-bold"
                        : "text-[#5F6B63] font-semibold hover:text-[#17231B]"
                    }`}
                    title={`Wilayah ${item.wilayah}`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: regionColor }}
                    />
                    <span className="truncate">{item.wilayah}</span>
                  </div>
                );
              })}

              {/* Total Column Label */}
              <div
                className="flex-1 text-center text-[9px] sm:text-[11px] font-bold text-[#16823B] uppercase pl-1 sm:pl-2 truncate flex items-center justify-center"
                title={summaryTooltipText}
              >
                <span>{summaryColumnLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MonthlyAnalysisSection({
  selectedMonth,
  chartsData,
  loading,
}: MonthlyAnalysisSectionProps) {
  const [hoveredWilayah, setHoveredWilayah] = useState<string | null>(null);

  const currentMonthName = useMemo(() => {
    return MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || "Bulan Terpilih";
  }, [selectedMonth]);

  // 1. Data untuk Grafik 1: Cost per Wilayah
  const costSummary = useMemo(() => {
    const grandTotal = (chartsData || []).reduce((acc, d) => acc + (Number(d.costTotal) || 0), 0);
    const items: CapexBarItem[] = (chartsData || []).map((d) => {
      const val = Number(d.costTotal) || 0;
      const pct = grandTotal > 0 ? (val / grandTotal) * 100 : 0;
      return {
        wilayah: d.wilayah,
        value: val,
        topLabel: formatCostTop(val),
        subLabel: val > 0 ? `${pct.toFixed(1)}%` : "-",
        insideLabel: `${pct.toFixed(1)}%`,
        tooltipText: `Wilayah ${d.wilayah}: ${formatCurrencyRp(val)} (${formatCostTop(val)} • ${pct.toFixed(1)}% dari total)`,
      };
    });

    return {
      items,
      grandTotal,
      topLabel: formatCostTop(grandTotal),
      subLabel: "100%",
      tooltipText: `Total Seluruh Wilayah (${currentMonthName}): ${formatCurrencyRp(grandTotal)} (100%)`,
    };
  }, [chartsData, currentMonthName]);

  // 2. Data untuk Grafik 2: Cost / HA per Wilayah
  const costHaSummary = useMemo(() => {
    const totalCost = (chartsData || []).reduce((acc, d) => acc + (Number(d.costTotal) || 0), 0);
    const totalLuas = (chartsData || []).reduce((acc, d) => acc + (Number(d.luasHa) || 0), 0);
    const avgCostHa = totalLuas > 0 ? (totalCost / totalLuas) / 1_000_000 : 0;

    const items: CapexBarItem[] = (chartsData || []).map((d) => {
      const val = d.costPerHaJuta !== null ? Number(d.costPerHaJuta) : 0;
      return {
        wilayah: d.wilayah,
        value: val,
        topLabel: formatCostHaTop(val),
        subLabel: val > 0 ? "Jt/HA" : "-",
        insideLabel: val > 0 ? `${val.toFixed(1)}` : "",
        tooltipText: `Wilayah ${d.wilayah}: ${val > 0 ? `${val.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Juta Rp/HA` : "-"}`,
      };
    });

    return {
      items,
      avgCostHa,
      topLabel: formatCostHaTop(avgCostHa),
      subLabel: "Rata-rata",
      tooltipText: `Rata-rata Cost/HA PG1 (${currentMonthName}): ${avgCostHa.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Juta Rp/HA`,
    };
  }, [chartsData, currentMonthName]);

  // 3. Data untuk Grafik 3: Penggunaan TK Sulam
  const tkSummary = useMemo(() => {
    const grandTotal = (chartsData || []).reduce((acc, d) => acc + (Number(d.penggunaanTk) || 0), 0);
    const items: CapexBarItem[] = (chartsData || []).map((d) => {
      const val = Number(d.penggunaanTk) || 0;
      const pct = grandTotal > 0 ? (val / grandTotal) * 100 : 0;
      return {
        wilayah: d.wilayah,
        value: val,
        topLabel: formatTkTop(val),
        subLabel: val > 0 ? `${pct.toFixed(1)}%` : "-",
        insideLabel: `${pct.toFixed(1)}%`,
        tooltipText: `Wilayah ${d.wilayah}: ${formatNumberId(val, 1)} TK (${pct.toFixed(1)}% dari total)`,
      };
    });

    return {
      items,
      grandTotal,
      topLabel: formatTkTop(grandTotal),
      subLabel: "100%",
      tooltipText: `Total TK PG1 (${currentMonthName}): ${formatNumberId(grandTotal, 1)} TK (100%)`,
    };
  }, [chartsData, currentMonthName]);

  // 4. Data untuk Grafik 4: Penggunaan Batang Sulam
  const batangSummary = useMemo(() => {
    const grandTotal = (chartsData || []).reduce((acc, d) => acc + (Number(d.penggunaanBatang) || 0), 0);
    const items: CapexBarItem[] = (chartsData || []).map((d) => {
      const val = Number(d.penggunaanBatang) || 0;
      const pct = grandTotal > 0 ? (val / grandTotal) * 100 : 0;
      return {
        wilayah: d.wilayah,
        value: val,
        topLabel: formatBatangTop(val),
        subLabel: val > 0 ? `${pct.toFixed(1)}%` : "-",
        insideLabel: `${pct.toFixed(1)}%`,
        tooltipText: `Wilayah ${d.wilayah}: ${formatNumberId(val, 0)} Btg (${pct.toFixed(1)}% dari total)`,
      };
    });

    return {
      items,
      grandTotal,
      topLabel: formatBatangTop(grandTotal),
      subLabel: "100%",
      tooltipText: `Total Batang PG1 (${currentMonthName}): ${formatNumberId(grandTotal, 0)} Btg (100%)`,
    };
  }, [chartsData, currentMonthName]);

  return (
    <div className="space-y-4 font-sans">
      {/* Header Analisis per Wilayah */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black text-[#17231B] tracking-tight">
            Analisis per Wilayah --- {currentMonthName}
          </h2>
          <p className="text-xs text-[#5F6B63] mt-0.5">
            Analisis biaya, cost per hektar, tenaga kerja, dan bibit batang tertanam per wilayah pada bulan {currentMonthName}.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#DDE5DF] p-12 flex flex-col items-center justify-center gap-2 text-xs font-semibold text-[#5F6B63]">
          <div className="w-7 h-7 border-3 border-[#16823B] border-t-transparent rounded-full animate-spin mb-1" />
          <span>Memuat data analisis wilayah bulan {currentMonthName}...</span>
        </div>
      ) : chartsData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DDE5DF] p-12 flex flex-col items-center justify-center gap-2 text-xs text-[#5F6B63]">
          <AlertCircle className="w-8 h-8 text-[#E5C959]" />
          <span className="font-bold text-[#17231B]">Tidak ada data analisis untuk bulan {currentMonthName}</span>
        </div>
      ) : (
        /* Grid 2x2 Bar Chart Berpenampilan Persis Amount CAPEX per Status */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Grafik 1: Cost per Wilayah */}
          <CapexRegionalChartCard
            icon={<DollarSign className="w-5 h-5" />}
            iconBgClass="bg-[#16823B]/10"
            iconTextClass="text-[#16823B]"
            title="Cost per Wilayah"
            subtitle={`Total realisasi biaya per wilayah pada ${currentMonthName}`}
            badgeLabel="Rupiah"
            badgeClass="bg-[#EAF3EC] text-[#16823B] border-[#CBE0D1]"
            items={costSummary.items}
            summaryTopLabel={costSummary.topLabel}
            summarySubLabel={costSummary.subLabel}
            summaryColumnLabel="TOTAL"
            summaryTooltipText={costSummary.tooltipText}
            hoveredWilayah={hoveredWilayah}
            onHoverWilayah={setHoveredWilayah}
          />

          {/* Grafik 2: Cost / HA per Wilayah */}
          <CapexRegionalChartCard
            icon={<TrendingUp className="w-5 h-5" />}
            iconBgClass="bg-blue-50"
            iconTextClass="text-[#29A9D6]"
            title="Cost / HA per Wilayah"
            subtitle={`Rasio biaya per luas efektif tertanam pada ${currentMonthName}`}
            badgeLabel="Juta Rp / HA"
            badgeClass="bg-blue-50 text-[#29A9D6] border-blue-200"
            items={costHaSummary.items}
            summaryTopLabel={costHaSummary.topLabel}
            summarySubLabel={costHaSummary.subLabel}
            summaryInsideLabel="AVG"
            summaryColumnLabel="RATA2"
            summaryTooltipText={costHaSummary.tooltipText}
            hoveredWilayah={hoveredWilayah}
            onHoverWilayah={setHoveredWilayah}
          />

          {/* Grafik 3: Penggunaan TK Sulam */}
          <CapexRegionalChartCard
            icon={<Users className="w-5 h-5" />}
            iconBgClass="bg-amber-50"
            iconTextClass="text-[#F9A91B]"
            title="Penggunaan TK Sulam"
            subtitle={`Jumlah serapan tenaga kerja per wilayah pada ${currentMonthName}`}
            badgeLabel="Tenaga Kerja (TK)"
            badgeClass="bg-amber-50 text-amber-800 border-amber-200"
            items={tkSummary.items}
            summaryTopLabel={tkSummary.topLabel}
            summarySubLabel={tkSummary.subLabel}
            summaryColumnLabel="TOTAL"
            summaryTooltipText={tkSummary.tooltipText}
            hoveredWilayah={hoveredWilayah}
            onHoverWilayah={setHoveredWilayah}
          />

          {/* Grafik 4: Penggunaan Batang Sulam */}
          <CapexRegionalChartCard
            icon={<Sprout className="w-5 h-5" />}
            iconBgClass="bg-emerald-50"
            iconTextClass="text-[#0B6B32]"
            title="Penggunaan Batang Sulam"
            subtitle={`Jumlah bibit sulam tertanam per wilayah pada ${currentMonthName}`}
            badgeLabel="Batang Bibit"
            badgeClass="bg-emerald-50 text-emerald-800 border-emerald-200"
            items={batangSummary.items}
            summaryTopLabel={batangSummary.topLabel}
            summarySubLabel={batangSummary.subLabel}
            summaryColumnLabel="TOTAL"
            summaryTooltipText={batangSummary.tooltipText}
            hoveredWilayah={hoveredWilayah}
            onHoverWilayah={setHoveredWilayah}
          />
        </div>
      )}
    </div>
  );
}
