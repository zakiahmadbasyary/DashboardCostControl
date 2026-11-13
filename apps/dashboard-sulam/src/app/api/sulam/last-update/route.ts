import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const latestSulam = await prisma.sulam.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    return NextResponse.json({
      success: true,
      lastUpdated: latestSulam?.createdAt ? latestSulam.createdAt.toISOString() : null,
    });
  } catch (error) {
    console.error("Gagal mengambil last update data transaksi Sulam:", error);
    return NextResponse.json({ success: false, lastUpdated: null }, { status: 500 });
  }
}

