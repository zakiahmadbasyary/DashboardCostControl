"use client";

import React from "react";
import { BarChart3, PieChart } from "lucide-react";

interface GroupBreakdownItem {
  group: string;
  budget: number;
  realisasi: number;
  qty: number;
}

interface HppChartsProps {
  data: GroupBreakdownItem[];
  loading?: boolean;
}

export default function HppCharts({ data, loading }: HppChartsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatShortCurrency = (val: number) => {
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)} M`;
    if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(0)} Jt`;
    return `Rp ${val}`;
  };

  if (loading || data.length === 0) {
    return null;
  }

  // Find max value for scaling bar height
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.budget || 0, d.realisasi || 0)),
    100_000_000
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Comparison Bar Chart: Budget vs Realisasi HPP per Group */}
      <div className="bg-white p-5 rounded-2xl border border-[#E0E8E2] shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-[#EAEFEB] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#EAF3EC] text-[#16823B] rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#17231B] text-base">Perbandingan Budget vs Realisasi</h3>
                <p className="text-xs text-[#5F6B63]">Alokasi biaya per Kelompok Zona / Group</p>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-[#5F6B63]">Budget</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#16823B]"></div>
                <span className="text-[#5F6B63]">Realisasi</span>
              </div>
            </div>
          </div>

          {/* Bar Diagram */}
          <div className="space-y-4 pt-2">
            {data.map((item) => {
              const budgetPercent = (item.budget / maxVal) * 100;
              const realisasiPercent = (item.realisasi / maxVal) * 100;
              const isOver = item.realisasi > item.budget;

              return (
                <div key={item.group} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-extrabold text-[#17231B]">
                    <span>Group {item.group}</span>
                    <span className="text-[#5F6B63]">
                      Realisasi: {formatShortCurrency(item.realisasi)} / Budget: {formatShortCurrency(item.budget)}
                    </span>
                  </div>

                  {/* Dual Bar Track */}
                  <div className="space-y-1">
                    {/* Budget Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                        title={`Budget: ${formatCurrency(item.budget)}`}
                      ></div>
                    </div>
                    {/* Realisasi Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          isOver ? "bg-red-500" : "bg-[#16823B]"
                        }`}
                        style={{ width: `${Math.min(realisasiPercent, 100)}%` }}
                        title={`Realisasi: ${formatCurrency(item.realisasi)}`}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Group Distribution & Yield Output */}
      <div className="bg-white p-5 rounded-2xl border border-[#E0E8E2] shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-[#EAEFEB] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#17231B] text-base">Distribusi Produksi & Hasil</h3>
                <p className="text-xs text-[#5F6B63]">Total volume panen & kontribusi per Zone</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {data.map((item) => (
              <div
                key={item.group}
                className="p-4 rounded-xl bg-[#F8FAF9] border border-[#EAEFEB] flex flex-col justify-between hover:bg-[#F4F8F5] transition-colors"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-[#17231B]">Group {item.group}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Aktif
                    </span>
                  </div>
                  <div className="text-xs text-[#5F6B63] mt-2">Volume Panen:</div>
                  <div className="text-lg font-black text-[#16823B]">{item.qty.toLocaleString("id-ID")} Kg</div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-200/60 flex justify-between text-[11px]">
                  <span className="text-[#5F6B63]">HPP Est:</span>
                  <span className="font-bold text-[#17231B]">
                    {item.qty > 0 ? formatCurrency(item.realisasi / item.qty) : "Rp 0"} / Kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
