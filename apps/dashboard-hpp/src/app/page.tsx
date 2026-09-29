"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import HppDashboardHeader from "@/components/HppDashboardHeader";
import HppMainFilters, { HppFilterState, MONTH_NAMES } from "@/components/HppMainFilters";
import HppTrendAndWilayahCharts, { TrendPoint, WilayahPoint } from "@/components/HppTrendAndWilayahCharts";
import HppLokasiTable, { LokasiHppItem } from "@/components/HppLokasiTable";
import HppLocationDetailDrilldown, { AktivitasHppItem, BudgetItem } from "@/components/HppLocationDetailDrilldown";

export default function DashboardHPPPage() {
  const [mounted, setMounted] = useState(false);

  // Main Filter State per PRD Section 6
  const [filters, setFilters] = useState<HppFilterState>({
    taksasiFilter: "all",
    costGroupFilter: "all",
    statusFilter: "all",
    periodeFilter: "all",
    reportFilter: "rp_kg",
    wilayahFilter: "all",
  });

  // Selected Lokasi for Drill-down (PRD Section 11, 12, 13, 14)
  const [selectedLokasiCode, setSelectedLokasiCode] = useState<string | null>(null);

  // Raw Database Data States
  const [rawLokasiList, setRawLokasiList] = useState<LokasiHppItem[]>([]);
  const [rawAktivitasList, setRawAktivitasList] = useState<AktivitasHppItem[]>([]);
  const [rawBudgetList, setRawBudgetList] = useState<BudgetItem[]>([]);

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch initial raw data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const [lokasiRes, aktivitasRes, summaryRes] = await Promise.all([
        fetch("/api/hpp/lokasi"),
        fetch("/api/hpp/aktivitas"),
        fetch("/api/hpp/summary"),
      ]);

      const lokasiData = await lokasiRes.json();
      const aktivitasData = await aktivitasRes.json();
      const summaryData = await summaryRes.json();

      if (lokasiData.status === "success") {
        setRawLokasiList(lokasiData.data || []);
      }
      if (aktivitasData.status === "success") {
        setRawAktivitasList(aktivitasData.data || []);
      }

      // If summary API returns budgets, store them for Section 12 budget lookup
      if (summaryData.status === "success" && summaryData.budgets) {
        setRawBudgetList(summaryData.budgets);
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

  // Handler for updating filter state
  const handleFilterChange = (newFilters: Partial<HppFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Extract available Cost Groups for filter dropdown
  const availableGroups = useMemo(() => {
    const setGrp = new Set<string>();
    rawLokasiList.forEach((item) => {
      if (item.group) setGrp.add(item.group);
    });
    return Array.from(setGrp).sort();
  }, [rawLokasiList]);

  // Apply Main Filters to rawLokasiList (PRD Section 6 & Section 22)
  const filteredLokasiList = useMemo(() => {
    return rawLokasiList.filter((item) => {
      // 1. Taksasi Filter
      if (filters.taksasiFilter === "100_only") {
        const taksasiVal = Number(item.luasAktif) > 0 ? (Number(item.luasPanen) / Number(item.luasAktif)) * 100 : 0;
        if (Math.round(taksasiVal) < 100) return false;
      }

      // 2. Cost Group Filter
      if (filters.costGroupFilter !== "all" && item.group !== filters.costGroupFilter) {
        return false;
      }

      // 3. Status Filter (NSSC, NSFC, NS = NSSC || NSFC)
      if (filters.statusFilter !== "all") {
        if (filters.statusFilter === "NS") {
          if (item.status !== "NSSC" && item.status !== "NSFC") return false;
        } else if (item.status !== filters.statusFilter) {
          return false;
        }
      }

      // 4. Periode (Bulan) Filter
      if (filters.periodeFilter !== "all" && item.periode !== filters.periodeFilter) {
        return false;
      }

      // 5. Wilayah Filter
      if (filters.wilayahFilter !== "all") {
        const itemWilayah = item.masterSheet?.wilayah || "";
        if (itemWilayah.toUpperCase() !== filters.wilayahFilter.toUpperCase()) {
          return false;
        }
      }

      return true;
    });
  }, [rawLokasiList, filters]);

  // Calculate Trend Data (Jan–Dec + YTD weighted sum) per PRD Section 8
  const { trendData, ytdPoint } = useMemo(() => {
    const monthStats: Record<number, { cost: number; qty: number; luas: number }> = {};

    for (let m = 1; m <= 12; m++) {
      monthStats[m] = { cost: 0, qty: 0, luas: 0 };
    }

    let ytdCost = 0;
    let ytdQty = 0;
    let ytdLuas = 0;

    filteredLokasiList.forEach((item) => {
      const p = item.periode;
      const c = Number(item.biaya || 0);
      const q = Number(item.qtyPanen || 0);
      const l = Number(item.luasPanen || 0);

      if (monthStats[p]) {
        monthStats[p].cost += c;
        monthStats[p].qty += q;
        monthStats[p].luas += l;
      }

      ytdCost += c;
      ytdQty += q;
      ytdLuas += l;
    });

    const trendPoints: TrendPoint[] = Object.keys(monthStats).map((monthStr) => {
      const m = Number(monthStr);
      const s = monthStats[m];
      const valRpKg = s.qty > 0 ? s.cost / s.qty : 0;
      const valRpHa = s.luas > 0 ? s.cost / s.luas : 0;

      return {
        month: m,
        label: MONTH_NAMES[m - 1].substring(0, 3),
        cost: s.cost,
        qty: s.qty,
        luas: s.luas,
        valRpKg,
        valRpHa,
      };
    });

    const ytd: TrendPoint = {
      month: 13,
      label: "YTD",
      cost: ytdCost,
      qty: ytdQty,
      luas: ytdLuas,
      valRpKg: ytdQty > 0 ? ytdCost / ytdQty : 0,
      valRpHa: ytdLuas > 0 ? ytdCost / ytdLuas : 0,
    };

    return { trendData: trendPoints, ytdPoint: ytd };
  }, [filteredLokasiList]);

  // Calculate Wilayah Data (W01–W07) per PRD Section 9
  const wilayahData = useMemo(() => {
    const regions = ["W01", "W02", "W03", "W04", "W05", "W06", "W07"];
    const regionStats: Record<string, { cost: number; qty: number; luas: number }> = {};

    regions.forEach((r) => {
      regionStats[r] = { cost: 0, qty: 0, luas: 0 };
    });

    filteredLokasiList.forEach((item) => {
      const reg = (item.masterSheet?.wilayah || "W01").toUpperCase();
      const c = Number(item.biaya || 0);
      const q = Number(item.qtyPanen || 0);
      const l = Number(item.luasPanen || 0);

      if (regionStats[reg]) {
        regionStats[reg].cost += c;
        regionStats[reg].qty += q;
        regionStats[reg].luas += l;
      }
    });

    const list: WilayahPoint[] = regions.map((reg) => {
      const s = regionStats[reg];
      return {
        wilayah: reg,
        cost: s.cost,
        qty: s.qty,
        luas: s.luas,
        valRpKg: s.qty > 0 ? s.cost / s.qty : 0,
        valRpHa: s.luas > 0 ? s.cost / s.luas : 0,
      };
    });

    return list;
  }, [filteredLokasiList]);

  // Items for selected location drill-down
  const selectedLokasiItems = useMemo(() => {
    if (!selectedLokasiCode) return [];
    return rawLokasiList.filter((item) => item.lokasi === selectedLokasiCode);
  }, [rawLokasiList, selectedLokasiCode]);

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
      {/* Shared Navbar Header Matched to WIP Header */}
      <HppDashboardHeader />

      {/* Main Content Body Container */}
      <main className="flex-1 max-w-[95%] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8" suppressHydrationWarning>
        
        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between" suppressHydrationWarning>
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* PRD Section 6: Filter Utama Toolbar */}
        <section suppressHydrationWarning>
          <HppMainFilters
            filters={filters}
            onChangeFilter={handleFilterChange}
            availableGroups={availableGroups}
          />
        </section>

        {/* PRD Section 8 & 9: Trend HPP Pine PG1 & HPP Per Wilayah Charts */}
        <section suppressHydrationWarning>
          <HppTrendAndWilayahCharts
            trendData={trendData}
            ytdPoint={ytdPoint}
            wilayahData={wilayahData}
            filters={filters}
            onSelectMonth={(m) => handleFilterChange({ periodeFilter: m })}
            onSelectWilayah={(w) => handleFilterChange({ wilayahFilter: w })}
            loading={loading}
          />
        </section>

        {/* PRD Section 10: Daftar Lokasi Table */}
        <section suppressHydrationWarning>
          <HppLokasiTable
            data={filteredLokasiList}
            loading={loading}
            selectedWilayahFilter={filters.wilayahFilter}
            onWilayahFilterChange={(w) => handleFilterChange({ wilayahFilter: w })}
            reportFilter={filters.reportFilter}
            selectedLokasiCode={selectedLokasiCode}
            onSelectLokasi={(code) => setSelectedLokasiCode((prev) => (prev === code ? null : code))}
          />
        </section>

        {/* PRD Section 11, 12, 13: Detail Lokasi, Group Cost Table & Aktivitas Table */}
        {selectedLokasiCode && (
          <section className="pt-2 animate-in fade-in duration-300" suppressHydrationWarning>
            <HppLocationDetailDrilldown
              lokasiCode={selectedLokasiCode}
              lokasiItems={selectedLokasiItems}
              aktivitasItems={rawAktivitasList}
              budgetItems={rawBudgetList}
              reportFilter={filters.reportFilter}
            />
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#DDE5DF] bg-white py-6 px-4 text-center text-xs text-[#5F6B63] mt-12" suppressHydrationWarning>
        <div className="max-w-[95%] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Great Giant Foods (GGF).</span>
          <span className="font-semibold text-[#16823B]">
            Dashboard HPP PG1 (Harga Pokok Produksi) • PostgreSQL & Prisma Engine
          </span>
        </div>
      </footer>
    </div>
  );
}
