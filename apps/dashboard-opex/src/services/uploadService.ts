import { UploadProgress, DataSourceCategory } from "@/types/sourceData";

export { type DataSourceCategory } from "@/types/sourceData";

export const uploadService = {
  async uploadSourceFile(
    category: DataSourceCategory,
    file: File,
    onProgress: (progress: UploadProgress) => void
  ): Promise<boolean> {
    const fileName = file.name;
    const fileSize = file.size;

    const categoryKey = category === "Data Budget" ? "budget" : "actual";

    // Phase 1: Uploading
    onProgress({
      fileName,
      fileSize,
      status: "uploading",
      progressPercentage: 25,
      message: "Mengunggah file ke server...",
    });

    try {
      // Bersihkan nama file dari spasi, tanda kurung, dan karakter non-alphanumeric agar aman bagi multipart parser
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const safeFile = new File([file], safeName, { type: file.type });

      const formData = new FormData();
      formData.append("category", categoryKey);
      formData.append("file", safeFile);

      // Phase 2: Processing & Validating
      onProgress({
        fileName,
        fileSize,
        status: "validating",
        progressPercentage: 60,
        message: "Membaca data Excel, memvalidasi kolom, & menyinkronkan Summary OPEX...",
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
          message: data.message || "Gagal memproses file Excel.",
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
