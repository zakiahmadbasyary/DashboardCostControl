export type CapexUploadCategory =
  | "Data Created"
  | "Data PO"
  | "Data Budget"
  | "Data Purchasing"
  | "Data Kategori"
  | "User Approver";

export type UploadFrequency = "harian" | "tahunan" | "on_demand";

export type UploadStatus = "idle" | "uploading" | "success" | "error" | "validating";

export interface UploadProgress {
  fileName: string;
  fileSize: number;
  status: UploadStatus;
  progressPercentage: number;
  message?: string;
}

export interface UploadCardMeta {
  title: CapexUploadCategory;
  categoryKey: string;
  frequency: UploadFrequency;
  frequencyLabel: string;
  frequencyBadgeColor: string;
  step: number;
  desc: string;
  sampleFile: string;
}
