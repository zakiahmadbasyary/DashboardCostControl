import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.bahanMaterial.deleteMany();
      await tx.masterSheet.deleteMany();
    });

    return NextResponse.json({
      success: true,
      message: "Seluruh data pada tabel MasterSheet & BahanMaterial berhasil dikosongkan.",
    });
  } catch (error: unknown) {
    console.error("Error resetting data:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message: `Gagal melakukan reset data: ${msg}` }, { status: 500 });
  }
}
