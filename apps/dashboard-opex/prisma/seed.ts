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

// Target Bulanan Sesuai Referensi Visual Dashboard OPEX GGP:
// Jan: Act 2.488 M, Bgt 1.594 M (+56%)
// Feb: Act 1.394 M, Bgt 1.600 M (-13%)
// Mar: Act 1.678 M, Bgt 2.438 M (-31%)
// Apr-Des: Budget berjalan, Actual belum ada (0)
const MONTHLY_TARGETS: Record<number, { actual: number; budget: number }> = {
  1: { actual: 2488000000, budget: 1594000000 },
  2: { actual: 1394000000, budget: 1600000000 },
  3: { actual: 1678000000, budget: 2438000000 },
  4: { actual: 0, budget: 3570000000 },
  5: { actual: 0, budget: 3573000000 },
  6: { actual: 0, budget: 4661000000 },
  7: { actual: 0, budget: 3993000000 },
  8: { actual: 0, budget: 4614000000 },
  9: { actual: 0, budget: 3789000000 },
  10: { actual: 0, budget: 4049000000 },
  11: { actual: 0, budget: 1310000000 },
  12: { actual: 0, budget: 1715000000 },
};

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

async function main() {
  console.log("🌱 Memulai seeding data terkalibrasi Dashboard OPEX GGP...");

  await prisma.summary.deleteMany();
  await prisma.dataActual.deleteMany();
  await prisma.dataBudget.deleteMany();
  await prisma.mastersheetCe2.deleteMany();
  await prisma.mastersheetCostcenter.deleteMany();

  console.log("📁 Menambahkan Master Cost Center & CE2...");
  await prisma.mastersheetCostcenter.createMany({ data: COST_CENTERS });
  await prisma.mastersheetCe2.createMany({ data: COST_ELEMENTS });

  const dataBudgetRecords: Prisma.DataBudgetCreateManyInput[] = [];
  const dataActualRecords: Prisma.DataActualCreateManyInput[] = [];
  const summaryRecords: Prisma.SummaryCreateManyInput[] = [];

  const totalCombos = COST_CENTERS.length * COST_ELEMENTS.length; // 60 kombinasi
  let docCounter = 1000;

  for (let periode = 1; periode <= 12; periode++) {
    const target = MONTHLY_TARGETS[periode];
    const monthDate = new Date(CURRENT_YEAR, periode - 1, 1);

    // Distribusi budget per kombinasi (CC & CE2)
    const baseBudgetUnit = Math.floor(target.budget / totalCombos);
    let budgetRemainder = target.budget - baseBudgetUnit * totalCombos;

    // Distribusi actual PG1 per kombinasi
    const baseActualUnit = target.actual > 0 ? Math.floor(target.actual / totalCombos) : 0;
    let actualRemainder = target.actual > 0 ? target.actual - baseActualUnit * totalCombos : 0;

    let comboIdx = 0;

    for (const cc of COST_CENTERS) {
      for (const ce of COST_ELEMENTS) {
        comboIdx++;
        const isLastCombo = comboIdx === totalCombos;

        // Hitung budget pasti agar total bulanan tepat sama dengan target
        const comboBudget = baseBudgetUnit + (isLastCombo ? budgetRemainder : 0);
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

        // Generate untuk setiap PG
        for (const pg of PGS) {
          let pgActual = 0;

          if (pg === "PG1") {
            pgActual = target.actual > 0 ? baseActualUnit + (isLastCombo ? actualRemainder : 0) : 0;
          } else if (pg === "PG2") {
            // PG2 proporsional 0.88x dari PG1
            pgActual = target.actual > 0 ? Math.round((baseActualUnit * 0.88) / 1000) * 1000 : 0;
          } else if (pg === "PG3") {
            // PG3 proporsional 0.76x dari PG1
            pgActual = target.actual > 0 ? Math.round((baseActualUnit * 0.76) / 1000) * 1000 : 0;
          }

          // Generate data_actual transactions jika actual > 0
          if (pgActual > 0) {
            const activities = SAMPLE_ACTIVITIES[ce.ce2] || ["Aktivitas Operasional Rutin"];
            const numTrans = 2;
            const halfPortion = Math.floor(pgActual / numTrans);
            const remainderPortion = pgActual - halfPortion;

            for (let t = 0; t < numTrans; t++) {
              docCounter++;
              const portion = t === 0 ? halfPortion : remainderPortion;
              const note = activities[t % activities.length];
              const transDate = new Date(CURRENT_YEAR, periode - 1, 8 + t * 10);
              const actualKode = `${periode}${cc.costcenter}${ce.ce2}${pg}`;

              dataActualRecords.push({
                kode: actualKode,
                costcenter: cc.costcenter,
                deskripsiCostcenter: cc.deskripsiCostcenter,
                costControl: ce.ce2,
                costDescription: ce.deskripsiCe2,
                idrAct: new Prisma.Decimal(portion),
                objectCurrency: "IDR",
                notes: note,
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
          }

          // Summary per kombinasi
          const summaryKode = `${periode}${cc.costcenter}${ce.ce2}${pg}`;
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
            pg: pg,
            nilaiActual: pgActual > 0 ? new Prisma.Decimal(pgActual) : null,
            nilaiBudget: new Prisma.Decimal(comboBudget),
            variance: variance !== null ? new Prisma.Decimal(variance) : null,
          });
        }
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

  console.log("✅ Seeding terkalibrasi berhasil!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
