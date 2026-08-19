import {
  DashboardFilter,
  LocationFilter,
  TrendDataPoint,
  LocationData,
  GroupCostData,
  ActivityData,
} from "@/types/dashboard";
import {
  mockLocations,
  mockGroupCostsMap,
  mockActivitiesMap,
} from "@/mocks/dashboardData";
import {
  mockLocationSourceData,
} from "@/mocks/sourceData";

import { matchesStatus, matchesGroupCost } from "@/lib/filterUtils";

const REGIONS = ["AW01", "AW02", "AW03", "AW04", "AW05", "AW06", "AW07"];

export const dashboardService = {
  async getTrendData(filters: DashboardFilter): Promise<TrendDataPoint[]> {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.jenisBibit) params.set("jenisBibit", filters.jenisBibit);
      if (filters.kelasBibit) params.set("kelasBibit", filters.kelasBibit);
      if (filters.groupCost) params.set("groupCost", filters.groupCost);

      const res = await fetch(`/api/dashboard/trend?${params.toString()}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (error) {
      console.warn("API call /api/dashboard/trend failed, falling back to mock data:", error);
    }

    // Fallback to mock data calculations
    const filteredSource = mockLocationSourceData.filter((item) => {
      if (!matchesStatus(item.status, filters.status)) return false;
      if (filters.jenisBibit && filters.jenisBibit !== "all" && item.jenisBibit !== filters.jenisBibit) return false;
      if (filters.kelasBibit && filters.kelasBibit !== "all" && item.kelasBibit !== filters.kelasBibit) return false;
      if (!matchesGroupCost(item, filters.groupCost)) return false;
      return true;
    });

    return Array.from({ length: 22 }, (_, i) => {
      const age = i;
      const point: TrendDataPoint = { umur: age };

      REGIONS.forEach((region) => {
        const matches = filteredSource.filter(
          (src) => src.wilayah === region && src.umur === age
        );
        const totalCostWilayah = matches.reduce((acc, curr) => acc + curr.cost, 0);

        const uniqueLocations = new Map<string, number>();
        matches.forEach((item) => {
          if (!uniqueLocations.has(item.lokasi)) {
            uniqueLocations.set(item.lokasi, item.luas);
          }
        });
        const totalLuasWilayah = Array.from(uniqueLocations.values()).reduce(
          (acc, luas) => acc + luas,
          0
        );

        if (totalLuasWilayah > 0 && totalCostWilayah > 0) {
          const costHaRp = totalCostWilayah / totalLuasWilayah;
          const costHaJuta = costHaRp / 1000000;
          point[region] = Math.round(costHaJuta * 10) / 10;
        } else {
          point[region] = 0;
        }
      });

      return point;
    });
  },

  async getLocations(
    globalFilters: DashboardFilter,
    locationFilters: LocationFilter
  ): Promise<LocationData[]> {
    try {
      const params = new URLSearchParams();
      if (globalFilters.status) params.set("status", globalFilters.status);
      if (globalFilters.jenisBibit) params.set("jenisBibit", globalFilters.jenisBibit);
      if (globalFilters.kelasBibit) params.set("kelasBibit", globalFilters.kelasBibit);
      if (globalFilters.groupCost) params.set("groupCost", globalFilters.groupCost);
      if (locationFilters.umur !== undefined) params.set("umur", String(locationFilters.umur));
      if (locationFilters.wilayah) params.set("wilayah", locationFilters.wilayah);

      const res = await fetch(`/api/dashboard/locations?${params.toString()}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (error) {
      console.warn("API call /api/dashboard/locations failed, falling back to mock data:", error);
    }

    // Fallback to mock data
    return mockLocations.filter((loc) => {
      if (!matchesStatus(loc.status, globalFilters.status)) return false;
      if (globalFilters.jenisBibit && globalFilters.jenisBibit !== "all" && loc.jenisBibit !== globalFilters.jenisBibit) return false;
      if (
        globalFilters.kelasBibit &&
        globalFilters.kelasBibit !== "all" &&
        loc.kelas !== globalFilters.kelasBibit &&
        loc.kelasBibit !== globalFilters.kelasBibit
      ) return false;
      if (!matchesGroupCost(loc, globalFilters.groupCost)) return false;

      if (locationFilters.umur !== undefined && (locationFilters.umur as number | string) !== "all" && loc.umur !== locationFilters.umur) return false;
      if (locationFilters.wilayah && locationFilters.wilayah !== "all" && loc.wilayah !== locationFilters.wilayah) return false;

      return true;
    });
  },

  async getGroupCosts(lokasi: string): Promise<GroupCostData[]> {
    try {
      if (!lokasi) return [];

      const params = new URLSearchParams({ lokasi });
      const res = await fetch(`/api/dashboard/group-costs?${params.toString()}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (error) {
      console.warn("API call /api/dashboard/group-costs failed, falling back to mock data:", error);
    }

    // Fallback to mock data
    if (mockGroupCostsMap[lokasi]) return mockGroupCostsMap[lokasi];

    return [
      { groupCost: "Land Preparation", costHa: 3500000, sbt: 3600000 },
      { groupCost: "Fertilization", costHa: 4200000, sbt: 4000000 },
      { groupCost: "Road and Drainage", costHa: 1500000, sbt: 1600000 },
      { groupCost: "Maintenance", costHa: 2100000, sbt: 2100000 },
      { groupCost: "Harvesting", costHa: 1300000, sbt: 1200000 },
    ];
  },

  async getActivities(groupCost: string, lokasi?: string): Promise<ActivityData[]> {
    try {
      if (!groupCost && !lokasi) return [];

      const params = new URLSearchParams();
      if (groupCost) params.set("groupCost", groupCost);
      if (lokasi) params.set("lokasi", lokasi);

      const res = await fetch(`/api/dashboard/activities?${params.toString()}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (error) {
      console.warn("API call /api/dashboard/activities failed, falling back to mock data:", error);
    }

    // Fallback to mock data
    const fallback = mockActivitiesMap[groupCost] || [];
    if (lokasi && lokasi !== "all") {
      return fallback.filter(
        (item) =>
          !item.lokasi ||
          item.lokasi.toLowerCase() === lokasi.toLowerCase() ||
          `LOC-${item.idAktivitas}`.toLowerCase() === lokasi.toLowerCase()
      );
    }

    return fallback;
  },
};
