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
