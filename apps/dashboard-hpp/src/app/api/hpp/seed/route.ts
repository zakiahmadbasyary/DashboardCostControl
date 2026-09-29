import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Seed MasterSheet (W01 to W07)
    const masterData = [
      { lokasi: "001A", wilayah: "W01", kodeBibit: "BIB-S01", jenisBibit: "sucker", kelasBibit: "sedang" },
      { lokasi: "001B", wilayah: "W01", kodeBibit: "BIB-C02", jenisBibit: "crown", kelasBibit: "besar" },
      { lokasi: "002A", wilayah: "W02", kodeBibit: "BIB-N01", jenisBibit: "nursery", kelasBibit: "kecil" },
      { lokasi: "002B", wilayah: "W02", kodeBibit: "BIB-S02", jenisBibit: "sucker", kelasBibit: "besar" },
      { lokasi: "003A", wilayah: "W03", kodeBibit: "BIB-C01", jenisBibit: "crown", kelasBibit: "sedang" },
      { lokasi: "004A", wilayah: "W04", kodeBibit: "BIB-S03", jenisBibit: "sucker", kelasBibit: "kecil" },
      { lokasi: "005A", wilayah: "W05", kodeBibit: "BIB-N02", jenisBibit: "nursery", kelasBibit: "sedang" },
      { lokasi: "006A", wilayah: "W06", kodeBibit: "BIB-C03", jenisBibit: "crown", kelasBibit: "besar" },
      { lokasi: "007A", wilayah: "W07", kodeBibit: "BIB-S04", jenisBibit: "sucker", kelasBibit: "sedang" },
    ];

    for (const item of masterData) {
      await prisma.masterSheet.upsert({
        where: { lokasi: item.lokasi },
        update: item,
        create: item,
      });
    }

    // 2. Seed Budget (for periods 1-12 across ZN01-ZN04 and NSSC/NFSC)
    const budgetData = [
      { idBudget: "BUD001", group: "ZN01", status: "NFSC", periode: 1, budget: 500000000.0 },
      { idBudget: "BUD002", group: "ZN02", status: "NSSC", periode: 2, budget: 750000000.0 },
      { idBudget: "BUD003", group: "ZN03", status: "NFSC", periode: 3, budget: 620000000.0 },
      { idBudget: "BUD004", group: "ZN04", status: "NSSC", periode: 4, budget: 480000000.0 },
      { idBudget: "BUD005", group: "ZN01", status: "NSSC", periode: 5, budget: 550000000.0 },
      { idBudget: "BUD006", group: "ZN02", status: "NFSC", periode: 6, budget: 710000000.0 },
      { idBudget: "BUD007", group: "ZN03", status: "NSSC", periode: 7, budget: 680000000.0 },
      { idBudget: "BUD008", group: "ZN04", status: "NFSC", periode: 8, budget: 530000000.0 },
      { idBudget: "BUD009", group: "ZN01", status: "NFSC", periode: 9, budget: 600000000.0 },
      { idBudget: "BUD010", group: "ZN02", status: "NSSC", periode: 10, budget: 790000000.0 },
      { idBudget: "BUD011", group: "ZN03", status: "NFSC", periode: 11, budget: 640000000.0 },
      { idBudget: "BUD012", group: "ZN04", status: "NSSC", periode: 12, budget: 590000000.0 },
    ];

    for (const item of budgetData) {
      await prisma.budget.upsert({
        where: { idBudget: item.idBudget },
        update: item,
        create: item,
      });
    }

    // 3. Seed LokasiHPP (covering periods 1-12, W01-W07, 100% taksasi & <100% taksasi)
    const lokasiData = [
      {
        idLokasiHpp: "LH001",
        lokasi: "001A",
        idBudget: "BUD001",
        periode: 1,
        status: "NFSC",
        qtyPanen: 12500.0,
        luasPanen: 5.5,
        luasAktif: 5.5, // 100% taksasi
        group: "ZN01",
        descGroup: "Zone 01 Land Preparation & Planting",
        jenisBiaya: "Pupuk & Kimia",
        biaya: 150000000.0,
      },
      {
        idLokasiHpp: "LH002",
        lokasi: "001B",
        idBudget: "BUD002",
        periode: 2,
        status: "NSSC",
        qtyPanen: 18000.0,
        luasPanen: 7.5,
        luasAktif: 7.8, // < 100% taksasi
        group: "ZN02",
        descGroup: "Zone 02 Crop Maintenance",
        jenisBiaya: "Pemeliharaan & Land Prep",
        biaya: 220000000.0,
      },
      {
        idLokasiHpp: "LH003",
        lokasi: "002A",
        idBudget: "BUD003",
        periode: 3,
        status: "NFSC",
        qtyPanen: 9800.0,
        luasPanen: 4.0,
        luasAktif: 4.0, // 100% taksasi
        group: "ZN03",
        descGroup: "Zone 03 Harvesting & Forcing",
        jenisBiaya: "Pekerja & Manpower",
        biaya: 110000000.0,
      },
      {
        idLokasiHpp: "LH004",
        lokasi: "002B",
        idBudget: "BUD004",
        periode: 4,
        status: "NSSC",
        qtyPanen: 15400.0,
        luasPanen: 6.1,
        luasAktif: 6.5, // < 100% taksasi
        group: "ZN04",
        descGroup: "Zone 04 Irrigation & Fertilizer",
        jenisBiaya: "Operasional Alat & Mesin",
        biaya: 185000000.0,
      },
      {
        idLokasiHpp: "LH005",
        lokasi: "003A",
        idBudget: "BUD005",
        periode: 5,
        status: "NSSC",
        qtyPanen: 11200.0,
        luasPanen: 5.0,
        luasAktif: 5.0, // 100% taksasi
        group: "ZN01",
        descGroup: "Zone 01 Land Preparation",
        jenisBiaya: "Irigasi & Air",
        biaya: 130000000.0,
      },
      {
        idLokasiHpp: "LH006",
        lokasi: "004A",
        idBudget: "BUD006",
        periode: 6,
        status: "NFSC",
        qtyPanen: 16800.0,
        luasPanen: 6.8,
        luasAktif: 6.8, // 100% taksasi
        group: "ZN02",
        descGroup: "Zone 02 Crop Maintenance",
        jenisBiaya: "Pupuk & Pestisida",
        biaya: 195000000.0,
      },
      {
        idLokasiHpp: "LH007",
        lokasi: "005A",
        idBudget: "BUD007",
        periode: 7,
        status: "NSSC",
        qtyPanen: 14200.0,
        luasPanen: 5.6,
        luasAktif: 6.0, // < 100% taksasi
        group: "ZN03",
        descGroup: "Zone 03 Harvesting",
        jenisBiaya: "Manpower & Harvest",
        biaya: 162000000.0,
      },
      {
        idLokasiHpp: "LH008",
        lokasi: "006A",
        idBudget: "BUD008",
        periode: 8,
        status: "NFSC",
        qtyPanen: 19500.0,
        luasPanen: 8.0,
        luasAktif: 8.0, // 100% taksasi
        group: "ZN04",
        descGroup: "Zone 04 Irrigation",
        jenisBiaya: "Alat Heavy Equipment",
        biaya: 240000000.0,
      },
      {
        idLokasiHpp: "LH009",
        lokasi: "007A",
        idBudget: "BUD009",
        periode: 9,
        status: "NFSC",
        qtyPanen: 13900.0,
        luasPanen: 5.5,
        luasAktif: 5.5, // 100% taksasi
        group: "ZN01",
        descGroup: "Zone 01 Planting",
        jenisBiaya: "Material Bibit & Sucker",
        biaya: 158000000.0,
      },
    ];

    for (const item of lokasiData) {
      await prisma.lokasiHPP.upsert({
        where: { idLokasiHpp: item.idLokasiHpp },
        update: item,
        create: item,
      });
    }

    // 4. Seed AktivitasHPP
    const aktivitasData = [
      {
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
      {
        idAktivitas: "ACT002",
        lokasi: "001A",
        tanggalMulaiRawat: new Date("2026-01-12"),
        tanggalMulaiTanam: new Date("2026-02-01"),
        tanggalForcingStandard: new Date("2026-06-15"),
        rencanaForcing: new Date("2026-06-20"),
        realForcing: new Date("2026-06-22"),
        rencanaPanen: new Date("2026-11-01"),
        aktivitas: "Weed Control & Herbisida",
        biaya: 22000000.0,
        hasil: 12500.0,
        uom: "Kg",
        group: "ZN01",
      },
      {
        idAktivitas: "ACT003",
        lokasi: "001B",
        tanggalMulaiRawat: new Date("2026-01-15"),
        tanggalMulaiTanam: new Date("2026-02-10"),
        tanggalForcingStandard: new Date("2026-06-25"),
        rencanaForcing: new Date("2026-06-28"),
        realForcing: new Date("2026-06-30"),
        rencanaPanen: new Date("2026-11-15"),
        aktivitas: "Pemeliharaan & Land Prep",
        biaya: 45000000.0,
        hasil: 18000.0,
        uom: "Kg",
        group: "ZN02",
      },
      {
        idAktivitas: "ACT004",
        lokasi: "002A",
        tanggalMulaiRawat: new Date("2026-02-01"),
        tanggalMulaiTanam: new Date("2026-02-20"),
        tanggalForcingStandard: new Date("2026-07-01"),
        rencanaForcing: new Date("2026-07-05"),
        realForcing: new Date("2026-07-05"),
        rencanaPanen: new Date("2026-12-01"),
        aktivitas: "Penyemprotan Pestisida & Insektisida",
        biaya: 28000000.0,
        hasil: 9800.0,
        uom: "Kg",
        group: "ZN03",
      },
      {
        idAktivitas: "ACT005",
        lokasi: "002B",
        tanggalMulaiRawat: new Date("2026-02-15"),
        tanggalMulaiTanam: new Date("2026-03-01"),
        tanggalForcingStandard: new Date("2026-07-15"),
        rencanaForcing: new Date("2026-07-20"),
        realForcing: new Date("2026-07-22"),
        rencanaPanen: new Date("2026-12-15"),
        aktivitas: "Pengolahan Tanah Sub-surface",
        biaya: 42000000.0,
        hasil: 15400.0,
        uom: "Kg",
        group: "ZN04",
      },
    ];

    for (const item of aktivitasData) {
      await prisma.aktivitasHPP.upsert({
        where: { idAktivitas: item.idAktivitas },
        update: item,
        create: item,
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Berhasil mengisikan data simulasi PRD HPP (W01-W07, Periode 1-12) ke database!",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengisikan data ke database" },
      { status: 500 }
    );
  }
}
