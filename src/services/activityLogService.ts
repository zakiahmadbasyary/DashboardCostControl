import { ActivityLogItem, LogFilter } from "@/types/activityLog";
import { mockActivityLogs } from "@/mocks/activityLogs";

let logsStorage: ActivityLogItem[] = [...mockActivityLogs];

export const activityLogService = {
  async getLogs(filter?: LogFilter): Promise<ActivityLogItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    let result = [...logsStorage];

    if (filter) {
      if (filter.admin && filter.admin !== "all") {
        result = result.filter((l) => l.adminUsername === filter.admin);
      }
      if (filter.action && filter.action !== "all") {
        result = result.filter((l) => l.action === filter.action);
      }
      if (filter.dataSource && filter.dataSource !== "all") {
        result = result.filter((l) => l.dataSource === filter.dataSource);
      }
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        result = result.filter(
          (l) =>
            l.description.toLowerCase().includes(q) ||
            (l.fileName && l.fileName.toLowerCase().includes(q))
        );
      }
    }

    return result;
  },

  async addLog(logData: Omit<ActivityLogItem, "id" | "timestamp">): Promise<ActivityLogItem> {
    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString("en-US", { month: "short" })} ${now.getFullYear()}, ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newLog: ActivityLogItem = {
      id: `LOG-${Date.now()}`,
      timestamp: formattedDate,
      ...logData,
    };

    logsStorage = [newLog, ...logsStorage];
    return newLog;
  },
};
