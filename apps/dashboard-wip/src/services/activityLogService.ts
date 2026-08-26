import { ActivityLogItem, LogFilter } from "@/types/activityLog";

export const activityLogService = {
  async getLogs(filter?: LogFilter): Promise<ActivityLogItem[]> {
    const params = new URLSearchParams();
    if (filter?.admin && filter.admin !== "all") params.set("admin", filter.admin);
    if (filter?.action && filter.action !== "all") params.set("action", filter.action);
    if (filter?.dataSource && filter.dataSource !== "all") params.set("dataSource", filter.dataSource);
    if (filter?.searchQuery) params.set("searchQuery", filter.searchQuery);

    const res = await fetch(`/api/admin/logs?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch activity logs");
    }

    const data = await res.json();
    return data.logs || [];
  },

  async addLog(logData: Omit<ActivityLogItem, "id" | "timestamp">): Promise<void> {
    try {
      await fetch("/api/admin/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      });
    } catch (err) {
      console.error("Error creating activity log:", err);
    }
  },
};
