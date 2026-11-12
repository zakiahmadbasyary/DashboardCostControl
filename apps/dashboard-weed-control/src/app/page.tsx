"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MainFilter from "@/components/dashboard/MainFilter";
import TrendCostCard from "@/components/dashboard/TrendCostCard";
import LocationListCard from "@/components/dashboard/LocationListCard";
import LocationDetailCard from "@/components/dashboard/LocationDetailCard";
import ActivityAndCostCard from "@/components/dashboard/ActivityAndCostCard";
import TimelineCard from "@/components/dashboard/TimelineCard";
import MaterialModal from "@/components/dashboard/MaterialModal";

import {
  MainFilterState,
  TrendDataPoint,
  LocationItem,
  LocationDetail,
  ActivityCostItem,
  AgeCostDataPoint,
  TimelineItem,
} from "@/types/dashboard";
import { weedDashboardService } from "@/services/weedDashboardService";

export default function WeedControlDashboardPage() {
  // 1. Filter Options (Loaded from API)
  const [activitiesOptions, setActivitiesOptions] = useState<string[]>([
    "Total Aktivitas",
  ]);
  const [statusesOptions, setStatusesOptions] = useState<
    Array<{ value: string; label: string }>
  >([
    { value: "NS", label: "NS (NSFC & NSSC)" },
    { value: "NSFC", label: "NSFC" },
    { value: "NSSC", label: "NSSC" },
    { value: "all", label: "Semua Status" },
  ]);
  const [wilayahList, setWilayahList] = useState<string[]>([
    "AW01",
    "AW02",
    "AW03",
    "AW04",
    "AW05",
    "AW06",
    "AW07",
  ]);
  const [umurList, setUmurList] = useState<number[]>([]);

  // 2. Global Main Filter State (Freeze header)
  const [mainFilter, setMainFilter] = useState<MainFilterState>({
    aktivitas: "Total Aktivitas",
    status: "NS",
  });

  // 3. Local Filter State (Only affects Location List Card)
  const [localFilter, setLocalFilter] = useState<{
    umur: number[] | "all";
    wilayah: string[] | "all";
    search: string;
  }>({
    umur: "all",
    wilayah: "all",
    search: "",
  });

  // 4. Data States
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [locationDetail, setLocationDetail] = useState<LocationDetail | null>(null);

  // Downstream Data for selected location
  const [activitiesData, setActivitiesData] = useState<ActivityCostItem[]>([]);
  const [chartData, setChartData] = useState<AgeCostDataPoint[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);

  // Popup Modal Material
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);

  // 5. Loading States
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
  const [loadingTrend, setLoadingTrend] = useState<boolean>(true);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [loadingActivityCost, setLoadingActivityCost] = useState<boolean>(false);
  const [loadingTimeline, setLoadingTimeline] = useState<boolean>(false);

  // 6. Smooth Scroll Target
  const [pendingScrollTarget, setPendingScrollTarget] = useState<"location" | null>(null);

  const scrollToElement = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Fetch filter options on mount
  useEffect(() => {
    let isMounted = true;
    weedDashboardService
      .getFilters()
      .then((res) => {
        if (!isMounted) return;
        if (res.activities) setActivitiesOptions(res.activities);
        if (res.statuses) setStatusesOptions(res.statuses);
        if (res.wilayah && res.wilayah.length > 0) setWilayahList(res.wilayah);
        if (res.umurList) setUmurList(res.umurList);
      })
      .catch((err) => {
        console.error("Gagal memuat filter options:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingFilters(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Location selection -> Fetch Detail, Activity+Cost, and Timeline
  const handleSelectLocation = useCallback(async (loc: LocationItem) => {
    setSelectedLocation(loc);
    setLoadingDetail(true);
    setLoadingActivityCost(true);
    setLoadingTimeline(true);

    try {
      const [detailRes, actCostRes, timelineRes] = await Promise.all([
        weedDashboardService.getLocationDetail(loc.lokasi),
        weedDashboardService.getActivityAndCost(loc.lokasi),
        weedDashboardService.getTimeline(loc.lokasi),
      ]);

      setLocationDetail(detailRes);
      setActivitiesData(actCostRes.activities || []);
      setChartData(actCostRes.chartData || []);
      setTimelineData(timelineRes || []);
    } catch (err) {
      console.error("Gagal memuat data hilir lokasi:", err);
    } finally {
      setLoadingDetail(false);
      setLoadingActivityCost(false);
      setLoadingTimeline(false);
    }
  }, []);

  // Fetch Trend and Locations when Main Filter changes
  const fetchMainData = useCallback(async () => {
    setLoadingTrend(true);
    setLoadingLocations(true);

    try {
      const [trendRes, locRes] = await Promise.all([
        weedDashboardService.getTrendData(mainFilter),
        weedDashboardService.getLocations(mainFilter, localFilter),
      ]);

      setTrendData(trendRes);
      setLocations(locRes);

      // Check if current selected location is still present in new results
      if (selectedLocation) {
        const stillPresent = locRes.find((l) => l.lokasi === selectedLocation.lokasi);
        if (stillPresent) {
          // Update selected location reference
          setSelectedLocation(stillPresent);
        } else {
          // Jika lokasi terpilih tidak lagi sesuai filter, kosongkan pilihan sesuai PRD
          setSelectedLocation(null);
          setLocationDetail(null);
          setActivitiesData([]);
          setChartData([]);
          setTimelineData([]);
        }
      } else if (locRes.length > 0) {
        // Auto-select first location on initial load
        handleSelectLocation(locRes[0]);
      }
    } catch (err) {
      console.error("Gagal memuat data utama:", err);
    } finally {
      setLoadingTrend(false);
      setLoadingLocations(false);
    }
  }, [mainFilter, localFilter, selectedLocation, handleSelectLocation]);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        fetchMainData();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [mainFilter, localFilter]);

  // Handle Main Filter Apply & Reset
  const handleApplyMainFilter = (newFilter: MainFilterState) => {
    setMainFilter(newFilter);
  };

  const handleResetMainFilter = () => {
    const defaultMain: MainFilterState = {
      aktivitas: "Total Aktivitas",
      status: "NS",
    };
    setMainFilter(defaultMain);
  };

  // Handle Local Location Filter Change (Umur / Wilayah / Search)
  const handleLocalFilterChange = (newLocal: {
    umur: number[] | "all";
    wilayah: string[] | "all";
    search: string;
  }) => {
    setLocalFilter(newLocal);
  };

  // Handle Click on Umur in Trend Chart/Table -> Filter Location table to that umur & scroll
  const handleSelectUmurFromTrend = useCallback(
    (umur: number) => {
      setLocalFilter({
        umur: [umur],
        wilayah: "all",
        search: "",
      });
      setPendingScrollTarget("location");
    },
    []
  );

  // Smooth scroll effect after locations finish loading
  useEffect(() => {
    if (pendingScrollTarget === "location" && !loadingLocations) {
      const timer = setTimeout(() => {
        scrollToElement("location-list-section");
        setPendingScrollTarget(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pendingScrollTarget, loadingLocations, scrollToElement]);

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans selection:bg-[#16823B] selection:text-white">
      {/* 1. Header (Navbar + Left Sidebar matching WIP) */}
      <DashboardHeader />

      {/* 2. Main Content Container */}
      <main className="flex-1 w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-8">
        {/* Main Filter Section (Sticky / Freeze Header) */}
        <section className="sticky top-20 z-20 bg-[#F7F9F7] py-2 -my-2">
          <MainFilter
            filters={mainFilter}
            activities={activitiesOptions}
            statuses={statusesOptions}
            onApplyFilters={handleApplyMainFilter}
            onResetFilters={handleResetMainFilter}
            loading={loadingTrend || loadingLocations}
          />
        </section>

        {/* Section 2: Trend Cost Weed Control Card */}
        <section>
          <TrendCostCard
            data={trendData}
            loading={loadingTrend}
            selectedAktivitas={mainFilter.aktivitas}
            selectedStatus={mainFilter.status}
            onSelectUmur={handleSelectUmurFromTrend}
          />
        </section>

        {/* Section 3: List Lokasi per Wilayah Card */}
        <section>
          <LocationListCard
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            umurList={umurList}
            wilayahList={wilayahList}
            selectedUmur={localFilter.umur}
            selectedWilayah={localFilter.wilayah}
            onFilterChange={handleLocalFilterChange}
            loading={loadingLocations}
          />
        </section>

        {/* Section 4: Detail Lokasi Card */}
        <section>
          <LocationDetailCard
            location={locationDetail || selectedLocation}
            loading={loadingDetail}
          />
        </section>

        {/* Section 5: Aktivitas dan Cost Card (35% Left Table + 65% Right Combo Chart) */}
        <section>
          <ActivityAndCostCard
            selectedLocation={selectedLocation}
            activities={activitiesData}
            chartData={chartData}
            loading={loadingActivityCost}
          />
        </section>

        {/* Section 6: Timeline Aktivitas Card */}
        <section>
          <TimelineCard
            selectedLocation={selectedLocation}
            timeline={timelineData}
            onOpenMaterialModal={(timelineId) => setSelectedTimelineId(timelineId)}
            loading={loadingTimeline}
          />
        </section>
      </main>

      {/* Section 7: Material Modal Popup */}
      <MaterialModal
        timelineId={selectedTimelineId}
        onClose={() => setSelectedTimelineId(null)}
      />

      {/* Footer matching WIP style */}
      <footer className="border-t border-[#DDE5DF] bg-white py-6 text-center text-xs text-[#5F6B63] mt-12">
        <div className="w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Great Giant Foods (GGF).</span>
          <span className="font-semibold text-[#16823B]">
            Weed Control Ecosystem • PostgreSQL & Prisma Engine
          </span>
        </div>
      </footer>
    </div>
  );
}
