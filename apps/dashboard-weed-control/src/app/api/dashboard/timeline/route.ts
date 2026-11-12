import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TimelineItem } from "@/types/dashboard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lokasi = (searchParams.get("lokasi") || "").trim();

    if (!lokasi) {
      return NextResponse.json(
        { success: false, error: "Parameter lokasi wajib diisi" },
        { status: 400 }
      );
    }

    const rows = await prisma.dataTimeline.findMany({
      where: { lokasi },
      orderBy: [
        { tanggalRealisasi: "asc" },
        { id: "asc" },
      ],
      include: {
        _count: {
          select: { materialList: true },
        },
      },
    });

    const data: TimelineItem[] = rows.map((r) => ({
      id: r.id.toString(),
      lokasi: r.lokasi,
      awalRawat: r.awalRawat ? r.awalRawat.toISOString() : null,
      aktivitas: r.aktivitas || "-",
      tanggalRealisasi: r.tanggalRealisasi ? r.tanggalRealisasi.toISOString() : null,
      umur: r.umur ?? null,
      hasil: r.hasil !== null ? Number(r.hasil) : null,
      uom: r.uom || "-",
      tk: r.tk !== null ? Number(r.tk) : null,
      kapasitasPerTk: r.kapasitasPerTk !== null ? Number(r.kapasitasPerTk) : null,
      totalCost: r.totalCost !== null ? Number(r.totalCost) : null,
      upah: r.upah !== null ? Number(r.upah) : null,
      charge: r.charge !== null ? Number(r.charge) : null,
      material: r.material !== null ? Number(r.material) : null,
      hasMaterials: r._count.materialList > 0,
    }));

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
    });
  } catch (error: any) {
    console.error("Error in /api/dashboard/timeline:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal mengambil data timeline",
      },
      { status: 500 }
    );
  }
}

