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
  mockSbtSourceData,
  mockActivitySourceData,
} from "@/mocks/sourceData";

const REGIONS = ["AW01", "AW02", "AW03", "AW04", "AW05", "AW06", "AW07"];

export const dashboardService = {
  async getTrendData(filters: DashboardFilter): Promise<TrendDataPoint[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Filter source data matching current global filters
    const filteredSource = mockLocationSourceData.filter((item) => {
      if (filters.status && filters.status !== "all" && item.status !== filters.status) {
        return false;
      }
      if (filters.jenisBibit && filters.jenisBibit !== "all" && item.jenisBibit !== filters.jenisBibit) {
        return false;
      }
      if (filters.kelasBibit && filters.kelasBibit !== "all" && item.kelasBibit !== filters.kelasBibit) {
        return false;
      }
      if (filters.groupCost && filters.groupCost !== "all" && item.groupCost !== filters.groupCost) {
        return false;
      }
      return true;
    });

    // Calculate denominator per region: SUM(luas seluruh lokasi pada wilayah)
    const regionTotalLuas: Record<string, number> = {};
    const regionLocSeen: Record<string, Set<string>> = {};

    filteredSource.forEach((item) => {
      if (!regionTotalLuas[item.wilayah]) {
        regionTotalLuas[item.wilayah] = 0;
        regionLocSeen[item.wilayah] = new Set();
      }
      if (!regionLocSeen[item.wilayah].has(item.lokasi)) {
        regionLocSeen[item.wilayah].add(item.lokasi);
        regionTotalLuas[item.wilayah] += item.luas;
      }
    });

    // Build trend dataset for ages 0 to 21 across regions AW01..AW07
    return Array.from({ length: 22 }, (_, i) => {
      const age = i;
      const point: TrendDataPoint = { umur: age };

      REGIONS.forEach((region) => {
        // Find matches for this region and age
        const matches = filteredSource.filter(
          (src) => src.wilayah === region && src.umur === age
        );

        const totalCostAge = matches.reduce((acc, curr) => acc + curr.cost, 0);
        const totalLuasRegion = regionTotalLuas[region] || 0;

        if (totalLuasRegion > 0 && totalCostAge > 0) {
          // Rumus spesifikasi: SUM(cost pada wilayah dan umur) / SUM(luas seluruh lokasi pada wilayah)
          const costHaRp = totalCostAge / totalLuasRegion;
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
    await new Promise((resolve) => setTimeout(resolve, 200));

    return mockLocations.filter((loc) => {
      // Global filters
      if (globalFilters.status && globalFilters.status !== "all" && loc.status !== globalFilters.status) {
        return false;
      }
      if (globalFilters.jenisBibit && globalFilters.jenisBibit !== "all" && loc.jenisBibit !== globalFilters.jenisBibit) {
        return false;
      }
      if (
        globalFilters.kelasBibit &&
        globalFilters.kelasBibit !== "all" &&
        loc.kelas !== globalFilters.kelasBibit &&
        loc.kelasBibit !== globalFilters.kelasBibit
      ) {
        return false;
      }
      if (globalFilters.groupCost && globalFilters.groupCost !== "all" && loc.groupCost !== globalFilters.groupCost) {
        return false;
      }

      // Location-specific filters
      if (locationFilters.umur !== "all" && loc.umur !== locationFilters.umur) {
        return false;
      }
      if (locationFilters.wilayah !== "all" && loc.wilayah !== locationFilters.wilayah) {
        return false;
      }

      return true;
    });
  },

  async getGroupCosts(lokasi: string): Promise<GroupCostData[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (!lokasi) return [];

    // Find location items in sourceData matching lokasi code or id
    const locMatches = mockLocationSourceData.filter(
      (item) => item.lokasi === lokasi || item.id === lokasi || `LOC-${item.id}` === lokasi
    );

    if (locMatches.length > 0) {
      // Group by groupCost
      const gcMap: Record<string, { totalCost: number; totalLuas: number; codeSbt: string }> = {};
      locMatches.forEach((item) => {
        if (!gcMap[item.groupCost]) {
          gcMap[item.groupCost] = { totalCost: 0, totalLuas: 0, codeSbt: item.codeSbt };
        }
        gcMap[item.groupCost].totalCost += item.cost;
        gcMap[item.groupCost].totalLuas += item.luas;
      });

      return Object.keys(gcMap).map((gcKey) => {
        const entry = gcMap[gcKey];
        const costHa = entry.totalLuas > 0 ? entry.totalCost / entry.totalLuas : 0;

        // Find matching SBT value from mockSbtSourceData using codeSbt or groupCost
        const sbtMatch = mockSbtSourceData.find(
          (sbt) => sbt.codeSbt === entry.codeSbt || sbt.groupCost === gcKey
        );
        const sbtVal = sbtMatch ? sbtMatch.nilaiSbt : costHa * 0.95;

        return {
          groupCost: gcKey,
          costHa: Math.round(costHa),
          sbt: Math.round(sbtVal),
          codeSbt: entry.codeSbt,
        };
      });
    }

    if (mockGroupCostsMap[lokasi]) {
      return mockGroupCostsMap[lokasi];
    }

    // Default Group Costs for dynamic location codes
    return [
      { groupCost: "Land Preparation", costHa: 3500000, sbt: 3600000 },
      { groupCost: "Fertilization", costHa: 4200000, sbt: 4000000 },
      { groupCost: "Road and Drainage", costHa: 1500000, sbt: 1600000 },
      { groupCost: "Maintenance", costHa: 2100000, sbt: 2100000 },
      { groupCost: "Harvesting", costHa: 1300000, sbt: 1200000 },
    ];
  },

  async getActivities(groupCost: string, lokasi?: string): Promise<ActivityData[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (!groupCost && !lokasi) return [];

    const actMatches = mockActivitySourceData.filter((item) => {
      if (groupCost && groupCost !== "all" && item.groupCost.toLowerCase() !== groupCost.toLowerCase()) {
        return false;
      }
      if (
        lokasi &&
        lokasi !== "all" &&
        item.lokasi !== lokasi &&
        `LOC-${item.id}` !== lokasi &&
        item.id !== lokasi
      ) {
        return false;
      }
      return true;
    });

    if (actMatches.length > 0) {
      return actMatches.map((item) => ({
        idAktivitas: item.idAktivitas || item.id,
        aktivitas: item.aktivitas,
        kelas: item.kelasBibit,
        kelasBibit: item.kelasBibit,
        cost: item.biaya,
        biaya: item.biaya,
        luas: item.luas,
        costHa: item.luas > 0 ? Math.round(item.biaya / item.luas) : item.costHa,
        groupCost: item.groupCost,
        lokasi: item.lokasi,
        status: item.status,
        wilayah: item.wilayah,
      }));
    }

    return mockActivitiesMap[groupCost] || [];
  },
};
