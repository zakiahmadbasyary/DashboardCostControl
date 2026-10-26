import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { category } = await request.json();
    const cleanCategory = String(category || "").toLowerCase().trim();

    if (cleanCategory === "actual" || cleanCategory === "data_actual" || cleanCategory === "data actual") {
      const deleted = await prisma.dataActual.deleteMany({});
      // Reset actual values in summary
      await prisma.summary.updateMany({
        data: {
          nilaiActual: null,
          variance: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Tabel Data Actual berhasil direset (${deleted.count.toLocaleString("id-ID")} baris data dihapus).`,
      });
    }

    if (cleanCategory === "budget" || cleanCategory === "data_budget" || cleanCategory === "data budget") {
      const deleted = await prisma.dataBudget.deleteMany({});
      // Reset budget values in summary
      await prisma.summary.updateMany({
        data: {
          nilaiBudget: null,
          variance: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Tabel Data Budget berhasil direset (${deleted.count.toLocaleString("id-ID")} baris data dihapus).`,
      });
    }

    return NextResponse.json(
      { success: false, message: `Kategori '${category}' tidak valid untuk reset data.` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error resetting data:", error);
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan saat mereset data.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
