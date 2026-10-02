import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Empty database tables
    await prisma.aktivitasHPP.deleteMany();
    await prisma.lokasiHPP.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.masterSheet.deleteMany();

    return NextResponse.json({
      status: "success",
      message: "Berhasil mengosongkan seluruh data dummy dari database HPP. Database sekarang siap menerima data asli dari upload Excel.",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error resetting database:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengosongkan database HPP" },
      { status: 500 }
    );
  }
}

