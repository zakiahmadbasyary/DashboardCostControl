"use client";

import React, { useState, useMemo } from "react";
import { CapexItem, CapexMainFilterValues } from "@/types/capex";
import { formatCurrencyRp } from "@/lib/formatters";
import {
  TrendingUp,
  FolderTree,
  Filter,
  Lock,
  SlidersHorizontal,
} from "lucide-react";

export type ChartFilterMode = "locked" | "responsive";

interface CapexAnalyticsChartsCardProps {
  items: CapexItem[];
  globalItems?: CapexItem[];
  loading?: boolean;
  activeFilters?: CapexMainFilterValues;
  statusList?: string[];
  filterMode?: ChartFilterMode;
  onToggleFilterMode?: (mode: ChartFilterMode) => void;
  onSelectStatus?: (status: string) => void;
  onSelectCategory?: (category: string) => void;
  onResetStatus?: () => void;
  onResetCategory?: () => void;
}

// 5 Status CAPEX berurutan sesuai alur bisnis
const ORDERED_STATUSES = [
  "Belum Created",
  "Sudah Created",
  "Final Approve",
  "Sudah PO",
  "Sudah Close",
] as const;

// Palet warna gradasi hijau terstandar GGF (seperti di HPP Wilayah: Hijau Muda -> Hijau Tua)
const STATUS_BAR_COLORS: Record<string, string> = {
  "Belum Created": "#B5E397", // Hijau Muda
  "Sudah Created": "#60B647", // Hijau Sedang-Muda
  "Final Approve": "#16823B", // Hijau Utama GGF
  "Sudah PO": "#0E632A",      // Hijau Tua
  "Sudah Close": "#06451B",   // Hijau Sangat Tua
};

/**
 * Normalisasi status string dari database ke 5 status standar
 */
function normalizeStatus(status: string | null | undefined): string {
  if (!status) return "Belum Created";
  const s = status.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (s === "belum_created") return "Belum Created";
  if (s === "sudah_created") return "Sudah Created";
  if (s === "final_approve") return "Final Approve";
  if (s === "sudah_po") return "Sudah PO";
  if (s === "sudah_close") return "Sudah Close";
  return status.replace(/_/g, " ");
}

/**
 * Cek apakah status saat ini sedang aktif sebagai filter
 */
function isStatusActive(statusLabel: string, currentFilter?: string): boolean {
  if (!currentFilter || currentFilter === "Semua") return false;
  const normLabel = statusLabel.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const normCurrent = currentFilter.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return normLabel === normCurrent;
}

/**
 * Cek apakah kategori saat ini sedang aktif sebagai filter
 */
function isCategoryActive(catName: string, currentCategory?: string): boolean {
  if (!currentCategory || currentCategory === "Semua") return false;
  return catName.trim().toLowerCase() === currentCategory.trim().toLowerCase();
}

/**
 * Format angka dalam bentuk jutaan standar Indonesia (seperti di dashboard HPP)
 */
function formatValJuta(val: number): string {
  if (!val || val <= 0) return "-";
  const valJuta = val / 1_000_000;
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(valJuta);
}

/**
 * Singkat nama kategori jika terlalu panjang untuk axis bawah
 */
function getCategoryShortLabel(name: string): string {
  if (!name) return "—";
  const map: Record<string, string> = {
    "Bangunan": "Bangunan",
    "Komputer & Elektronik": "Komputer",
    "Lagoon": "Lagoon",
    "Peralatan Kebun": "Alat Kebun",
    "Perlengkapan Boom": "P. Boom",
    "Perlengkapan Irigasi": "P. Irigasi",
    "Saluran & Gorong2": "Saluran",
    "Unit Kebun": "Unit Kebun",
    "Unit Motor": "Unit Motor",
  };
  return map[name] || (name.length > 9 ? name.substring(0, 8) + "…" : name);
}

export default function CapexAnalyticsChartsCard({
  items,
  globalItems,
  loading = false,
  activeFilters,
  filterMode,
  onToggleFilterMode,
  onSelectStatus,
  onSelectCategory,
  onResetStatus,
  onResetCategory,
}: CapexAnalyticsChartsCardProps) {
  const [internalMode, setInternalMode] = useState<ChartFilterMode>("locked");
  const mode = filterMode ?? internalMode;
  const setMode = onToggleFilterMode ?? setInternalMode;

  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const isAnyStatusSelected = Boolean(
    activeFilters?.statusCapex && activeFilters.statusCapex !== "Semua"
  );
  const isAnyCategorySelected = Boolean(
    activeFilters?.kategori && activeFilters.kategori !== "Semua"
  );

  // Active items for chart calculations:
  // In locked mode, use globalItems (unfiltered); in responsive mode, use filtered items
  const chartItems = useMemo(() => {
    if (mode === "locked" && globalItems && globalItems.length > 0) {
      return globalItems;
    }
    return items;
  }, [mode, globalItems, items]);

  // ─── 1. DATA PROCESSING UNTUK GRAFIK KIRI (Amount per Status) ─────────────────
  const statusSummary = useMemo(() => {
    const map: Record<string, { totalAmount: number; count: number }> = {};
    ORDERED_STATUSES.forEach((st) => {
      map[st] = { totalAmount: 0, count: 0 };
    });

    let grandTotalAmount = 0;
    let grandTotalCount = 0;

    chartItems.forEach((item) => {
      const norm = normalizeStatus(item.statusCapex);
      const amount = Number(item.amount) || 0;

      if (!map[norm]) {
        map[norm] = { totalAmount: 0, count: 0 };
      }
      map[norm].totalAmount += amount;
      map[norm].count += 1;

      grandTotalAmount += amount;
      grandTotalCount += 1;
    });

    const data = ORDERED_STATUSES.map((status) => {
      const stats = map[status] || { totalAmount: 0, count: 0 };
      const barColor = STATUS_BAR_COLORS[status] || "#16823B";
      return {
        status,
        totalAmount: stats.totalAmount,
        count: stats.count,
        barColor,
      };
    });

    const maxStatusAmount = Math.max(...data.map((d) => d.totalAmount), 1);

    return {
      data,
      maxStatusAmount,
      grandTotalAmount,
      grandTotalCount,
    };
  }, [chartItems]);

  // ─── 2. DATA PROCESSING UNTUK GRAFIK KANAN (Belum Created vs Sudah Created per Kategori) ─
  const categorySummary = useMemo(() => {
    const map: Record<
      string,
      {
        kategori: string;
        belumCreatedCount: number;
        sudahCreatedCount: number;
        totalCount: number;
        totalAmount: number;
      }
    > = {};

    chartItems.forEach((item) => {
      const cat = (item.kategori && item.kategori.trim()) || "Tanpa Kategori";
      const norm = normalizeStatus(item.statusCapex);
      const isBelumCreated = norm === "Belum Created";
      const amount = Number(item.amount) || 0;

      if (!map[cat]) {
        map[cat] = {
          kategori: cat,
          belumCreatedCount: 0,
          sudahCreatedCount: 0,
          totalCount: 0,
          totalAmount: 0,
        };
      }

      if (isBelumCreated) {
        map[cat].belumCreatedCount += 1;
      } else {
        map[cat].sudahCreatedCount += 1;
      }

      map[cat].totalCount += 1;
      map[cat].totalAmount += amount;
    });

    // Urutkan kategori berdasarkan total CAPEX terbanyak
    const sorted = Object.values(map).sort((a, b) => b.totalCount - a.totalCount);

    // Nilai maksimum untuk skala stacked bar chart (total item per kategori)
    const maxTotalCount = Math.max(
      ...sorted.map((c) => c.totalCount),
      1
    );

    const totalBelumCreated = sorted.reduce((acc, c) => acc + c.belumCreatedCount, 0);
    const totalSudahCreated = sorted.reduce((acc, c) => acc + c.sudahCreatedCount, 0);
    const grandTotalCatCount = totalBelumCreated + totalSudahCreated;

    return {
      categories: sorted,
      maxTotalCount,
      totalBelumCreated,
      totalSudahCreated,
      grandTotalCatCount,
    };
  }, [chartItems]);

  // Loading skeleton matching HPP Trend & Wilayah
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 font-sans">
        <div className="bg-white p-5 rounded-2xl border border-[#DDE5DF] animate-pulse h-80"></div>
        <div className="bg-white p-5 rounded-2xl border border-[#DDE5DF] animate-pulse h-80"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-3.5 font-sans">
      {/* ── TOP CONTROL BAR: TOGGLE FILTER MODE (TERKUNCI / RESPONSIF) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-[#DDE5DF] shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-[#17231B]">
                Summary CAPEX
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  mode === "locked"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-blue-50 text-blue-800 border-blue-200"
                }`}
              >
                {mode === "locked" ? "Mode Terkunci (Global)" : "Mode Responsif (Filter)"}
              </span>
            </div>
            <p className="text-[11px] text-[#5F6B63] truncate">
              {mode === "locked"
                ? "Grafik menampilkan data total keseluruhan (tidak terpotong oleh dropdown filter)."
                : "Grafik ikut menyaring dan menyesuaikan data sesuai filter yang dipilih di atas."}
            </p>
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#F7F9F7] rounded-xl border border-[#DDE5DF] shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setMode("locked")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "locked"
                ? "bg-[#16823B] text-white shadow-xs"
                : "text-[#5F6B63] hover:text-[#17231B] hover:bg-neutral-200/50"
            }`}
            title="Grafik menampilkan total data CAPEX secara keseluruhan"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Terkunci (Global)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("responsive")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "responsive"
                ? "bg-[#16823B] text-white shadow-xs"
                : "text-[#5F6B63] hover:text-[#17231B] hover:bg-neutral-200/50"
            }`}
            title="Grafik ikut tersaring sesuai opsi Kategori & Cost Center di atas"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Responsif (Filter)</span>
          </button>
        </div>
      </div>

      {/* ── TWO COLUMN CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 font-sans">
      {/* ----------------------------------------------------------------- */}
      {/* CHART 1 (LEFT): Total Amount per Status CAPEX (Vertical Bar Chart)*/}
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
                <h3 className="font-bold text-base text-[#17231B] flex items-center gap-2">
                  <span>Amount CAPEX per Status</span>
                  {isAnyStatusSelected && (
                    <span className="text-[10px] bg-[#16823B] text-white px-2 py-0.5 rounded-full font-semibold">
                      Tersaring
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#5F6B63]">
                  Klik batang status untuk memfilter data CAPEX
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#16823B] bg-[#16823B]/10 px-2.5 py-1 rounded-lg border border-[#16823B]/20">
                Rp Juta
              </span>
            </div>
          </div>

          {/* Vertical Bar Chart Container */}
          <div className="pt-2 w-full">
            <div className="w-full">
              {/* Bars Area */}
              <div className="flex items-end justify-between gap-1.5 sm:gap-2.5 h-48 pb-1 w-full">
                {statusSummary.data.map((item) => {
                  const val = item.totalAmount;
                  const heightPercent =
                    statusSummary.maxStatusAmount > 0
                      ? (val / statusSummary.maxStatusAmount) * 100
                      : 0;
                  const isHovered = hoveredStatus === item.status;
                  const isSelected = isStatusActive(item.status, activeFilters?.statusCapex);

                  return (
                    <div
                      key={item.status}
                      onClick={() => onSelectStatus?.(item.status)}
                      onMouseEnter={() => setHoveredStatus(item.status)}
                      onMouseLeave={() => setHoveredStatus(null)}
                      className={`flex-1 flex flex-col items-center group cursor-pointer min-w-0 transition-opacity ${
                        isAnyStatusSelected && !isSelected
                          ? "opacity-45 hover:opacity-100"
                          : "opacity-100"
                      }`}
                      title={`${item.status}: ${formatCurrencyRp(val)} (${formatValJuta(val)} Jt) — Klik untuk menyaring`}
                    >
                      {/* Number value label on top of bar */}
                      <span
                        className={`text-[8px] min-[380px]:text-[9px] sm:text-[11px] font-mono mb-1 transition-all truncate tracking-tighter w-full text-center ${
                          isSelected
                            ? "text-[#16823B] font-bold scale-105"
                            : isHovered
                            ? "text-[#16823B] font-bold"
                            : "text-[#17231B] font-semibold opacity-90 group-hover:opacity-100"
                        }`}
                      >
                        {formatValJuta(val)}
                      </span>

                      {/* Bar Track Container (HPP style) */}
                      <div className="w-full bg-[#F2F6F3] rounded-t-md h-36 flex items-end overflow-hidden p-0.5">
                        <div
                          className={`w-full rounded-t transition-all duration-300 hover:brightness-95 ${
                            isSelected
                              ? "bg-[#FCE27A] ring-2 ring-[#E5C959] shadow-md scale-[1.02]"
                              : isHovered
                              ? "ring-2 ring-[#16823B]/40"
                              : ""
                          }`}
                          style={{
                            height: `${Math.max(heightPercent, val > 0 ? 5 : 0)}%`,
                            backgroundColor: isSelected
                              ? "#FCE27A"
                              : isHovered
                              ? "#16823B"
                              : item.barColor,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}

                {/* Total Accumulation Bar Column (seperti YTD di HPP) */}
                <div
                  onClick={() => onResetStatus?.()}
                  className="flex-1 flex flex-col items-center group cursor-pointer border-l border-dashed border-[#D5E1D8] pl-1 sm:pl-2 min-w-0"
                  title={`Total Akumulasi: ${formatCurrencyRp(statusSummary.grandTotalAmount)} (${formatValJuta(statusSummary.grandTotalAmount)} Jt) — Klik untuk reset status`}
                >
                  <span className="text-[8px] min-[380px]:text-[9px] sm:text-[11px] font-mono font-bold text-[#16823B] mb-1 truncate tracking-tighter w-full text-center">
                    {formatValJuta(statusSummary.grandTotalAmount)}
                  </span>

                  <div className="w-full bg-emerald-50 rounded-t-md h-36 flex items-end overflow-hidden p-0.5 border border-emerald-200">
                    <div
                      className="w-full bg-[#8CC63F] hover:bg-[#16823B] rounded-t transition-all duration-300 shadow-xs"
                      style={{
                        height: "100%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Solid Base Baseline */}
              <div className="w-full h-[2px] bg-[#17231B]/20 rounded-full"></div>

              {/* Status Labels Axis */}
              <div className="flex justify-between gap-1.5 sm:gap-2.5 mt-2 w-full">
                {statusSummary.data.map((item) => {
                  const isHovered = hoveredStatus === item.status;
                  const isSelected = isStatusActive(item.status, activeFilters?.statusCapex);

                  return (
                    <span
                      key={item.status}
                      onClick={() => onSelectStatus?.(item.status)}
                      onMouseEnter={() => setHoveredStatus(item.status)}
                      onMouseLeave={() => setHoveredStatus(null)}
                      className={`flex-1 text-center text-[9px] sm:text-[11px] transition-colors truncate cursor-pointer ${
                        isSelected
                          ? "text-[#16823B] underline font-extrabold"
                          : isHovered
                          ? "text-[#16823B] font-bold"
                          : "text-[#5F6B63] font-semibold hover:text-[#17231B]"
                      }`}
                      title={`${item.status} (Klik untuk filter)`}
                    >
                      {item.status}
                    </span>
                  );
                })}
                {/* Total Column Label */}
                <span
                  onClick={() => onResetStatus?.()}
                  className="flex-1 text-center text-[9px] sm:text-[11px] font-bold text-[#16823B] uppercase pl-1 sm:pl-2 truncate cursor-pointer hover:underline"
                  title="Klik untuk reset filter status"
                >
                  TOTAL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info with Active Filter indicator */}
        <div className="mt-4 pt-3 border-t border-[#DDE5DF]/60 text-xs text-[#5F6B63] flex justify-between items-center">
          {isAnyStatusSelected ? (
            <div className="flex items-center gap-2">
              <span>
                Filter Aktif: <strong className="text-[#16823B]">{activeFilters?.statusCapex}</strong>
              </span>
              <button
                type="button"
                onClick={onResetStatus}
                className="text-[10px] bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded cursor-pointer font-bold transition-all"
              >
                ✕ Reset Status
              </button>
            </div>
          ) : (
            <span>Klik batang status untuk memfilter data CAPEX</span>
          )}
          <span className="font-semibold text-[#16823B]">Status Nominal CAPEX</span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* CHART 2 (RIGHT): CAPEX per Kategori (Stacked Bar Chart: Belum vs Sudah+) */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white p-5 rounded-2xl border border-[#DDE5DF] shadow-sm shadow-[#16823B]/5 flex flex-col justify-between">
        <div>
          {/* Card Header Title */}
          <div className="flex items-center justify-between mb-4 border-b border-[#DDE5DF] pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#17231B] flex items-center gap-2">
                  <span>CAPEX per Kategori</span>
                  {isAnyCategorySelected && (
                    <span className="text-[10px] bg-[#16823B] text-white px-2 py-0.5 rounded-full font-semibold">
                      Tersaring
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#5F6B63]">
                  Klik kategori atau segmen batang untuk menyaring data CAPEX
                </p>
              </div>
            </div>

            {/* Interactive Legend (Stacked Segments) */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onSelectStatus?.("Belum Created")}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all cursor-pointer ${
                  isStatusActive("Belum Created", activeFilters?.statusCapex)
                    ? "bg-[#8CD16B]/20 text-[#15803D] ring-1 ring-[#8CD16B]"
                    : "text-[#5F6B63] hover:text-[#17231B]"
                }`}
                title="Klik untuk memfilter status Belum Created"
              >
                <span className="w-2.5 h-2.5 rounded-xs bg-[#8CD16B] border border-[#60B647]" />
                <span>Belum<span className="hidden sm:inline"> Created</span></span>
              </button>
              <button
                type="button"
                onClick={() => onSelectStatus?.("Sudah Created")}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all cursor-pointer ${
                  isStatusActive("Sudah Created", activeFilters?.statusCapex)
                    ? "bg-[#16823B]/20 text-[#16823B] ring-1 ring-[#16823B]"
                    : "text-[#16823B] hover:text-[#0E632A]"
                }`}
                title="Klik untuk memfilter status Sudah Created"
              >
                <span className="w-2.5 h-2.5 rounded-xs bg-[#16823B] border border-[#0E632A]" />
                <span>Sudah<span className="hidden sm:inline"> Created</span>+</span>
              </button>
            </div>
          </div>

          {/* Vertical Stacked Bar Chart Container */}
          <div className="pt-2 w-full">
            <div className="w-full">
              {/* Bars Area */}
              <div className="flex items-end justify-between gap-1.5 sm:gap-2.5 h-48 pb-1 w-full">
                {categorySummary.categories.map((cat) => {
                  const isHovered = hoveredCategory === cat.kategori;
                  const isCatSelected = isCategoryActive(cat.kategori, activeFilters?.kategori);

                  const totalVal = cat.totalCount;
                  const barHeightPercent =
                    categorySummary.maxTotalCount > 0
                      ? (totalVal / categorySummary.maxTotalCount) * 100
                      : 0;

                  const belumPercent =
                    totalVal > 0 ? (cat.belumCreatedCount / totalVal) * 100 : 0;
                  const sudahPercent =
                    totalVal > 0 ? (cat.sudahCreatedCount / totalVal) * 100 : 0;

                  const isBelumStatusSelected = isStatusActive(
                    "Belum Created",
                    activeFilters?.statusCapex
                  );
                  const isSudahStatusSelected = isStatusActive(
                    "Sudah Created",
                    activeFilters?.statusCapex
                  );

                  return (
                    <div
                      key={cat.kategori}
                      onClick={() => onSelectCategory?.(cat.kategori)}
                      onMouseEnter={() => setHoveredCategory(cat.kategori)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`flex-1 flex flex-col items-center group cursor-pointer min-w-0 transition-opacity ${
                        isAnyCategorySelected && !isCatSelected
                          ? "opacity-45 hover:opacity-100"
                          : "opacity-100"
                      }`}
                      title={`${cat.kategori}: Total ${totalVal} CAPEX\n• Belum Created: ${cat.belumCreatedCount} (${totalVal > 0 ? Math.round(belumPercent) : 0}%)\n• Sudah Created+: ${cat.sudahCreatedCount} (${totalVal > 0 ? Math.round(sudahPercent) : 0}%)\n(Klik kategori untuk filter)`}
                    >
                      {/* Total Number Value label on top of stacked bar */}
                      <span
                        className={`text-[8px] min-[380px]:text-[9px] sm:text-[11px] font-mono mb-1 transition-all truncate tracking-tighter w-full text-center ${
                          isCatSelected
                            ? "text-[#16823B] font-bold scale-105"
                            : isHovered
                            ? "text-[#16823B] font-bold"
                            : "text-[#17231B] font-semibold opacity-90 group-hover:opacity-100"
                        }`}
                      >
                        {totalVal > 0 ? totalVal : "-"}
                      </span>

                      {/* Bar Track Container */}
                      <div
                        className={`w-full bg-[#F2F6F3] rounded-t-md h-36 flex items-end overflow-hidden p-0.5 transition-all duration-200 ${
                          isCatSelected
                            ? "ring-2 ring-[#E5C959] shadow-md bg-[#FFFBEA]"
                            : isHovered
                            ? "ring-1 ring-[#16823B]/40 bg-[#EBF3ED]"
                            : ""
                        }`}
                      >
                        {/* Single Stacked Bar Column */}
                        <div
                          className="w-full rounded-t overflow-hidden flex flex-col justify-end transition-all duration-300"
                          style={{
                            height: `${Math.max(barHeightPercent, totalVal > 0 ? 6 : 0)}%`,
                          }}
                        >
                          {/* Segmen Atas: Belum Created */}
                          {cat.belumCreatedCount > 0 && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectStatus?.("Belum Created");
                              }}
                              className={`w-full transition-all duration-300 hover:brightness-105 cursor-pointer flex items-center justify-center overflow-hidden ${
                                isBelumStatusSelected
                                  ? "bg-[#FCE27A] ring-1 ring-[#E5C959]"
                                  : isSudahStatusSelected
                                  ? "bg-[#8CD16B] opacity-35"
                                  : "bg-[#8CD16B]"
                              }`}
                              style={{
                                height: `${belumPercent}%`,
                              }}
                              title={`${cat.kategori} • Belum Created: ${cat.belumCreatedCount} (${Math.round(belumPercent)}%) — Klik untuk filter status Belum Created`}
                            >
                              {belumPercent >= 28 && barHeightPercent >= 24 && (
                                <span className="text-[7px] sm:text-[9px] font-mono font-bold text-white/95 drop-shadow-xs select-none">
                                  {cat.belumCreatedCount}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Segmen Bawah: Sudah Created+ */}
                          {cat.sudahCreatedCount > 0 && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectStatus?.("Sudah Created");
                              }}
                              className={`w-full transition-all duration-300 hover:brightness-110 cursor-pointer flex items-center justify-center overflow-hidden ${
                                isSudahStatusSelected
                                  ? "bg-[#FCE27A] ring-1 ring-[#E5C959]"
                                  : isBelumStatusSelected
                                  ? "bg-[#16823B] opacity-35"
                                  : "bg-[#16823B]"
                              }`}
                              style={{
                                height: `${sudahPercent}%`,
                              }}
                              title={`${cat.kategori} • Sudah Created+: ${cat.sudahCreatedCount} (${Math.round(sudahPercent)}%) — Klik untuk filter status Sudah Created`}
                            >
                              {sudahPercent >= 28 && barHeightPercent >= 24 && (
                                <span className="text-[7px] sm:text-[9px] font-mono font-bold text-white drop-shadow-xs select-none">
                                  {cat.sudahCreatedCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Total Accumulation Column (Stacked Bar Total) */}
                <div
                  onClick={() => onResetCategory?.()}
                  className="flex-1 flex flex-col items-center group cursor-pointer border-l border-dashed border-[#D5E1D8] pl-1 sm:pl-2 min-w-0"
                  title={`Total Seluruh Kategori: ${categorySummary.grandTotalCatCount} CAPEX\n• Belum Created: ${categorySummary.totalBelumCreated} (${categorySummary.grandTotalCatCount > 0 ? Math.round((categorySummary.totalBelumCreated / categorySummary.grandTotalCatCount) * 100) : 0}%)\n• Sudah Created+: ${categorySummary.totalSudahCreated} (${categorySummary.grandTotalCatCount > 0 ? Math.round((categorySummary.totalSudahCreated / categorySummary.grandTotalCatCount) * 100) : 0}%)\n(Klik untuk reset filter kategori)`}
                >
                  <span className="text-[8px] min-[380px]:text-[9px] sm:text-[11px] font-mono font-bold text-[#16823B] mb-1 truncate tracking-tighter w-full text-center">
                    {categorySummary.grandTotalCatCount}
                  </span>

                  <div className="w-full bg-emerald-50 rounded-t-md h-36 flex items-end overflow-hidden p-0.5 border border-emerald-200">
                    <div className="w-full h-full rounded-t overflow-hidden flex flex-col justify-end shadow-xs transition-all duration-300">
                      {/* Total Belum Created (Atas) */}
                      <div
                        className="w-full bg-[#8CD16B] hover:brightness-105 transition-all duration-300 flex items-center justify-center overflow-hidden"
                        style={{
                          height: `${
                            categorySummary.grandTotalCatCount > 0
                              ? (categorySummary.totalBelumCreated / categorySummary.grandTotalCatCount) * 100
                              : 0
                          }%`,
                        }}
                        title={`Total Belum Created: ${categorySummary.totalBelumCreated}`}
                      >
                        <span className="text-[7px] sm:text-[9px] font-mono font-bold text-white/95 select-none">
                          {categorySummary.totalBelumCreated}
                        </span>
                      </div>
                      {/* Total Sudah Created+ (Bawah) */}
                      <div
                        className="w-full bg-[#16823B] hover:brightness-110 transition-all duration-300 flex items-center justify-center overflow-hidden"
                        style={{
                          height: `${
                            categorySummary.grandTotalCatCount > 0
                              ? (categorySummary.totalSudahCreated / categorySummary.grandTotalCatCount) * 100
                              : 0
                          }%`,
                        }}
                        title={`Total Sudah Created+: ${categorySummary.totalSudahCreated}`}
                      >
                        <span className="text-[7px] sm:text-[9px] font-mono font-bold text-white select-none">
                          {categorySummary.totalSudahCreated}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solid Base Baseline */}
              <div className="w-full h-[2px] bg-[#17231B]/20 rounded-full"></div>

              {/* Category Labels Axis */}
              <div className="flex justify-between gap-1.5 sm:gap-2.5 mt-2 w-full">
                {categorySummary.categories.map((cat) => {
                  const isHovered = hoveredCategory === cat.kategori;
                  const isCatSelected = isCategoryActive(cat.kategori, activeFilters?.kategori);

                  return (
                    <span
                      key={cat.kategori}
                      onClick={() => onSelectCategory?.(cat.kategori)}
                      onMouseEnter={() => setHoveredCategory(cat.kategori)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`flex-1 text-center text-[9px] sm:text-[10px] transition-colors truncate cursor-pointer ${
                        isCatSelected
                          ? "text-[#16823B] underline font-extrabold"
                          : isHovered
                          ? "text-[#16823B] font-bold"
                          : "text-[#5F6B63] font-semibold hover:text-[#17231B]"
                      }`}
                      title={`${cat.kategori} (Klik untuk filter)`}
                    >
                      {getCategoryShortLabel(cat.kategori)}
                    </span>
                  );
                })}
                {/* Total Column Label */}
                <span
                  onClick={() => onResetCategory?.()}
                  className="flex-1 text-center text-[9px] sm:text-[10px] font-bold text-[#16823B] uppercase pl-1 sm:pl-2 truncate cursor-pointer hover:underline"
                  title="Klik untuk reset filter kategori"
                >
                  TOTAL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info with Active Filter indicator */}
        <div className="mt-4 pt-3 border-t border-[#DDE5DF]/60 text-xs text-[#5F6B63] flex justify-between items-center">
          {isAnyCategorySelected ? (
            <div className="flex items-center gap-2">
              <span>
                Filter Aktif: <strong className="text-[#16823B]">{activeFilters?.kategori}</strong>
              </span>
              <button
                type="button"
                onClick={onResetCategory}
                className="text-[10px] bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded cursor-pointer font-bold transition-all"
              >
                ✕ Reset Kategori
              </button>
            </div>
          ) : (
            <span>Klik kategori atau segmen untuk menyaring tampilan</span>
          )}
          <span className="font-semibold text-[#16823B]">Distribusi Kategori (Stacked)</span>
        </div>
      </div>
    </div>
    </div>
  );
}
