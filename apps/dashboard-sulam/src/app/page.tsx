"use client";

import React, { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  Sprout,
  DollarSign,
  Layers,
  TrendingDown,
  Filter,
  Calendar,
  MapPin,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Table as TableIcon,
} from "lucide-react";

export default function DashboardSulamPage() {
  const [selectedWilayah, setSelectedWilayah] = useState("all");
  const [selectedTahun, setSelectedTahun] = useState("2026");
  const [selectedJenisBibit, setSelectedJenisBibit] = useState("all");

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans">
      {/* 1. Header with Left Mini-Sidebar, Top Navbar, Mobile Navigation & Drawer */}
      <DashboardHeader />

      {/* 2. Main Content Container (offset md:ml-16 to accommodate left mini-sidebar) */}
      <main className="flex-1 w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Banner Section */}
        <section className="bg-white rounded-2xl border border-[#DDE5DF] p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF3EC] border border-[#CBE0D1] flex items-center justify-center text-[#16823B] shrink-0 shadow-xs">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-[#17231B] tracking-tight">
                    Dashboard Pemeliharaan & Penyulaman (Sulam)
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Modul Aktif
                  </span>
                </div>
                <p className="text-sm text-[#5F6B63] max-w-2xl leading-relaxed">
                  Pemantauan real-time biaya material bibit sulam, tenaga kerja lapangan, evaluasi efisiensi per hektar, dan rekonsiliasi data biaya tanaman perkebunan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              <span className="text-xs text-[#5F6B63] font-medium hidden lg:inline">
                Terakhir Diperbarui: <strong className="text-[#17231B]">Hari ini</strong>
              </span>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4 text-[#5F6B63]" />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </section>

        {/* Global Filters Section (Sticky/Freeze bar matching WIP) */}
        <section className="sticky top-20 z-20 bg-[#F7F9F7] py-2 -my-2">
          <div className="bg-white rounded-2xl border border-[#DDE5DF] p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[#17231B] font-bold text-sm">
              <Filter className="w-4 h-4 text-[#16823B]" />
              <span>Filter Data Sulam</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Wilayah */}
              <div className="flex items-center gap-2 bg-[#F8FAF9] px-3 py-1.5 rounded-xl border border-[#DDE5DF]">
                <MapPin className="w-4 h-4 text-[#5F6B63]" />
                <span className="text-xs font-medium text-[#5F6B63]">Wilayah:</span>
                <select
                  value={selectedWilayah}
                  onChange={(e) => setSelectedWilayah(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#17231B] focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Wilayah</option>
                  <option value="AW01">AW01 (PG 1)</option>
                  <option value="AW02">AW02 (PG 2)</option>
                  <option value="AW03">AW03 (PG 3)</option>
                </select>
              </div>

              {/* Filter Periode / Tahun */}
              <div className="flex items-center gap-2 bg-[#F8FAF9] px-3 py-1.5 rounded-xl border border-[#DDE5DF]">
                <Calendar className="w-4 h-4 text-[#5F6B63]" />
                <span className="text-xs font-medium text-[#5F6B63]">Tahun:</span>
                <select
                  value={selectedTahun}
                  onChange={(e) => setSelectedTahun(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#17231B] focus:outline-none cursor-pointer"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>

              {/* Filter Jenis Bibit */}
              <div className="flex items-center gap-2 bg-[#F8FAF9] px-3 py-1.5 rounded-xl border border-[#DDE5DF]">
                <Sprout className="w-4 h-4 text-[#5F6B63]" />
                <span className="text-xs font-medium text-[#5F6B63]">Jenis Bibit:</span>
                <select
                  value={selectedJenisBibit}
                  onChange={(e) => setSelectedJenisBibit(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#17231B] focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Jenis Bibit</option>
                  <option value="bibit_a">Bibit Unggul A</option>
                  <option value="bibit_b">Bibit Standar B</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* KPI / Metric Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Biaya Sulam */}
          <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">
                Total Biaya Sulam
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#EAF3EC] text-[#16823B] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#17231B] tracking-tight">
              Rp 0
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#5F6B63] mt-2 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Menunggu integrasi data Excel / DB</span>
            </div>
          </div>

          {/* Card 2: Luas Area Sulam */}
          <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">
                Luas Area Sulam
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#17231B] tracking-tight">
              0,00 <span className="text-sm font-semibold text-[#5F6B63]">Ha</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#5F6B63] mt-2 font-medium">
              <span>Cakupan lokasi perkebunan PG 1</span>
            </div>
          </div>

          {/* Card 3: Rata-Rata Biaya / Ha */}
          <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">
                Rata-rata Biaya / Ha
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#17231B] tracking-tight">
              Rp 0 <span className="text-sm font-semibold text-[#5F6B63]">/Ha</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-medium">
              <span>Benchmark target operasional</span>
            </div>
          </div>

          {/* Card 4: Total Bibit Disulam */}
          <div className="bg-white rounded-2xl border border-[#DDE5DF] p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#5F6B63] uppercase tracking-wider">
                Total Bibit Disulam
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#17231B] tracking-tight">
              0 <span className="text-sm font-semibold text-[#5F6B63]">Batang</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#5F6B63] mt-2 font-medium">
              <span>Realisasi bibit penyulaman</span>
            </div>
          </div>
        </section>

        {/* Visual Analytics & Data Overview Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart/Analytics Container */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#DDE5DF] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF3EC] text-[#16823B] flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-[#17231B]">
                      Tren Biaya & Realisasi Sulam Bulanan
                    </h2>
                    <p className="text-xs text-[#5F6B63]">
                      Perbandingan anggaran vs realisasi per bulan
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F8FAF9] border border-[#DDE5DF] text-[#5F6B63]">
                  Tahun {selectedTahun}
                </span>
              </div>

              {/* Chart Placeholder / Visual Area */}
              <div className="h-64 sm:h-72 w-full bg-[#F8FAF9] rounded-xl border border-dashed border-[#DDE5DF] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDE5DF] flex items-center justify-center text-[#16823B] mb-3 shadow-2xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-[#17231B]">
                  Ruang Visualisasi Tren Sulam
                </h3>
                <p className="text-xs text-[#5F6B63] max-w-md mt-1">
                  Komponen chart akan otomatis menampilkan grafik tren biaya material & upah kerja setelah tabel data Sulam dihubungkan.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#EAEFEB] flex items-center justify-between text-xs text-[#5F6B63]">
              <span>Modul: Cost Control Sulam (Penyulaman)</span>
              <span className="font-semibold text-[#16823B]">Siap untuk integrasi data</span>
            </div>
          </div>

          {/* Quick Info & Action Card */}
          <div className="bg-white rounded-2xl border border-[#DDE5DF] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#EAF3EC] text-[#16823B] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#17231B]">
                    Status Sumber Data
                  </h2>
                  <p className="text-xs text-[#5F6B63]">
                    Koneksi database & template Excel
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#DDE5DF]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#17231B] mb-1">
                    <span>Database Engine</span>
                    <span className="text-emerald-600 font-extrabold">Tersambung</span>
                  </div>
                  <p className="text-[11px] text-[#5F6B63]">
                    PostgreSQL via Prisma ORM monorepo setup
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#DDE5DF]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#17231B] mb-1">
                    <span>Navigasi Ekosistem</span>
                    <span className="text-emerald-600 font-extrabold">Aktif (9 Modul)</span>
                  </div>
                  <p className="text-[11px] text-[#5F6B63]">
                    Mini sidebar & drawer terhubung dengan portal dan seluruh dashboard
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#DDE5DF]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#17231B] mb-1">
                    <span>Upload Template</span>
                    <span className="text-amber-600 font-extrabold">Tahap Input</span>
                  </div>
                  <p className="text-[11px] text-[#5F6B63]">
                    Format excel input data biaya sulam & bibit
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EAEFEB]">
              <a
                href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3005"}
                className="w-full py-2.5 px-4 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Buka Admin Pusat untuk Kelola Data</span>
              </a>
            </div>
          </div>
        </section>

        {/* Detailed Table Preview Section */}
        <section className="bg-white rounded-2xl border border-[#DDE5DF] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF3EC] text-[#16823B] flex items-center justify-center">
                <TableIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#17231B]">
                  Rincian Lokasi & Biaya Sulam
                </h2>
                <p className="text-xs text-[#5F6B63]">
                  Tabel data per petak / lokasi penanaman bibit sulam
                </p>
              </div>
            </div>

            <div className="text-xs text-[#5F6B63]">
              Menampilkan 0 baris data
            </div>
          </div>

          <div className="overflow-x-auto border border-[#EAEFEB] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#EAEFEB] text-[#5F6B63] font-bold">
                  <th className="p-3.5">No</th>
                  <th className="p-3.5">ID Lokasi</th>
                  <th className="p-3.5">Wilayah</th>
                  <th className="p-3.5">Luas (Ha)</th>
                  <th className="p-3.5">Jenis Bibit</th>
                  <th className="p-3.5">Jumlah Bibit</th>
                  <th className="p-3.5">Biaya Material (Rp)</th>
                  <th className="p-3.5">Biaya Upah (Rp)</th>
                  <th className="p-3.5">Total Biaya (Rp)</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={10} className="p-8 text-center text-[#89938D]">
                    Belum ada data biaya sulam yang dimuat. Data akan muncul setelah diunggah melalui panel admin.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* 3. Footer matching dashboard WIP */}
      <footer className="border-t border-[#DDE5DF] bg-white py-6 text-center text-xs text-[#5F6B63] mt-12">
        <div className="w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Great Giant Foods (GGF).</span>
          <span className="font-semibold text-[#16823B]">
            Integrated Database System • PostgreSQL & Prisma Engine
          </span>
        </div>
      </footer>
    </div>
  );
}
