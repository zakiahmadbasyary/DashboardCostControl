import {
  DashboardFilter,
  LocationFilter,
  TrendDataPoint,
  LocationData,
  GroupCostData,
  ActivityData,
} from "@/types/dashboard";

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
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (error) {
      console.error("API call /api/dashboard/trend failed:", error);
    }

    return [];
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
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (error) {
      console.error("API call /api/dashboard/locations failed:", error);
    }

    return [];
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
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (error) {
      console.error("API call /api/dashboard/group-costs failed:", error);
    }

    return [];
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
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (error) {
      console.error("API call /api/dashboard/activities failed:", error);
    }

    return [];
  },
};
