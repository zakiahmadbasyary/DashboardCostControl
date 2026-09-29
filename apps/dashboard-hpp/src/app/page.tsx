"use client";

import React, { useState, useEffect, useCallback } from "react";
import HppDashboardHeader from "@/components/HppDashboardHeader";
import HppMetricsOverview, { HppSummaryMetrics } from "@/components/HppMetricsOverview";
import HppCharts from "@/components/HppCharts";
import HppLokasiTable, { LokasiHppItem } from "@/components/HppLokasiTable";
import HppAktivitasTable, { AktivitasHppItem } from "@/components/HppAktivitasTable";
import DatabaseTesterView from "@/components/DatabaseTesterView";
import { BarChart3, Database } from "lucide-react";

export default function DashboardHPPPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "database">("overview");
  const [mounted, setMounted] = useState(false);

  // Data states
  const [metrics, setMetrics] = useState<HppSummaryMetrics | null>(null);
  const [groupBreakdown, setGroupBreakdown] = useState<any[]>([]);
  const [lokasiList, setLokasiList] = useState<LokasiHppItem[]>([]);
  const [aktivitasList, setAktivitasList] = useState<AktivitasHppItem[]>([]);
  const [selectedLokasi, setSelectedLokasi] = useState<LokasiHppItem | null>(null);

  // Status & Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Fetch Summary Metrics
      const summaryRes = await fetch("/api/hpp/summary");
      const summaryData = await summaryRes.json();

      if (summaryData.status === "success") {
        setMetrics(summaryData.metrics);
        setGroupBreakdown(summaryData.groupBreakdown || []);
      } else {
        setErrorMsg(summaryData.message || "Gagal mengambil data ringkasan HPP");
      }

      // 2. Fetch Lokasi List
      const lokasiRes = await fetch("/api/hpp/lokasi");
      const lokasiData = await lokasiRes.json();
      if (lokasiData.status === "success") {
        setLokasiList(lokasiData.data || []);
      }

      // 3. Fetch Aktivitas List
      const aktivitasRes = await fetch("/api/hpp/aktivitas");
      const aktivitasData = await aktivitasRes.json();
      if (aktivitasData.status === "success") {
        setAktivitasList(aktivitasData.data || []);
      }
    } catch (err: any) {
      console.error("Error loading HPP dashboard data:", err);
      setErrorMsg(err.message || "Gagal menghubungkan ke database Dashboard HPP");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [mounted, fetchData]);

  const handleSelectLokasi = (item: LokasiHppItem) => {
    setSelectedLokasi((prev) => (prev?.idLokasiHpp === item.idLokasiHpp ? null : item));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center text-[#17231B]">
        <div className="flex items-center gap-3 font-semibold text-sm">
          <div className="w-5 h-5 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat Dashboard HPP...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans" suppressHydrationWarning>
      {/* Clean Dashboard Header Matched to WIP Header */}
      <HppDashboardHeader />

      {/* Main Content Body */}
      <main className="flex-1 max-w-[95%] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8" suppressHydrationWarning>
        
        {/* Top Control Switcher for Page Views */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#17231B] tracking-tight">
              Dashboard HPP (Harga Pokok Produksi)
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6B63] font-medium mt-0.5">
              Monitoring Biaya Realisasi vs Anggaran HPP Perkebunan & Aktivitas Panen
            </p>
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="inline-flex p-1 bg-[#E8EFEA] rounded-xl border border-[#D5E1D8] shrink-0">
            <button
              onClick={() => setActiveTab("overview")}
              suppressHydrationWarning
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-[#16823B] text-white shadow-2xs"
                  : "text-[#455248] hover:text-[#17231B] hover:bg-[#DCE7DF]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Overview Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("database")}
              suppressHydrationWarning
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "database"
                  ? "bg-[#16823B] text-white shadow-2xs"
                  : "text-[#455248] hover:text-[#17231B] hover:bg-[#DCE7DF]"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Tester Database</span>
            </button>
          </div>
        </div>

        {/* Error Notification Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between" suppressHydrationWarning>
            <span>⚠️ {errorMsg}</span>
            <button
              onClick={() => setActiveTab("database")}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              suppressHydrationWarning
            >
              Buka Database Tester
            </button>
          </div>
        )}

        {/* Tab 1: Overview Dashboard View */}
        {activeTab === "overview" && (
          <>
            {/* KPI Summary Cards */}
            <section suppressHydrationWarning>
              <HppMetricsOverview metrics={metrics} loading={loading} />
            </section>

            {/* Comparison Bar & Yield Distribution Charts */}
            <section suppressHydrationWarning>
              <HppCharts data={groupBreakdown} loading={loading} />
            </section>

            {/* Interactive Lokasi HPP Table */}
            <section suppressHydrationWarning>
              <HppLokasiTable
                data={lokasiList}
                loading={loading}
                onSelectLokasi={handleSelectLokasi}
                selectedLokasiId={selectedLokasi?.idLokasiHpp}
              />
            </section>

            {/* Aktivitas HPP Table */}
            <section suppressHydrationWarning>
              <HppAktivitasTable data={aktivitasList} loading={loading} />
            </section>
          </>
        )}

        {/* Tab 2: Database Diagnostic & Testing View */}
        {activeTab === "database" && (
          <section suppressHydrationWarning>
            <DatabaseTesterView />
          </section>
        )}

      </main>

      {/* Shared Footer */}
      <footer className="border-t border-[#DDE5DF] bg-white py-6 px-4 text-center text-xs text-[#5F6B63] mt-12" suppressHydrationWarning>
        <div className="max-w-[95%] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Great Giant Foods (GGF).</span>
          <span className="font-semibold text-[#16823B]">
            Dashboard HPP (Harga Pokok Produksi) • PostgreSQL & Prisma Engine
          </span>
        </div>
      </footer>
    </div>
  );
}
