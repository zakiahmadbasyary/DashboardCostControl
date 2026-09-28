import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting HPP Database Seeding...");

  // 1. Seed MasterSheet
  const master1 = await prisma.masterSheet.upsert({
    where: { lokasi: "001A" },
    update: {},
    create: {
      lokasi: "001A",
      wilayah: "W01",
      kodeBibit: "BIB-S01",
      jenisBibit: "sucker",
      kelasBibit: "sedang",
    },
  });

  const master2 = await prisma.masterSheet.upsert({
    where: { lokasi: "001B" },
    update: {},
    create: {
      lokasi: "001B",
      wilayah: "W01",
      kodeBibit: "BIB-C02",
      jenisBibit: "crown",
      kelasBibit: "besar",
    },
  });

  const master3 = await prisma.masterSheet.upsert({
    where: { lokasi: "002A" },
    update: {},
    create: {
      lokasi: "002A",
      wilayah: "W02",
      kodeBibit: "BIB-N01",
      jenisBibit: "nursery",
      kelasBibit: "kecil",
    },
  });

  console.log("✅ MasterSheet seeded:", [master1.lokasi, master2.lokasi, master3.lokasi]);

  // 2. Seed Budget
  const budget1 = await prisma.budget.upsert({
    where: { idBudget: "BUD001" },
    update: {},
    create: {
      idBudget: "BUD001",
      group: "ZN01",
      status: "NFSC",
      periode: 1,
      budget: 500000000.0,
    },
  });

  const budget2 = await prisma.budget.upsert({
    where: { idBudget: "BUD002" },
    update: {},
    create: {
      idBudget: "BUD002",
      group: "ZN02",
      status: "NSSC",
      periode: 2,
      budget: 750000000.0,
    },
  });

  console.log("✅ Budget seeded:", [budget1.idBudget, budget2.idBudget]);

  // 3. Seed LokasiHPP
  const lokasiHpp1 = await prisma.lokasiHPP.upsert({
    where: { idLokasiHpp: "LH001" },
    update: {},
    create: {
      idLokasiHpp: "LH001",
      lokasi: "001A",
      idBudget: "BUD001",
      periode: 1,
      status: "NFSC",
      qtyPanen: 12500.5,
      luasPanen: 5.2,
      luasAktif: 5.5,
      group: "ZN01",
      descGroup: "Zone 01 Plantation Area",
      jenisBiaya: "Pupuk & Kimia",
      biaya: 150000000.0,
    },
  });

  const lokasiHpp2 = await prisma.lokasiHPP.upsert({
    where: { idLokasiHpp: "LH002" },
    update: {},
    create: {
      idLokasiHpp: "LH002",
      lokasi: "001B",
      idBudget: "BUD002",
      periode: 2,
      status: "NSSC",
      qtyPanen: 18000.0,
      luasPanen: 7.5,
      luasAktif: 7.8,
      group: "ZN02",
      descGroup: "Zone 02 Plantation Area",
      jenisBiaya: "Pemeliharaan & Land Prep",
      biaya: 220000000.0,
    },
  });

  console.log("✅ LokasiHPP seeded:", [lokasiHpp1.idLokasiHpp, lokasiHpp2.idLokasiHpp]);

  // 4. Seed AktivitasHPP
  const aktivitas1 = await prisma.aktivitasHPP.upsert({
    where: { idAktivitas: "ACT001" },
    update: {},
    create: {
      idAktivitas: "ACT001",
      lokasi: "001A",
      tanggalMulaiRawat: new Date("2026-01-10"),
      tanggalMulaiTanam: new Date("2026-02-01"),
      tanggalForcingStandard: new Date("2026-06-15"),
      rencanaForcing: new Date("2026-06-20"),
      realForcing: new Date("2026-06-22"),
      rencanaPanen: new Date("2026-11-01"),
      aktivitas: "Pemupukan Dosis 1",
      biaya: 35000000.0,
      hasil: 12500.0,
      uom: "Kg",
      group: "ZN01",
    },
  });

  const aktivitas2 = await prisma.aktivitasHPP.upsert({
    where: { idAktivitas: "ACT002" },
    update: {},
    create: {
      idAktivitas: "ACT002",
      lokasi: "001B",
      tanggalMulaiRawat: new Date("2026-01-15"),
      tanggalMulaiTanam: new Date("2026-02-10"),
      tanggalForcingStandard: new Date("2026-06-25"),
      rencanaForcing: new Date("2026-06-28"),
      realForcing: new Date("2026-06-30"),
      rencanaPanen: new Date("2026-11-15"),
      aktivitas: "Weed Control & Maintenance",
      biaya: 25000000.0,
      hasil: 18000.0,
      uom: "Kg",
      group: "ZN02",
    },
  });

  console.log("✅ AktivitasHPP seeded:", [aktivitas1.idAktivitas, aktivitas2.idAktivitas]);

  console.log("🎉 HPP Database Seeding Completed Successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error Seeding HPP Database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
