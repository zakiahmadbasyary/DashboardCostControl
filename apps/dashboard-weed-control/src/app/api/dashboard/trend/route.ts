import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TrendDataPoint, TrendRawMetric } from "@/types/dashboard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const aktivitas = (searchParams.get("aktivitas") || "Total Aktivitas").trim();
    const status = (searchParams.get("status") || "NS").trim();

    // Bangun filter status SQL
    let statusCondition = "m.status IN ('NSFC', 'NSSC')";
    if (status === "NSFC") {
      statusCondition = "m.status = 'NSFC'";
    } else if (status === "NSSC") {
      statusCondition = "m.status = 'NSSC'";
    } else if (status === "all") {
      statusCondition = "1=1";
    }

    let rows: Array<{
      wilayah: string;
      umur: number;
      total_biaya: number;
      total_luas: number;
      cost_per_ha: number | null;
    }> = [];

    if (aktivitas === "Total Aktivitas") {
      rows = await prisma.$queryRawUnsafe<
        Array<{
          wilayah: string;
          umur: number;
          total_biaya: number;
          total_luas: number;
          cost_per_ha: number | null;
        }>
      >(`
        SELECT 
          m.wilayah,
          m.umur,
          COALESCE(SUM(m.total_cost), 0)::float AS total_biaya,
          COALESCE(SUM(m.luas), 0)::float AS total_luas,
          CASE 
            WHEN COALESCE(SUM(m.luas), 0) > 0 
            THEN (SUM(m.total_cost) / SUM(m.luas))::float 
            ELSE NULL 
          END AS cost_per_ha
        FROM weed_control.mastersheet m
        WHERE m.wilayah IS NOT NULL 
          AND m.umur IS NOT NULL
          AND ${statusCondition}
        GROUP BY m.wilayah, m.umur
        ORDER BY m.umur ASC, m.wilayah ASC;
      `);
    } else {
      // Aktivitas tertentu: Hindari JOIN mentah yang menggandakan luas lokasi!
      // Hitung total biaya per lokasi unik terlebih dahulu, lalu gabungkan dengan luas lokasi unik
      const escapedAktivitas = aktivitas.replace(/'/g, "''");
      rows = await prisma.$queryRawUnsafe<
        Array<{
          wilayah: string;
          umur: number;
          total_biaya: number;
          total_luas: number;
          cost_per_ha: number | null;
        }>
      >(`
        WITH loc_agg AS (
          SELECT 
            da.lokasi,
            m.wilayah,
            m.umur,
            m.luas,
            SUM(da.biaya) AS total_biaya
          FROM weed_control.data_aktivitas da
          JOIN weed_control.mastersheet m ON da.lokasi = m.lokasi
          WHERE da.aktivitas = '${escapedAktivitas}'
            AND m.wilayah IS NOT NULL
            AND m.umur IS NOT NULL
            AND ${statusCondition}
          GROUP BY da.lokasi, m.wilayah, m.umur, m.luas
        )
        SELECT
          wilayah,
          umur,
          COALESCE(SUM(total_biaya), 0)::float AS total_biaya,
          COALESCE(SUM(luas), 0)::float AS total_luas,
          CASE 
            WHEN COALESCE(SUM(luas), 0) > 0 
            THEN (SUM(total_biaya) / SUM(luas))::float 
            ELSE NULL 
          END AS cost_per_ha
        FROM loc_agg
        GROUP BY wilayah, umur
        ORDER BY umur ASC, wilayah ASC;
      `);
    }

    // Kelompokkan hasil per umur untuk Recharts BarChart
    const mapByUmur = new Map<number, TrendDataPoint>();

    for (const r of rows) {
      if (!mapByUmur.has(r.umur)) {
        mapByUmur.set(r.umur, {
          umur: r.umur,
          raw: {},
        });
      }

      const point = mapByUmur.get(r.umur)!;
      const roundedCostHa = r.cost_per_ha !== null ? Math.round(r.cost_per_ha * 100) / 100 : null;
      point[r.wilayah] = roundedCostHa;

      if (!point.raw) point.raw = {};
      point.raw[r.wilayah] = {
        totalBiaya: r.total_biaya,
        totalLuas: r.total_luas,
        costHa: r.cost_per_ha,
      };
    }

    const data: TrendDataPoint[] = Array.from(mapByUmur.values()).sort(
      (a, b) => a.umur - b.umur
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error in /api/dashboard/trend:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal mengambil data trend cost",
      },
      { status: 500 }
    );
  }
}

