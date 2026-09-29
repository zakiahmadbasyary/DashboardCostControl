import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Seed MasterSheet
    const masterData = [
      { lokasi: "001A", wilayah: "W01", kodeBibit: "BIB-S01", jenisBibit: "sucker", kelasBibit: "sedang" },
      { lokasi: "001B", wilayah: "W01", kodeBibit: "BIB-C02", jenisBibit: "crown", kelasBibit: "besar" },
      { lokasi: "002A", wilayah: "W02", kodeBibit: "BIB-N01", jenisBibit: "nursery", kelasBibit: "kecil" },
      { lokasi: "002B", wilayah: "W02", kodeBibit: "BIB-S02", jenisBibit: "sucker", kelasBibit: "besar" },
      { lokasi: "003A", wilayah: "W03", kodeBibit: "BIB-C01", jenisBibit: "crown", kelasBibit: "sedang" },
    ];

    for (const item of masterData) {
      await prisma.masterSheet.upsert({
        where: { lokasi: item.lokasi },
        update: item,
        create: item,
      });
    }

    // 2. Seed Budget
    const budgetData = [
      { idBudget: "BUD001", group: "ZN01", status: "NFSC", periode: 1, budget: 500000000.0 },
      { idBudget: "BUD002", group: "ZN02", status: "NSSC", periode: 2, budget: 750000000.0 },
      { idBudget: "BUD003", group: "ZN03", status: "NFSC", periode: 1, budget: 620000000.0 },
      { idBudget: "BUD004", group: "ZN04", status: "NSSC", periode: 2, budget: 480000000.0 },
    ];

    for (const item of budgetData) {
      await prisma.budget.upsert({
        where: { idBudget: item.idBudget },
        update: item,
        create: item,
      });
    }

    // 3. Seed LokasiHPP
    const lokasiData = [
      {
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
      {
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
      {
        idLokasiHpp: "LH003",
        lokasi: "002A",
        idBudget: "BUD001",
        periode: 1,
        status: "NFSC",
        qtyPanen: 9800.0,
        luasPanen: 4.0,
        luasAktif: 4.2,
        group: "ZN01",
        descGroup: "Zone 01 Plantation Area",
        jenisBiaya: "Pekerja & Manpower",
        biaya: 110000000.0,
      },
      {
        idLokasiHpp: "LH004",
        lokasi: "002B",
        idBudget: "BUD003",
        periode: 1,
        status: "NFSC",
        qtyPanen: 15400.0,
        luasPanen: 6.1,
        luasAktif: 6.5,
        group: "ZN03",
        descGroup: "Zone 03 Plantation Area",
        jenisBiaya: "Operasional Alat & Mesin",
        biaya: 185000000.0,
      },
      {
        idLokasiHpp: "LH005",
        lokasi: "003A",
        idBudget: "BUD004",
        periode: 2,
        status: "NSSC",
        qtyPanen: 11200.0,
        luasPanen: 4.8,
        luasAktif: 5.0,
        group: "ZN04",
        descGroup: "Zone 04 Plantation Area",
        jenisBiaya: "Irigasi & Air",
        biaya: 130000000.0,
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
      {
        idAktivitas: "ACT003",
        lokasi: "002A",
        tanggalMulaiRawat: new Date("2026-02-01"),
        tanggalMulaiTanam: new Date("2026-02-20"),
        tanggalForcingStandard: new Date("2026-07-01"),
        rencanaForcing: new Date("2026-07-05"),
        realForcing: new Date("2026-07-05"),
        rencanaPanen: new Date("2026-12-01"),
        aktivitas: "Penyemprotan Hama & Pestisida",
        biaya: 28000000.0,
        hasil: 9800.0,
        uom: "Kg",
        group: "ZN01",
      },
      {
        idAktivitas: "ACT004",
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
        group: "ZN03",
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
      message: "Berhasil mengisikan data simulasi HPP ke database!",
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
