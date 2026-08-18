import { LocationSourceItem, SbtSourceItem, ActivitySourceItem } from "@/types/sourceData";
import { mockLocationSourceData, mockSbtSourceData, mockActivitySourceData } from "@/mocks/sourceData";

export const previewService = {
  async getLocationData(search?: string): Promise<LocationSourceItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!search) return mockLocationSourceData;
    const query = search.toLowerCase();
    return mockLocationSourceData.filter(
      (item) =>
        item.lokasi.toLowerCase().includes(query) ||
        item.wilayah.toLowerCase().includes(query) ||
        item.groupCost.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
    );
  },

  async getSbtData(search?: string): Promise<SbtSourceItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!search) return mockSbtSourceData;
    const query = search.toLowerCase();
    return mockSbtSourceData.filter(
      (item) =>
        item.codeSbt.toLowerCase().includes(query) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(query)) ||
        item.groupCost.toLowerCase().includes(query)
    );
  },

  async getActivityData(search?: string): Promise<ActivitySourceItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!search) return mockActivitySourceData;
    const query = search.toLowerCase();
    return mockActivitySourceData.filter(
      (item) =>
        (item.idAktivitas && item.idAktivitas.toLowerCase().includes(query)) ||
        item.aktivitas.toLowerCase().includes(query) ||
        item.groupCost.toLowerCase().includes(query) ||
        item.lokasi.toLowerCase().includes(query)
    );
  },
};
