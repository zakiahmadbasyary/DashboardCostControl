import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  let lastUpdated: string | null = null;

  // 1. Prioritas 1: Ambil dari mastersheet.updatedAt (terupdate saat admin upload Data Lokasi)
  try {
    const latestMastersheet = await prisma.mastersheet.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });
    if (latestMastersheet?.updatedAt) {
      lastUpdated = latestMastersheet.updatedAt.toISOString();
    }
  } catch (err) {
    console.warn("Gagal mengambil timestamp dari mastersheet Weed Control:", err);
  }

  // 2. Fallback: Ambil dari costUmur.createdAt (juga bagian dari upload Data Lokasi)
  if (!lastUpdated) {
    try {
      const latestCostUmur = await prisma.costUmur.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });
      if (latestCostUmur?.createdAt) {
        lastUpdated = latestCostUmur.createdAt.toISOString();
      }
    } catch (err) {
      console.warn("Gagal mengambil timestamp dari costUmur Weed Control:", err);
    }
  }

  return NextResponse.json({
    success: true,
    lastUpdated,
  });
}

