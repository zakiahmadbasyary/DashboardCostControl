import { LocationData, GroupCostData, ActivityData, TrendDataPoint } from "@/types/dashboard";
import { mockLocationSourceData } from "@/mocks/sourceData";

// Derive mockLocations directly from mockLocationSourceData in sourceData.ts
export const mockLocations: LocationData[] = mockLocationSourceData.map((item) => ({
  idLokasi: `LOC-${item.id}`,
  lokasi: item.lokasi,
  wilayah: item.wilayah,
  umur: item.umur,
  kelas: item.kelasBibit,
  kelasBibit: item.kelasBibit,
  jenisBibit: item.jenisBibit,
  groupCost: item.groupCost,
  cost: item.cost,
  costHa: item.costHa,
  luas: item.luas,
  status: item.status,
  codeSbt: item.codeSbt,
  pupuk: item.pupuk,
}));

// Fallback baseline trend data (Umur 0..21)
export const mockTrendData: TrendDataPoint[] = Array.from({ length: 22 }, (_, i) => {
  const age = i;
  return {
    umur: age,
    AW01: Math.round((10 + age * 2.8) * 10) / 10,
    AW02: Math.round((9.5 + age * 2.6) * 10) / 10,
    AW03: Math.round((11 + age * 2.9) * 10) / 10,
    AW04: Math.round((10.2 + age * 2.7) * 10) / 10,
    AW05: Math.round((12 + age * 3.1) * 10) / 10,
    AW06: Math.round((8.8 + age * 2.5) * 10) / 10,
    AW07: Math.round((10.5 + age * 2.85) * 10) / 10,
  };
});

export const mockGroupCostsMap: Record<string, GroupCostData[]> = {
  "001A": [
    { groupCost: "Land Preparation", costHa: 3500000, sbt: 3600000 },
    { groupCost: "Fertilization", costHa: 4100000, sbt: 4000000 },
    { groupCost: "Road and Drainage", costHa: 1400000, sbt: 1500000 },
    { groupCost: "Weed Control", costHa: 1700000, sbt: 1800000 },
    { groupCost: "Planting", costHa: 1800000, sbt: 1900000 },
  ],
  "002A": [
    { groupCost: "Planting", costHa: 4200000, sbt: 4000000 },
    { groupCost: "Fertilization", costHa: 4500000, sbt: 4300000 },
    { groupCost: "Weed Control", costHa: 2100000, sbt: 2000000 },
  ],
  "010A": [
    { groupCost: "Fertilization", costHa: 4200000, sbt: 4000000 },
    { groupCost: "Road and Drainage", costHa: 1500000, sbt: 1600000 },
    { groupCost: "Maintenance", costHa: 2100000, sbt: 2100000 },
    { groupCost: "Harvesting", costHa: 1300000, sbt: 1200000 },
    { groupCost: "Weed Control", costHa: 1800000, sbt: 1900000 },
  ],
  "011B": [
    { groupCost: "Road and Drainage", costHa: 3800000, sbt: 3600000 },
    { groupCost: "Fertilization", costHa: 4500000, sbt: 4200000 },
    { groupCost: "Plant Pest Control", costHa: 2400000, sbt: 2500000 },
    { groupCost: "Planting", costHa: 1900000, sbt: 1800000 },
  ],
  "012F": [
    { groupCost: "Plant Pest Control", costHa: 4800000, sbt: 4500000 },
    { groupCost: "Road and Drainage", costHa: 2100000, sbt: 2000000 },
    { groupCost: "Fertilization", costHa: 5100000, sbt: 5000000 },
    { groupCost: "Land Preparation", costHa: 2800000, sbt: 2900000 },
  ],
  "013C": [
    { groupCost: "Weed Control", costHa: 3900000, sbt: 4000000 },
    { groupCost: "Fertilization", costHa: 4100000, sbt: 4100000 },
    { groupCost: "Maintenance", costHa: 1900000, sbt: 2000000 },
  ],
  "014D": [
    { groupCost: "Harvesting", costHa: 6200000, sbt: 6000000 },
    { groupCost: "Road and Drainage", costHa: 2900000, sbt: 2800000 },
    { groupCost: "Plant Pest Control", costHa: 3500000, sbt: 3600000 },
  ],
  "015E": [
    { groupCost: "Land Preparation", costHa: 7100000, sbt: 6900000 },
    { groupCost: "Planting", costHa: 4300000, sbt: 4400000 },
    { groupCost: "Fertilization", costHa: 5200000, sbt: 5000000 },
  ],
  "016G": [
    { groupCost: "Planting", costHa: 3800000, sbt: 3900000 },
    { groupCost: "Weed Control", costHa: 2400000, sbt: 2500000 },
    { groupCost: "Fertilization", costHa: 3600000, sbt: 3500000 },
  ],
  "017H": [
    { groupCost: "Maintenance", costHa: 7800000, sbt: 7500000 },
    { groupCost: "Harvesting", costHa: 5900000, sbt: 6000000 },
    { groupCost: "Road and Drainage", costHa: 3100000, sbt: 3000000 },
  ],
};

export const mockActivitiesMap: Record<string, ActivityData[]> = {
  "Fertilization": [
    { idAktivitas: "ACT-101", aktivitas: "Aplikasi NPK Granul Phase 1", kelas: "Besar", kelasBibit: "Besar", cost: 18500000, luas: 10.0, costHa: 1850000, groupCost: "Fertilization" },
    { idAktivitas: "ACT-102", aktivitas: "Pemupukan Foliar Mikro Element", kelas: "Sedang", kelasBibit: "Sedang", cost: 13500000, luas: 10.0, costHa: 1350000, groupCost: "Fertilization" },
    { idAktivitas: "ACT-103", aktivitas: "Pengapuran Kalsit / Dolomit Subsoil", kelas: "Besar", kelasBibit: "Besar", cost: 10000000, luas: 10.0, costHa: 1000000, groupCost: "Fertilization" },
  ],
  "Road and Drainage": [
    { idAktivitas: "ACT-201", aktivitas: "Pembersihan Parit Utama Block A", kelas: "Besar", kelasBibit: "Besar", cost: 5400000, luas: 12.0, costHa: 450000, groupCost: "Road and Drainage" },
    { idAktivitas: "ACT-202", aktivitas: "Perbaikan Jalan Panen Koridor", kelas: "Sedang", kelasBibit: "Sedang", cost: 10200000, luas: 12.0, costHa: 850000, groupCost: "Road and Drainage" },
    { idAktivitas: "ACT-203", aktivitas: "Rawat Jembatan Kayu / Gorong-gorong", kelas: "Besar", kelasBibit: "Besar", cost: 2400000, luas: 12.0, costHa: 200000, groupCost: "Road and Drainage" },
  ],
  "Plant Pest Control": [
    { idAktivitas: "ACT-301", aktivitas: "Spraying Insektisida Pengerek Batang", kelas: "Besar", kelasBibit: "Besar", cost: 21450000, luas: 13.0, costHa: 1650000, groupCost: "Plant Pest Control" },
    { idAktivitas: "ACT-302", aktivitas: "Pemasangan Perangkap Feromon Hama", kelas: "Sedang", kelasBibit: "Sedang", cost: 9750000, luas: 13.0, costHa: 750000, groupCost: "Plant Pest Control" },
    { idAktivitas: "ACT-303", aktivitas: "Sanitasi Buah Terserang Jamur", kelas: "Kecil", kelasBibit: "Kecil", cost: 5200000, luas: 13.0, costHa: 400000, groupCost: "Plant Pest Control" },
  ],
  "Weed Control": [
    { idAktivitas: "ACT-401", aktivitas: "Babat Rumput Manual Antar Barisan", kelas: "Sedang", kelasBibit: "Sedang", cost: 8550000, luas: 9.0, costHa: 950000, groupCost: "Weed Control" },
    { idAktivitas: "ACT-402", aktivitas: "Herbisida Kontak Gulma Daun Lebar", kelas: "Besar", kelasBibit: "Besar", cost: 12600000, luas: 9.0, costHa: 1400000, groupCost: "Weed Control" },
  ],
  "Planting": [
    { idAktivitas: "ACT-501", aktivitas: "Penanaman Bibit Crown / Sucker", kelas: "Besar", kelasBibit: "Besar", cost: 17600000, luas: 8.0, costHa: 2200000, groupCost: "Planting" },
    { idAktivitas: "ACT-502", aktivitas: "Penyulaman Tanaman Mati Block C", kelas: "Sedang", kelasBibit: "Sedang", cost: 6400000, luas: 8.0, costHa: 800000, groupCost: "Planting" },
  ],
  "Land Preparation": [
    { idAktivitas: "ACT-601", aktivitas: "Bajak Lahan Heavy Tractor", kelas: "Besar", kelasBibit: "Besar", cost: 56000000, luas: 16.0, costHa: 3500000, groupCost: "Land Preparation" },
    { idAktivitas: "ACT-602", aktivitas: "Garuk & Ridging Guludan Tanaman", kelas: "Besar", kelasBibit: "Besar", cost: 36800000, luas: 16.0, costHa: 2300000, groupCost: "Land Preparation" },
  ],
  "Maintenance": [
    { idAktivitas: "ACT-701", aktivitas: "Kastrasi Bunga Pertama", kelas: "Besar", kelasBibit: "Besar", cost: 19200000, luas: 16.0, costHa: 1200000, groupCost: "Maintenance" },
    { idAktivitas: "ACT-702", aktivitas: "Pruning Daun Kering Lapangan", kelas: "Sedang", kelasBibit: "Sedang", cost: 24000000, luas: 16.0, costHa: 1500000, groupCost: "Maintenance" },
  ],
  "Harvesting": [
    { idAktivitas: "ACT-801", aktivitas: "Panen Buah Segar Kelas Super", kelas: "Besar", kelasBibit: "Besar", cost: 48000000, luas: 15.0, costHa: 3200000, groupCost: "Harvesting" },
    { idAktivitas: "ACT-802", aktivitas: "Angkut Buah ke Tempat Pengumpulan", kelas: "Sedang", kelasBibit: "Sedang", cost: 27000000, luas: 15.0, costHa: 1800000, groupCost: "Harvesting" },
  ],
};
