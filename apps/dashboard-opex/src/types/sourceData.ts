export type DataSourceCategory = "Data Actual" | "Data Budget";

export type UploadStatus = "idle" | "uploading" | "success" | "error" | "validating";

export interface UploadProgress {
  fileName: string;
  fileSize: number;
  status: UploadStatus;
  progressPercentage: number;
  message?: string;
}

export interface PreviewTableResponse {
  data: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  maxActualPeriod?: number;
}
