"use client";

import React, { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  Tractor,
  Droplets,
  DollarSign,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  Sparkles,
  BarChart3,
  MapPin,
} from "lucide-react";
import { getDashboardNavConfig } from "@dashboard/shared-ui";

export default function DashboardWeedControlPage() {
  const { adminUrl } = getDashboardNavConfig();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans selection:bg-[#16823B] selection:text-white">
      {/* 1. Header with Left Mini Sidebar (w-16) & Top Navbar matching Dashboard WIP */}
      <DashboardHeader />

      {/* 2. Main Content Container (offset md:ml-16 to accommodate left mini-sidebar) */}
      <main className="flex-1 w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* Hero / Module Header Card */}
        <section className="bg-white rounded-2xl border border-[#DDE5DF] p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#EAF3EC] via-[#F8FAF9] to-transparent rounded-bl-full pointer-events-none -z-0" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3EC] border border-[#CBE0D1] text-[#16823B] text-xs font-bold">
                <Tractor className="w-3.5 h-3.5 text-[#16823B]" />
                <span>Plantation Operations • Weed Control Ecosystem</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231B] tracking-tight">
                Monitoring & Evaluasi Biaya Weed Control
              </h1>
              
              <p className="text-sm sm:text-base text-[#5F6B63] leading-relaxed">
                Pemantauan komprehensif efektivitas pengendalian gulma, aplikasi herbisida, penggunaan tenaga kerja,
                dan pengendalian biaya per hektar di seluruh wilayah perkebunan Great Giant Foods (GGF).
              </p>
            </div>

            {/* Quick Action & Year Selector */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-[#F8FAF9] border border-[#DDE5DF] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#2C3830]">
                <Calendar className="w-4 h-4 text-[#16823B]" />
                <span>Tahun:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent font-bold text-[#16823B] focus:outline-none cursor-pointer"
                >
                  <option value={currentYear}>{currentYear}</option>
                  <option value={currentYear - 1}>{currentYear - 1}</option>
                </select>
              </div>

              <a
                href={adminUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>Upload Data Weed Control</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* KPI Preview Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">
                Total Biaya Weed Control
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#16823B] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-[#17231B] tracking-tight">
                Rp --
              </div>
              <div className="text-xs text-[#89938D] mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Menunggu integrasi data</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">
                Total Luas Aplikasi
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-[#17231B] tracking-tight">
                -- Ha
              </div>
              <div className="text-xs text-[#89938D] mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Cakupan PG 1 & PG Wilayah</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">
                Biaya Rata-Rata / Ha
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-[#17231B] tracking-tight">
                Rp -- / Ha
              </div>
              <div className="text-xs text-[#89938D] mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Target efisiensi cost/Ha</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">
                Aplikasi Herbisida
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-[#17231B] tracking-tight">
                -- Liter
              </div>
              <div className="text-xs text-[#89938D] mt-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Material herbisida & aditif</span>
              </div>
            </div>
          </div>
        </section>

        {/* Development & Architecture Blueprint Section */}
        <section className="bg-white rounded-2xl border border-[#DDE5DF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EAEFEB]">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#17231B] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#16823B]" />
                <span>Rencana Analisis Modul Weed Control</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#5F6B63] mt-0.5">
                Modul ini siap dikembangkan dengan fitur visualisasi dan kalkulasi sesuai standar AgroMetric.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#16823B] border border-emerald-200 text-xs font-bold self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4" />
              <span>Navbar & Sidebar Terintegrasi</span>
            </span>
          </div>

          {/* Planned Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-[#EAEFEB] bg-[#F8FAF9] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EAF3EC] text-[#16823B] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-sm text-[#17231B]">
                Komparasi Antar PG & Wilayah
              </h3>
              <p className="text-xs text-[#5F6B63] leading-relaxed">
                Pembandingan tren biaya weed control bulanan antar PG (PG1, PG2, PG3) serta matriks detail per wilayah (AW01 - AW07).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#EAEFEB] bg-[#F8FAF9] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EAF3EC] text-[#16823B] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-sm text-[#17231B]">
                Breakdown Material & Labour
              </h3>
              <p className="text-xs text-[#5F6B63] leading-relaxed">
                Analisis proporsi biaya herbisida kimiawi versus upah tenaga kerja (TK) dan efisiensi pengoperasian traktor boom sprayer.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#EAEFEB] bg-[#F8FAF9] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EAF3EC] text-[#16823B] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-sm text-[#17231B]">
                Tabel Evaluasi Lokasi & Plot
              </h3>
              <p className="text-xs text-[#5F6B63] leading-relaxed">
                Tabel drilldown per lokasi plot kebun, mencakup varietas, tanggal aplikasi, dosis liter/Ha, dan realisasi biaya aktual.
              </p>
            </div>
          </div>

          {/* Quick Setup Notice */}
          <div className="p-4 rounded-xl bg-[#EAF3EC]/60 border border-[#CBE0D1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-xs sm:text-sm text-[#16823B] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Langkah Selanjutnya: Skema Database & Upload Excel</span>
              </div>
              <p className="text-xs text-[#5F6B63]">
                Siapkan skema tabel Prisma / PostgreSQL dan file template Excel weed control untuk mengaktifkan kalkulasi otomatis.
              </p>
            </div>

            <a
              href={adminUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-[#CBE0D1] hover:bg-[#F8FAF9] text-[#16823B] font-bold text-xs transition-all shadow-2xs shrink-0"
            >
              <span>Buka Admin Central</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

      </main>

      {/* 3. Footer matching Dashboard WIP */}
      <footer className="border-t border-[#DDE5DF] bg-white py-6 text-center text-xs text-[#5F6B63] mt-auto">
        <div className="w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Great Giant Foods (GGF).</span>
          <span className="font-semibold text-[#16823B]">Integrated Database System • PostgreSQL & Prisma Engine</span>
        </div>
      </footer>
    </div>
  );
}
