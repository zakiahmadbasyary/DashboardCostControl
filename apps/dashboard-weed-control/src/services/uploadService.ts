import { UploadProgress, WeedControlCategory } from "@/types/sourceData";
import * as XLSX from "xlsx";

export { type WeedControlCategory } from "@/types/sourceData";

const CHUNK_SIZE = 1000; // 1.000 baris per batch payload agar responsif dan aman dari limit request body

export const uploadService = {
  /**
   * Upload satu jenis file sumber Excel (Data Lokasi, Data Timeline, atau Data Aktivitas)
   */
  async uploadSourceFile(
    category: WeedControlCategory,
    file: File,
    onProgress: (progress: UploadProgress) => void
  ): Promise<boolean> {
    const fileName = file.name;
    const fileSize = file.size;

    let categoryKey = "lokasi";
    if (category === "Data Timeline") categoryKey = "timeline";
    if (category === "Data Aktivitas") categoryKey = "aktivitas";

    try {
      // 1. Membaca file Excel di browser
      onProgress({
        fileName,
        fileSize,
        status: "validating",
        progressPercentage: 10,
        message: "Membaca dan memverifikasi lembar kerja Excel...",
      });

      const arrayBuffer = await file.arrayBuffer();
      // cellDates: false penting agar angka serial Excel tidak tergeser oleh konversi zona waktu
      const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: false });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("Berkas Excel kosong atau tidak memiliki lembar kerja (sheet).");
      }

      const sheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

      if (!rawRows || rawRows.length === 0) {
        throw new Error("Berkas Excel tidak memiliki baris data untuk diimpor.");
      }

      // Deteksi header kolom material dinamis khusus file Data Timeline
      let dynamicMaterialHeaders: string[] = [];
      if (categoryKey === "timeline") {
        const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:A1");
        const headers: string[] = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
          if (cell && cell.v) headers.push(String(cell.v).trim());
        }

        // Cari index kolom "Material" (total biaya material)
        const matIndex = headers.findIndex((h) => /^material$/i.test(h));
        if (matIndex !== -1 && matIndex + 1 < headers.length) {
          dynamicMaterialHeaders = headers.slice(matIndex + 1).filter((h) => h && !h.startsWith("__EMPTY"));
        }
      }

      const totalRows = rawRows.length;
      const totalChunks = Math.ceil(totalRows / CHUNK_SIZE);

      onProgress({
        fileName,
        fileSize,
        status: "uploading",
        progressPercentage: 15,
        message: `Mempersiapkan pengiriman ${totalRows.toLocaleString("id-ID")} baris dalam ${totalChunks} batch...`,
      });

      // 2. Pengiriman Bertahap (Chunking)
      for (let i = 0; i < totalChunks; i++) {
        const chunkRows = rawRows.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const isFirstChunk = i === 0;
        const isLastChunk = i === totalChunks - 1;

        const startRow = i * CHUNK_SIZE + 1;
        const endRow = Math.min((i + 1) * CHUNK_SIZE, totalRows);
        const percent = Math.min(95, Math.round(15 + ((i + 1) / totalChunks) * 80));

        onProgress({
          fileName,
          fileSize,
          status: isLastChunk ? "validating" : "uploading",
          progressPercentage: percent,
          message: isLastChunk
            ? `Menyimpan batch terakhir & menjalankan transaksi Replace database...`
            : `Mengunggah batch ${i + 1} dari ${totalChunks} (baris ${startRow.toLocaleString("id-ID")} - ${endRow.toLocaleString("id-ID")})...`,
        });

        // Retry hingga 3 kali
        let success = false;
        let lastError = "";

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const res = await fetch("/api/admin/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                category: categoryKey,
                rows: chunkRows,
                dynamicMaterialHeaders,
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
          } catch (err: any) {
            lastError = err.message || "Gagal menghubungi server";
            if (attempt < 3) {
              await new Promise((r) => setTimeout(r, 1200 * attempt));
            }
          }
        }

        if (!success) {
          throw new Error(`Gagal pada batch ${i + 1}/${totalChunks}: ${lastError}`);
        }
      }

      onProgress({
        fileName,
        fileSize,
        status: "success",
        progressPercentage: 100,
        message: `Berhasil mengimpor dan me-replace ${totalRows.toLocaleString("id-ID")} baris data ${category}!`,
      });

      return true;
    } catch (err: any) {
      onProgress({
        fileName,
        fileSize,
        status: "error",
        progressPercentage: 100,
        message: err.message || "Terjadi kesalahan saat mengunggah file.",
      });
      return false;
    }
  },

  /**
   * Reset data kategori tertentu di database
   */
  async resetCategoryData(category: WeedControlCategory | "all"): Promise<{ success: boolean; message: string }> {
    let categoryKey = "all";
    if (category === "Data Lokasi") categoryKey = "lokasi";
    if (category === "Data Timeline") categoryKey = "timeline";
    if (category === "Data Aktivitas") categoryKey = "aktivitas";

    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categoryKey }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal mereset data.");
      }

      return { success: true, message: data.message || "Data berhasil direset." };
    } catch (err: any) {
      return { success: false, message: err.message || "Terjadi kesalahan server saat mereset data." };
    }
  },

  /**
   * Unduh file template Excel sesuai kategori
   */
  downloadTemplate(categoryKey: "lokasi" | "timeline" | "aktivitas") {
    window.open(`/api/admin/template?category=${categoryKey}`, "_blank");
  },
};

