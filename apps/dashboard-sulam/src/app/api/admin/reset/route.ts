import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const [deletedSulam, deletedSummary] = await prisma.$transaction(async (tx) => {
      // 1. Hapus transaksi sulam (anak relasi)
      const sulamCount = await tx.sulam.deleteMany({});
      // 2. Hapus summary sulam (induk relasi)
      const summaryCount = await tx.summarySulam.deleteMany({});
      return [sulamCount, summaryCount];
    });

    return NextResponse.json({
      success: true,
      message: `Database Sulam berhasil direset: ${deletedSulam.count.toLocaleString(
        "id-ID"
      )} transaksi sulam dan ${deletedSummary.count.toLocaleString("id-ID")} summary kode dihapus.`,
      deletedCount: deletedSulam.count,
    });
  } catch (error: any) {
    console.error("Gagal mereset data Sulam:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengosongkan database Sulam.",
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

