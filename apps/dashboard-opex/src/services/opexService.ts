import {
  PeriodOption,
  Ce2Option,
  MonthlySummaryResponse,
  CostCenterSummaryItem,
  CostElementSummaryItem,
  ActivityGroupItem,
  TrendPgResponse,
} from "@/types/opex";

export const opexService = {
  async getFilters(): Promise<{ periods: PeriodOption[]; ce2List: Ce2Option[] }> {
    try {
      const res = await fetch("/api/dashboard/filters", { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("API error getFilters:", e);
    }
    return { periods: [], ce2List: [] };
  },

  async getSummaryMonthly(): Promise<MonthlySummaryResponse> {
    try {
      const res = await fetch("/api/dashboard/summary-monthly", { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("API error getSummaryMonthly:", e);
    }
    return { months: [], totalActual: 0, totalBudget: 0, totalVariance: null };
  },

  async getCostCenters(period: number): Promise<CostCenterSummaryItem[]> {
    try {
      const res = await fetch(`/api/dashboard/cost-centers?period=${period}`, {
        cache: "no-store",
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("API error getCostCenters:", e);
    }
    return [];
  },

  async getCostElements(period: number, costcenter: string): Promise<CostElementSummaryItem[]> {
    try {
      const res = await fetch(
        `/api/dashboard/cost-elements?period=${period}&costcenter=${encodeURIComponent(costcenter)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("API error getCostElements:", e);
    }
    return [];
  },

  async getActivities(
    period: number,
    costcenter: string,
    ce2: string
  ): Promise<{ activities: ActivityGroupItem[]; totalCost: number; transactionCount: number }> {
    try {
      const res = await fetch(
        `/api/dashboard/activities?period=${period}&costcenter=${encodeURIComponent(
          costcenter
        )}&ce2=${encodeURIComponent(ce2)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("API error getActivities:", e);
    }
    return { activities: [], totalCost: 0, transactionCount: 0 };
  },

  async getTrendPg(ce2: string, period: number): Promise<TrendPgResponse> {
    try {
      const res = await fetch(
        `/api/dashboard/trend-pg?ce2=${encodeURIComponent(ce2)}&period=${period}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("API error getTrendPg:", e);
    }
    return { monthlyTrend: [], costCenterTable: [] };
  },
};
