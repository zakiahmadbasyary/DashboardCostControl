export interface PreviewFilterParams {
  wilayah?: string;
  status?: string;
  periode?: string;
  tahun?: string;
}

export interface PreviewFilterOptions {
  wilayahList?: string[];
  statusList?: string[];
  periodeList?: number[];
  tahunList?: number[];
}

export interface PreviewResponse {
  status: string;
  data: Record<string, any>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filterOptions?: PreviewFilterOptions;
}

export const hppPreviewService = {
  async getTableData(
    tab: "mastersheet" | "budget" | "lokasi" | "aktivitas",
    search: string = "",
    page: number = 1,
    limit: number = 50,
    filters?: PreviewFilterParams
  ): Promise<PreviewResponse> {
    const params = new URLSearchParams({
      tab,
      search,
      page: String(page),
      limit: String(limit),
    });

    if (filters?.wilayah && filters.wilayah !== "all") {
      params.set("wilayah", filters.wilayah);
    }
    if (filters?.status && filters.status !== "all") {
      params.set("status", filters.status);
    }
    if (filters?.periode && filters.periode !== "all") {
      params.set("periode", filters.periode);
    }
    if (filters?.tahun && filters.tahun !== "all") {
      params.set("tahun", filters.tahun);
    }

    const res = await fetch(`/api/admin/preview?${params.toString()}`);
    if (!res.ok) {
      throw new Error("Gagal mengambil data preview database.");
    }
    return res.json();
  },
};
