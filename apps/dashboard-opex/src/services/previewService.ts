import { PreviewTableResponse } from "@/types/sourceData";

export const previewService = {
  async getTableData(
    table: string,
    search: string = "",
    page: number = 1,
    limit: number = 50
  ): Promise<PreviewTableResponse> {
    const params = new URLSearchParams({
      table,
      search,
      page: String(page),
      limit: String(limit),
    });

    const res = await fetch(`/api/admin/preview?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Gagal memuat data preview (${res.status})`);
    }

    return res.json();
  },
};
