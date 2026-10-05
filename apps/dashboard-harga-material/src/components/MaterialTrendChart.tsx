"use client";

import React, { useState } from "react";
import { BarChart3, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";

export interface CategoryTrend {
  category: string;
  avgBudgetPrice: number;
  avgRealPrice: number;
  variancePercent: number;
  itemCount: number;
}

interface MaterialTrendChartProps {
  data: CategoryTrend[];
  onSelectCategory?: (category: string) => void;
}

export default function MaterialTrendChart({
  data,
  onSelectCategory,
}: MaterialTrendChartProps) {
  const [activeTab, setActiveTab] = useState<"chart" | "table">("chart");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Find max real price for relative bar scale
  const maxPrice = Math.max(...data.map((d) => Math.max(d.avgBudgetPrice, d.avgRealPrice)), 1);

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs space-y-4 font-sans" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#DDE5DF] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#16823B]/10 text-[#16823B] rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#17231B]">
              Perbandingan Harga Realisasi vs Budget Per Kategori
            </h3>
            <p className="text-xs text-[#5F6B63]">
              Analisis rata-rata harga material per kategori (Pupuk, Chemical, BBM, Bibit, Sparepart)
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F8FAF9] rounded-xl border border-[#DDE5DF] shrink-0" suppressHydrationWarning>
          <button
            onClick={() => setActiveTab("chart")}
            suppressHydrationWarning
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "chart" ? "bg-white text-[#16823B] shadow-2xs" : "text-[#5F6B63] hover:text-[#17231B]"
            }`}
          >
            Visual Diagram
          </button>
          <button
            onClick={() => setActiveTab("table")}
            suppressHydrationWarning
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "table" ? "bg-white text-[#16823B] shadow-2xs" : "text-[#5F6B63] hover:text-[#17231B]"
            }`}
          >
            Tabel Rincian
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "chart" ? (
        <div className="space-y-4 pt-2">
          {data.map((item) => {
            const budgetWidth = Math.round((item.avgBudgetPrice / maxPrice) * 100);
            const realWidth = Math.round((item.avgRealPrice / maxPrice) * 100);
            const isHigher = item.avgRealPrice > item.avgBudgetPrice;

            return (
              <div
                key={item.category}
                onClick={() => onSelectCategory && onSelectCategory(item.category)}
                className="p-3.5 rounded-xl border border-[#E0E8E2] hover:bg-[#F8FAF9] transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#17231B] group-hover:text-[#16823B] transition-colors">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold text-[#5F6B63] bg-gray-100 px-2 py-0.5 rounded-full">
                      {item.itemCount} Item
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-[#5F6B63]">
                      Budget: <strong className="text-[#17231B]">{formatCurrency(item.avgBudgetPrice)}</strong>
                    </span>
                    <span className="text-[#17231B]">
                      Realisasi: <strong className="text-[#16823B]">{formatCurrency(item.avgRealPrice)}</strong>
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        isHigher ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {isHigher ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {item.variancePercent > 0 ? `+${item.variancePercent.toFixed(1)}%` : `${item.variancePercent.toFixed(1)}%`}
                    </span>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-1.5 pt-1">
                  {/* Budget Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex items-center">
                    <div
                      className="bg-[#89938D] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(budgetWidth, 4)}%` }}
                      title={`Budget: ${formatCurrency(item.avgBudgetPrice)}`}
                    />
                  </div>
                  {/* Realisation Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden flex items-center">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigher ? "bg-red-500" : "bg-[#16823B]"
                      }`}
                      style={{ width: `${Math.max(realWidth, 4)}%` }}
                      title={`Realisasi: ${formatCurrency(item.avgRealPrice)}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
              <tr>
                <th className="py-2.5 px-3">Kategori Material</th>
                <th className="py-2.5 px-3 text-center">Jumlah Item</th>
                <th className="py-2.5 px-3 text-right">Rerata Budget (Rp)</th>
                <th className="py-2.5 px-3 text-right">Rerata Realisasi (Rp)</th>
                <th className="py-2.5 px-3 text-right">Deviasi (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
              {data.map((item) => (
                <tr key={item.category} className="hover:bg-[#F7F9F7] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#17231B]">{item.category}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-[#5F6B63]">{item.itemCount}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">{formatCurrency(item.avgBudgetPrice)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">{formatCurrency(item.avgRealPrice)}</td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-bold ${
                      item.variancePercent > 0 ? "text-red-600" : "text-emerald-700"
                    }`}
                  >
                    {item.variancePercent > 0 ? `+${item.variancePercent.toFixed(1)}%` : `${item.variancePercent.toFixed(1)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
