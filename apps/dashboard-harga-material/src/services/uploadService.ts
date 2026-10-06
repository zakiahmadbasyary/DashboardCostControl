export interface UploadProgress {
  fileName: string;
  fileSize: number;
  status: "idle" | "uploading" | "validating" | "success" | "error";
  progressPercentage: number;
  message: string;
}

export const uploadService = {
  async uploadSourceFile(
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
      progressPercentage: 30,
      message: "Mengunggah file ke server...",
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Phase 2: Processing & Validating
      onProgress({
        fileName,
        fileSize,
        status: "validating",
        progressPercentage: 65,
        message: "Memvalidasi header, membaca Excel/CSV, & memperbarui database...",
      });

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      let data: { success?: boolean; message?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = { success: false, message: `Server error (${res.status}: ${res.statusText}).` };
      }

      if (!res.ok || !data.success) {
        onProgress({
          fileName,
          fileSize,
          status: "error",
          progressPercentage: 100,
          message: data.message || "Gagal memproses file data harga material.",
        });
        return false;
      }

      // Phase 3: Success
      onProgress({
        fileName,
        fileSize,
        status: "success",
        progressPercentage: 100,
        message: data.message || `File ${fileName} berhasil diproses!`,
      });

      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      onProgress({
        fileName,
        fileSize,
        status: "error",
        progressPercentage: 100,
        message: `Terjadi kesalahan saat mengunggah file: ${errorMsg}`,
      });
      return false;
    }
  },

  async resetData(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      return {
        success: Boolean(data.success),
        message: data.message || "Proses reset data selesai.",
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Gagal melakukan reset data: ${errorMsg}`,
      };
    }
  },
};
