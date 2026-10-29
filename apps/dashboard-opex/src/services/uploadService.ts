import { UploadProgress, DataSourceCategory } from "@/types/sourceData";
import * as XLSX from "xlsx";

export { type DataSourceCategory } from "@/types/sourceData";

const CHUNK_SIZE = 3000; // 3.000 baris per batch (~1 MB JSON payload)

export const uploadService = {
  async uploadSourceFile(
    category: DataSourceCategory,
    file: File,
    onProgress: (progress: UploadProgress) => void
  ): Promise<boolean> {
    const fileName = file.name;
    const fileSize = file.size;
    const categoryKey = category === "Data Budget" ? "budget" : "actual";

    try {
      // 1. Fase Membaca Excel di Browser
      onProgress({
        fileName,
        fileSize,
        status: "validating",
        progressPercentage: 5,
        message: "Membaca dan memverifikasi berkas Excel...",
      });

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
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
      const totalChunks = Math.ceil(totalRows / CHUNK_SIZE);

      onProgress({
        fileName,
        fileSize,
        status: "uploading",
        progressPercentage: 10,
        message: `Mempersiapkan pengiriman ${totalRows.toLocaleString("id-ID")} baris dalam ${totalChunks} batch...`,
      });

      // 2. Fase Pengiriman Bertahap (Chunking / Batching)
      for (let i = 0; i < totalChunks; i++) {
        const chunkRows = rawRows.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const isFirstChunk = i === 0;
        const isLastChunk = i === totalChunks - 1;

        const startRow = i * CHUNK_SIZE + 1;
        const endRow = Math.min((i + 1) * CHUNK_SIZE, totalRows);
        const percent = Math.min(95, Math.round(10 + ((i + 1) / totalChunks) * 85));

        onProgress({
          fileName,
          fileSize,
          status: isLastChunk ? "validating" : "uploading",
          progressPercentage: percent,
          message: isLastChunk
            ? `Menyimpan batch terakhir & menyinkronkan tabel summary...`
            : `Mengunggah batch ${i + 1} dari ${totalChunks} (baris ${startRow.toLocaleString("id-ID")} - ${endRow.toLocaleString("id-ID")} dari ${totalRows.toLocaleString("id-ID")})...`,
        });

        // Mekanisme retry otomatis hingga 3 kali jika ada fluktuasi jaringan sesaat
        let success = false;
        let lastError = "";

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const res = await fetch("/api/admin/upload", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                category: categoryKey,
                rows: chunkRows,
                chunkIndex: i,
                totalChunks,
                isFirstChunk,
                isLastChunk,
              }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
              throw new Error(data.message || `Server merespon error HTTP ${res.status}`);
            }

            success = true;
            break;
          } catch (err: unknown) {
            lastError = err instanceof Error ? err.message : String(err);
            if (attempt < 3) {
              // Tunggu 1 detik sebelum mencoba lagi
              await new Promise((r) => setTimeout(r, 1000));
            }
          }
        }

        if (!success) {
          throw new Error(`Gagal mengirim batch ${i + 1}/${totalChunks}: ${lastError}`);
        }
      }

      // 3. Fase Sukses Selesai
      onProgress({
        fileName,
        fileSize,
        status: "success",
        progressPercentage: 100,
        message: `Berhasil mengunggah & memproses seluruh ${totalRows.toLocaleString("id-ID")} baris data!`,
      });

      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      onProgress({
        fileName,
        fileSize,
        status: "error",
        progressPercentage: 100,
        message: `Gagal memproses file: ${errorMsg}`,
      });
      return false;
    }
  },

  async resetCategoryData(category: DataSourceCategory): Promise<{ success: boolean; message: string }> {
    const categoryKey = category === "Data Budget" ? "budget" : "actual";

    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categoryKey }),
      });

      const data = await res.json();
      return {
        success: data.success ?? false,
        message: data.message || "Proses reset selesai.",
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Gagal mereset data: ${errorMsg}`,
      };
    }
  },
};
