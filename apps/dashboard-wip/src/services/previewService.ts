export interface PreviewResponse<T = Record<string, unknown>> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const previewService = {
  async getTableData<T = Record<string, unknown>>(
    table: "mastersheet" | "lokasi" | "sbt" | "aktivitas",
    search = "",
    page = 1,
    limit = 50
  ): Promise<PreviewResponse<T>> {
    const params = new URLSearchParams({
      table,
      search,
      page: String(page),
      limit: String(limit),
    });

    const res = await fetch(`/api/admin/preview?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch preview data: ${res.statusText}`);
    }

    return res.json();
  },
};
