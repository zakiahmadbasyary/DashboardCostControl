import { PrismaClient, Prisma } from "../src/generated/client/index.js";

const prisma = new PrismaClient();

// ── 1. MASTER COST CENTERS ───────────────────────────────────────────────────
const COST_CENTERS = [
  { costcenter: "CC101", deskripsiCostcenter: "Pengolahan Tanah & Persiapan Lahan PG1", isview: true },
  { costcenter: "CC102", deskripsiCostcenter: "Irigasi & Tata Air Perkebunan PG1", isview: true },
  { costcenter: "CC103", deskripsiCostcenter: "Pemupukan & Pemeliharaan Tanaman PG1", isview: true },
  { costcenter: "CC104", deskripsiCostcenter: "Panen & Pengangkutan Hasil PG1", isview: true },
  { costcenter: "CC105", deskripsiCostcenter: "Armada Traktor & Alat Berat PG1", isview: true },
  { costcenter: "CC106", deskripsiCostcenter: "Bengkel & Workshop Lapangan PG1", isview: true },
  { costcenter: "CC201", deskripsiCostcenter: "Operasional Lapangan & Kebun PG2", isview: true },
  { costcenter: "CC202", deskripsiCostcenter: "Pemeliharaan & Tata Air PG2", isview: true },
  { costcenter: "CC301", deskripsiCostcenter: "Operasional Lapangan & Kebun PG3", isview: true },
  { costcenter: "CC302", deskripsiCostcenter: "Pemeliharaan & Tata Air PG3", isview: true },
];

// ── 2. MASTER COST ELEMENT 2 (CE2) ───────────────────────────────────────────
const COST_ELEMENTS = [
  { ce2: "CE01", deskripsiCe2: "Upah & Tenaga Kerja Lapangan", isview: true },
  { ce2: "CE02", deskripsiCe2: "Pupuk, Agrokimia & Nutrisi", isview: true },
  { ce2: "CE03", deskripsiCe2: "Bahan Bakar & Pelumas Mesin", isview: true },
  { ce2: "CE04", deskripsiCe2: "Suku Cadang & Perbaikan Alat", isview: true },
  { ce2: "CE05", deskripsiCe2: "Jasa Borongan & Kontraktor", isview: true },
  { ce2: "CE06", deskripsiCe2: "Biaya Umum & Operasional Lainnya", isview: true },
];

// Template aktivitas per CE2
const SAMPLE_ACTIVITIES: Record<string, string[]> = {
  CE01: [
    "Upah Tenaga Kerja Borongan Penyiangan Gulma",
    "Upah Harian Lepas Aplikasi Pupuk Dasar",
    "Insentif & Lembur Operator Traktor Panen",
    "Upah Regu Mandor Pengawasan Lapangan",
  ],
  CE02: [
    "Pengadaan Pupuk NPK Granular Dosis Standar",
    "Aplikasi Herbisida Sistemik Pra-Tumbuh",
    "Nutrisi Daun & Mikro Elemen Organik",
    "Pemberian Kapur Dolomit Pengatur pH Tanah",
  ],
  CE03: [
    "Pengisian Solar Industri Mesin Pompa Air",
    "Bahan Bakar Solar Traktor Lapangan",
    "Oli Mesin HD & Pelumas Hidrolik Alat Berat",
    "Bensin Operasional Sepeda Motor Agronomi",
  ],
  CE04: [
    "Penggantian Filter Udara & Oli Berkala",
    "Perbaikan Pompa Air & Pipa Sambungan Irigasi",
    "Penggantian Ban Traktor & Bearing Gandar",
    "Servis Sistem Hidrolik & Blade Bajak",
  ],
  CE05: [
    "Sewa Truk Tronton Pengangkutan Pupuk Luar",
    "Jasa Operator Borongan Land Clearing",
    "Jasa Pembersihan Saluran Drainase Utama",
    "Subkontraktor Instalasi Sensor Kelembaban Tanah",
  ],
  CE06: [
    "Peralatan Keselamatan Kerja & APD Kebun",
    "Konsumsi Regu Kerja Lapangan Lembur",
    "Biaya Koordinasi Lapangan & Keamanan Area",
    "Pengadaan Terpal & Karung Panen Kebun",
  ],
};

const PGS = ["PG1", "PG2", "PG3"];
const CURRENT_YEAR = 2026;

// Deterministic Pseudo-Random Generator (agar data selalu stabil & realistis)
let seed = 42;
function pseudoRandom(): number {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

async function main() {
  console.log("🌱 Memulai seeding data dummy Dashboard OPEX...");

  // 1. Bersihkan data sebelumnya (urutan child -> parent)
  console.log("🧹 Membersihkan tabel opex...");
  await prisma.summary.deleteMany();
  await prisma.dataActual.deleteMany();
  await prisma.dataBudget.deleteMany();
  await prisma.mastersheetCe2.deleteMany();
  await prisma.mastersheetCostcenter.deleteMany();

  // 2. Insert Mastersheet Cost Centers
  console.log("📁 Menambahkan Master Cost Center...");
  await prisma.mastersheetCostcenter.createMany({
    data: COST_CENTERS,
  });

  // 3. Insert Mastersheet CE2
  console.log("📁 Menambahkan Master CE2...");
  await prisma.mastersheetCe2.createMany({
    data: COST_ELEMENTS,
  });

  // 4. Generate Budget & Actual Data
  console.log("📊 Menghasilkan data transaksi Budget, Actual, dan Summary...");

  const dataBudgetRecords: Prisma.DataBudgetCreateManyInput[] = [];
  const dataActualRecords: Prisma.DataActualCreateManyInput[] = [];
  const summaryRecords: Prisma.SummaryCreateManyInput[] = [];

  let docCounter = 1000;

  // Loop untuk 12 Bulan (Periode 1 s.d. 12)
  for (let periode = 1; periode <= 12; periode++) {
    const monthDate = new Date(CURRENT_YEAR, periode - 1, 1);

    for (const cc of COST_CENTERS) {
      for (const ce of COST_ELEMENTS) {
        // Base Budget per (periode, costcenter, ce2) — berlaku untuk semua PG
        // Variasi budget antara 25 Juta s.d. 120 Juta per kombinasi
        const baseBudget = Math.round((30000000 + pseudoRandom() * 85000000) / 100000) * 100000;
        const budgetKode = `${periode}${cc.costcenter}${ce.ce2}`;

        dataBudgetRecords.push({
          kode: budgetKode,
          costcenter: cc.costcenter,
          deskripsiCostcenter: cc.deskripsiCostcenter,
          ce2: ce.ce2,
          deskripsiCe2: ce.deskripsiCe2,
          amountIdr: new Prisma.Decimal(baseBudget),
          month: monthDate,
          period: periode,
          groupExp: "OPERATING_EXPENSES",
        });

        // Untuk setiap PG, generate Actual data
        for (const pg of PGS) {
          // Rasio actual terhadap budget (PG1 memiliki data penuh, PG2 & PG3 memiliki variasi)
          // Bulan 1..12 disimulasikan: bulan 1-4 realisasi riil, bulan 5-12 proyeksi/aktual bertahap
          const pgMultiplier = pg === "PG1" ? 1.0 : pg === "PG2" ? 0.85 : 0.75;
          const varianceRatio = 0.82 + pseudoRandom() * 0.35; // 82% - 117% dari budget
          const totalActualForCombo = Math.round((baseBudget * pgMultiplier * varianceRatio) / 100000) * 100000;

          // Buat 2-3 rincian transaksi data_actual
          const activities = SAMPLE_ACTIVITIES[ce.ce2] || ["Aktivitas Operasional Rutin"];
          const numTransactions = 2 + Math.floor(pseudoRandom() * 2); // 2 atau 3 transaksi
          let allocatedActual = 0;

          const actualKode = `${periode}${cc.costcenter}${ce.ce2}${pg}`;

          for (let i = 0; i < numTransactions; i++) {
            docCounter++;
            const isLast = i === numTransactions - 1;
            const portion = isLast ? totalActualForCombo - allocatedActual : Math.round((totalActualForCombo / numTransactions) / 50000) * 50000;
            allocatedActual += portion;

            const activityNote = activities[i % activities.length];
            const transDate = new Date(CURRENT_YEAR, periode - 1, 5 + i * 8);

            dataActualRecords.push({
              kode: actualKode,
              costcenter: cc.costcenter,
              deskripsiCostcenter: cc.deskripsiCostcenter,
              costControl: ce.ce2,
              costDescription: ce.deskripsiCe2,
              idrAct: new Prisma.Decimal(portion),
              objectCurrency: "IDR",
              notes: activityNote,
              ce2: ce.ce2,
              deskripsiCe2: ce.deskripsiCe2,
              documentNumber: `DOC-${CURRENT_YEAR}-${String(docCounter).padStart(5, "0")}`,
              documentDate: transDate,
              postingDate: transDate,
              period: periode,
              pg: pg,
              groupingDepartement: "PLANTATION_OPS",
            });
          }

          // Hitung variance untuk tabel Summary: ((actual - budget) / budget) * 100
          const variance = Number((((totalActualForCombo - baseBudget) / baseBudget) * 100).toFixed(2));
          const summaryKode = `${periode}${cc.costcenter}${ce.ce2}${pg}`;

          summaryRecords.push({
            kode: summaryKode,
            periode: periode,
            costcenter: cc.costcenter,
            deskripsiCostcenter: cc.deskripsiCostcenter,
            ce2: ce.ce2,
            deskripsiCe2: ce.deskripsiCe2,
            pg: pg,
            nilaiActual: new Prisma.Decimal(totalActualForCombo),
            nilaiBudget: new Prisma.Decimal(baseBudget),
            variance: new Prisma.Decimal(variance),
          });
        }
      }
    }
  }

  // Insert data dalam batch
  console.log(`📥 Memasukkan ${dataBudgetRecords.length} baris data_budget...`);
  await prisma.dataBudget.createMany({ data: dataBudgetRecords });

  console.log(`📥 Memasukkan ${dataActualRecords.length} baris data_actual...`);
  // Prisma batching untuk menghindari batas parameter database
  const CHUNK_SIZE = 1000;
  for (let i = 0; i < dataActualRecords.length; i += CHUNK_SIZE) {
    const chunk = dataActualRecords.slice(i, i + CHUNK_SIZE);
    await prisma.dataActual.createMany({ data: chunk });
  }

  console.log(`📥 Memasukkan ${summaryRecords.length} baris summary...`);
  for (let i = 0; i < summaryRecords.length; i += CHUNK_SIZE) {
    const chunk = summaryRecords.slice(i, i + CHUNK_SIZE);
    await prisma.summary.createMany({ data: chunk });
  }

  console.log("✅ Seeding database OPEX berhasil diselesaikan!");
  console.log(`- Master Cost Center : ${COST_CENTERS.length}`);
  console.log(`- Master CE2         : ${COST_ELEMENTS.length}`);
  console.log(`- Data Budget        : ${dataBudgetRecords.length}`);
  console.log(`- Data Actual        : ${dataActualRecords.length}`);
  console.log(`- Summary Records    : ${summaryRecords.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Gagal melakukan seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
