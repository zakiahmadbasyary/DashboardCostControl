"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";

export type PgIndicatorKey =
  | "upahHa"
  | "batangHa"
  | "upahBatang"
  | "batangTk"
  | "tkBulan"
  | "costTkBulan";

export interface PgIndicatorOption {
  key: PgIndicatorKey;
  label: string;
  unit: string;
  desc: string;
}

export const PG_INDICATORS: PgIndicatorOption[] = [
  { key: "upahHa", label: "Upah/HA", unit: "Rp/HA", desc: "Total biaya upah / total luas efektif" },
  { key: "batangHa", label: "Batang/HA", unit: "Btg/HA", desc: "Total bibit / total luas efektif" },
  { key: "upahBatang", label: "Upah/Batang", unit: "Rp/Btg", desc: "Total biaya upah / total bibit" },
  { key: "batangTk", label: "Batang/TK", unit: "Btg/TK", desc: "Total bibit / total tenaga kerja" },
  { key: "tkBulan", label: "TK/Bulan", unit: "TK", desc: "Total kebutuhan tenaga kerja per bulan" },
  { key: "costTkBulan", label: "Cost TK/Bulan", unit: "Rp", desc: "Total realisasi biaya upah per bulan" },
];

interface IndicatorFilterProps {
  selectedIndicator: PgIndicatorKey;
  onSelectIndicator: (key: PgIndicatorKey) => void;
}

export default function IndicatorFilter({
  selectedIndicator,
  onSelectIndicator,
}: IndicatorFilterProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#DDE5DF] p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EAF3EC] text-[#16823B] shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[#17231B]">
            Pilih Indikator Evaluasi Antar-PG
          </h3>
        </div>
        <span className="text-[11px] text-[#5F6B63] italic font-medium">
          *Filter ini hanya mengubah grafik perbandingan bulanan di bawah
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PG_INDICATORS.map((ind) => {
          const isSelected = selectedIndicator === ind.key;
          return (
            <button
              key={ind.key}
              type="button"
              onClick={() => onSelectIndicator(ind.key)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? "bg-[#16823B] text-white border-[#16823B] shadow-xs"
                  : "bg-[#F8FAF9] text-[#17231B] border-[#DDE5DF] hover:border-[#16823B] hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-[#17231B]"}`}>
                  {ind.label}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    isSelected ? "bg-white/20 text-white" : "bg-[#EAF3EC] text-[#16823B]"
                  }`}
                >
                  {ind.unit}
                </span>
              </div>
              <p
                className={`text-[10px] mt-1.5 line-clamp-1 ${
                  isSelected ? "text-emerald-100" : "text-[#5F6B63]"
                }`}
              >
                {ind.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
