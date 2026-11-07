"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SulamSubMenu } from "@/components/sulam/SubMenuTabs";
import SulamMainFilters, { PgIndicatorKey } from "@/components/sulam/antar-pg/SulamMainFilters";
import PgComparisonChart from "@/components/sulam/antar-pg/PgComparisonChart";
import PgSummaryTable from "@/components/sulam/antar-pg/PgSummaryTable";
import WilayahMainFilters, { MONTH_OPTIONS } from "@/components/sulam/antar-wilayah/WilayahMainFilters";
import MonthlyMatrixSection from "@/components/sulam/antar-wilayah/MonthlyMatrixSection";
import MonthlyAnalysisSection from "@/components/sulam/antar-wilayah/MonthlyAnalysisSection";
import LocationDetailTable from "@/components/sulam/antar-wilayah/LocationDetailTable";
import LocationMonthlyChart from "@/components/sulam/antar-wilayah/LocationMonthlyChart";
import MandorAnalysisSection from "@/components/sulam/antar-wilayah/MandorAnalysisSection";

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
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
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
    monthName: MONTH_OPTIONS[currentMonth - 1]?.label || "Januari",
  });
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("wilayah");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadingWilayah, setLoadingWilayah] = useState<boolean>(true);
  const [selectedLocation, setSelectedLocation] = useState<{ wilayah: string; lokasi: string } | null>(null);

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
        all: "true",
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
  }, [selectedYear, selectedMonth]);

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
            {/* ── STICKY / FREEZE MAIN FILTER SECTION (CAPEX STYLE: BULAN & TAHUN) ── */}
            <section className="sticky top-16 sm:top-20 z-20 bg-[#F7F9F7] py-1" suppressHydrationWarning>
              <WilayahMainFilters
                selectedMonth={selectedMonth}
                onMonthChange={(m) => {
                  setSelectedMonth(m);
                  setCurrentPage(1);
                }}
                monthsWithData={monthsWithData}
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

            {/* 1. Perbandingan Bulanan (Selalu 12 Bulan) */}
            <MonthlyMatrixSection
              tkChartData={wilayahData.bagian1?.tkChartData || []}
              tkMatrixRows={wilayahData.bagian1?.tkMatrixRows || []}
              batangTkChartData={wilayahData.bagian1?.batangTkChartData || []}
              batangTkMatrixRows={wilayahData.bagian1?.batangTkMatrixRows || []}
              regions={wilayahData.bagian1?.regions || []}
              loading={loadingWilayah}
            />

            {/* 2. Analisis per Wilayah (4 Grafik) */}
            <MonthlyAnalysisSection
              selectedMonth={selectedMonth}
              chartsData={wilayahData.bagian2?.charts || []}
              loading={loadingWilayah}
            />

            {/* 3. Tabel Detail Seluruh Lokasi (Scrollable + Filter Wilayah) */}
            {(() => {
              const selectedLocationKey = selectedLocation
                ? `${selectedLocation.wilayah}__${selectedLocation.lokasi}`
                : null;
              const locationMonthlyMetricData =
                selectedLocationKey && wilayahData.bagian4?.locationMonthlyMap?.[selectedLocationKey]
                  ? wilayahData.bagian4.locationMonthlyMap[selectedLocationKey]
                  : [];

              // Ambil data mandor khusus lokasi jika dipilih; jika tidak dipilih maka kosong
              const locationMandorData =
                selectedLocationKey && wilayahData.bagian5?.locationMandorMap?.[selectedLocationKey]
                  ? wilayahData.bagian5.locationMandorMap[selectedLocationKey]
                  : null;

              const activeRekapMandor = locationMandorData ? locationMandorData.rekapMandor : [];
              const activeHistoriMandor = locationMandorData ? locationMandorData.historiMandor : [];

              return (
                <>
                  <LocationDetailTable
                    locations={wilayahData.bagian3?.locations || []}
                    totalCount={wilayahData.bagian3?.totalCount || 0}
                    locationTotal={wilayahData.bagian3?.locationTotal}
                    monthName={wilayahData.monthName || "Januari"}
                    loading={loadingWilayah}
                    selectedLocationKey={selectedLocationKey}
                    onSelectLocation={(loc) => setSelectedLocation(loc)}
                  />

                  {/* 4. Grafik Analisa Bulanan per Lokasi (Click Action dari Tabel Lokasi & Klik Bar Bulan) */}
                  <LocationMonthlyChart
                    selectedLocation={selectedLocation}
                    selectedYear={selectedYear}
                    data={locationMonthlyMetricData}
                    selectedMonth={selectedMonth}
                    onSelectMonth={(m) => {
                      setSelectedMonth(m);
                      setCurrentPage(1);
                    }}
                    loading={loadingWilayah}
                  />

                  {/* 5. Analisa Mandor (Rekap Bulanan di Kiri & Histori Harian di Kanan) */}
                  <MandorAnalysisSection
                    selectedLocation={selectedLocation}
                    onResetLocation={() => setSelectedLocation(null)}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    monthName={wilayahData.monthName || "Januari"}
                    rekapData={activeRekapMandor}
                    historiData={activeHistoriMandor}
                    loading={loadingWilayah}
                  />
                </>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}
