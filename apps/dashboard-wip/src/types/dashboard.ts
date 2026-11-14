export interface DashboardFilter {
  status: string;
  jenisBibit: string;
  kelasBibit: string;
  groupCost: string;
}

export interface LocationFilter {
  umur: number | number[] | string | string[];
  wilayah: string | string[];
}

export interface TrendDataPoint {
  umur: number; // 0..21
  [wilayah: string]: number; // e.g. AW01: 12.5, AW02: 11.8
}

export interface LocationData {
  idLokasi: string;
  lokasi: string;
  wilayah: string;
  umur: number;
  kelas: string; // Besar, Sedang, Kecil
  kelasBibit?: string;
  jenisBibit: string; // Sucker, Crown, Nursery
  groupCost: string;
  cost: number;
  costHa: number;
  luas: number;
  status: string;
  codeSbt?: string;
  pupuk?: string; // Kompos, Tanpa Kompos
}

export interface GroupCostData {
  groupCost: string;
  costHa: number;
  sbt: number;
  codeSbt?: string;
}

export interface ActivityData {
  idAktivitas: string;
  aktivitas: string;
  kelas: string;
  kelasBibit?: string;
  cost: number;
  biaya?: number;
  luas: number;
  costHa: number; // Cost / Luas
  groupCost: string;
  lokasi?: string;
  status?: string;
  wilayah?: string;
}

export interface HistoryActivityData {
  rowLabels: string;
  tanggalRealisasi: number;
  lokasi: string;
  kodeAktifitas: string;
  deskripsi: string;
  actCostGroup: string;
  satuanHasil?: string | null;
  costCharge: number;
  hasilCharge: number;
  costMaterial: number;
  hasilMaterial: number;
  costUpah: number;
  hasilUpah: number;
  costTotal: number;
  hasilTotal: number;
}

export interface KelengkapanData {
  id: number;
  rowLabels: string;
  group: string;
  kodeBahan: string;
  deskripsiBahan?: string | null;
  satuanHasil?: string | null;
  sumHasil: number;
  sumResource: number;
  sumBiaya: number;
}

export interface AkumBahanData {
  id: number;
  lokasi: string;
  kodeMaterial: string;
  deskripsiMaterial: string;
  quantity: number;
}
