export interface LocationSourceItem {
  id: string;
  lokasi: string;
  status: string;
  kelasBibit: string; // Besar, Sedang, Kecil
  jenisBibit: string; // Sucker, Crown, Nursery
  umur: number; // 0..21
  luas: number;
  groupCost: string;
  cost: number;
  codeSbt: string; // status + pupuk + kelasBibit + jenisBibit + groupCost + umur
  pupuk: string; // Kompos, Tanpa Kompos
  wilayah: string;
  costHa: number;
  keteranganGc?: string;
}

export interface SbtSourceItem {
  id: string;
  codeSbt: string;
  status: string;
  pupuk: string;
  jenis: string;
  kelas: string;
  groupCost: string;
  umur: number;
  nilaiSbt: number;
  keterangan?: string;
}

export interface ActivitySourceItem {
  id: string;
  lokasi: string;
  status: string;
  wilayah: string;
  luas: number;
  kelasBibit: string;
  aktivitas: string;
  biaya: number;
  groupCost: string;
  idAktivitas?: string;
  costHa: number; // Biaya / Luas
  keteranganGc?: string;
}

export type UploadStatus = "idle" | "uploading" | "success" | "error" | "validating";

export interface UploadProgress {
  fileName: string;
  fileSize: number;
  status: UploadStatus;
  progressPercentage: number;
  message?: string;
}
