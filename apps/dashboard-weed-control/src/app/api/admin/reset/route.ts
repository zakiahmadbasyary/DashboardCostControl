import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category } = body;

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Kategori reset tidak ditentukan." },
        { status: 400 }
      );
    }

    if (category === "timeline") {
      // Hapus data_material lalu data_timeline
      await prisma.$transaction(async (tx) => {
        await tx.dataMaterial.deleteMany({});
        await tx.dataTimeline.deleteMany({});
      });

      return NextResponse.json({
        success: true,
        message: "Berhasil mereset seluruh data Timeline dan Rincian Material.",
      });
    }

    if (category === "aktivitas") {
      // Hapus data_aktivitas
      await prisma.dataAktivitas.deleteMany({});

      return NextResponse.json({
        success: true,
        message: "Berhasil mereset seluruh data Rekap Aktivitas.",
      });
    }

    if (category === "lokasi") {
      // Cek apakah ada data timeline atau aktivitas yang masih bergantung
      const [timelineCount, aktivitasCount] = await Promise.all([
        prisma.dataTimeline.count(),
        prisma.dataAktivitas.count(),
      ]);

      if (timelineCount > 0 || aktivitasCount > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Tidak dapat mereset Data Lokasi karena masih terdapat ${timelineCount.toLocaleString(
              "id-ID"
            )} data timeline dan ${aktivitasCount.toLocaleString(
              "id-ID"
            )} data aktivitas yang mereferensikannya. Reset data timeline dan aktivitas terlebih dahulu.`,
          },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.costUmur.deleteMany({});
        await tx.mastersheet.deleteMany({});
      });

      return NextResponse.json({
        success: true,
        message: "Berhasil mereset seluruh Data Lokasi (Mastersheet & Biaya Umur).",
      });
    }

    if (category === "all") {
      // Hapus seluruh 5 tabel sesuai urutan keamanan FK
      await prisma.$transaction(async (tx) => {
        await tx.dataMaterial.deleteMany({});
        await tx.dataTimeline.deleteMany({});
        await tx.dataAktivitas.deleteMany({});
        await tx.costUmur.deleteMany({});
        await tx.mastersheet.deleteMany({});
      });

      return NextResponse.json({
        success: true,
        message: "Berhasil mereset seluruh 5 tabel data Weed Control di database.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Kategori reset tidak dikenali." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Error resetting data:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Terjadi kesalahan server saat mereset data." },
      { status: 500 }
    );
  }
}
