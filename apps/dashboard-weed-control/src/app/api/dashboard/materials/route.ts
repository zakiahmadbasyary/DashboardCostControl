import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MaterialItem } from "@/types/dashboard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timelineIdStr = searchParams.get("timelineId");

    if (!timelineIdStr) {
      return NextResponse.json(
        { success: false, error: "Parameter timelineId wajib diisi" },
        { status: 400 }
      );
    }

    const timelineId = BigInt(timelineIdStr);

    const [timelineInfo, rows] = await Promise.all([
      prisma.dataTimeline.findUnique({
        where: { id: timelineId },
        select: {
          id: true,
          lokasi: true,
          aktivitas: true,
          tanggalRealisasi: true,
          material: true,
        },
      }),
      prisma.dataMaterial.findMany({
        where: {
          timelineId,
          quantity: {
            gt: 0,
          },
        },
        orderBy: [
          { quantity: "desc" },
          { namaMaterial: "asc" },
        ],
      }),
    ]);

    const materials: MaterialItem[] = rows.map((r) => ({
      id: r.id.toString(),
      namaMaterial: r.namaMaterial,
      quantity: Number(r.quantity),
    }));

    return NextResponse.json({
      success: true,
      data: {
        timeline: timelineInfo
          ? {
              id: timelineInfo.id.toString(),
              lokasi: timelineInfo.lokasi,
              aktivitas: timelineInfo.aktivitas || "-",
              tanggalRealisasi: timelineInfo.tanggalRealisasi
                ? timelineInfo.tanggalRealisasi.toISOString()
                : null,
              totalMaterialCost:
                timelineInfo.material !== null ? Number(timelineInfo.material) : null,
            }
          : null,
        materials,
        total: materials.length,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/dashboard/materials:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal mengambil data material",
      },
      { status: 500 }
    );
  }
}

