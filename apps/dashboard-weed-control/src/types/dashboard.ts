// Tipe Data untuk Dashboard Weed Control GGP

export interface MainFilterState {
  aktivitas: string; // "Total Aktivitas" atau nama aktivitas spesifik
  status: string; // "NS", "NSFC", "NSSC", atau "all"
}

export interface TrendRawMetric {
  totalBiaya: number;
  totalLuas: number;
  costHa: number | null;
}

export interface TrendDataPoint {
  umur: number;
  [wilayah: string]: number | null | any;
  raw?: Record<string, TrendRawMetric>;
}

export interface LocationFilterState {
  umur: number[] | "all";
  wilayah: string[] | "all";
  search?: string;
}

export interface LocationItem {
  lokasi: string;
  wilayah: string;
  umur: number;
  luas: number;
  status: string;
  jenis: string;
  kelas: string;
  totalCost: number;
  costHa: number;
}

export interface LocationDetail {
  lokasi: string;
  wilayah: string;
  status: string;
  luas: number;
  jenis: string;
  kelas: string;
  umur: number;
  totalCost?: number | null;
  mulaiRawat?: string | null;
  mulaiTanam?: string | null;
  forcingStandar?: string | null;
  realForcing?: string | null;
  selesaiPanen?: string | null;
  umurForcing?: number | null;
}

export interface ActivityCostItem {
  aktivitas: string;
  totalBiaya: number;
  costHa: number;
}

export interface AgeCostDataPoint {
  umur: number;
  costHa: number | null;
  kumulatifCostHa: number | null;
  rawCost: number;
  luas: number;
}

export interface TimelineItem {
  id: string;
  lokasi: string;
  awalRawat?: string | null;
  aktivitas: string;
  tanggalRealisasi?: string | null;
  umur?: number | null;
  hasil?: number | null;
  uom?: string | null;
  tk?: number | null;
  kapasitasPerTk?: number | null;
  totalCost?: number | null;
  upah?: number | null;
  charge?: number | null;
  material?: number | null;
  hasMaterials: boolean;
}

export interface MaterialItem {
  id: string;
  namaMaterial: string;
  quantity: number;
}

