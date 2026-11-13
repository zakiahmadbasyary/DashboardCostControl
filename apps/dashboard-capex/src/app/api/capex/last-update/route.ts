import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  let lastUpdated: string | null = null;

  // 1. Prioritas 1: Ambil dari total.updatedAt (tabel default capex yang selalu ada di DB VPS & lokal)
  try {
    const latestTotal = await prisma.total.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });
    if (latestTotal?.updatedAt) {
      lastUpdated = latestTotal.updatedAt.toISOString();
    }
  } catch (err) {
    console.warn("Gagal mengambil update timestamp dari total:", err);
  }

  // 2. Prioritas 2: Coba ambil dari upload_log jika tabelnya sudah ada
  if (!lastUpdated) {
    try {
      if ((prisma as any).uploadLog) {
        const latestUpload = await (prisma as any).uploadLog.findFirst({
          where: { category: "created" },
          orderBy: { uploadedAt: "desc" },
          select: { uploadedAt: true },
        });
        if (latestUpload?.uploadedAt) {
          lastUpdated = latestUpload.uploadedAt.toISOString();
        }
      }
    } catch {
      // Abaikan jika tabel upload_log belum dibuat di DB VPS
    }
  }

  // 3. Prioritas 3: Fallback ke req_date terbaru di tabel created
  if (!lastUpdated) {
    try {
      const latestCreated = await prisma.created.findFirst({
        where: { reqDate: { not: null } },
        orderBy: { reqDate: "desc" },
        select: { reqDate: true },
      });
      if (latestCreated?.reqDate) {
        lastUpdated = latestCreated.reqDate.toISOString();
      }
    } catch (err) {
      console.warn("Gagal mengambil reqDate dari created:", err);
    }
  }

  return NextResponse.json({
    success: true,
    lastUpdated,
  });
}


