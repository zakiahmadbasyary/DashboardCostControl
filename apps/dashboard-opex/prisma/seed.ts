import { PrismaClient, Prisma } from "../src/generated/client/index.js";

const prisma = new PrismaClient();

// ── 1. MASTER COST CENTERS ───────────────────────────────────────────────────
const COST_CENTERS = [
  // PG1 Cost Centers (18 Cost Centers agar memenuhi 16 data [8 kiri + 8 kanan] & ada halaman berikutnya)
  { costcenter: "CC101", deskripsiCostcenter: "Pengolahan Tanah & Persiapan Lahan PG1", isview: true, pg: "PG1", weight: 0.08 },
  { costcenter: "CC102", deskripsiCostcenter: "Irigasi & Tata Air Perkebunan PG1", isview: true, pg: "PG1", weight: 0.06 },
  { costcenter: "CC103", deskripsiCostcenter: "Pemupukan & Pemeliharaan Tanaman PG1", isview: true, pg: "PG1", weight: 0.11 },
  { costcenter: "CC104", deskripsiCostcenter: "Panen & Pengangkutan Hasil PG1", isview: true, pg: "PG1", weight: 0.09 },
  { costcenter: "CC105", deskripsiCostcenter: "Armada Traktor & Alat Berat PG1", isview: true, pg: "PG1", weight: 0.07 },
  { costcenter: "CC106", deskripsiCostcenter: "Bengkel & Workshop Lapangan PG1", isview: true, pg: "PG1", weight: 0.05 },
  { costcenter: "CC107", deskripsiCostcenter: "Pembibitan & Nursery Nanas PG1", isview: true, pg: "PG1", weight: 0.06 },
  { costcenter: "CC108", deskripsiCostcenter: "Pengendalian Hama & Penyakit PG1", isview: true, pg: "PG1", weight: 0.07 },
  { costcenter: "CC109", deskripsiCostcenter: "Penyiangan Gulma & Herbisida PG1", isview: true, pg: "PG1", weight: 0.05 },
  { costcenter: "CC110", deskripsiCostcenter: "Pemeliharaan Jalan Kebun & Jembatan PG1", isview: true, pg: "PG1", weight: 0.05 },
  { costcenter: "CC111", deskripsiCostcenter: "Konservasi Lahan & Drainase Utama PG1", isview: true, pg: "PG1", weight: 0.05 },
  { costcenter: "CC112", deskripsiCostcenter: "Aplikasi Hormon & Forcing PG1", isview: true, pg: "PG1", weight: 0.06 },
  { costcenter: "CC113", deskripsiCostcenter: "Pengawasan Agronomi & Mutu Buah PG1", isview: true, pg: "PG1", weight: 0.04 },
  { costcenter: "CC114", deskripsiCostcenter: "Sarana & Prasarana Lapangan PG1", isview: true, pg: "PG1", weight: 0.04 },
  { costcenter: "CC115", deskripsiCostcenter: "Gudang Saprotan & Logistik Kebun PG1", isview: true, pg: "PG1", weight: 0.04 },
  { costcenter: "CC116", deskripsiCostcenter: "Keamanan & Perlindungan Kebun PG1", isview: true, pg: "PG1", weight: 0.03 },
  { costcenter: "CC117", deskripsiCostcenter: "Pompa Air & Sumur Dalam PG1", isview: true, pg: "PG1", weight: 0.03 },
  { costcenter: "CC118", deskripsiCostcenter: "Manajemen Limbah Organik & Kompos PG1", isview: true, pg: "PG1", weight: 0.02 },

  // PG2 Cost Centers
  { costcenter: "CC201", deskripsiCostcenter: "Operasional Lapangan & Kebun PG2", isview: true, pg: "PG2", weight: 0.58 },
  { costcenter: "CC202", deskripsiCostcenter: "Pemeliharaan & Tata Air PG2", isview: true, pg: "PG2", weight: 0.42 },

  // PG3 Cost Centers
  { costcenter: "CC301", deskripsiCostcenter: "Operasional Lapangan & Kebun PG3", isview: true, pg: "PG3", weight: 0.56 },
  { costcenter: "CC302", deskripsiCostcenter: "Pemeliharaan & Tata Air PG3", isview: true, pg: "PG3", weight: 0.44 },
];

// ── 2. MASTER COST ELEMENT 2 (CE2) DENGAN PROPORSI BOBOT ────────────────────
const COST_ELEMENTS = [
  { ce2: "CE01", deskripsiCe2: "Upah & Tenaga Kerja Lapangan", isview: true, weight: 0.30 },
  { ce2: "CE02", deskripsiCe2: "Pupuk, Agrokimia & Nutrisi", isview: true, weight: 0.26 },
  { ce2: "CE03", deskripsiCe2: "Bahan Bakar & Pelumas Mesin", isview: true, weight: 0.18 },
  { ce2: "CE04", deskripsiCe2: "Suku Cadang & Perbaikan Alat", isview: true, weight: 0.11 },
  { ce2: "CE05", deskripsiCe2: "Jasa Borongan & Kontraktor", isview: true, weight: 0.09 },
  { ce2: "CE06", deskripsiCe2: "Biaya Umum & Operasional Lainnya", isview: true, weight: 0.06 },
];

// ── 3. TARGET ANGGARAN & REALISASI BULANAN PG1 (12 BULAN LENGKAP & BERAGAM) ─
const MONTHLY_TARGETS: Record<number, { actual: number; budget: number }> = {
  1: { actual: 2488000000, budget: 1594000000 },  // +56% Over budget (Awal musim tanam)
  2: { actual: 1394000000, budget: 1600000000 },  // -13% Hemat
  3: { actual: 2180000000, budget: 2438000000 },  // -11% Hemat
  4: { actual: 3290000000, budget: 3570000000 },  // -8% Hemat
  5: { actual: 3750000000, budget: 3573000000 },  // +5% Sedikit over
  6: { actual: 4420000000, budget: 4661000000 },  // -5% Hemat
  7: { actual: 4190000000, budget: 3993000000 },  // +5% Over (Puncak panen)
  8: { actual: 4520000000, budget: 4614000000 },  // -2% Mendekati target
  9: { actual: 3680000000, budget: 3789000000 },  // -3% Hemat
  10: { actual: 4110000000, budget: 4049000000 }, // +1.5%
  11: { actual: 1420000000, budget: 1310000000 }, // +8.4%
  12: { actual: 1650000000, budget: 1715000000 }, // -3.8%
};

const SAMPLE_ACTIVITIES: Record<string, string[]> = {
  CE01: [
    "Upah Tenaga Kerja Borongan Penyiangan Gulma Blok A",
    "Upah Harian Lepas Aplikasi Pupuk Dasar Susulan",
    "Insentif & Lembur Operator Traktor Panen Musim Puncak",
    "Upah Regu Mandor Pengawasan Agronomi & Kualitas Buah",
    "Upah Tenaga Pruning & Pemangkasan Pelepah Kering",
  ],
  CE02: [
    "Pengadaan Pupuk NPK Granular Dosis Rekomendasi Balit",
    "Aplikasi Herbisida Sistemik Pra-Tumbuh Area Gawangan",
    "Nutrisi Daun & Mikro Elemen Organik Fase Vegetatif",
    "Pemberian Kapur Dolomit Pengatur pH Tanah Asam",
    "Aplikasi Fungisida Protektif Pengendali Penyakit Busuk",
  ],
  CE03: [
    "Pengisian Solar Industri Mesin Pompa Irigasi Sub-Station",
    "Bahan Bakar Solar Traktor Roda 4 Olah Tanah",
    "Oli Mesin HD-40 & Pelumas Hidrolik Alat Berat",
    "Bensin Operasional Sepeda Motor Agronomi & Mandor",
    "Bahan Bakar Genset Penerangan Pos Jaga & Bengkel",
  ],
  CE04: [
    "Penggantian Filter Udara, Solar & Oli Traktor MF",
    "Perbaikan Pompa Sentrifugal & Penggantian Seal Sambungan",
    "Penggantian Ban Traktor Depan & Bearing Roda Trailed",
    "Servis Sistem Hidrolik & Penggantian Blade Rotavator",
    "Penggantian Nozzle Sprayer & Selang Tekanan Tinggi",
  ],
  CE05: [
    "Sewa Truk Tronton Ekspedisi Pengangkutan Pupuk dari Pabrik",
    "Jasa Operator Borongan Land Clearing Parit Drainase",
    "Jasa Normalisasi Saluran Pembuangan Air Alami",
    "Subkontraktor Kalibrasi & Servis Timbangan Jembatan Kebun",
    "Jasa Borongan Pembuatan Pintu Air & Tanggul Penahan",
  ],
  CE06: [
    "Pengadaan Peralatan Keselamatan Kerja & APD Mandor Kebun",
    "Konsumsi & Logistik Regu Kerja Lapangan Lembur",
    "Biaya Koordinasi Lapangan & Hubungan Keamanan Desa",
    "Pengadaan Terpal Penutup Buah & Karung Panen Kebun",
    "Alat Tulis Kantor Pos Lapangan & Pembukuan Mandor",
  ],
};

const CURRENT_YEAR = 2026;

// Helper pseudo-random deterministik agar hasil konsisten tapi bervariasi
function pseudoVariation(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return (x - Math.floor(x) - 0.5) * 0.25; // Rentang variasi +/- 12.5%
}

async function main() {
  console.log("🌱 Memulai seeding data beragam & realistis Dashboard OPEX GGP...");

  await prisma.summary.deleteMany();
  await prisma.dataActual.deleteMany();
  await prisma.dataBudget.deleteMany();
  await prisma.mastersheetCe2.deleteMany();
  await prisma.mastersheetCostcenter.deleteMany();

  console.log("📁 Menambahkan Master Cost Center & CE2...");
  await prisma.mastersheetCostcenter.createMany({
    data: COST_CENTERS.map(({ costcenter, deskripsiCostcenter, isview }) => ({
      costcenter,
      deskripsiCostcenter,
      isview,
    })),
  });

  await prisma.mastersheetCe2.createMany({
    data: COST_ELEMENTS.map(({ ce2, deskripsiCe2, isview }) => ({
      ce2,
      deskripsiCe2,
      isview,
    })),
  });

  const dataBudgetRecords: Prisma.DataBudgetCreateManyInput[] = [];
  const dataActualRecords: Prisma.DataActualCreateManyInput[] = [];
  const summaryRecords: Prisma.SummaryCreateManyInput[] = [];

  let docCounter = 1000;

  for (let periode = 1; periode <= 12; periode++) {
    const target = MONTHLY_TARGETS[periode];
    const monthDate = new Date(CURRENT_YEAR, periode - 1, 1);

    // Iterasi setiap Cost Center
    for (let ccIdx = 0; ccIdx < COST_CENTERS.length; ccIdx++) {
      const cc = COST_CENTERS[ccIdx];
      const isPg1 = cc.pg === "PG1";

      for (let ceIdx = 0; ceIdx < COST_ELEMENTS.length; ceIdx++) {
        const ce = COST_ELEMENTS[ceIdx];

        // 1. Hitung Nilai Budget Berbobot
        // Proporsi gabungan bobot Cost Center dan Cost Element
        const combinedWeight = cc.weight * ce.weight;
        // Variasi musiman alami
        const varFactor = 1 + pseudoVariation(periode * 100 + ccIdx * 10 + ceIdx);
        let comboBudget = Math.round((target.budget * combinedWeight * varFactor) / 10000) * 10000;
        if (comboBudget < 2000000) comboBudget = 2000000; // Minimum 2 Juta

        const budgetKode = `${periode}${cc.costcenter}${ce.ce2}`;
        dataBudgetRecords.push({
          kode: budgetKode,
          costcenter: cc.costcenter,
          deskripsiCostcenter: cc.deskripsiCostcenter,
          ce2: ce.ce2,
          deskripsiCe2: ce.deskripsiCe2,
          amountIdr: new Prisma.Decimal(comboBudget),
          month: monthDate,
          period: periode,
          groupExp: "OPERATING_EXPENSES",
        });

        // 2. Hitung Nilai Actual Beragam
        // Untuk PG1, gunakan rasio target PG1 dengan variasi acak deterministik
        const baseActualRatio = target.actual / target.budget;
        // Tambahkan fluktuasi per kombinasi: ada yang hemat (-15%), ada yang over (+20%)
        const comboVarianceFactor = 1 + pseudoVariation(periode * 333 + ccIdx * 77 + ceIdx * 13);
        let pg1Actual = Math.round((comboBudget * baseActualRatio * comboVarianceFactor) / 10000) * 10000;
        if (pg1Actual < 1500000) pg1Actual = 1500000;

        // Tentukan actual berdasarkan PG dari cost center
        let pgActual = 0;
        if (cc.pg === "PG1") {
          pgActual = pg1Actual;
        } else if (cc.pg === "PG2") {
          // PG2: sekitar 85% - 105% dari proporsi PG1
          const pg2Factor = 0.92 + pseudoVariation(periode * 55 + ccIdx * 23);
          pgActual = Math.round((pg1Actual * pg2Factor) / 10000) * 10000;
        } else if (cc.pg === "PG3") {
          // PG3: sekitar 75% - 95% dari proporsi PG1
          const pg3Factor = 0.82 + pseudoVariation(periode * 77 + ccIdx * 31);
          pgActual = Math.round((pg1Actual * pg3Factor) / 10000) * 10000;
        }

        // 3. Generate Transaksi Individual di data_actual
        if (pgActual > 0) {
          const activities = SAMPLE_ACTIVITIES[ce.ce2] || ["Aktivitas Lapangan Perkebunan"];
          // 2 sampai 3 transaksi dengan porsi beragam
          const numTrans = (ceIdx % 2) + 2; // 2 atau 3 transaksi
          const portions: number[] = [];
          let remaining = pgActual;

          for (let t = 0; t < numTrans - 1; t++) {
            const ratio = 0.35 + pseudoVariation(periode * 44 + t * 9) * 0.5;
            const portion = Math.round((pgActual * ratio) / 10000) * 10000;
            portions.push(portion);
            remaining -= portion;
          }
          portions.push(Math.max(remaining, 500000));

          for (let t = 0; t < portions.length; t++) {
            docCounter++;
            const portionVal = portions[t];
            const note = activities[(t + periode + ccIdx) % activities.length];
            // Tanggal posting bervariasi sepanjang bulan (tanggal 4, 12, 22)
            const dayOfTrans = Math.min(4 + t * 9 + (ccIdx % 5), 28);
            const transDate = new Date(CURRENT_YEAR, periode - 1, dayOfTrans);
            const actualKode = `${periode}${cc.costcenter}${ce.ce2}${cc.pg}`;

            dataActualRecords.push({
              kode: actualKode,
              costcenter: cc.costcenter,
              deskripsiCostcenter: cc.deskripsiCostcenter,
              costControl: ce.ce2,
              costDescription: ce.deskripsiCe2,
              idrAct: new Prisma.Decimal(portionVal),
              objectCurrency: "IDR",
              notes: note,
              ce2: ce.ce2,
              deskripsiCe2: ce.deskripsiCe2,
              documentNumber: `DOC-${CURRENT_YEAR}-${String(docCounter).padStart(5, "0")}`,
              documentDate: transDate,
              postingDate: transDate,
              period: periode,
              pg: cc.pg,
              groupingDepartement: "PLANTATION_OPS",
            });
          }
        }

        // 4. Generate Summary Records
        const summaryKode = `${periode}${cc.costcenter}${ce.ce2}${cc.pg}`;
        const variance =
          pgActual > 0 && comboBudget > 0
            ? Number((((pgActual - comboBudget) / comboBudget) * 100).toFixed(2))
            : null;

        summaryRecords.push({
          kode: summaryKode,
          periode: periode,
          costcenter: cc.costcenter,
          deskripsiCostcenter: cc.deskripsiCostcenter,
          ce2: ce.ce2,
          deskripsiCe2: ce.deskripsiCe2,
          pg: cc.pg,
          nilaiActual: pgActual > 0 ? new Prisma.Decimal(pgActual) : null,
          nilaiBudget: new Prisma.Decimal(comboBudget),
          variance: variance !== null ? new Prisma.Decimal(variance) : null,
        });
      }
    }
  }

  console.log(`📥 Menyimpan ${dataBudgetRecords.length} budget records...`);
  await prisma.dataBudget.createMany({ data: dataBudgetRecords });

  console.log(`📥 Menyimpan ${dataActualRecords.length} actual records...`);
  const CHUNK_SIZE = 1000;
  for (let i = 0; i < dataActualRecords.length; i += CHUNK_SIZE) {
    await prisma.dataActual.createMany({ data: dataActualRecords.slice(i, i + CHUNK_SIZE) });
  }

  console.log(`📥 Menyimpan ${summaryRecords.length} summary records...`);
  for (let i = 0; i < summaryRecords.length; i += CHUNK_SIZE) {
    await prisma.summary.createMany({ data: summaryRecords.slice(i, i + CHUNK_SIZE) });
  }

  console.log("✅ Seeding data beragam & realistis berhasil diselesaikan!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
