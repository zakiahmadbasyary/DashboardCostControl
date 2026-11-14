"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GlobalFilters from "@/components/dashboard/GlobalFilters";
import TrendCard from "@/components/dashboard/TrendCard";
import LocationAnalysis from "@/components/dashboard/LocationAnalysis";
import LocationDetailCard from "@/components/dashboard/LocationDetailCard";
import GroupCostTable from "@/components/dashboard/GroupCostTable";
import ActivityTable from "@/components/dashboard/ActivityTable";
import ActivityDetailCard from "@/components/dashboard/ActivityDetailCard";
import AkumBahanCard from "@/components/dashboard/AkumBahanCard";

import {
  DashboardFilter,
  LocationFilter,
  TrendDataPoint,
  LocationData,
  GroupCostData,
  ActivityData,
  HistoryActivityData,
  KelengkapanData,
  AkumBahanData,
} from "@/types/dashboard";
import { dashboardService } from "@/services/dashboardService";

export default function PublicDashboardPage() {
  // Global Filters state
  const [globalFilters, setGlobalFilters] = useState<DashboardFilter>({
    status: "all",
    jenisBibit: "all",
    kelasBibit: "all",
    groupCost: "all",
  });

  // Location-specific sub-filters state
  const [locationFilters, setLocationFilters] = useState<LocationFilter>({
    umur: 0,
    wilayah: "AW01",
  });

  // Data states
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const [groupCosts, setGroupCosts] = useState<GroupCostData[]>([]);
  const [selectedGroupCost, setSelectedGroupCost] = useState<GroupCostData | null>(null);

  const [activities, setActivities] = useState<ActivityData[]>([]);

  // History Aktivitas, Kelengkapan, & Akumulasi Bahan states
  const [historyActivities, setHistoryActivities] = useState<HistoryActivityData[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryActivityData | null>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const [kelengkapan, setKelengkapan] = useState<KelengkapanData[]>([]);
  const [loadingKelengkapan, setLoadingKelengkapan] = useState<boolean>(false);

  const [akumBahan, setAkumBahan] = useState<AkumBahanData[]>([]);
  const [loadingAkumBahan, setLoadingAkumBahan] = useState<boolean>(false);

  // Loading states
  const [loadingTrend, setLoadingTrend] = useState<boolean>(true);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(true);
  const [loadingGroupCosts, setLoadingGroupCosts] = useState<boolean>(false);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);

  // Smooth scroll helper dengan offset akurat di bawah header sticky & filter utama
  const scrollToElement = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const scrollTop =
      window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const elTop = el.getBoundingClientRect().top + scrollTop;
    let offset = typeof window !== "undefined" && window.innerWidth < 640 ? 68 : 84;

    // Khusus scroll ke Analisis Lokasi dari grafik Trend Cost:
    // Tambahkan tinggi Filter Utama yang sedang sticky / freeze agar tabel Analisis Lokasi tidak tertutup
    if (id === "location-analysis-section") {
      const filterEl = document.getElementById("global-filters-section");
      const filterHeight = filterEl ? filterEl.getBoundingClientRect().height : 85;
      offset += filterHeight + 16;
    }

    const targetY = Math.max(0, elTop - offset);

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  }, []);

  // Ref to track selectedLocation without triggering fetchDashboardData re-runs
  const selectedLocationRef = useRef<LocationData | null>(selectedLocation);
  useEffect(() => {
    selectedLocationRef.current = selectedLocation;
  }, [selectedLocation]);

  // Handle History Aktivitas selection -> Fetch Kelengkapan
  const handleSelectHistory = useCallback(async (item: HistoryActivityData) => {
    setSelectedHistory(item);
    setLoadingKelengkapan(true);
    try {
      const kelRes = await dashboardService.getKelengkapan(item.rowLabels);
      setKelengkapan(kelRes);
    } catch (err) {
      console.error("Error fetching kelengkapan:", err);
      setKelengkapan([]);
    } finally {
      setLoadingKelengkapan(false);
    }
  }, []);

  // Handle Group Cost selection -> Fetch Activities & History Aktivitas
  const handleSelectGroupCost = useCallback(
    async (gc: GroupCostData, overrideLocCode?: string) => {
      setSelectedGroupCost(gc);
      setLoadingActivities(true);
      setLoadingHistory(true);
      setSelectedHistory(null);
      setKelengkapan([]);

      const locCode = overrideLocCode || selectedLocationRef.current?.lokasi || selectedLocationRef.current?.idLokasi || "";

      try {
        const [actRes, histRes] = await Promise.all([
          dashboardService.getActivities(gc.groupCost, locCode),
          dashboardService.getHistoryActivities(locCode, gc.groupCost),
        ]);
        setActivities(actRes);
        setHistoryActivities(histRes);

        // Otomatis pilih item history pertama jika data tersedia
        if (histRes && histRes.length > 0) {
          handleSelectHistory(histRes[0]);
        }
      } catch (err) {
        console.error("Error fetching activities / history:", err);
      } finally {
        setLoadingActivities(false);
        setLoadingHistory(false);
      }
    },
    [handleSelectHistory]
  );

  // Handle Location selection -> Fetch Group Costs & Akumulasi Bahan
  const handleSelectLocation = useCallback(
    async (loc: LocationData, shouldScroll: boolean = false) => {
      setSelectedLocation(loc);
      selectedLocationRef.current = loc;
      setSelectedGroupCost(null);
      setActivities([]);
      setHistoryActivities([]);
      setSelectedHistory(null);
      setKelengkapan([]);
      setLoadingGroupCosts(true);
      setLoadingAkumBahan(true);

      if (shouldScroll) {
        setPendingScrollTarget("detail");
      }

      try {
        const [gcRes, akumRes] = await Promise.all([
          dashboardService.getGroupCosts(loc.lokasi),
          dashboardService.getAkumBahan(loc.lokasi),
        ]);
        setGroupCosts(gcRes);
        setAkumBahan(akumRes);

        // Otomatis pilih group cost pertama jika data tersedia
        if (gcRes && gcRes.length > 0) {
          handleSelectGroupCost(gcRes[0], loc.lokasi);
        }
      } catch (err) {
        console.error("Error fetching group costs / akum bahan:", err);
      } finally {
        setLoadingGroupCosts(false);
        setLoadingAkumBahan(false);
      }
    },
    [handleSelectGroupCost]
  );

  const fetchDashboardData = useCallback(async () => {
    setLoadingTrend(true);
    setLoadingLocations(true);

    try {
      const [trendRes, locRes] = await Promise.all([
        dashboardService.getTrendData(globalFilters),
        dashboardService.getLocations(globalFilters, locationFilters),
      ]);

      setTrendData(trendRes);
      setLocations(locRes);

      const currentSelected = selectedLocationRef.current;
      // Reset downstream selections if selected location is no longer in filtered list
      if (currentSelected && !locRes.some((l) => l.idLokasi === currentSelected.idLokasi)) {
        setSelectedLocation(null);
        setGroupCosts([]);
        setSelectedGroupCost(null);
        setActivities([]);
        setHistoryActivities([]);
        setSelectedHistory(null);
        setKelengkapan([]);
        setAkumBahan([]);
      } else if (!currentSelected && locRes.length > 0) {
        handleSelectLocation(locRes[0], false);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoadingTrend(false);
      setLoadingLocations(false);
    }
  }, [globalFilters, locationFilters, handleSelectLocation]);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        fetchDashboardData();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

  // Handle Global Filters application
  const handleApplyGlobalFilters = (newFilters: DashboardFilter) => {
    setGlobalFilters(newFilters);
  };

  // ── PENDING SCROLL TARGET STATE (SETELAH LOAD DATA LOKASI / DETAIL SELESAI) ──
  const [pendingScrollTarget, setPendingScrollTarget] = useState<"location" | "detail" | null>(null);

  // Handle click on Umur in Trend Chart/Table -> Filter Location Table for clicked Umur & all Wilayah, then scroll down
  const handleSelectUmurFromTrend = useCallback(
    (umur: number) => {
      const isSameFilter =
        (Array.isArray(locationFilters.umur)
          ? locationFilters.umur.length === 1 && locationFilters.umur[0] === umur
          : locationFilters.umur === umur) && locationFilters.wilayah === "all";

      // Jika data sudah sesuai filter dan tidak sedang memuat, langsung scroll seketika
      if (isSameFilter && !loadingLocations) {
        scrollToElement("location-analysis-section");
      } else {
        setLoadingLocations(true);
        setPendingScrollTarget("location");
        setLocationFilters({
          umur: [umur],
          wilayah: "all",
        });
      }
    },
    [locationFilters, loadingLocations, scrollToElement]
  );

  // Effect: Menjalankan Smooth Scroll tepat ketika proses load data selesai
  useEffect(() => {
    if (!pendingScrollTarget) return;

    if (pendingScrollTarget === "detail" && !loadingGroupCosts) {
      // Jeda 80ms untuk memastikan data group costs selesai dirender ke DOM
      const timer = setTimeout(() => {
        scrollToElement("location-detail-section");
        setPendingScrollTarget(null);
      }, 80);
      return () => clearTimeout(timer);
    }

    if (pendingScrollTarget === "location" && !loadingLocations) {
      // Jeda singkat (80ms) untuk memastikan browser selesai me-render baris tabel lokasi
      const timer = setTimeout(() => {
        scrollToElement("location-analysis-section");
        setPendingScrollTarget(null);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [pendingScrollTarget, loadingGroupCosts, loadingLocations, scrollToElement]);

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans">
      {/* Header */}
      <DashboardHeader />

      {/* Main Container */}
      <main className="flex-1 w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Global Filters Section (Sticky / Freeze) */}
        <section
          id="global-filters-section"
          className="sticky top-20 z-20 bg-[#F7F9F7] py-2 -my-2"
        >
          <GlobalFilters initialFilters={globalFilters} onApplyFilters={handleApplyGlobalFilters} />
        </section>

        {/* Trend Section (Unified Chart & Table Card) */}
        <section className="relative z-0 isolate">
          <TrendCard
            data={trendData}
            loading={loadingTrend}
            onSelectUmur={handleSelectUmurFromTrend}
          />
        </section>

        {/* Location Analysis Section */}
        <section className="relative z-0 isolate">
          <LocationAnalysis
            locations={locations}
            selectedLocation={selectedLocation}
            locationFilters={locationFilters}
            onFilterChange={setLocationFilters}
            onSelectLocation={(loc) => handleSelectLocation(loc, true)}
            loading={loadingLocations}
          />
        </section>

        {/* Location Detail Card Section (Sticky / Freeze replacing GlobalFilters on Desktop/Tablet, normal scroll on Mobile) */}
        <section
          id="location-detail-section"
          className={`scroll-mt-16 sm:scroll-mt-20 ${
            selectedLocation
              ? "sm:sticky sm:top-20 sm:z-30 sm:bg-[#F7F9F7] sm:py-2 sm:-my-2"
              : ""
          }`}
        >
          <LocationDetailCard selectedLocation={selectedLocation} />
        </section>

        {/* Downstream Cascading Section: Group Cost -> Activity */}
        <section className="relative z-0 isolate grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <GroupCostTable
            selectedLocation={selectedLocation}
            groupCosts={groupCosts}
            selectedGroupCost={selectedGroupCost}
            onSelectGroupCost={handleSelectGroupCost}
            loading={loadingGroupCosts}
          />

          <ActivityTable
            selectedGroupCost={selectedGroupCost}
            selectedLocation={selectedLocation}
            activities={activities}
            loading={loadingActivities}
          />
        </section>

        {/* Section Detail Aktivitas (History Aktivitas & Kelengkapan) */}
        <section className="relative z-0 isolate">
          <ActivityDetailCard
            selectedLocation={selectedLocation}
            selectedGroupCost={selectedGroupCost}
            historyActivities={historyActivities}
            loadingHistory={loadingHistory}
            selectedHistory={selectedHistory}
            onSelectHistory={handleSelectHistory}
            kelengkapan={kelengkapan}
            loadingKelengkapan={loadingKelengkapan}
          />
        </section>

        {/* Section Akumulasi Bahan */}
        <section className="relative z-0 isolate">
          <AkumBahanCard
            selectedLocation={selectedLocation}
            data={akumBahan}
            loading={loadingAkumBahan}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DDE5DF] bg-white py-6 text-center text-xs text-[#5F6B63] mt-12">
        <div className="w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Great Giant Foods (GGF).</span>
          <span className="font-semibold text-[#16823B]">Integrated Database System • PostgreSQL & Prisma Engine</span>
        </div>
      </footer>
    </div>
  );
}
