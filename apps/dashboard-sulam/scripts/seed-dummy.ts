import { prisma } from "../src/lib/prisma";

// Daftar Wilayah per PG
const PG_WILAYAH_MAP: Record<string, string[]> = {
  PG1: ["AW01", "AW02", "AW03", "AW04", "AW05", "AW06", "AW07"],
  PG2: ["AW08", "AW09", "AW10", "AW11", "AW12", "AW13", "AW14", "AW15"],
  PG3: ["AW16", "AW17", "AW18", "AW19", "AW20", "AW21", "AW22", "AW23"],
};

// Lokasi perkebunan per wilayah PG1 (untuk detail tabel Bagian 3)
const WILAYAH_LOCATIONS: Record<string, string[]> = {
  AW01: ["01A", "01B", "02A", "02C", "03A", "04B", "05A", "06C", "07A", "08B", "09A", "10C"],
  AW02: ["11A", "12B", "13A", "14C", "15A", "16B", "17A", "18C", "19A", "20B"],
  AW03: ["21A", "22B", "23A", "24C", "25A", "26B", "27A", "28C", "29B"],
  AW04: ["31A", "32B", "33A", "34C", "35A", "36B", "37A", "38C"],
  AW05: ["41A", "42B", "43A", "44C", "45A", "46B", "47A", "48C"],
  AW06: ["51A", "52B", "53A", "54C", "55A", "56B", "57A", "58B"],
  AW07: ["61A", "62B", "63A", "64C", "65A", "66B", "67A", "68C"],
};

// Generic locations untuk PG2 dan PG3
const DEFAULT_LOCATIONS = ["01A", "02B", "03A", "04C", "05B", "06A", "07C", "08A"];

const STATUS_TANAMAN = ["PC", "1R", "2R", "3R"];
const KODE_AKTIVITAS = ["SLM-01", "SLM-02", "SLM-03"];

// Seed random generator dengan deterministik seed agar konsisten
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

async function main() {
  console.log("=== Memulai Generate Data Dummy SULAM ===");

  // 1. Bersihkan data lama terlebih dahulu
  console.log("Membersihkan data transaksi & summary lama...");
  await prisma.sulam.deleteMany({});
  await prisma.summarySulam.deleteMany({});

  const years = [2025, 2026];
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  let spkCounter = 1000;
  let seedIndex = 42;

  const allSummaryRecords: any[] = [];
  const allSulamRecords: any[] = [];

  for (const year of years) {
    console.log(`Memproses tahun ${year}...`);

    for (const month of months) {
      for (const [pg, wilayahList] of Object.entries(PG_WILAYAH_MAP)) {
        for (const wilayah of wilayahList) {
          const kode = `${pg}-${wilayah}-${year}-${month}`;
          const locations = WILAYAH_LOCATIONS[wilayah] || DEFAULT_LOCATIONS;

          // Hitung akumulator untuk summary
          let summaryMaterial = 0;
          let summaryUpah = 0;
          let summaryBatang = 0;
          let summaryJumlahTk = 0;
          let summaryLuas = 0;

          // Buat 3 hingga 6 transaksi per lokasi per bulan
          // Khusus PG1 kita buat lokasi lebih padat untuk mengisi pagination tabel
          const numLocationsToPick = pg === "PG1" ? locations.length : Math.min(locations.length, 4);

          for (let locIdx = 0; locIdx < numLocationsToPick; locIdx++) {
            const lokasi = locations[locIdx];
            seedIndex++;

            // Tanggal realisasi dalam bulan bersangkutan (hari 1-28)
            const day = Math.floor(seededRandom(seedIndex) * 27) + 1;
            const tanggalRealisasi = new Date(year, month - 1, day);
            const tanggalSpk = new Date(year, month - 1, Math.max(1, day - 3));

            const statusTanaman = STATUS_TANAMAN[Math.floor(seededRandom(seedIndex + 1) * STATUS_TANAMAN.length)];
            const kodeAktivitas = KODE_AKTIVITAS[Math.floor(seededRandom(seedIndex + 2) * KODE_AKTIVITAS.length)];

            // Luas HA per transaksi (0.4 - 3.5 HA)
            const luasHa = Number((0.5 + seededRandom(seedIndex + 3) * 2.5).toFixed(2));

            // Tenaga Kerja (4 - 25 TK)
            const tk = Number((4 + seededRandom(seedIndex + 4) * 18).toFixed(1));

            // Batang Bibit (proporsional terhadap TK dan Luas: 80-140 batang/TK)
            const batangPerTk = 85 + Math.floor(seededRandom(seedIndex + 5) * 50);
            const batangBibit = Math.round(tk * batangPerTk);

            // Biaya Upah: Rp 85.000 - Rp 110.000 per TK
            const tarifUpah = 92000 + Math.floor(seededRandom(seedIndex + 6) * 15000);
            const biayaUpah = Math.round(tk * tarifUpah);

            // Biaya Material: Rp 3.200 - Rp 4.500 per batang bibit
            const hargaBibit = 3500 + Math.floor(seededRandom(seedIndex + 7) * 900);
            const biayaMaterial = Math.round(batangBibit * hargaBibit);

            spkCounter++;
            const spkUpah = `SPK-${year}${String(month).padStart(2, "0")}-${spkCounter}`;
            spkCounter++;
            const spkMaterial = `SPK-${year}${String(month).padStart(2, "0")}-${spkCounter}`;

            // 1. Transaksi UPAH
            allSulamRecords.push({
              tanggalRealisasi,
              spkId: spkUpah,
              plantationGroup: pg,
              wilayah,
              lokasi,
              statusTanaman,
              tanggalSpk,
              kodeAktivitas,
              deskripsi: `Penyulaman Tanaman Ulang Upah Manual Blok ${lokasi}`,
              jenisData: "Upah",
              groupBahanAlat: "Tenaga Kerja Langsung",
              kodeBahanAlatLainlain: "TK-SULAM",
              deskripsiBahanAlatLainlain: "Tenaga Kerja Harian Lepas Sulam",
              resourceBahanAlat: tk,
              hasilEfektif: luasHa,
              satuanHasil: "HA",
              totalRealisasiBiaya: biayaUpah,
              referensiLokasi: `${wilayah}-${lokasi}`,
              costCenterName: `CC-${wilayah}`,
              costWorkingHour: 18500,
              indeksBiaya: Number((biayaUpah / luasHa).toFixed(2)),
              indexResourceQty: Number((tk / luasHa).toFixed(2)),
              pasDocument: `PAS-${year}${month}-${locIdx}`,
              orderNo: `ORD-${year}${month}-${locIdx}`,
              actCostGroup: "UPAH_SULAM",
              jenis: "Upah",
              pg,
              year,
              month,
              kode,
            });

            // 2. Transaksi MATERIAL
            allSulamRecords.push({
              tanggalRealisasi,
              spkId: spkMaterial,
              plantationGroup: pg,
              wilayah,
              lokasi,
              statusTanaman,
              tanggalSpk,
              kodeAktivitas,
              deskripsi: `Bibit Nanas Pemeliharaan Sulam Blok ${lokasi}`,
              jenisData: "Material",
              groupBahanAlat: "Bibit & Bahan Tanaman",
              kodeBahanAlatLainlain: "BBT-NN-MD2",
              deskripsiBahanAlatLainlain: "Bibit Mahkota Nanas MD2 Grade A",
              resourceBahanAlat: batangBibit,
              hasilEfektif: luasHa,
              satuanHasil: "HA",
              totalRealisasiBiaya: biayaMaterial,
              referensiLokasi: `${wilayah}-${lokasi}`,
              costCenterName: `CC-${wilayah}`,
              costWorkingHour: 0,
              indeksBiaya: Number((biayaMaterial / luasHa).toFixed(2)),
              indexResourceQty: Number((batangBibit / luasHa).toFixed(2)),
              pasDocument: `PAS-${year}${month}-${locIdx}-M`,
              orderNo: `ORD-${year}${month}-${locIdx}-M`,
              actCostGroup: "MATERIAL_SULAM",
              jenis: "Material",
              pg,
              year,
              month,
              kode,
            });

            summaryUpah += biayaUpah;
            summaryMaterial += biayaMaterial;
            summaryBatang += batangBibit;
            summaryJumlahTk += tk;
            summaryLuas += luasHa;
          }

          // Buat record SummarySulam untuk kode ini
          allSummaryRecords.push({
            kode,
            pg,
            wilayah,
            year,
            month,
            material: summaryMaterial,
            upah: summaryUpah,
            batang: summaryBatang,
            jumlahTk: Number(summaryJumlahTk.toFixed(2)),
            luas: Number(summaryLuas.toFixed(2)),
          });
        }
      }
    }
  }

  console.log(`Menyimpan ${allSummaryRecords.length} baris summary_sulam...`);
  // Batch insert summary (chunk 500)
  for (let i = 0; i < allSummaryRecords.length; i += 500) {
    const chunk = allSummaryRecords.slice(i, i + 500);
    await prisma.summarySulam.createMany({ data: chunk });
  }

  console.log(`Menyimpan ${allSulamRecords.length} baris transaksi sulam...`);
  // Batch insert sulam (chunk 500)
  for (let i = 0; i < allSulamRecords.length; i += 500) {
    const chunk = allSulamRecords.slice(i, i + 500);
    await prisma.sulam.createMany({ data: chunk });
  }

  console.log("=== Generate Data Dummy SULAM Selesai ===");
  const finalSummaryCount = await prisma.summarySulam.count();
  const finalTxCount = await prisma.sulam.count();
  console.log({
    finalSummaryCount,
    finalTxCount,
  });
}

main()
  .catch((e) => {
    console.error("Gagal menjalankan seed dummy:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

