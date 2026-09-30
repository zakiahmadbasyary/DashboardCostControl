import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { category } = await req.json();

    if (category === "mastersheet") {
      await prisma.masterSheet.deleteMany();
    } else if (category === "budget") {
      await prisma.budget.deleteMany();
    } else if (category === "lokasi") {
      await prisma.lokasiHPP.deleteMany();
    } else if (category === "aktivitas") {
      await prisma.aktivitasHPP.deleteMany();
    } else if (category === "all") {
      await prisma.aktivitasHPP.deleteMany();
      await prisma.lokasiHPP.deleteMany();
      await prisma.budget.deleteMany();
      await prisma.masterSheet.deleteMany();
    }

    return NextResponse.json({
      status: "success",
      message: `Berhasil mengosongkan data tabel ${category}.`,
    });
  } catch (error: any) {
    console.error("Error resetting data:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengosongkan data database." },
      { status: 500 }
    );
  }
}
