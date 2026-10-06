"use client";

import React from "react";
import { BarChart3, Tag, Package, RefreshCw, AlertCircle, Info } from "lucide-react";

export interface MonthlyChartItem {
  month: number;
  label: string;
  nilai: number | null;
  date: string | null;
}

export interface MasterMaterialOption {
  material: string;
  materialDescription: string | null;
  group: string | null;
  baseUnitOfMeasure: string | null;
  abcIndicator: string | null;
}

interface MaterialAnalysisCardProps {
  groups?: string[];
  materials?: MasterMaterialOption[];
  selectedGroup?: string;
  selectedMaterial?: string;
  onGroupChange?: (group: string) => void;
  onMaterialChange?: (material: string) => void;
  chartData: MonthlyChartItem[];
  activeMaster: MasterMaterialOption | null;
  latestNilai: number | null;
  latestUpdateDate: string | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default function MaterialAnalysisCard({
  chartData,
  activeMaster,
  latestNilai,
  latestUpdateDate,
  loading,
  error,
  onRetry,
}: MaterialAnalysisCardProps) {
  const formatNumberOnly = (val: number | null) => {
    if (val === null || val === undefined) return "-";
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatBarValue = (val: number | null) => {
    if (val === null || val === undefined) return "";
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 1,
    }).format(val);
  };

  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Find max value in chart data for bar height percentage scaling
  const validNilaiList = chartData.map((d) => d.nilai).filter((v): v is number => v !== null);
  const maxNilai = validNilaiList.length > 0 ? Math.max(...validNilaiList) : 1;

  // Determine UoM display (e.g. RP/KG or RP/Fertilization)
  const uomDisplay = activeMaster?.baseUnitOfMeasure
    ? `RP/${activeMaster.baseUnitOfMeasure}`
    : activeMaster?.group
    ? `RP/${activeMaster.group}`
    : "RP/Unit";

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs space-y-6 font-sans" suppressHydrationWarning>
      
      {/* 1. Header & Active Material Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-5">
        
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#16823B]/10 text-[#16823B] rounded-xl shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-[#17231B] tracking-tight">
              CARD 1 — ANALISIS HARGA MATERIAL
            </h2>
            <p className="text-xs text-[#5F6B63]">
              Perkembangan harga material bulan 1 sampai 12 berdasarkan data <code className="text-[#16823B] font-semibold">bahan_material.nilai</code>
            </p>
          </div>
        </div>

        {/* Active Material Badge */}
        {activeMaster && (
          <div className="flex items-center gap-2.5 bg-[#F7F9F7] border border-[#DDE5DF] px-3.5 py-2 rounded-xl shrink-0 shadow-2xs">
            <Package className="w-4 h-4 text-[#16823B]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wide">Material Aktif Grafik:</span>
              <span className="text-xs font-bold text-[#16823B] truncate max-w-[280px]">
                {activeMaster.materialDescription ? `${activeMaster.material} - ${activeMaster.materialDescription}` : activeMaster.material}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* 2. Main Content Grid (Chart + Info Card) */}
      {loading ? (
        <div className="py-20 text-center text-[#5F6B63] space-y-3 bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#16823B]" />
          <p className="text-xs font-semibold">Memuat grafik dan analisis material...</p>
        </div>
      ) : error ? (
        <div className="py-12 px-6 text-center bg-red-50 border border-red-200 rounded-xl space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
          <p className="text-xs font-bold text-red-700">Gagal memuat data harga material.</p>
          <p className="text-xs text-red-600">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Silakan coba lagi
          </button>
        </div>
      ) : !activeMaster ? (
        <div className="py-16 text-center bg-[#F7F9F7] rounded-xl border border-[#DDE5DF] text-[#5F6B63] space-y-2">
          <Info className="w-8 h-8 mx-auto text-[#89938D]" />
          <p className="text-sm font-bold text-[#17231B]">Pilih material untuk melihat informasi</p>
          <p className="text-xs">Silakan pilih opsi Group dan Material pada dropdown filter di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Left 2 Cols: Bar Chart / Column Chart */}
          <div className="lg:col-span-2 bg-white border border-[#DDE5DF] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-2xs">
            
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-[#17231B]">
                  Perkembangan Harga Bulan 1 – 12
                </h3>
                <p className="text-[11px] text-[#5F6B63]">
                  Sumbu X: Bulan (Jan – Des) • Sumbu Y: Nilai (<span className="font-mono">price / price_unit</span>)
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#16823B] bg-[#16823B]/10 px-2.5 py-1 rounded-lg border border-[#16823B]/20 font-mono">
                {activeMaster.material}
              </span>
            </div>

            {/* Visual Bar Chart — Matched to Reference Image */}
            <div className="flex flex-col w-full pt-4 pb-1">
              
              {/* Bars Row */}
              <div className="h-56 flex items-end justify-between gap-1.5 sm:gap-2.5 px-1 w-full">
                {chartData.map((bar) => {
                  const heightPercent = bar.nilai !== null ? Math.max(Math.round((bar.nilai / maxNilai) * 100), 8) : 0;
                  const monthAbbr = MONTH_ABBR[bar.month - 1] || bar.label;

                  return (
                    <div
                      key={bar.month}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative min-w-0"
                    >
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-12 bg-[#17231B] text-white text-[10px] py-1 px-2 rounded-md shadow-lg transition-opacity whitespace-nowrap z-20 font-mono">
                        <div className="font-bold">{monthAbbr} ({bar.date ? formatDate(bar.date) : "N/A"})</div>
                        <div className="text-[#84E09B]">{bar.nilai !== null ? formatCurrency(bar.nilai) : "Tidak ada data"}</div>
                      </div>

                      {/* Value Label above Bar */}
                      {bar.nilai !== null ? (
                        <span className="text-[10px] sm:text-xs font-bold text-[#1E293B] mb-1.5 truncate max-w-full text-center">
                          {formatBarValue(bar.nilai)}
                        </span>
                      ) : (
                        <span className="text-[9px] text-gray-400 mb-1 font-medium">-</span>
                      )}

                      {/* Bar Container Track */}
                      <div className="w-full bg-[#F2F4F2] rounded-t-lg overflow-hidden flex items-end h-full">
                        {bar.nilai !== null ? (
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-[#85C43C] hover:bg-[#76B332] transition-colors rounded-t-md shadow-2xs"
                          />
                        ) : (
                          <div className="w-full h-1 bg-gray-300 rounded-t-sm" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Horizontal Border Line below bars */}
              <div className="w-full border-b border-[#DDE5DF] mt-2.5 mb-2" />

              {/* Month Abbr Labels (Jan, Feb, Mar, ...) */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 px-1 w-full">
                {chartData.map((bar) => {
                  const monthAbbr = MONTH_ABBR[bar.month - 1] || bar.label;
                  return (
                    <div key={bar.month} className="flex-1 text-center">
                      <span className="text-xs sm:text-sm font-semibold text-[#254E70]">
                        {monthAbbr}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-[#5F6B63] border-t border-[#DDE5DF] pt-3 gap-1">
              <span>* Apabila terdapat beberapa update di bulan yang sama, menggunakan data <code className="font-semibold text-[#16823B]">MAX(update)</code>.</span>
              <span className="font-bold text-[#17231B] shrink-0">Jan – Des</span>
            </div>

          </div>

          {/* Right 1 Col: Card Informasi Material (Exact Design per User Uploaded Image) */}
          <div className="bg-white border-2 border-[#005B9E] rounded-xl flex flex-col justify-between overflow-hidden shadow-sm self-stretch">
            
            {/* 1. Solid Blue Header Bar */}
            <div className="bg-[#0073C6] py-3.5 px-4 text-center border-b-2 border-[#005B9E]">
              <h3 className="text-white text-sm sm:text-base font-extrabold tracking-wider uppercase font-sans">
                HARGA TERBARU
              </h3>
            </div>

            {/* 2. Body Info Content */}
            <div className="p-6 flex flex-col items-center justify-center text-center space-y-4 my-auto">
              
              {/* Large Value Display */}
              <div className="text-4xl sm:text-5xl font-black text-[#0073C6] font-sans tracking-tight leading-none">
                {formatNumberOnly(latestNilai)}
              </div>

              {/* RP / Unit Line */}
              <div className="text-sm sm:text-base font-extrabold text-[#17231B] font-sans tracking-wide">
                {uomDisplay}
              </div>

              {/* Material Code Footer Line */}
              <div className="text-xs sm:text-sm font-semibold text-[#17231B] font-sans pt-1">
                Kode Material : <span className="font-bold text-[#17231B]">{activeMaster.material}</span>
              </div>

            </div>

            {/* Optional subtle bottom meta footer */}
            <div className="bg-[#F7F9F7] border-t border-[#DDE5DF] py-2 px-4 text-center text-[10px] text-[#5F6B63] font-medium">
              {activeMaster.materialDescription ? `${activeMaster.materialDescription}` : "Master Material Logistik"}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
