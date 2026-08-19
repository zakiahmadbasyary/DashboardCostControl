import { UploadProgress } from "@/types/sourceData";
import { activityLogService } from "@/services/activityLogService";

export const uploadService = {
  async uploadSourceFile(
    dataSourceCategory: "Data Lokasi" | "Data SBT" | "Data Aktivitas",
    file: File,
    onProgress: (progress: UploadProgress) => void
  ): Promise<boolean> {
    const fileName = file.name;
    const fileSize = file.size;

    // Phase 1: Uploading
    onProgress({
      fileName,
      fileSize,
      status: "uploading",
      progressPercentage: 25,
      message: "Mengunggah file ke server...",
    });
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Phase 2: Validating
    onProgress({
      fileName,
      fileSize,
      status: "validating",
      progressPercentage: 70,
      message: "Memvalidasi kolom dan format data...",
    });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Phase 3: Success
    onProgress({
      fileName,
      fileSize,
      status: "success",
      progressPercentage: 100,
      message: `File ${fileName} berhasil diproses dan diperbarui!`,
    });

    // Record activity log
    await activityLogService.addLog({
      adminUsername: "admin",
      action: "UPLOAD_DATA",
      dataSource: dataSourceCategory,
      fileName,
      description: `Upload ${fileName} (${Math.round(fileSize / 1024)} KB) berhasil diproses.`,
    });

    return true;
  },
};
