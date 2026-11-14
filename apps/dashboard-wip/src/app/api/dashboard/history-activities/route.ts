import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getZnDetail } from "@/lib/filterUtils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLokasi = searchParams.get("lokasi")?.trim();
    const rawGroupCost = searchParams.get("groupCost")?.trim();

    if (!rawLokasi) {
      return NextResponse.json({ success: false, data: [], message: "Parameter 'lokasi' diperlukan." }, { status: 400 });
    }

    const cleanLokasi = rawLokasi.replace("LOC-", "").trim();

    // Build Prisma query condition
    const where: any = {
      lokasi: {
        equals: cleanLokasi,
        mode: "insensitive",
      },
    };

    if (rawGroupCost && rawGroupCost !== "all" && rawGroupCost !== "Semua") {
      const znInfo = getZnDetail(rawGroupCost);
      const candidates = new Set<string>();
      candidates.add(rawGroupCost);
      if (znInfo?.znCode) {
        candidates.add(znInfo.znCode);
      }
      if (znInfo?.description) {
        candidates.add(znInfo.description);
      }

      where.OR = Array.from(candidates).map((candidate) => ({
        actCostGroup: {
          equals: candidate,
          mode: "insensitive",
        },
      }));
    }

    // Ambil daftar kode aktivitas yang sedang disembunyikan (isActive = true)
    const activeExcludes = await prisma.excludedActivity.findMany({
      where: { isActive: true },
      select: { kodeAktivitas: true },
    });
    const excludedCodes = activeExcludes.map((e) => e.kodeAktivitas);

    if (excludedCodes.length > 0) {
      where.kodeAktifitas = {
        notIn: excludedCodes,
      };
    }

    const historyItems = await prisma.historyAktivitas.findMany({
      where,
      orderBy: {
        tanggalRealisasi: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: historyItems,
    });
  } catch (error: unknown) {
    console.error("Error fetching history activities:", error);
    return NextResponse.json(
      { success: false, data: [], message: "Gagal memuat data history aktivitas." },
      { status: 500 }
    );
  }
}

