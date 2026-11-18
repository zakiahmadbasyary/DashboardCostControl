"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MainFilter from "@/components/dashboard/MainFilter";
import TrendCostCard from "@/components/dashboard/TrendCostCard";
import LocationListCard from "@/components/dashboard/LocationListCard";
import LocationDetailCard from "@/components/dashboard/LocationDetailCard";
import ActivityAndCostCard from "@/components/dashboard/ActivityAndCostCard";
import TimelineCard from "@/components/dashboard/TimelineCard";

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

  // 3. Local Filter State (Default umur = 1)
  const [localFilter, setLocalFilter] = useState<{
    umur: number[] | "all";
    wilayah: string[] | "all";
    search: string;
  }>({
    umur: [1],
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
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  // 5. Loading States
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
  const [loadingTrend, setLoadingTrend] = useState<boolean>(true);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [loadingActivityCost, setLoadingActivityCost] = useState<boolean>(false);
  const [loadingTimeline, setLoadingTimeline] = useState<boolean>(false);

  // 6. Smooth Scroll Target ("detail", "location", atau "timeline")
  const [pendingScrollTarget, setPendingScrollTarget] = useState<
    "location" | "detail" | "timeline" | null
  >(null);

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
  const handleSelectLocation = useCallback(
    async (loc: LocationItem, shouldScroll: boolean = false) => {
      setSelectedLocation(loc);
      setSelectedActivity(null);
      setLoadingDetail(true);
      setLoadingActivityCost(true);
      setLoadingTimeline(true);

      if (shouldScroll) {
        setPendingScrollTarget("detail");
      }

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
    },
    []
  );

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
          setSelectedLocation(stillPresent);
        } else {
          // Jika lokasi terpilih tidak lagi sesuai filter, kosongkan pilihan sesuai PRD
          setSelectedLocation(null);
          setSelectedActivity(null);
          setLocationDetail(null);
          setActivitiesData([]);
          setChartData([]);
          setTimelineData([]);
        }
      } else if (locRes.length > 0) {
        // Auto-select first location on initial load without scrolling
        handleSelectLocation(locRes[0], false);
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

  // Handle Local Location Filter Change (Umur default 1)
  const handleLocalFilterChange = (newLocal: {
    umur: number[] | "all";
    wilayah: string[] | "all";
    search: string;
  }) => {
    setLocalFilter(newLocal);
  };

  // Handle Click on Umur in Trend Chart -> Filter Location table to that umur & scroll
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

  // Handle Click Action on Rincian Aktivitas -> Filter Timeline by that activity & smooth scroll after data loaded
  const handleSelectActivity = useCallback(
    async (activityName: string) => {
      if (!selectedLocation) return;

      // Jika klik aktivitas yang sedang aktif terpilih, toggle/reset kembali ke semua
      if (selectedActivity === activityName) {
        setSelectedActivity(null);
        setLoadingTimeline(true);
        try {
          const res = await weedDashboardService.getTimeline(selectedLocation.lokasi);
          setTimelineData(res || []);
        } catch (err) {
          console.error("Gagal memuat timeline:", err);
        } finally {
          setLoadingTimeline(false);
        }
        return;
      }

      setSelectedActivity(activityName);
      setLoadingTimeline(true);
      setPendingScrollTarget("timeline");

      try {
        const res = await weedDashboardService.getTimeline(
          selectedLocation.lokasi,
          activityName
        );
        setTimelineData(res || []);
      } catch (err) {
        console.error("Gagal memuat timeline aktivitas:", err);
      } finally {
        setLoadingTimeline(false);
      }
    },
    [selectedLocation, selectedActivity]
  );

  const handleResetActivityFilter = useCallback(async () => {
    if (!selectedLocation) return;
    setSelectedActivity(null);
    setLoadingTimeline(true);
    try {
      const res = await weedDashboardService.getTimeline(selectedLocation.lokasi);
      setTimelineData(res || []);
    } catch (err) {
      console.error("Gagal reset filter timeline:", err);
    } finally {
      setLoadingTimeline(false);
    }
  }, [selectedLocation]);

  // Smooth scroll effect after data finishes loading
  useEffect(() => {
    if (!pendingScrollTarget) return;

    if (
      pendingScrollTarget === "detail" &&
      !loadingDetail &&
      !loadingActivityCost &&
      !loadingTimeline
    ) {
      const timer = setTimeout(() => {
        scrollToElement("location-detail-section");
        setPendingScrollTarget(null);
      }, 80);
      return () => clearTimeout(timer);
    }

    if (pendingScrollTarget === "location" && !loadingLocations) {
      const timer = setTimeout(() => {
        scrollToElement("location-analysis-section");
        setPendingScrollTarget(null);
      }, 80);
      return () => clearTimeout(timer);
    }

    if (pendingScrollTarget === "timeline" && !loadingTimeline) {
      const timer = setTimeout(() => {
        scrollToElement("timeline-activity-section");
        setPendingScrollTarget(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    pendingScrollTarget,
    loadingDetail,
    loadingActivityCost,
    loadingTimeline,
    loadingLocations,
    scrollToElement,
  ]);

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans selection:bg-[#16823B] selection:text-white">
      {/* 1. Header (Navbar + Left Sidebar matching WIP) */}
      <DashboardHeader />

      {/* 2. Main Content Container */}
      <main className="flex-1 w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-8">
        {/* Main Filter Section (Sticky / Freeze Header) */}
        <section className="sticky top-16 sm:top-20 z-20 bg-[#F7F9F7] py-2 -my-2">
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
        <section className="relative z-0 isolate">
          <TrendCostCard
            data={trendData}
            loading={loadingTrend}
            onSelectUmur={handleSelectUmurFromTrend}
          />
        </section>

        {/* Section 3: List Lokasi per Wilayah Card */}
        <section className="relative z-0 isolate">
          <LocationListCard
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => handleSelectLocation(loc, true)}
            umurList={umurList}
            wilayahList={wilayahList}
            selectedUmur={localFilter.umur}
            selectedWilayah={localFilter.wilayah}
            onFilterChange={handleLocalFilterChange}
            loading={loadingLocations}
          />
        </section>

        {/* Section 4: Detail Lokasi Card (Sticky / Freeze replacing MainFilter on Desktop/Tablet, normal scroll on Mobile) */}
        <section
          id="location-detail-section"
          className={`scroll-mt-16 sm:scroll-mt-20 ${
            selectedLocation || locationDetail
              ? "sm:sticky sm:top-20 sm:z-30 sm:bg-[#F7F9F7] sm:py-2 sm:-my-2"
              : ""
          }`}
        >
          <LocationDetailCard
            location={locationDetail || selectedLocation}
            loading={loadingDetail}
          />
        </section>

        {/* Section 5: Aktivitas dan Cost Card (35% Left Table + 65% Right Combo Chart) */}
        <section className="relative z-0 isolate">
          <ActivityAndCostCard
            selectedLocation={selectedLocation}
            activities={activitiesData}
            chartData={chartData}
            loading={loadingActivityCost}
            selectedActivity={selectedActivity}
            onSelectActivity={handleSelectActivity}
          />
        </section>

        {/* Section 6: Timeline Aktivitas Card */}
        <section
          id="timeline-activity-section"
          className="relative z-0 isolate scroll-mt-24 sm:scroll-mt-[200px]"
        >
          <TimelineCard
            selectedLocation={selectedLocation}
            timeline={timelineData}
            loading={loadingTimeline}
            selectedActivity={selectedActivity}
            onResetActivityFilter={handleResetActivityFilter}
          />
        </section>
      </main>

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
