import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Cek dari riwayat upload_log untuk kategori data 'created'
    const latestUpload = await prisma.uploadLog.findFirst({
      where: { category: "created" },
      orderBy: { uploadedAt: "desc" },
      select: { uploadedAt: true },
    });

    if (latestUpload?.uploadedAt) {
      return NextResponse.json({
        success: true,
        lastUpdated: latestUpload.uploadedAt.toISOString(),
      });
    }

    // 2. Fallback ke total.updatedAt jika upload_log kosong
    const latestTotal = await prisma.total.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });

    return NextResponse.json({
      success: true,
      lastUpdated: latestTotal?.updatedAt ? latestTotal.updatedAt.toISOString() : null,
    });
  } catch (error) {
    console.error("Gagal mengambil last update data created CAPEX:", error);
    return NextResponse.json({ success: false, lastUpdated: null }, { status: 500 });
  }
}

