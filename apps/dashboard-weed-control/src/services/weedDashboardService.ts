// Service untuk memanggil API Dashboard Weed Control

import {
  MainFilterState,
  TrendDataPoint,
  LocationItem,
  LocationDetail,
  ActivityCostItem,
  AgeCostDataPoint,
  TimelineItem,
  MaterialItem,
} from "@/types/dashboard";

export interface FilterOptionsResponse {
  activities: string[];
  statuses: Array<{ value: string; label: string }>;
  wilayah: string[];
  umurList: number[];
}

export interface ActivityCostResponse {
  lokasi: string;
  luas: number;
  activities: ActivityCostItem[];
  chartData: AgeCostDataPoint[];
}

export interface MaterialDetailResponse {
  timeline: {
    id: string;
    lokasi: string;
    aktivitas: string;
    tanggalRealisasi: string | null;
    totalMaterialCost: number | null;
  } | null;
  materials: MaterialItem[];
  total: number;
}

export const weedDashboardService = {
  async getFilters(): Promise<FilterOptionsResponse> {
    const res = await fetch("/api/dashboard/filters", { cache: "no-store" });
    if (!res.ok) throw new Error("Gagal mengambil opsi filter");
    const json = await res.json();
    return json.data;
  },

  async getTrendData(filter: MainFilterState): Promise<TrendDataPoint[]> {
    const params = new URLSearchParams({
      aktivitas: filter.aktivitas,
      status: filter.status,
    });
    const res = await fetch(`/api/dashboard/trend?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Gagal mengambil data trend cost");
    const json = await res.json();
    return json.data || [];
  },

  async getLocations(
    mainFilter: MainFilterState,
    localFilter?: {
      umur?: number[] | "all";
      wilayah?: string[] | "all";
      search?: string;
    }
  ): Promise<LocationItem[]> {
    const params = new URLSearchParams({
      aktivitas: mainFilter.aktivitas,
      status: mainFilter.status,
    });

    if (localFilter?.umur) {
      params.set(
        "umur",
        Array.isArray(localFilter.umur) ? localFilter.umur.join(",") : localFilter.umur
      );
    }
    if (localFilter?.wilayah) {
      params.set(
        "wilayah",
        Array.isArray(localFilter.wilayah)
          ? localFilter.wilayah.join(",")
          : localFilter.wilayah
      );
    }
    if (localFilter?.search) {
      params.set("search", localFilter.search);
    }

    const res = await fetch(`/api/dashboard/locations?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Gagal mengambil data lokasi");
    const json = await res.json();
    return json.data || [];
  },

  async getLocationDetail(lokasi: string): Promise<LocationDetail> {
    const params = new URLSearchParams({ lokasi });
    const res = await fetch(`/api/dashboard/location-detail?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Gagal mengambil detail lokasi");
    const json = await res.json();
    return json.data;
  },

  async getActivityAndCost(lokasi: string): Promise<ActivityCostResponse> {
    const params = new URLSearchParams({ lokasi });
    const res = await fetch(`/api/dashboard/activity-cost?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Gagal mengambil data aktivitas dan cost");
    const json = await res.json();
    return json.data;
  },

  async getTimeline(lokasi: string): Promise<TimelineItem[]> {
    const params = new URLSearchParams({ lokasi });
    const res = await fetch(`/api/dashboard/timeline?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Gagal mengambil data timeline");
    const json = await res.json();
    return json.data || [];
  },

  async getMaterials(timelineId: string): Promise<MaterialDetailResponse> {
    const params = new URLSearchParams({ timelineId });
    const res = await fetch(`/api/dashboard/materials?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Gagal mengambil rincian bahan material");
    const json = await res.json();
    return json.data;
  },
};

