import { PreviewTableResponse } from "@/types/sourceData";

export const previewService = {
  async getTableData(
    table: string,
    search: string = "",
    page: number = 1,
    limit: number = 50,
    summaryMode: string = "both"
  ): Promise<PreviewTableResponse> {
    const params = new URLSearchParams({
      table,
      search,
      page: String(page),
      limit: String(limit),
      summary_mode: summaryMode,
    });

    const res = await fetch(`/api/admin/preview?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Gagal memuat data preview (${res.status})`);
    }

    return res.json();
  },

  async toggleView(
    type: "cc" | "ce2",
    id: string,
    isview: boolean
  ): Promise<{ success: boolean; message?: string }> {
    const res = await fetch("/api/admin/preview", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, isview }),
    });

    if (!res.ok) {
      throw new Error(`Gagal mengubah status visibilitas (${res.status})`);
    }

    return res.json();
  },

  async toggleViewAll(
    type: "cc" | "ce2",
    isview: boolean
  ): Promise<{ success: boolean; message?: string }> {
    const res = await fetch("/api/admin/preview", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id: "all", isview }),
    });

    if (!res.ok) {
      throw new Error(`Gagal mengubah status semua visibilitas (${res.status})`);
    }

    return res.json();
  },
};
