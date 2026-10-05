"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import HppDashboardHeader from "@/components/HppDashboardHeader";
import HppMainFilters, { HppFilterState, CostGroupOption, MONTH_NAMES, getCurrentMonthIndex } from "@/components/HppMainFilters";
import HppTrendAndWilayahCharts, { TrendPoint, WilayahPoint } from "@/components/HppTrendAndWilayahCharts";
import HppLokasiTable, { LokasiHppItem } from "@/components/HppLokasiTable";
import HppLocationDetailDrilldown, { AktivitasHppItem, BudgetItem } from "@/components/HppLocationDetailDrilldown";

export default function DashboardHPPPage() {
  const [mounted, setMounted] = useState(false);

  // Main Filter State per PRD Section 6 (Default periodeFilter = Bulan sekarang saat ini)
  const [filters, setFilters] = useState<HppFilterState>({
    taksasiFilter: "all",
    costGroupFilter: "all",
    statusFilter: "all",
    periodeFilter: getCurrentMonthIndex(),
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

  // Handler for updating filter state (Called ONLY upon Terapkan, Reset, or Chart Bar click)
  const handleFilterChange = (newFilters: HppFilterState | Partial<HppFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Extract available Cost Group options with desc_group column data from lokasiHPP
  const availableGroupOptions = useMemo<CostGroupOption[]>(() => {
    const groupMap: Record<string, string> = {};
    rawLokasiList.forEach((item) => {
      if (item.group && !groupMap[item.group]) {
        groupMap[item.group] = item.descGroup || item.group;
      }
    });

    return Object.entries(groupMap)
      .map(([group, descGroup]) => ({
        group,
        descGroup,
      }))
      .sort((a, b) => {
        const aIsZw = a.group.toUpperCase().startsWith("ZW");
        const bIsZw = b.group.toUpperCase().startsWith("ZW");
        if (aIsZw !== bIsZw) return aIsZw ? 1 : -1;
        return a.group.localeCompare(b.group);
      });
  }, [rawLokasiList]);

  // Apply Main Filters to rawLokasiList (PRD Section 6 & Section 22)
  const filteredLokasiList = useMemo(() => {
    return rawLokasiList.filter((item) => {
      // 1. Taksasi Filter
      if (filters.taksasiFilter === "100_only") {
        const taksasiVal = Number(item.luasAktif) > 0 ? (Number(item.luasPanen) / Number(item.luasAktif)) * 100 : 0;
        if (Math.round(taksasiVal) < 100) return false;
      }

      // 2. Cost Group Filter (Support direct_cost for ZN and indirect_cost for ZW)
      if (filters.costGroupFilter !== "all") {
        if (filters.costGroupFilter === "direct_cost") {
          if (!item.group || !item.group.toUpperCase().startsWith("ZN")) return false;
        } else if (filters.costGroupFilter === "indirect_cost") {
          if (!item.group || !item.group.toUpperCase().startsWith("ZW")) return false;
        } else if (item.group !== filters.costGroupFilter) {
          return false;
        }
      }

      // 3. Status Filter (NSSC, NSFC, NS = NSSC || NSFC)
      if (filters.statusFilter !== "all") {
        if (filters.statusFilter === "NS") {
          if (item.status !== "NSSC" && item.status !== "NSFC") return false;
        } else if (item.status !== filters.statusFilter) {
          return false;
        }
      }

      // 4. Periode (Bulan) Filter (Match specific month number 1..12)
      if (item.periode !== filters.periodeFilter) {
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

  // Aggregate and sort location codes descending by HPP (rp_kg / rp_ha) or total cost: Largest to Smallest
  const sortedLokasiCodes = useMemo(() => {
    const lokasiMap: Record<
      string,
      { totalBiaya: number; qtyPanen: number; luasPanen: number; luasAktif: number }
    > = {};

    filteredLokasiList.forEach((item) => {
      const code = item.lokasi;
      if (!lokasiMap[code]) {
        lokasiMap[code] = {
          totalBiaya: 0,
          qtyPanen: Number(item.qtyPanen || 0),
          luasPanen: Number(item.luasPanen || 0),
          luasAktif: Number(item.luasAktif || 0),
        };
      } else {
        if (lokasiMap[code].luasPanen === 0 && Number(item.luasPanen || 0) > 0) {
          lokasiMap[code].luasPanen = Number(item.luasPanen);
        }
        if (lokasiMap[code].luasAktif === 0 && Number(item.luasAktif || 0) > 0) {
          lokasiMap[code].luasAktif = Number(item.luasAktif);
        }
      }
      lokasiMap[code].totalBiaya += Number(item.biaya || 0);
    });

    const isRpKg = filters.reportFilter === "rp_kg";

    const aggregated = Object.entries(lokasiMap)
      .map(([code, data]) => {
        const taksasi = data.luasAktif > 0 ? (data.luasPanen / data.luasAktif) * 100 : 0;
        const rpKg = data.qtyPanen > 0 ? data.totalBiaya / data.qtyPanen : 0;
        const rpHa = data.luasPanen > 0 ? data.totalBiaya / data.luasPanen : 0;
        const val = isRpKg ? rpKg : rpHa;
        return { code, val, totalBiaya: data.totalBiaya, taksasi };
      })
      .filter((item) => item.taksasi > 0);

    // Sort descending by HPP value (val), fallback to totalBiaya descending
    aggregated.sort((a, b) => (b.val !== a.val ? b.val - a.val : b.totalBiaya - a.totalBiaya));

    return aggregated.map((item) => item.code);
  }, [filteredLokasiList, filters.reportFilter]);

  // Auto-select location with largest HPP (Rp/Kg or Rp/Ha) by default (first item in sorted list)
  useEffect(() => {
    if (sortedLokasiCodes.length > 0) {
      setSelectedLokasiCode(sortedLokasiCodes[0]);
    } else {
      setSelectedLokasiCode(null);
    }
  }, [sortedLokasiCodes]);

  // Calculate Trend Data (Jan–Dec + YTD weighted sum) per PRD Section 8
  const { trendData, ytdPoint } = useMemo(() => {
    const monthStats: Record<number, { cost: number; qty: number; luas: number }> = {};

    for (let m = 1; m <= 12; m++) {
      monthStats[m] = { cost: 0, qty: 0, luas: 0 };
    }

    let ytdCost = 0;
    let ytdQty = 0;
    let ytdLuas = 0;

    // Group rawLokasiList by unique (lokasi, periode) to avoid duplicating qty & area per ZN group row
    const locMap: Record<string, { cost: number; qty: number; luas: number; periode: number }> = {};

    rawLokasiList.forEach((item) => {
      if (filters.taksasiFilter === "100_only") {
        const taksasiVal = Number(item.luasAktif) > 0 ? (Number(item.luasPanen) / Number(item.luasAktif)) * 100 : 0;
        if (Math.round(taksasiVal) < 100) return;
      }
      if (filters.costGroupFilter !== "all") {
        if (filters.costGroupFilter === "direct_cost") {
          if (!item.group || !item.group.toUpperCase().startsWith("ZN")) return;
        } else if (filters.costGroupFilter === "indirect_cost") {
          if (!item.group || !item.group.toUpperCase().startsWith("ZW")) return;
        } else if (item.group !== filters.costGroupFilter) return;
      }
      if (filters.statusFilter !== "all") {
        if (filters.statusFilter === "NS") {
          if (item.status !== "NSSC" && item.status !== "NSFC") return;
        } else if (item.status !== filters.statusFilter) return;
      }
      if (filters.wilayahFilter !== "all") {
        const itemWilayah = item.masterSheet?.wilayah || "";
        if (itemWilayah.toUpperCase() !== filters.wilayahFilter.toUpperCase()) return;
      }

      const key = `${item.lokasi}_P${item.periode}`;
      if (!locMap[key]) {
        locMap[key] = {
          cost: 0,
          qty: Number(item.qtyPanen || 0),
          luas: Number(item.luasPanen || 0),
          periode: item.periode,
        };
      }
      locMap[key].cost += Number(item.biaya || 0);
    });

    Object.values(locMap).forEach((loc) => {
      const p = loc.periode;
      if (monthStats[p]) {
        monthStats[p].cost += loc.cost;
        monthStats[p].qty += loc.qty;
        monthStats[p].luas += loc.luas;
      }
      ytdCost += loc.cost;
      ytdQty += loc.qty;
      ytdLuas += loc.luas;
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
  }, [
    rawLokasiList,
    filters.taksasiFilter,
    filters.costGroupFilter,
    filters.statusFilter,
    filters.wilayahFilter,
    filters.reportFilter,
  ]);

  // Calculate Wilayah Data (W01–W07) per PRD Section 9 (Matches all filters EXCEPT wilayahFilter)
  const wilayahData = useMemo(() => {
    const regions = ["W01", "W02", "W03", "W04", "W05", "W06", "W07"];
    const regionStats: Record<string, { cost: number; qty: number; luas: number }> = {};

    regions.forEach((r) => {
      regionStats[r] = { cost: 0, qty: 0, luas: 0 };
    });

    const locMap: Record<string, { cost: number; qty: number; luas: number; wilayah: string }> = {};

    // Aggregate data matching all filters EXCEPT wilayahFilter for selected month
    rawLokasiList.forEach((item) => {
      if (item.periode !== filters.periodeFilter) return;
      if (filters.taksasiFilter === "100_only") {
        const taksasiVal = Number(item.luasAktif) > 0 ? (Number(item.luasPanen) / Number(item.luasAktif)) * 100 : 0;
        if (Math.round(taksasiVal) < 100) return;
      }
      if (filters.costGroupFilter !== "all") {
        if (filters.costGroupFilter === "direct_cost") {
          if (!item.group || !item.group.toUpperCase().startsWith("ZN")) return;
        } else if (filters.costGroupFilter === "indirect_cost") {
          if (!item.group || !item.group.toUpperCase().startsWith("ZW")) return;
        } else if (item.group !== filters.costGroupFilter) return;
      }
      if (filters.statusFilter !== "all") {
        if (filters.statusFilter === "NS") {
          if (item.status !== "NSSC" && item.status !== "NSFC") return;
        } else if (item.status !== filters.statusFilter) return;
      }

      const key = `${item.lokasi}_P${item.periode}`;
      if (!locMap[key]) {
        locMap[key] = {
          cost: 0,
          qty: Number(item.qtyPanen || 0),
          luas: Number(item.luasPanen || 0),
          wilayah: (item.masterSheet?.wilayah || "W01").toUpperCase(),
        };
      }
      locMap[key].cost += Number(item.biaya || 0);
    });

    Object.values(locMap).forEach((loc) => {
      const reg = loc.wilayah;
      if (regionStats[reg]) {
        regionStats[reg].cost += loc.cost;
        regionStats[reg].qty += loc.qty;
        regionStats[reg].luas += loc.luas;
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
  }, [
    rawLokasiList,
    filters.taksasiFilter,
    filters.costGroupFilter,
    filters.statusFilter,
    filters.periodeFilter,
    filters.reportFilter,
  ]);

  // Items for selected location drill-down (filtered by selected location and active period/filters)
  const selectedLokasiItems = useMemo(() => {
    if (!selectedLokasiCode) return [];
    return rawLokasiList.filter((item) => {
      if (item.lokasi !== selectedLokasiCode) return false;
      if (item.periode !== filters.periodeFilter) return false;
      if (filters.statusFilter !== "all") {
        if (filters.statusFilter === "NS") {
          if (item.status !== "NSSC" && item.status !== "NSFC") return false;
        } else if (item.status !== filters.statusFilter) {
          return false;
        }
      }
      if (filters.wilayahFilter !== "all") {
        const itemWilayah = item.masterSheet?.wilayah || "";
        if (itemWilayah.toUpperCase() !== filters.wilayahFilter.toUpperCase()) {
          return false;
        }
      }
      return true;
    });
  }, [
    rawLokasiList,
    selectedLokasiCode,
    filters.periodeFilter,
    filters.statusFilter,
    filters.wilayahFilter,
  ]);

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
      {/* Shared Navbar Header Matched to WIP Header (Sticky top-0 z-50) */}
      <HppDashboardHeader />

      {/* Main Content Body Container */}
      <main className="flex-1 max-w-[95%] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6" suppressHydrationWarning>
        
        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between" suppressHydrationWarning>
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* PRD Section 6: Sticky Freeze Filter Utama Toolbar */}
        <section className="sticky top-20 z-30 font-sans" suppressHydrationWarning>
          <HppMainFilters
            filters={filters}
            onChangeFilter={handleFilterChange}
            availableGroupOptions={availableGroupOptions}
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
            onSelectLokasi={(code) => setSelectedLokasiCode(code)}
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
