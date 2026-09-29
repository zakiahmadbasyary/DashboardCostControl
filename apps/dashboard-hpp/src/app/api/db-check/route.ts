import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Tes koneksi tingkat dasar dengan query raw
    await prisma.$queryRaw`SELECT 1`;

    // 2. Hitung jumlah record pada setiap tabel HPP
    const [totalMasterSheet, totalBudget, totalLokasiHPP, totalAktivitasHPP] = await Promise.all([
      prisma.masterSheet.count(),
      prisma.budget.count(),
      prisma.lokasiHPP.count(),
      prisma.aktivitasHPP.count(),
    ]);

    // 3. Ambil contoh sampel data dari masing-masing tabel
    const sampleMaster = await prisma.masterSheet.findFirst();
    const sampleBudget = await prisma.budget.findFirst();

    return NextResponse.json({
      success: true,
      status: "connected",
      message: "Berhasil terhubung ke database PostgreSQL Dashboard HPP via Prisma!",
      schema: "hpp",
      timestamp: new Date().toISOString(),
      statistics: {
        totalMasterSheet,
        totalBudget,
        totalLokasiHPP,
        totalAktivitasHPP,
      },
      sampleData: {
        masterSheet: sampleMaster,
        budget: sampleBudget,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        status: "disconnected",
        message:
          "Gagal terhubung ke database PostgreSQL HPP. Pastikan service PostgreSQL berjalan dan DATABASE_URL di .env sudah sesuai.",
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
