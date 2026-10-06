"use client";

import React from "react";
import { BarChart3, Tag, Package, RefreshCw, AlertCircle, Info, Clock, TrendingUp, TrendingDown } from "lucide-react";

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

  // Find min, max, and avg values in chart data for bar height scaling & metric summary
  const validNilaiList = chartData.map((d) => d.nilai).filter((v): v is number => v !== null);
  const maxNilai = validNilaiList.length > 0 ? Math.max(...validNilaiList) : 1;
  const minNilai = validNilaiList.length > 0 ? Math.min(...validNilaiList) : null;
  const avgNilai = validNilaiList.length > 0 ? validNilaiList.reduce((a, b) => a + b, 0) / validNilaiList.length : null;

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
          <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#17231B]">
              Analisis Harga Material
            </h3>
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
                <h3 className="font-bold text-base text-[#17231B]">
                  Perkembangan Harga Bulan 1 – 12
                </h3>
                <p className="text-xs text-[#5F6B63]">
                  Sumbu X: Bulan (Jan – Des) • Sumbu Y: Nilai (<span className="font-mono">price / price_unit</span>)
                </p>
              </div>
              <span className="text-xs font-bold text-[#16823B] bg-[#16823B]/10 px-2.5 py-1 rounded-lg border border-[#16823B]/20 font-mono">
                {activeMaster.material}
              </span>
            </div>

            {/* Visual Bar Chart — Matched 1:1 to HPP Bar Chart Font Styles */}
            <div className="flex flex-col w-full pt-2 pb-1">
              
              {/* Bars Row */}
              <div className="h-52 flex items-end justify-between gap-1 sm:gap-1.5 px-1 w-full pb-1">
                {chartData.map((bar) => {
                  const heightPercent = bar.nilai !== null ? Math.max(Math.round((bar.nilai / maxNilai) * 100), 8) : 0;
                  const monthAbbr = MONTH_ABBR[bar.month - 1] || bar.label;

                  return (
                    <div
                      key={bar.month}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer min-w-0"
                    >
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-12 bg-[#17231B] text-white text-[10px] py-1 px-2 rounded-md shadow-lg transition-opacity whitespace-nowrap z-20 font-mono">
                        <div className="font-bold">{monthAbbr} ({bar.date ? formatDate(bar.date) : "N/A"})</div>
                        <div className="text-[#84E09B]">{bar.nilai !== null ? formatCurrency(bar.nilai) : "Tidak ada data"}</div>
                      </div>

                      {/* Value Label above Bar (HPP Font Style: font-mono text-xs font-semibold) */}
                      {bar.nilai !== null ? (
                        <span className="text-[8px] min-[380px]:text-[9px] sm:text-[11px] font-mono text-[#17231B] font-semibold opacity-90 group-hover:opacity-100 mb-1 transition-all truncate tracking-tighter w-full text-center">
                          {formatBarValue(bar.nilai)}
                        </span>
                      ) : (
                        <span className="text-[8px] sm:text-[10px] text-gray-400 mb-1 font-mono">-</span>
                      )}

                      {/* Bar Container Track (HPP Style: rounded-t-md p-0.5) */}
                      <div className="w-full bg-[#F2F6F3] rounded-t-md overflow-hidden flex items-end h-full p-0.5">
                        {bar.nilai !== null ? (
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-[#8CC63F] hover:bg-[#16823B] transition-all duration-300 rounded-t shadow-2xs"
                          />
                        ) : (
                          <div className="w-full h-1 bg-gray-300 rounded-t-sm" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Solid Base Baseline (HPP Style: 2px dark baseline) */}
              <div className="w-full h-[2px] bg-[#17231B]/20 rounded-full my-1.5" />

              {/* Month Abbr Labels Axis (HPP Font Style: text-[9px] sm:text-xs text-[#5F6B63] font-semibold) */}
              <div className="flex items-center justify-between gap-1 sm:gap-1.5 px-0.5 w-full mt-1">
                {chartData.map((bar) => {
                  const monthAbbr = MONTH_ABBR[bar.month - 1] || bar.label;
                  return (
                    <div key={bar.month} className="flex-1 text-center">
                      <span className="text-[9px] sm:text-xs font-semibold text-[#5F6B63] hover:text-[#17231B] transition-colors truncate block">
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

          {/* Right 1 Col: Card Informasi Material (Warna Ijo Tebal #16823B Standard HPP & Terendah Kuning) */}
          <div className="bg-white border-2 border-[#16823B] rounded-2xl flex flex-col justify-between overflow-hidden shadow-sm self-stretch font-sans">
            
            {/* 1. Header Banner Ijo Tebal (#16823B) */}
            <div className="bg-gradient-to-r from-[#16823B] to-[#0B6B32] px-3.5 py-2.5 border-b-2 border-[#0B6B32] text-white flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-white/10 backdrop-blur-md text-[#A8D437] border border-white/20">
                  <Tag className="w-3.5 h-3.5 text-[#A8D437]" />
                </div>
                <h3 className="text-white text-xs font-bold tracking-wider uppercase">
                  INFORMASI HARGA TERBARU
                </h3>
              </div>
              <span className="text-[10px] font-extrabold text-[#0B6B32] bg-[#A8D437] px-2 py-0.5 rounded shadow-2xs">
                PG 1
              </span>
            </div>

            {/* 2. Body Content */}
            <div className="p-3 flex flex-col gap-2.5 my-auto">
              
              {/* Hero Price Container */}
              <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-2.5 text-center flex flex-col items-center justify-center gap-0.5 shadow-2xs">
                <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#16823B]" />
                  <span>HARGA TERAKHIR</span>
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-[#16823B] font-mono tracking-tight my-0.5">
                  {formatNumberOnly(latestNilai)}
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#16823B] text-white font-bold text-[11px] font-mono shadow-2xs">
                  {uomDisplay}
                </div>
                {latestUpdateDate && (
                  <span className="text-[10px] text-[#5F6B63] font-semibold mt-0.5">
                    Update Terakhir: {formatDate(latestUpdateDate)}
                  </span>
                )}
              </div>

              {/* 2 KPI Cards: Tertinggi (Kuning) & Terendah (Ijo) */}
              <div className="grid grid-cols-2 gap-2">
                {/* Tertinggi (Kuning #FCE27A Style) */}
                <div className="bg-[#FEFCE8] border border-[#FDE047] rounded-xl p-2 px-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#854D0E]">
                    <span className="uppercase">TERTINGGI</span>
                    <TrendingUp className="w-3.5 h-3.5 text-[#854D0E]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#713F12] font-mono mt-0.5">
                    {formatBarValue(maxNilai)}
                  </span>
                </div>

                {/* Terendah (Ijo Style) */}
                <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-2 px-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#166534]">
                    <span className="uppercase">TERENDAH</span>
                    <TrendingDown className="w-3.5 h-3.5 text-[#16A34A]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#15803D] font-mono mt-0.5">
                    {formatBarValue(minNilai)}
                  </span>
                </div>
              </div>

              {/* Detail Metadata Table */}
              <div className="bg-white border border-[#E0E8E2] rounded-xl p-2.5 sm:p-3 space-y-2 text-xs text-[#17231B]">
                {/* Row 1: Kode Material */}
                <div className="flex items-center justify-between border-b border-[#EAF0EB] pb-2">
                  <span className="text-xs font-semibold text-[#5F6B63]">Kode Material</span>
                  <span className="font-mono font-bold text-xs text-[#17231B] bg-white px-2.5 py-0.5 rounded-md border border-[#DDE5DF] shadow-2xs">
                    {activeMaster.material}
                  </span>
                </div>

                {/* Row 2: Deskripsi */}
                <div className="flex items-center justify-between border-b border-[#EAF0EB] pb-2 gap-2">
                  <span className="text-xs font-semibold text-[#5F6B63] shrink-0">Deskripsi</span>
                  <span className="font-semibold text-xs text-[#17231B] text-right truncate max-w-[190px]" title={activeMaster.materialDescription || ""}>
                    {activeMaster.materialDescription || "-"}
                  </span>
                </div>

                {/* Row 3: Group Material */}
                <div className="flex items-center justify-between border-b border-[#EAF0EB] pb-2">
                  <span className="text-xs font-semibold text-[#5F6B63]">Group Material</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#16823B] border border-[#A5D6A7] font-semibold text-xs">
                    {activeMaster.group || "-"}
                  </span>
                </div>

                {/* Row 4: Satuan (UoM) */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#5F6B63]">Satuan (UoM)</span>
                  <span className="font-mono font-bold text-xs text-[#17231B]">
                    {activeMaster.baseUnitOfMeasure || "-"}
                  </span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-[#F8FAF9] border-t border-[#DDE5DF] py-1.5 px-3 text-center text-[10px] text-[#16823B] font-semibold">
              Master Data Logistik PG 1
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
