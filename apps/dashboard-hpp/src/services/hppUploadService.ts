import * as XLSX from "xlsx";

export type HppDataCategory = "MasterSheet" | "Data Budget" | "Data Lokasi HPP" | "Data Aktivitas HPP";

export interface UploadProgress {
  fileName: string;
  fileSize: number;
  status: "uploading" | "validating" | "success" | "error";
  progressPercentage: number;
  message?: string;
  parsedCount?: number;
}

export const hppUploadService = {
  /**
   * Reads and parses an uploaded Excel/CSV file, then posts to backend API
   */
  async uploadSourceFile(
    category: HppDataCategory,
    file: File,
    onProgress: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; message: string; count?: number }> {
    onProgress({
      fileName: file.name,
      fileSize: file.size,
      status: "uploading",
      progressPercentage: 20,
      message: "Membaca berkas Excel...",
    });

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawJson = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];

      onProgress({
        fileName: file.name,
        fileSize: file.size,
        status: "validating",
        progressPercentage: 60,
        message: `Memvalidasi ${rawJson.length} baris data...`,
      });

      let endpointCategory = "mastersheet";
      if (category === "Data Budget") endpointCategory = "budget";
      if (category === "Data Lokasi HPP") endpointCategory = "lokasi";
      if (category === "Data Aktivitas HPP") endpointCategory = "aktivitas";

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: endpointCategory,
          data: rawJson,
        }),
      });

      const responseText = await res.text();
      let result: any = {};

      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = {
          status: "error",
          message: `Gagal memproses respon server (${res.status} ${res.statusText}).`,
        };
      }

      if (res.ok && result.status === "success") {
        onProgress({
          fileName: file.name,
          fileSize: file.size,
          status: "success",
          progressPercentage: 100,
          message: result.message || "Berhasil menyimpan data ke database Prisma PostgreSQL.",
          parsedCount: result.count,
        });
        return { success: true, message: result.message, count: result.count };
      } else {
        onProgress({
          fileName: file.name,
          fileSize: file.size,
          status: "error",
          progressPercentage: 100,
          message: result.message || `Gagal mengunggah data (${res.status}).`,
        });
        return { success: false, message: result.message || "Gagal mengunggah data." };
      }
    } catch (err: any) {
      console.error("Upload Service Error:", err);
      const errMessage = err.message || "Format berkas Excel tidak valid.";
      onProgress({
        fileName: file.name,
        fileSize: file.size,
        status: "error",
        progressPercentage: 100,
        message: errMessage,
      });
      return { success: false, message: errMessage };
    }
  },

  /**
   * Resets database entries for a specific category
   */
  async resetCategoryData(category: HppDataCategory): Promise<{ success: boolean; message: string }> {
    let endpointCategory = "mastersheet";
    if (category === "Data Budget") endpointCategory = "budget";
    if (category === "Data Lokasi HPP") endpointCategory = "lokasi";
    if (category === "Data Aktivitas HPP") endpointCategory = "aktivitas";

    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: endpointCategory }),
      });
      const data = await res.json();
      return { success: res.ok && data.status === "success", message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || "Gagal mengosongkan data." };
    }
  },
};
