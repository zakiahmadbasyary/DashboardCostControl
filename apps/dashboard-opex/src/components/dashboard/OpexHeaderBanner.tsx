"use client";

import React from "react";
import { DollarSign, Calendar, TrendingDown, Layers } from "lucide-react";

interface OpexHeaderBannerProps {
  selectedPeriodLabel?: string;
}

export default function OpexHeaderBanner({ selectedPeriodLabel }: OpexHeaderBannerProps) {
  return (
    <section className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
      <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-[#16823B]/10 via-[#16823B]/5 to-transparent pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0 border border-[#16823B]/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-extrabold text-[#17231B] tracking-tight">
                  Dashboard OPEX GGP
                </h1>
                <span className="text-[10px] bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Operational Expenditure
                </span>
                <span className="text-[10px] bg-[#F8FAF9] text-[#5F6B63] border border-[#DDE5DF] px-2 py-0.5 rounded-full font-semibold">
                  Plantation Group 1 Focus
                </span>
              </div>
              <p className="text-xs text-[#5F6B63] mt-0.5">
                Monitoring & Analisis Komparatif Biaya Operasional Kebun (Actual vs Budget) — Great Giant Foods
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-xs font-semibold text-[#2C3830]">
            <Calendar className="w-3.5 h-3.5 text-[#16823B]" />
            <span>Tahun 2026</span>
            {selectedPeriodLabel && (
              <>
                <span className="text-[#89938D]">·</span>
                <span className="text-[#16823B] font-bold">{selectedPeriodLabel}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
