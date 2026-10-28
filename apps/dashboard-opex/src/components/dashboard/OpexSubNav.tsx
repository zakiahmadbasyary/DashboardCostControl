"use client";

import React from "react";
import { Building2, GitCompareArrows } from "lucide-react";

export type OpexSectionTab = "pg1" | "antar-pg";

interface OpexSubNavProps {
  activeSection: OpexSectionTab;
  onSelectSection: (section: OpexSectionTab) => void;
}

export default function OpexSubNav({
  activeSection,
  onSelectSection,
}: OpexSubNavProps) {
  return (
    <div className="bg-white border border-[#DDE5DF] rounded-xl p-1.5 shadow-2xs flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 transition-all">
      {/* ── Sub Menu Pills ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
        {/* Tombol 1: OPEX PG1 */}
        <button
          type="button"
          onClick={() => onSelectSection("pg1")}
          className={`flex-1 sm:flex-initial flex items-center justify-center sm:justify-start gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer select-none ${
            activeSection === "pg1"
              ? "bg-[#EAF3EC] text-[#16823B] font-bold border border-[#CBE0D1] shadow-2xs"
              : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F8FAF9] font-medium border border-transparent"
          }`}
        >
          <Building2
            className={`w-3.5 h-3.5 shrink-0 transition-colors ${
              activeSection === "pg1" ? "text-[#16823B]" : "text-[#89938D]"
            }`}
          />
          <div className="flex items-baseline gap-1.5">
            <span>OPEX PG1</span>
            <span className="hidden md:inline-block text-[10px] font-normal opacity-75">
              (Realisasi & Detail)
            </span>
          </div>
        </button>

        {/* Tombol 2: Komparasi Antar PG */}
        <button
          type="button"
          onClick={() => onSelectSection("antar-pg")}
          className={`flex-1 sm:flex-initial flex items-center justify-center sm:justify-start gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer select-none ${
            activeSection === "antar-pg"
              ? "bg-[#EAF3EC] text-[#16823B] font-bold border border-[#CBE0D1] shadow-2xs"
              : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F8FAF9] font-medium border border-transparent"
          }`}
        >
          <GitCompareArrows
            className={`w-3.5 h-3.5 shrink-0 transition-colors ${
              activeSection === "antar-pg" ? "text-[#16823B]" : "text-[#89938D]"
            }`}
          />
          <div className="flex items-baseline gap-1.5">
            <span>Komparasi Antar PG</span>
            <span className="hidden md:inline-block text-[10px] font-normal opacity-75">
              (Trend & Cost Center)
            </span>
          </div>
        </button>
      </div>

      {/* ── Status Kanan: Petunjuk Direct Scroll ── */}
      <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#89938D] px-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#16823B]" />
        <span>Klik untuk navigasi langsung ke bagian yang diinginkan</span>
      </div>
    </div>
  );
}
