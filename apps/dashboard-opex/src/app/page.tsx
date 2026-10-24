"use client";

import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  DollarSign,
  TrendingDown,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  PieChart,
  Wallet,
  Activity,
  ArrowUpRight,
} from "lucide-react";

export default function DashboardOpexPage() {
  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans">
      {/* ── 1. HEADER & SIDEBAR NAVIGATION (SAMA PERSIS DENGAN PROYEK WIP) ── */}
      <DashboardHeader />

      {/* ── 2. MAIN DASHBOARD CONTAINER (Offset md:ml-16 untuk Mini Sidebar) ── */}
      <main className="flex-1 w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* ── BANNER HEADER MODUL OPEX ── */}
        <section className="bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-[#16823B]/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-extrabold text-[#17231B] tracking-tight">
                      Dashboard OPEX
                    </h1>
                    <span className="text-[10px] bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1] px-2 py-0.5 rounded-full font-bold">
                      Operational Expenditure
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6B63] mt-0.5">
                    Modul Pengendalian & Analisis Biaya Operasional Kebun dan Pengolahan — Great Giant Foods
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl text-xs font-semibold text-[#2C3830]">
                <Calendar className="w-3.5 h-3.5 text-[#16823B]" />
                <span>Tahun Berjalan 2026</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── PLACEHOLDER RINGKASAN & KPI CARDS SHELL ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Anggaran OPEX */}
          <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">
                Total Budget OPEX
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#16823B] flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-[#17231B] font-mono">
                Rp —
              </span>
              <p className="text-[11px] text-[#89938D] mt-0.5">
                Alokasi anggaran operasional tahun berjalan
              </p>
            </div>
          </div>

          {/* Card 2: Realisasi Biaya */}
          <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">
                Realisasi Biaya (YTD)
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-[#17231B] font-mono">
                Rp —
              </span>
              <p className="text-[11px] text-[#89938D] mt-0.5">
                Total pengeluaran operasional terakumulasi
              </p>
            </div>
          </div>

          {/* Card 3: Variansi / Sisa Anggaran */}
          <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">
                Sisa Anggaran OPEX
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-[#16823B] font-mono">
                Rp —
              </span>
              <p className="text-[11px] text-[#89938D] mt-0.5">
                Saldo efisiensi biaya operasional
              </p>
            </div>
          </div>

          {/* Card 4: Cost Centers Terkait */}
          <div className="bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">
                Cost Centers
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-[#17231B] font-mono">
                — Pusat Biaya
              </span>
              <p className="text-[11px] text-[#89938D] mt-0.5">
                Departemen & unit kerja terdaftar
              </p>
            </div>
          </div>
        </section>

        {/* ── AREA WORKSPACE / INFORMASI PENGEMBANGAN ── */}
        <section className="bg-white border border-[#DDE5DF] rounded-2xl p-6 sm:p-8 shadow-xs text-center flex flex-col items-center justify-center min-h-[320px]">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF3EC] border border-[#CBE0D1] flex items-center justify-center text-[#16823B] mb-3 shadow-2xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#17231B]">
            Workspace Dashboard OPEX Siap Dikembangkan
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6B63] max-w-lg mt-1 leading-relaxed">
            Struktur dasar proyek OPEX, top navbar, mini sidebar, expanded drawer, dan mobile menu navigasi telah terpasang sama persis seperti modul WIP ACC.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F8FAF9] border border-[#DDE5DF] text-[#2C3830]">
              <Layers className="w-3.5 h-3.5 text-[#16823B]" />
              Port: 3004
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B]">
              <PieChart className="w-3.5 h-3.5" />
              Modul: OPEX
            </span>
          </div>
        </section>
      </main>

      {/* ── 3. GLOBAL FOOTER (SAMA PERSIS DENGAN PROYEK LAIN) ── */}
      <footer className="mt-auto border-t border-[#DDE5DF] bg-white py-4 w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#89938D]">
          <span>
            © 2026 Great Giant Foods · Dashboard OPEX — Operational Expenditure Management
          </span>
          <span>
            Sistem Pemantauan Terpadu · Cost Control Ecosystem
          </span>
        </div>
      </footer>
    </div>
  );
}
