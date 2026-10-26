"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OpexMainFilter from "@/components/dashboard/OpexMainFilter";
import SummaryMonthlyChart from "@/components/dashboard/SummaryMonthlyChart";
import CostCenterTables from "@/components/dashboard/CostCenterTables";
import CostElementTable from "@/components/dashboard/CostElementTable";
import CostElementActivityTable from "@/components/dashboard/CostElementActivityTable";
import TrendPgChart from "@/components/dashboard/TrendPgChart";
import TrendPgTables from "@/components/dashboard/TrendPgTables";

import {
  PeriodOption,
  Ce2Option,
  MonthlyChartDataPoint,
  CostCenterSummaryItem,
  CostElementSummaryItem,
  ActivityGroupItem,
  TrendPgMonthlyPoint,
  TrendPgCostCenterItem,
} from "@/types/opex";
import { opexService } from "@/services/opexService";

const DEFAULT_PERIODS: PeriodOption[] = [
  { periode: 1, label: "Januari" },
  { periode: 2, label: "Februari" },
  { periode: 3, label: "Maret" },
  { periode: 4, label: "April" },
  { periode: 5, label: "Mei" },
  { periode: 6, label: "Juni" },
  { periode: 7, label: "Juli" },
  { periode: 8, label: "Agustus" },
  { periode: 9, label: "September" },
  { periode: 10, label: "Oktober" },
  { periode: 11, label: "November" },
  { periode: 12, label: "Desember" },
];

export default function DashboardOpexPage() {
  // ── 1. GLOBAL FILTER STATE ──
  const [periods, setPeriods] = useState<PeriodOption[]>(DEFAULT_PERIODS);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [ce2MasterList, setCe2MasterList] = useState<Ce2Option[]>([]);

  // ── 2. SUMMARY OVERHEAD PG1 STATE ──
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyChartDataPoint[]>([]);
  const [totalActual, setTotalActual] = useState<number>(0);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [totalVariance, setTotalVariance] = useState<number | null>(null);
  const [costCenters, setCostCenters] = useState<CostCenterSummaryItem[]>([]);
  const [selectedCostCenter, setSelectedCostCenter] = useState<string | null>(null);

  // ── 3. DETAIL COST ELEMENT STATE ──
  const [costElements, setCostElements] = useState<CostElementSummaryItem[]>([]);
  const [selectedCe2, setSelectedCe2] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityGroupItem[]>([]);
  const [activityTotalCost, setActivityTotalCost] = useState<number>(0);
  const [activityTxCount, setActivityTxCount] = useState<number>(0);

  // ── 4. TREND ANTAR PG STATE (INDEPENDENT CE2 FILTER) ──
  const [trendCe2, setTrendCe2] = useState<string>("CE01");
  const [trendMonthly, setTrendMonthly] = useState<TrendPgMonthlyPoint[]>([]);
  const [trendCostCenters, setTrendCostCenters] = useState<TrendPgCostCenterItem[]>([]);

  // ── 5. LOADING STATES ──
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
  const [loadingMonthlyChart, setLoadingMonthlyChart] = useState<boolean>(false);
  const [loadingCostCenters, setLoadingCostCenters] = useState<boolean>(false);
  const [loadingCostElements, setLoadingCostElements] = useState<boolean>(false);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const [loadingTrendPg, setLoadingTrendPg] = useState<boolean>(false);

  // ── FETCH INITIAL FILTERS ──
  useEffect(() => {
    async function initFilters() {
      setLoadingFilters(true);
      const data = await opexService.getFilters();
      if (data.periods && data.periods.length > 0) {
        setPeriods(data.periods);
        setSelectedPeriod(data.periods[0].periode);
      }
      if (data.ce2List && data.ce2List.length > 0) {
        setCe2MasterList(data.ce2List);
        setTrendCe2(data.ce2List[0].ce2);
      }
      setLoadingFilters(false);
    }
    initFilters();
  }, []);

  // ── FETCH SUMMARY MONTHLY CHART (PG1) ──
  useEffect(() => {
    async function fetchMonthly() {
      setLoadingMonthlyChart(true);
      const res = await opexService.getSummaryMonthly();
      setMonthlyChartData(res.months);
      setTotalActual(res.totalActual);
      setTotalBudget(res.totalBudget);
      setTotalVariance(res.totalVariance);
      setLoadingMonthlyChart(false);
    }
    fetchMonthly();
  }, []);

  // ── FETCH COST CENTERS WHEN PERIOD CHANGES ──
  useEffect(() => {
    if (!selectedPeriod) return;

    async function fetchCostCenters() {
      setLoadingCostCenters(true);
      const ccData = await opexService.getCostCenters(selectedPeriod);
      setCostCenters(ccData);

      // Pertahankan atau pilih Cost Center pertama secara default jika belum dipilih
      setSelectedCostCenter((prev) => {
        if (prev && ccData.some((c) => c.costcenter === prev)) {
          return prev;
        }
        return ccData.length > 0 ? ccData[0].costcenter : null;
      });

      setLoadingCostCenters(false);
    }

    fetchCostCenters();
  }, [selectedPeriod]);

  // ── FETCH COST ELEMENTS WHEN COST CENTER OR PERIOD CHANGES ──
  useEffect(() => {
    if (!selectedPeriod || !selectedCostCenter) {
      setCostElements([]);
      setSelectedCe2(null);
      return;
    }

    async function fetchCostElements() {
      setLoadingCostElements(true);
      const ceData = await opexService.getCostElements(selectedPeriod, selectedCostCenter!);
      setCostElements(ceData);

      // Pertahankan atau pilih CE2 pertama secara default jika masih valid
      setSelectedCe2((prev) => {
        if (prev && ceData.some((c) => c.ce2 === prev)) {
          return prev;
        }
        return ceData.length > 0 ? ceData[0].ce2 : null;
      });

      setLoadingCostElements(false);
    }

    fetchCostElements();
  }, [selectedPeriod, selectedCostCenter]);

  // ── FETCH ACTIVITIES WHEN CE2 OR COST CENTER OR PERIOD CHANGES ──
  useEffect(() => {
    if (!selectedPeriod || !selectedCostCenter || !selectedCe2) {
      setActivities([]);
      setActivityTotalCost(0);
      setActivityTxCount(0);
      return;
    }

    async function fetchActivities() {
      setLoadingActivities(true);
      const res = await opexService.getActivities(
        selectedPeriod,
        selectedCostCenter!,
        selectedCe2!
      );
      setActivities(res.activities);
      setActivityTotalCost(res.totalCost);
      setActivityTxCount(res.transactionCount);
      setLoadingActivities(false);
    }

    fetchActivities();
  }, [selectedPeriod, selectedCostCenter, selectedCe2]);

  // ── FETCH TREND PG WHEN TREND CE2 OR PERIOD CHANGES ──
  useEffect(() => {
    if (!trendCe2 || !selectedPeriod) return;

    async function fetchTrend() {
      setLoadingTrendPg(true);
      const res = await opexService.getTrendPg(trendCe2, selectedPeriod);
      setTrendMonthly(res.monthlyTrend);
      setTrendCostCenters(res.costCenterTable);
      setLoadingTrendPg(false);
    }

    fetchTrend();
  }, [trendCe2, selectedPeriod]);

  // Handler for Main Filter period selection
  const handleSelectPeriod = useCallback((p: number) => {
    setSelectedPeriod(p);
  }, []);

  const selectedPeriodObj = periods.find((p) => p.periode === selectedPeriod);
  const selectedPeriodLabel = selectedPeriodObj ? selectedPeriodObj.label : `Bulan ${selectedPeriod}`;

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans">
      {/* ── 1. TOP NAVBAR & SIDEBAR NAVIGATION ── */}
      <DashboardHeader />

      {/* ── 2. MAIN DASHBOARD CONTENT ── */}
      <main className="flex-1 w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Section 4: Main Filter (Periode Bulan) - Freeze / Sticky */}
        <section className="sticky top-16 sm:top-20 z-20 bg-[#F7F9F7]/95 backdrop-blur-xs ">
          <OpexMainFilter
            periods={periods}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={handleSelectPeriod}
            loading={loadingFilters}
          />
        </section>

        {/* Section 5.1: Summary Overhead PG1 — Grafik Actual vs Budget per Bulan */}
        <SummaryMonthlyChart
          data={monthlyChartData}
          totalActual={totalActual}
          totalBudget={totalBudget}
          totalVariance={totalVariance}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={handleSelectPeriod}
          loading={loadingMonthlyChart}
        />

        {/* Section 5.2: Dua Tabel Cost Center PG1 Berdampingan */}
        <CostCenterTables
          data={costCenters}
          selectedCostCenter={selectedCostCenter}
          onSelectCostCenter={setSelectedCostCenter}
          selectedPeriodLabel={selectedPeriodLabel}
          loading={loadingCostCenters}
        />

        {/* Section 6: Detail Cost Element (Dua Card Berdampingan: CE2 di Kiri, Aktivitas di Kanan) */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16823B]" />
                Detail Cost Element & Aktivitas Riil — PG1 ({selectedPeriodLabel})
              </h3>
              <p className="text-xs text-[#5F6B63] mt-0.5">
                Pilih akun Cost Element di kiri untuk menelusuri transaksi pekerjaan pada Cost Center{" "}
                <strong className="text-[#16823B]">{selectedCostCenter || "—"}</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* Card Kiri: Tabel Cost Element */}
            <CostElementTable
              selectedCostCenter={selectedCostCenter}
              data={costElements}
              selectedCe2={selectedCe2}
              onSelectCe2={setSelectedCe2}
              loading={loadingCostElements}
            />

            {/* Card Kanan: Tabel Aktivitas Riil */}
            <CostElementActivityTable
              selectedCostCenter={selectedCostCenter}
              selectedCe2={selectedCe2}
              activities={activities}
              totalCost={activityTotalCost}
              transactionCount={activityTxCount}
              loading={loadingActivities}
            />
          </div>
        </section>

        {/* Section 7: Trend Cost Element Antar PG (7.1, 7.2, 7.3) */}
        <section className="space-y-5 pt-2">
          {/* Card Atas: Grafik Actual Antar PG (7.1 & 7.2) */}
          <TrendPgChart
            data={trendMonthly}
            ce2List={ce2MasterList}
            selectedCe2={trendCe2}
            onSelectCe2={setTrendCe2}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={handleSelectPeriod}
            loading={loadingTrendPg}
          />

          {/* Card Bawah: Dua Tabel Cost Center Antar PG (7.3) */}
          <TrendPgTables
            data={trendCostCenters}
            selectedPeriodLabel={selectedPeriodLabel}
            selectedCe2={trendCe2}
            loading={loadingTrendPg}
          />
        </section>
      </main>

      {/* ── 3. GLOBAL FOOTER ── */}
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
