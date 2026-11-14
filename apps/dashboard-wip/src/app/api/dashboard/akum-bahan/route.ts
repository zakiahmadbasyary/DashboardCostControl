import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLokasi = searchParams.get("lokasi")?.trim();

    if (!rawLokasi) {
      return NextResponse.json({ success: false, data: [], message: "Parameter 'lokasi' diperlukan." }, { status: 400 });
    }

    const cleanLokasi = rawLokasi.replace("LOC-", "").trim();

    const akumBahanItems = await prisma.akumBahan.findMany({
      where: {
        lokasi: {
          equals: cleanLokasi,
          mode: "insensitive",
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: akumBahanItems,
    });
  } catch (error: unknown) {
    console.error("Error fetching akum bahan data:", error);
    return NextResponse.json(
      { success: false, data: [], message: "Gagal memuat data akumulasi bahan." },
      { status: 500 }
    );
  }
}

