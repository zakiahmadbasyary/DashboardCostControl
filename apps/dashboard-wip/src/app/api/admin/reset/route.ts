import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const category = String(body.category || "").toLowerCase().trim();

    let categoryTitle = "";
    let deletedCount = 0;

    if (category === "mastersheet") {
      categoryTitle = "MasterSheet";
      const res = await prisma.masterSheet.deleteMany();
      deletedCount = res.count;
    } else if (category === "sbt") {
      categoryTitle = "Data SBT";
      const res = await prisma.sbt.deleteMany();
      deletedCount = res.count;
    } else if (category === "lokasi") {
      categoryTitle = "Data Lokasi";
      const res = await prisma.lokasi.deleteMany();
      deletedCount = res.count;
    } else if (category === "aktivitas") {
      categoryTitle = "Data Aktivitas";
      const res = await prisma.aktivitas.deleteMany();
      deletedCount = res.count;
    } else {
      return NextResponse.json(
        { success: false, message: `Kategori '${category}' tidak valid.` },
        { status: 400 }
      );
    }

    // Log Activity in PostgreSQL database
    const session = getAdminSessionFromRequest(request);
    const adminUser = session
      ? await prisma.user.findFirst({ where: { id: session.id } })
      : await prisma.user.findFirst({ where: { role: "admin" } });

    if (adminUser) {
      await prisma.activityLog.create({
        data: {
          userId: adminUser.id,
          action: "RESET_DATA",
          dataSource: categoryTitle,
          fileName: null,
          description: `Berhasil mengosongkan ${deletedCount.toLocaleString("id-ID")} baris data pada tabel ${categoryTitle} (Struktur kolom tetap terjaga).`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengosongkan data tabel ${categoryTitle}! ${deletedCount.toLocaleString("id-ID")} baris data dihapus (Struktur kolom tetap utuh).`,
      count: deletedCount,
    });
  } catch (error: unknown) {
    console.error("Error in reset API route:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengosongkan data karena kesalahan server internal." },
      { status: 500 }
    );
  }
}
