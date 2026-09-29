"use client";

import React from "react";
import {
  Wallet,
  TrendingDown,
  Scale,
  Wheat,
  Maximize2,
  TrendingUp,
} from "lucide-react";

export interface HppSummaryMetrics {
  totalBudget: number;
  totalBiayaHpp: number;
  totalBiayaLokasi: number;
  totalBiayaAktivitas: number;
  costVariance: number;
  realizationPercent: number;
  totalQtyPanen: number;
  totalLuasPanen: number;
  totalLuasAktif: number;
  avgHppPerKg: number;
  avgYieldPerHa: number;
  totalLokasi: number;
  totalAktivitas: number;
}

interface HppMetricsOverviewProps {
  metrics: HppSummaryMetrics | null;
  loading?: boolean;
}

export default function HppMetricsOverview({ metrics, loading }: HppMetricsOverviewProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatNumber = (val: number, decimals = 1) => {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: decimals,
    }).format(val || 0);
  };

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-[#E0E8E2] animate-pulse h-32 flex flex-col justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-7 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const isUnderBudget = metrics.costVariance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Budget vs Realisasi */}
      <div className="bg-white p-5 rounded-2xl border border-[#E0E8E2] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
        <div>
          <div className="flex items-center justify-between text-[#5F6B63] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Anggaran (Budget)</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#17231B] tracking-tight">
            {formatCurrency(metrics.totalBudget)}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#F0F4F1] flex items-center justify-between text-xs">
          <span className="text-[#5F6B63] font-medium">Realisasi HPP:</span>
          <span className="font-bold text-[#17231B]">{formatCurrency(metrics.totalBiayaHpp)}</span>
        </div>
      </div>

      {/* 2. Realisasi & Realization % */}
      <div className="bg-white p-5 rounded-2xl border border-[#E0E8E2] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
        <div>
          <div className="flex items-center justify-between text-[#5F6B63] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Realisasi & Variance</span>
            <div className={`p-2 rounded-xl border group-hover:scale-105 transition-transform ${
              isUnderBudget ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
            }`}>
              {isUnderBudget ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl sm:text-2xl font-black text-[#17231B] tracking-tight">
              {formatNumber(metrics.realizationPercent, 1)}%
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isUnderBudget ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            }`}>
              {isUnderBudget ? "Hemat" : "Over"}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#F0F4F1] flex items-center justify-between text-xs">
          <span className="text-[#5F6B63] font-medium">Variance (Sisa):</span>
          <span className={`font-bold ${isUnderBudget ? "text-emerald-700" : "text-red-600"}`}>
            {formatCurrency(metrics.costVariance)}
          </span>
        </div>
      </div>

      {/* 3. Estimasi HPP per Kg */}
      <div className="bg-white p-5 rounded-2xl border border-[#E0E8E2] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
        <div>
          <div className="flex items-center justify-between text-[#5F6B63] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">HPP per Kg Hasil</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-105 transition-transform">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#17231B] tracking-tight">
            {formatCurrency(metrics.avgHppPerKg)} <span className="text-xs font-semibold text-[#5F6B63]">/ Kg</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#F0F4F1] flex items-center justify-between text-xs">
          <span className="text-[#5F6B63] font-medium">Yield per Ha:</span>
          <span className="font-bold text-[#16823B]">{formatNumber(metrics.avgYieldPerHa, 0)} Kg/Ha</span>
        </div>
      </div>

      {/* 4. Total Qty & Luas Panen */}
      <div className="bg-white p-5 rounded-2xl border border-[#E0E8E2] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
        <div>
          <div className="flex items-center justify-between text-[#5F6B63] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Hasil Panen & Luas</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:scale-105 transition-transform">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#17231B] tracking-tight">
            {formatNumber(metrics.totalQtyPanen, 0)} <span className="text-xs font-semibold text-[#5F6B63]">Kg</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#F0F4F1] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[#5F6B63]">
            <Maximize2 className="w-3 h-3" />
            <span>Luas Panen / Aktif:</span>
          </div>
          <span className="font-bold text-[#17231B]">{formatNumber(metrics.totalLuasPanen, 1)} Ha / {formatNumber(metrics.totalLuasAktif, 1)} Ha</span>
        </div>
      </div>
    </div>
  );
}
