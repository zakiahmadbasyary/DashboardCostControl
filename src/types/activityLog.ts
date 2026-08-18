export type LogActionType =
  | "LOGIN"
  | "LOGOUT"
  | "UPLOAD_DATA"
  | "REPLACE_DATA"
  | "VALIDATE_DATA"
  | "DELETE_DATA";

export type DataSourceCategory = "Data Lokasi" | "Data SBT" | "Data Aktivitas" | "-";

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  adminUsername: string;
  action: LogActionType;
  dataSource: DataSourceCategory;
  fileName?: string;
  description: string;
}

export interface LogFilter {
  admin: string;
  action: string;
  dataSource: string;
  searchQuery: string;
}
