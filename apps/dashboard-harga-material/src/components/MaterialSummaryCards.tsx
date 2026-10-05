"use client";

import React from "react";
import { Boxes, TrendingUp, TrendingDown, MinusCircle } from "lucide-react";

interface MaterialSummaryCardsProps {
  totalItems: number;
  avgChange: number;
  highestRise: { name: string; percent: number; priceDiff: number } | null;
  highestDrop: { name: string; percent: number; priceDiff: number } | null;
}

export default function MaterialSummaryCards({
  totalItems,
  avgChange,
  highestRise,
  highestDrop,
}: MaterialSummaryCardsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans" suppressHydrationWarning>
      
      {/* 1. Total Items */}
      <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider block">Total Master Material</span>
          <span className="text-2xl font-black text-[#17231B] mt-1 block">{totalItems} Item</span>
          <span className="text-[11px] text-[#5F6B63] font-medium mt-0.5 block">Kategori Pupuk, Bibit, Chemical, BBM</span>
        </div>
        <div className="p-3 bg-[#16823B]/10 rounded-2xl text-[#16823B] shrink-0">
          <Boxes className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Avg Change */}
      <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider block">Rerata Fluktuasi Harga</span>
          <span className={`text-2xl font-black mt-1 block ${avgChange > 0 ? "text-red-600" : avgChange < 0 ? "text-emerald-600" : "text-gray-700"}`}>
            {avgChange > 0 ? `+${avgChange.toFixed(1)}%` : `${avgChange.toFixed(1)}%`}
          </span>
          <span className="text-[11px] text-[#5F6B63] font-medium mt-0.5 block">Dibandingkan acuan budget</span>
        </div>
        <div className={`p-3 rounded-2xl shrink-0 ${avgChange > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
          {avgChange >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
        </div>
      </div>

      {/* 3. Highest Rise */}
      <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider block">Kenaikan Tertinggi</span>
          <span className="text-base font-extrabold text-[#17231B] mt-1 block truncate max-w-[180px]" title={highestRise?.name}>
            {highestRise ? highestRise.name : "-"}
          </span>
          <span className="text-xs font-mono font-bold text-red-600 block mt-0.5">
            {highestRise ? `+${highestRise.percent.toFixed(1)}% (${formatCurrency(highestRise.priceDiff)})` : "-"}
          </span>
        </div>
        <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Highest Drop */}
      <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider block">Penurunan Tertinggi</span>
          <span className="text-base font-extrabold text-[#17231B] mt-1 block truncate max-w-[180px]" title={highestDrop?.name}>
            {highestDrop ? highestDrop.name : "-"}
          </span>
          <span className="text-xs font-mono font-bold text-emerald-600 block mt-0.5">
            {highestDrop ? `${highestDrop.percent.toFixed(1)}% (${formatCurrency(highestDrop.priceDiff)})` : "-"}
          </span>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
          <TrendingDown className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
}
