import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityCostItem, AgeCostDataPoint } from "@/types/dashboard";

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

    // 1. Ambil data master lokasi untuk mendapatkan luas
    const master = await prisma.mastersheet.findUnique({
      where: { lokasi },
      select: { luas: true },
    });

    const luas = master?.luas !== null && master?.luas !== undefined ? Number(master.luas) : 0;

    // 2. Kueri tabel aktivitas (Bagian Kiri)
    // Kelompokkan per aktivitas, jumlahkan biaya, bagi luas lokasi 1 kali
    const escapedLokasi = lokasi.replace(/'/g, "''");
    const rawActivities = await prisma.$queryRawUnsafe<
      Array<{
        aktivitas: string | null;
        total_biaya: number | null;
      }>
    >(`
      SELECT 
        da.aktivitas,
        COALESCE(SUM(da.biaya), 0)::float AS total_biaya
      FROM weed_control.data_aktivitas da
      WHERE da.lokasi = '${escapedLokasi}'
        AND da.aktivitas IS NOT NULL
      GROUP BY da.aktivitas
      ORDER BY total_biaya DESC;
    `);

    const activities: ActivityCostItem[] = rawActivities.map((a) => {
      const totalBiaya = a.total_biaya ?? 0;
      const costHa = luas > 0 ? totalBiaya / luas : 0;
      return {
        aktivitas: a.aktivitas || "-",
        totalBiaya,
        costHa: Math.round(costHa * 100) / 100,
      };
    });

    // 3. Kueri tabel cost_umur untuk grafik kombinasi Bar + Line (Bagian Kanan)
    const rawCostUmur = await prisma.costUmur.findMany({
      where: { lokasi },
      orderBy: { umur: "asc" },
      select: {
        umur: true,
        cost: true,
      },
    });

    let runningCumulativeCost = 0;
    const chartData: AgeCostDataPoint[] = [];

    for (const cu of rawCostUmur) {
      const rawCost = Number(cu.cost);
      let costHa: number | null = null;

      if (luas > 0) {
        costHa = rawCost / luas;
        runningCumulativeCost += costHa;
      }

      chartData.push({
        umur: cu.umur,
        rawCost,
        luas,
        costHa: costHa !== null ? Math.round(costHa * 100) / 100 : null,
        kumulatifCostHa: luas > 0 ? Math.round(runningCumulativeCost * 100) / 100 : null,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        lokasi,
        luas,
        activities,
        chartData,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/dashboard/activity-cost:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal mengambil data aktivitas dan cost umur",
      },
      { status: 500 }
    );
  }
}

