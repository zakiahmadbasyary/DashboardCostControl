export interface PreviewResponse {
  status: string;
  data: Record<string, any>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const hppPreviewService = {
  async getTableData(
    tab: "mastersheet" | "budget" | "lokasi" | "aktivitas",
    search: string = "",
    page: number = 1,
    limit: number = 50
  ): Promise<PreviewResponse> {
    const params = new URLSearchParams({
      tab,
      search,
      page: String(page),
      limit: String(limit),
    });

    const res = await fetch(`/api/admin/preview?${params.toString()}`);
    if (!res.ok) {
      throw new Error("Gagal mengambil data preview database.");
    }
    return res.json();
  },
};
