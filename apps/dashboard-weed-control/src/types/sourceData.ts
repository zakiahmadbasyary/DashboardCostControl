export type WeedControlCategory = "Data Lokasi" | "Data Timeline" | "Data Aktivitas";

export type UploadStatus = "idle" | "uploading" | "success" | "error" | "validating";

export interface UploadProgress {
  fileName: string;
  fileSize: number;
  status: UploadStatus;
  progressPercentage: number;
  message?: string;
  errorDetails?: Array<{ row?: number; column?: string; reason: string }>;
}

export interface PreviewTableResponse {
  data: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  materialColumns?: string[];
  maxUmur?: number;
}
