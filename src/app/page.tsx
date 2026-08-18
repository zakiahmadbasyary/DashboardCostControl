"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GlobalFilters from "@/components/dashboard/GlobalFilters";
import TrendChart from "@/components/dashboard/TrendChart";
import TrendTable from "@/components/dashboard/TrendTable";
import LocationAnalysis from "@/components/dashboard/LocationAnalysis";
import GroupCostTable from "@/components/dashboard/GroupCostTable";
import ActivityTable from "@/components/dashboard/ActivityTable";

import {
  DashboardFilter,
  LocationFilter,
  TrendDataPoint,
  LocationData,
  GroupCostData,
  ActivityData,
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
    umur: "all",
    wilayah: "all",
  });

  // Data states
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const [groupCosts, setGroupCosts] = useState<GroupCostData[]>([]);
  const [selectedGroupCost, setSelectedGroupCost] = useState<GroupCostData | null>(null);

  const [activities, setActivities] = useState<ActivityData[]>([]);

  // Loading states
  const [loadingTrend, setLoadingTrend] = useState<boolean>(true);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(true);
  const [loadingGroupCosts, setLoadingGroupCosts] = useState<boolean>(false);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);

  // Fetch Trend and Locations when Global Filters or Location Sub-filters change
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

      // Reset downstream selections if selected location is no longer in filtered list
      if (selectedLocation && !locRes.some((l) => l.idLokasi === selectedLocation.idLokasi)) {
        setSelectedLocation(null);
        setGroupCosts([]);
        setSelectedGroupCost(null);
        setActivities([]);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoadingTrend(false);
      setLoadingLocations(false);
    }
  }, [globalFilters, locationFilters, selectedLocation]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Location selection -> Fetch Group Costs
  const handleSelectLocation = async (loc: LocationData) => {
    setSelectedLocation(loc);
    setSelectedGroupCost(null);
    setActivities([]);
    setLoadingGroupCosts(true);

    try {
      const gcRes = await dashboardService.getGroupCosts(loc.lokasi);
      setGroupCosts(gcRes);
    } catch (err) {
      console.error("Error fetching group costs:", err);
    } finally {
      setLoadingGroupCosts(false);
    }
  };

  // Handle Group Cost selection -> Fetch Activities
  const handleSelectGroupCost = async (gc: GroupCostData) => {
    setSelectedGroupCost(gc);
    setLoadingActivities(true);

    try {
      const actRes = await dashboardService.getActivities(gc.groupCost);
      setActivities(actRes);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Handle Global Filters application
  const handleApplyGlobalFilters = (newFilters: DashboardFilter) => {
    setGlobalFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col font-sans">
      {/* Header */}
      <DashboardHeader />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Global Filters Section */}
        <section>
          <GlobalFilters initialFilters={globalFilters} onApplyFilters={handleApplyGlobalFilters} />
        </section>

        {/* Trend Section (Chart & Table) */}
        <section className="flex flex-col gap-6">
          <TrendChart data={trendData} loading={loadingTrend} />
          <TrendTable data={trendData} loading={loadingTrend} />
        </section>

        {/* Location Analysis Section */}
        <section>
          <LocationAnalysis
            locations={locations}
            selectedLocation={selectedLocation}
            locationFilters={locationFilters}
            onFilterChange={setLocationFilters}
            onSelectLocation={handleSelectLocation}
            loading={loadingLocations}
          />
        </section>

        {/* Downstream Cascading Section: Group Cost -> Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <GroupCostTable
            selectedLocation={selectedLocation}
            groupCosts={groupCosts}
            selectedGroupCost={selectedGroupCost}
            onSelectGroupCost={handleSelectGroupCost}
            loading={loadingGroupCosts}
          />

          <ActivityTable
            selectedGroupCost={selectedGroupCost}
            activities={activities}
            loading={loadingActivities}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DDE5DF] bg-white py-6 px-4 text-center text-xs text-[#5F6B63] mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Great Giant Foods (GGF) — AgroMetric WIP ACC Cost Control. All rights reserved.</span>
          <span className="font-semibold text-[#16823B]">Frontend Phase • Powered by Mock Service Layer</span>
        </div>
      </footer>
    </div>
  );
}
