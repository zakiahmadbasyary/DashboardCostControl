import * as XLSX from "xlsx";

export interface UploadProgress {
  fileName: string;
  fileSize: number;
  status: "idle" | "uploading" | "validating" | "success" | "error";
  progressPercentage: number;
  message: string;
  result?: {
    totalRows: number;
    validRows: number;
    summaryCount: number;
    errorCount: number;
    sampleErrors?: { row: number; error: string }[];
  };
}

export const uploadService = {
  /**
   * Mengunggah file Excel Transaksi Sulam ke server (Mode Replace)
   */
  async uploadSourceFile(
    file: File,
    onProgress: (progress: UploadProgress) => void
  ): Promise<boolean> {
    const fileName = file.name;
    const fileSize = file.size;

    try {
      // 1. Fase Membaca Excel di Browser
      onProgress({
        fileName,
        fileSize,
        status: "validating",
        progressPercentage: 15,
        message: "Membaca dan memverifikasi format berkas Excel...",
      });

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: false });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("File Excel kosong atau tidak memiliki lembar kerja (sheet).");
      }

      const sheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      if (!rawRows || rawRows.length === 0) {
        throw new Error("File Excel tidak memiliki baris data untuk diimpor.");
      }

      const totalRows = rawRows.length;

      onProgress({
        fileName,
        fileSize,
        status: "uploading",
        progressPercentage: 45,
        message: `Mempersiapkan ${totalRows.toLocaleString("id-ID")} baris data untuk dikirim ke database (Mode Replace)...`,
      });

      // 2. Kirim berkas ke API Endpoint
      const formData = new FormData();
      formData.append("file", file);

      onProgress({
        fileName,
        fileSize,
        status: "uploading",
        progressPercentage: 70,
        message: `Mengirim dan me-replace data di database PostgreSQL...`,
      });

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Server merespon error HTTP ${res.status}`);
      }

      onProgress({
        fileName,
        fileSize,
        status: "success",
        progressPercentage: 100,
        message: data.message || "File Excel Sulam berhasil diunggah dan database telah diganti.",
        result: data.data,
      });

      return true;
    } catch (error: any) {
      console.error("Upload Sulam error:", error);
      onProgress({
        fileName,
        fileSize,
        status: "error",
        progressPercentage: 100,
        message: error.message || "Terjadi kesalahan saat memproses file Excel Sulam.",
      });
      return false;
    }
  },

  /**
   * Unduh file template Excel Sulam resmi
   */
  downloadTemplate() {
    window.open("/api/admin/template", "_blank");
  },

  /**
   * Reset seluruh data di database Sulam (Mengosongkan tabel transaksi dan summary)
   */
  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      return await res.json();
    } catch (err: any) {
      console.error("Error reset database Sulam:", err);
      return { success: false, message: err.message || "Gagal mengosongkan database Sulam." };
    }
  },
};

