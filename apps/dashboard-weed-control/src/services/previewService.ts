import { PreviewTableResponse } from "@/types/sourceData";

export type WeedControlTab =
  | "mastersheet"
  | "cost_umur"
  | "data_timeline"
  | "data_material"
  | "data_aktivitas";

export const previewService = {
  async getPreviewData(
    tab: WeedControlTab,
    page = 1,
    limit = 50,
    search = ""
  ): Promise<PreviewTableResponse> {
    const params = new URLSearchParams({
      tab,
      page: String(page),
      limit: String(limit),
    });

    if (search.trim()) {
      params.append("search", search.trim());
    }

    const res = await fetch(`/api/admin/preview?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Gagal memuat data preview: HTTP ${res.status}`);
    }

    const json = await res.json();
    return json;
  },
};

