"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SubMenuTabs, { SulamSubMenu } from "@/components/sulam/SubMenuTabs";
import SulamMainFilters, { PgIndicatorKey } from "@/components/sulam/antar-pg/SulamMainFilters";
import PgComparisonChart from "@/components/sulam/antar-pg/PgComparisonChart";
import PgSummaryTable from "@/components/sulam/antar-pg/PgSummaryTable";
import MonthlyMatrixSection from "@/components/sulam/antar-wilayah/MonthlyMatrixSection";
import MonthlyAnalysisSection from "@/components/sulam/antar-wilayah/MonthlyAnalysisSection";
import LocationDetailTable from "@/components/sulam/antar-wilayah/LocationDetailTable";

export default function DashboardSulamPage() {
  const [activeTab, setActiveTab] = useState<SulamSubMenu>("antar-pg");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]);

  // State Sub-menu 1 (Antar PG)
  const [selectedIndicator, setSelectedIndicator] = useState<PgIndicatorKey>("upahHa");
  const [selectedTablePg, setSelectedTablePg] = useState<string>("PG1");
  const [pgChartData, setPgChartData] = useState<any[]>([]);
  const [pgSummaryRows, setPgSummaryRows] = useState<any[]>([]);
  const [pgTableTotal, setPgTableTotal] = useState<any>(null);
  const [loadingPg, setLoadingPg] = useState<boolean>(true);

  // State Sub-menu 2 (Antar Wilayah PG1)
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [monthsWithData, setMonthsWithData] = useState<number[]>([]);
  const [wilayahData, setWilayahData] = useState<any>({
    bagian1: {
      regions: ["AW01", "AW02", "AW03", "AW04", "AW05", "AW06", "AW07"],
      tkChartData: [],
      tkMatrixRows: [],
      batangTkChartData: [],
      batangTkMatrixRows: [],
    },
    bagian2: {
      charts: [],
    },
    bagian3: {
      locations: [],
      totalCount: 0,
      page: 1,
      pageSize: 15,
      totalPages: 1,
      locationTotal: null,
    },
    monthName: "Januari",
  });
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("wilayah");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadingWilayah, setLoadingWilayah] = useState<boolean>(true);

  // ==========================================
  // Fetcher Sub-menu 1: Antar PG
  // ==========================================
  const fetchPgData = useCallback(async () => {
    setLoadingPg(true);
    try {
      const res = await fetch(`/api/sulam/antar-pg?year=${selectedYear}&pg=${selectedTablePg}`);
      const data = await res.json();
      if (data.success) {
        setPgChartData(data.chartData || []);
        setPgSummaryRows(data.summaryTable || []);
        setPgTableTotal(data.tableTotal || null);
        if (data.availableYears && data.availableYears.length > 0) {
          setAvailableYears(data.availableYears);
        }
      }
    } catch (e) {
      console.error("Gagal memuat data Antar PG:", e);
    } finally {
      setLoadingPg(false);
    }
  }, [selectedYear, selectedTablePg]);

  // ==========================================
  // Fetcher Sub-menu 2: Antar Wilayah
  // ==========================================
  const fetchWilayahData = useCallback(async () => {
    setLoadingWilayah(true);
    try {
      const params = new URLSearchParams({
        year: String(selectedYear),
        month: String(selectedMonth),
        search: searchLocation,
        sortBy,
        sortDir,
        page: String(currentPage),
        pageSize: "15",
      });

      const res = await fetch(`/api/sulam/antar-wilayah?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setWilayahData(data);
        if (data.availableYears && data.availableYears.length > 0) {
          setAvailableYears(data.availableYears);
        }
        if (data.monthsWithData) {
          setMonthsWithData(data.monthsWithData);
        }
      }
    } catch (e) {
      console.error("Gagal memuat data Antar Wilayah:", e);
    } finally {
      setLoadingWilayah(false);
    }
  }, [selectedYear, selectedMonth, searchLocation, sortBy, sortDir, currentPage]);

  // Effect saat Sub-menu atau Tahun berubah
  useEffect(() => {
    if (activeTab === "antar-pg") {
      fetchPgData();
    } else {
      fetchWilayahData();
    }
  }, [activeTab, selectedYear, fetchPgData, fetchWilayahData]);

  // Handler Sorting Tabel Lokasi
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans selection:bg-[#16823B] selection:text-white">
      {/* 1. Header with Left Mini-Sidebar (w-16) & Top Navbar with Sub-Menu (Antar PG & Antar Wilayah) */}
      <DashboardHeader
        activeSection={activeTab}
        onSelectSection={(section) => {
          setActiveTab(section);
          setCurrentPage(1);
        }}
      />

      {/* 2. Main Content Container (offset md:ml-16 to accommodate left mini-sidebar) */}
      <main className="flex-1 w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col gap-4">
        {/* ========================================================= */}
        {/* VIEW 1: Evaluasi Sulam Antar PG */}
        {/* ========================================================= */}
        {activeTab === "antar-pg" && (
          <div className="space-y-4">
            {/* ── STICKY / FREEZE MAIN FILTER SECTION (CAPEX STYLE) ── */}
            <section className="sticky top-16 sm:top-20 z-20 bg-[#F7F9F7] py-1" suppressHydrationWarning>
              <SulamMainFilters
                selectedIndicator={selectedIndicator}
                onSelectIndicator={setSelectedIndicator}
                selectedYear={selectedYear}
                availableYears={availableYears}
                onYearChange={(year) => {
                  setSelectedYear(year);
                }}
                onRefresh={fetchPgData}
                loading={loadingPg}
              />
            </section>

            {/* Grafik Perbandingan PG */}
            <PgComparisonChart
              data={pgChartData}
              indicator={selectedIndicator}
              loading={loadingPg}
            />

            {/* Tabel Summary Bulanan per PG */}
            <PgSummaryTable
              rows={pgSummaryRows}
              total={pgTableTotal}
              selectedPg={selectedTablePg}
              onSelectPg={setSelectedTablePg}
              loading={loadingPg}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: Evaluasi Sulam Antar Wilayah (PG1 AW01--AW07) */}
        {/* ========================================================= */}
        {activeTab === "antar-wilayah" && (
          <div className="space-y-4">
            {/* Sticky Top Filter for Antar Wilayah */}
            <section className="sticky top-16 sm:top-20 z-20 bg-[#F7F9F7] py-1" suppressHydrationWarning>
              <SubMenuTabs
                activeTab={activeTab}
                selectedYear={selectedYear}
                availableYears={availableYears}
                onYearChange={(year) => {
                  setSelectedYear(year);
                  setCurrentPage(1);
                }}
                onRefresh={fetchWilayahData}
                loading={loadingWilayah}
              />
            </section>

            {/* Bagian 1: Perbandingan Bulanan (Selalu 12 Bulan) */}
            <MonthlyMatrixSection
              tkChartData={wilayahData.bagian1?.tkChartData || []}
              tkMatrixRows={wilayahData.bagian1?.tkMatrixRows || []}
              batangTkChartData={wilayahData.bagian1?.batangTkChartData || []}
              batangTkMatrixRows={wilayahData.bagian1?.batangTkMatrixRows || []}
              regions={wilayahData.bagian1?.regions || []}
              loading={loadingWilayah}
            />

            {/* Bagian 2: Analisis per Wilayah (Filter Bulan + 4 Grafik) */}
            <MonthlyAnalysisSection
              selectedMonth={selectedMonth}
              onMonthChange={(m) => {
                setSelectedMonth(m);
                setCurrentPage(1);
              }}
              monthsWithData={monthsWithData}
              chartsData={wilayahData.bagian2?.charts || []}
              loading={loadingWilayah}
            />

            {/* Bagian 3: Tabel Detail Lokasi */}
            <LocationDetailTable
              locations={wilayahData.bagian3?.locations || []}
              totalCount={wilayahData.bagian3?.totalCount || 0}
              locationTotal={wilayahData.bagian3?.locationTotal}
              currentPage={currentPage}
              totalPages={wilayahData.bagian3?.totalPages || 1}
              pageSize={15}
              onPageChange={setCurrentPage}
              searchQuery={searchLocation}
              onSearchChange={(s) => {
                setSearchLocation(s);
                setCurrentPage(1);
              }}
              sortBy={sortBy}
              sortDir={sortDir}
              onSortChange={handleSortChange}
              monthName={wilayahData.monthName || "Januari"}
              loading={loadingWilayah}
            />
          </div>
        )}
      </main>
    </div>
  );
}
