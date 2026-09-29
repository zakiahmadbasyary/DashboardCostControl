import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Seed MasterSheet (W01 to W07 with multiple locations per region)
    const masterData = [
      // W01
      { lokasi: "001A", wilayah: "W01", kodeBibit: "BIB-S01", jenisBibit: "sucker", kelasBibit: "sedang" },
      { lokasi: "001B", wilayah: "W01", kodeBibit: "BIB-C02", jenisBibit: "crown", kelasBibit: "besar" },
      { lokasi: "001C", wilayah: "W01", kodeBibit: "BIB-N01", jenisBibit: "nursery", kelasBibit: "kecil" },
      // W02
      { lokasi: "002A", wilayah: "W02", kodeBibit: "BIB-[#001]", jenisBibit: "nursery", kelasBibit: "kecil" },
      { lokasi: "002B", wilayah: "W02", kodeBibit: "BIB-S02", jenisBibit: "sucker", kelasBibit: "besar" },
      { lokasi: "002C", wilayah: "W02", kodeBibit: "BIB-C03", jenisBibit: "crown", kelasBibit: "sedang" },
      // W03
      { lokasi: "003A", wilayah: "W03", kodeBibit: "BIB-C01", jenisBibit: "crown", kelasBibit: "sedang" },
      { lokasi: "003B", wilayah: "W03", kodeBibit: "BIB-S03", jenisBibit: "sucker", kelasBibit: "kecil" },
      { lokasi: "003C", wilayah: "W03", kodeBibit: "BIB-N03", jenisBibit: "nursery", kelasBibit: "besar" },
      // W04
      { lokasi: "004A", wilayah: "W04", kodeBibit: "BIB-S04", jenisBibit: "sucker", kelasBibit: "kecil" },
      { lokasi: "004B", wilayah: "W04", kodeBibit: "BIB-C04", jenisBibit: "crown", kelasBibit: "besar" },
      { lokasi: "004C", wilayah: "W04", kodeBibit: "BIB-N04", jenisBibit: "nursery", kelasBibit: "sedang" },
      // W05
      { lokasi: "005A", wilayah: "W05", kodeBibit: "BIB-N02", jenisBibit: "nursery", kelasBibit: "sedang" },
      { lokasi: "005B", wilayah: "W05", kodeBibit: "BIB-S05", jenisBibit: "sucker", kelasBibit: "besar" },
      { lokasi: "005C", wilayah: "W05", kodeBibit: "BIB-C05", jenisBibit: "crown", kelasBibit: "kecil" },
      // W06
      { lokasi: "006A", wilayah: "W06", kodeBibit: "BIB-C06", jenisBibit: "crown", kelasBibit: "besar" },
      { lokasi: "006B", wilayah: "W06", kodeBibit: "BIB-S06", jenisBibit: "sucker", kelasBibit: "sedang" },
      { lokasi: "006C", wilayah: "W06", kodeBibit: "BIB-N06", jenisBibit: "nursery", kelasBibit: "kecil" },
      // W07
      { lokasi: "007A", wilayah: "W07", kodeBibit: "BIB-S07", jenisBibit: "sucker", kelasBibit: "sedang" },
      { lokasi: "007B", wilayah: "W07", kodeBibit: "BIB-C07", jenisBibit: "crown", kelasBibit: "kecil" },
      { lokasi: "007C", wilayah: "W07", kodeBibit: "BIB-N07", jenisBibit: "nursery", kelasBibit: "besar" },
    ];

    for (const item of masterData) {
      await prisma.masterSheet.upsert({
        where: { lokasi: item.lokasi },
        update: item,
        create: item,
      });
    }

    // 2. Seed Budget (Comprehensive budgets for periods 1-12 across ZN01-ZN04 for NSSC & NFSC)
    const budgetGroups = ["ZN01", "ZN02", "ZN03", "ZN04"];
    const budgetStatuses = ["NSSC", "NFSC"];
    const budgetData: any[] = [];

    let bCounter = 1;
    for (let p = 1; p <= 12; p++) {
      for (const grp of budgetGroups) {
        for (const st of budgetStatuses) {
          const bId = `BUD${String(bCounter).padStart(3, "0")}`;
          // Generate realistic budget amounts e.g. 450M - 850M
          const baseAmt = 450000000 + ((p * 17 + bCounter * 23) % 400) * 1000000;
          budgetData.push({
            idBudget: bId,
            group: grp,
            status: st,
            periode: p,
            budget: baseAmt,
          });
          bCounter++;
        }
      }
    }

    for (const item of budgetData) {
      await prisma.budget.upsert({
        where: { idBudget: item.idBudget },
        update: item,
        create: item,
      });
    }

    // 3. Seed LokasiHPP (Covering periods 1-12 across ALL regions W01-W07, statuses NSSC & NFSC)
    const lokasiHppEntries: any[] = [];
    let lCounter = 1;

    const groupDescriptions: Record<string, string> = {
      ZN01: "Land Preparation & Maintenance",
      ZN02: "Seedling Allocation & Planting",
      ZN03: "Harvesting & Forcing Operations",
      ZN04: "Irrigation & Chemical Fertilization",
    };

    const jenisBiayaOptions = [
      "Pupuk & Kimia",
      "Pemeliharaan & Land Prep",
      "Pekerja & Manpower",
      "Operasional Alat & Mesin",
      "Irigasi & Air",
      "Pestisida & Herbisida",
      "Material Bibit & Sucker",
    ];

    // For every period (1 to 12)
    for (let p = 1; p <= 12; p++) {
      // For every master location
      masterData.forEach((mItem, index) => {
        const idHpp = `LH${String(lCounter).padStart(3, "0")}`;
        const grp = budgetGroups[(p + index) % budgetGroups.length];
        const status = (index + p) % 2 === 0 ? "NFSC" : "NSSC";
        const matchedBudget = budgetData.find((b) => b.periode === p && b.group === grp && b.status === status);
        const idBudget = matchedBudget ? matchedBudget.idBudget : budgetData[0].idBudget;

        // Qty panen & Luas
        const luasPanen = Number((4.0 + ((index * 3 + p * 2) % 50) / 10).toFixed(1));
        // 70% of entries are 100% taksasi, 30% are <100% taksasi
        const is100Taksasi = (index + p) % 3 !== 0;
        const luasAktif = is100Taksasi ? luasPanen : Number((luasPanen + 0.4).toFixed(1));
        const qtyPanen = Number((luasPanen * (1800 + ((p * 11 + index * 17) % 800))).toFixed(0));

        // Biaya location
        const biaya = Number((80000000 + ((p * 19 + index * 31) % 150) * 1000000).toFixed(0));

        lokasiHppEntries.push({
          idLokasiHpp: idHpp,
          lokasi: mItem.lokasi,
          idBudget,
          periode: p,
          status,
          qtyPanen,
          luasPanen,
          luasAktif,
          group: grp,
          descGroup: groupDescriptions[grp] || `Group ${grp}`,
          jenisBiaya: jenisBiayaOptions[(p + index) % jenisBiayaOptions.length],
          biaya,
        });

        lCounter++;
      });
    }

    for (const item of lokasiHppEntries) {
      await prisma.lokasiHPP.upsert({
        where: { idLokasiHpp: item.idLokasiHpp },
        update: item,
        create: item,
      });
    }

    // 4. Seed AktivitasHPP (Rich activities for locations & cost groups)
    const aktivitasNames: Record<string, string[]> = {
      ZN01: ["Pembersihan Lahan & Subsoiling", "Pengolahan Tanah & Garu", "Sanitasi & Pembuatan Bedengan"],
      ZN02: ["Seleksi & Penataan Bibit", "Penanaman Sucker/Crown", "Penyulaman Bibit Perkebunan"],
      ZN03: ["Penyemprotan Forcing Standard", "Aktivitas Panen & Pemetikan", "Pengangkutan Hasil Panen (Rit)"],
      ZN04: ["Pemupukan Dosis Granul", "Weed Control & Herbisida", "Penyiraman & Springkle Irigasi"],
    };

    const aktivitasEntries: any[] = [];
    let actCounter = 1;

    // Pick top locations for detailed activity entries
    const sampleLocations = ["001A", "001B", "002A", "002B", "003A", "004A", "005A", "006A", "007A"];

    sampleLocations.forEach((locCode, lIdx) => {
      budgetGroups.forEach((grp, gIdx) => {
        const actList = aktivitasNames[grp] || ["Aktivitas Pekerjaan Lapangan"];
        actList.forEach((actName, aIdx) => {
          const actId = `ACT${String(actCounter).padStart(3, "0")}`;
          const startDate = new Date(2026, 0, 10 + lIdx * 3 + aIdx * 5);
          const plantDate = new Date(2026, 1, 1 + lIdx * 2);
          const forcingDate = new Date(2026, 5, 15 + lIdx * 2);
          const panenDate = new Date(2026, 10, 1 + lIdx * 3);

          const biayaAct = 15000000 + ((lIdx * 13 + gIdx * 17 + aIdx * 7) % 35) * 1000000;
          const hasilAct = 8000 + ((lIdx * 11 + aIdx * 19) % 12000);

          aktivitasEntries.push({
            idAktivitas: actId,
            lokasi: locCode,
            tanggalMulaiRawat: startDate,
            tanggalMulaiTanam: plantDate,
            tanggalForcingStandard: forcingDate,
            rencanaForcing: forcingDate,
            realForcing: new Date(forcingDate.getTime() + 86400000 * 2),
            rencanaPanen: panenDate,
            aktivitas: actName,
            biaya: biayaAct,
            hasil: hasilAct,
            uom: aIdx % 2 === 0 ? "Kg" : "Ha",
            group: grp,
          });

          actCounter++;
        });
      });
    });

    for (const item of aktivitasEntries) {
      await prisma.aktivitasHPP.upsert({
        where: { idAktivitas: item.idAktivitas },
        update: item,
        create: item,
      });
    }

    return NextResponse.json({
      status: "success",
      message: `Berhasil mengisikan data simulasi komprehensif PRD HPP! (${masterData.length} Lokasi MasterSheet, ${budgetData.length} Budget, ${lokasiHppEntries.length} LokasiHPP per Periode 1-12 & Wilayah W01-W07, ${aktivitasEntries.length} Aktivitas).`,
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
