import { CapexUploadCategory, UploadProgress } from "@/types/admin";

export const capexUploadService = {
  getCategoryKey(category: CapexUploadCategory): string {
    switch (category) {
      case "Data Created":
        return "created";
      case "Data PO":
        return "po";
      case "Data Budget":
        return "budget";
      case "Data Purchasing":
        return "purchasing";
      case "Data Kategori":
        return "kategori";
      case "User Approver":
        return "approver";
      default:
        return "";
    }
  },

  async uploadSourceFile(
    category: CapexUploadCategory,
    file: File,
    onProgress: (progress: UploadProgress) => void
  ): Promise<boolean> {
    const fileName = file.name;
    const fileSize = file.size;
    const categoryKey = this.getCategoryKey(category);

    // Phase 1: Uploading
    onProgress({
      fileName,
      fileSize,
      status: "uploading",
      progressPercentage: 25,
      message: "Mengunggah file ke server...",
    });

    try {
      const formData = new FormData();
      formData.append("category", categoryKey);
      formData.append("file", file);

      // Phase 2: Processing in memory & updating DB
      onProgress({
        fileName,
        fileSize,
        status: "validating",
        progressPercentage: 65,
        message: "Membaca file di memori & memperbarui database...",
      });

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      let data: { success?: boolean; message?: string; importedCount?: number } = {};
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
        message: data.message || "Berhasil memperbarui data.",
      });
      return true;
    } catch (err: unknown) {
      onProgress({
        fileName,
        fileSize,
        status: "error",
        progressPercentage: 100,
        message: err instanceof Error ? err.message : "Koneksi jaringan terputus saat mengunggah file.",
      });
      return false;
    }
  },

  async resetCategoryData(category: CapexUploadCategory): Promise<{ success: boolean; message: string }> {
    const categoryKey = this.getCategoryKey(category);
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categoryKey }),
      });

      const data = await res.json();
      return {
        success: data.success ?? false,
        message: data.message || (data.success ? "Berhasil mengosongkan tabel." : "Gagal mengosongkan tabel."),
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Gagal menghubungi server untuk reset data.",
      };
    }
  },
};
