import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, data } = body;

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Data Excel kosong atau tidak terbaca." },
        { status: 400 }
      );
    }

    let count = 0;

    if (category === "mastersheet") {
      for (const row of data) {
        const lokasi = String(row.lokasi || row.Lokasi || row.LOKASI || "").trim();
        const wilayah = String(row.wilayah || row.Wilayah || row.WILAYAH || "W01").trim();
        const kodeBibit = String(row.kodeBibit || row.kode_bibit || row["Kode Bibit"] || "").trim();
        const jenisBibit = String(row.jenisBibit || row.jenis_bibit || row["Jenis Bibit"] || "").trim();
        const kelasBibit = String(row.kelasBibit || row.kelas_bibit || row["Kelas Bibit"] || "").trim();

        if (lokasi) {
          await prisma.masterSheet.upsert({
            where: { lokasi },
            update: { wilayah, kodeBibit, jenisBibit, kelasBibit },
            create: { lokasi, wilayah, kodeBibit, jenisBibit, kelasBibit },
          });
          count++;
        }
      }
    } else if (category === "budget") {
      for (const row of data) {
        const idBudget = String(row.idBudget || row.id_budget || row["ID Budget"] || `BUD_${Date.now()}_${count}`).trim();
        const group = String(row.group || row.Group || row["Group"] || "ZN01").trim();
        const status = String(row.status || row.Status || "NSSC").trim();
        const periode = Number(row.periode || row.Periode || 1);
        const budget = Number(row.budget || row.Budget || 0);

        if (idBudget) {
          await prisma.budget.upsert({
            where: { idBudget },
            update: { group, status, periode, budget },
            create: { idBudget, group, status, periode, budget },
          });
          count++;
        }
      }
    } else if (category === "lokasi") {
      for (const row of data) {
        const idLokasiHpp = String(row.idLokasiHpp || row.id_lokasi_hpp || row["ID Lokasi HPP"] || `LH_${count}_${Date.now()}`).trim();
        const lokasi = String(row.lokasi || row.Lokasi || "").trim();
        const idBudget = String(row.idBudget || row.id_budget || "BUD001").trim();
        const periode = Number(row.periode || row.Periode || 1);
        const status = String(row.status || row.Status || "NSSC").trim();
        const qtyPanen = Number(row.qtyPanen || row.qty_panen || row["Qty Panen"] || 0);
        const luasPanen = Number(row.luasPanen || row.luas_panen || row["Luas Panen"] || 0);
        const luasAktif = Number(row.luasAktif || row.luas_aktif || row["Luas Aktif"] || luasPanen);
        const group = String(row.group || row.Group || "ZN01").trim();
        const descGroup = String(row.descGroup || row.desc_group || row["Desc Group"] || `Group ${group}`).trim();
        const jenisBiaya = String(row.jenisBiaya || row.jenis_biaya || row["Jenis Biaya"] || "Umum").trim();
        const biaya = Number(row.biaya || row.Biaya || 0);

        if (idLokasiHpp && lokasi) {
          await prisma.lokasiHPP.upsert({
            where: { idLokasiHpp },
            update: { lokasi, idBudget, periode, status, qtyPanen, luasPanen, luasAktif, group, descGroup, jenisBiaya, biaya },
            create: { idLokasiHpp, lokasi, idBudget, periode, status, qtyPanen, luasPanen, luasAktif, group, descGroup, jenisBiaya, biaya },
          });
          count++;
        }
      }
    } else if (category === "aktivitas") {
      for (const row of data) {
        const idAktivitas = String(row.idAktivitas || row.id_aktivitas || row["ID Aktivitas"] || `ACT_${count}_${Date.now()}`).trim();
        const lokasi = String(row.lokasi || row.Lokasi || "").trim();
        const aktivitas = String(row.aktivitas || row.Aktivitas || row["Nama Aktivitas"] || "Aktivitas").trim();
        const biaya = Number(row.biaya || row.Biaya || 0);
        const hasil = Number(row.hasil || row.Hasil || 0);
        const uom = String(row.uom || row.UoM || row["UoM"] || "").trim();
        const group = String(row.group || row.Group || "ZN01").trim();

        if (idAktivitas && lokasi) {
          await prisma.aktivitasHPP.upsert({
            where: { idAktivitas },
            update: { lokasi, aktivitas, biaya, hasil, uom, group },
            create: { idAktivitas, lokasi, aktivitas, biaya, hasil, uom, group },
          });
          count++;
        }
      }
    }

    return NextResponse.json({
      status: "success",
      message: `Berhasil mengunggah & menyimpan ${count} data ${category} ke database Prisma PostgreSQL.`,
      count,
    });
  } catch (error: any) {
    console.error("Error uploading Excel data:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal menyimpan data Excel ke database." },
      { status: 500 }
    );
  }
}
