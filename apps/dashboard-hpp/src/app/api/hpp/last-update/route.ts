import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const latestLokasiHpp = await prisma.lokasiHPP.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    return NextResponse.json({
      success: true,
      lastUpdated: latestLokasiHpp?.createdAt ? latestLokasiHpp.createdAt.toISOString() : null,
    });
  } catch (error) {
    console.error("Gagal mengambil last update data lokasi HPP:", error);
    return NextResponse.json({ success: false, lastUpdated: null }, { status: 500 });
  }
}

