import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get("period");
    const costcenter = searchParams.get("costcenter");
    const ce2 = searchParams.get("ce2");

    if (!costcenter || !ce2) {
      return NextResponse.json({ activities: [], totalCost: 0 });
    }

    const period = periodParam ? parseInt(periodParam, 10) : 1;

    // Filter transaksi data_actual sesuai aturan PRD:
    // period, pg = 'PG1', costcenter, ce2
    const records = await prisma.dataActual.findMany({
      where: {
        pg: "PG1",
        period: period,
        costcenter: costcenter,
        ce2: ce2,
      },
      select: {
        idActual: true,
        documentNumber: true,
        postingDate: true,
        notes: true,
        idrAct: true,
      },
      orderBy: { idActual: "asc" },
    });

    // Ringkasan per nama aktivitas (notes)
    const groupedMap = new Map<
      string,
      {
        activity: string;
        totalCost: number;
        count: number;
      }
    >();

    let totalCost = 0;

    for (const r of records) {
      const actName = r.notes?.trim() || "Tanpa Keterangan";
      const cost = r.idrAct ? Number(r.idrAct) : 0;
      totalCost += cost;

      if (!groupedMap.has(actName)) {
        groupedMap.set(actName, {
          activity: actName,
          totalCost: 0,
          count: 0,
        });
      }

      const existing = groupedMap.get(actName)!;
      existing.totalCost += cost;
      existing.count += 1;
    }

    const activities = Array.from(groupedMap.values()).map((g) => ({
      activity: g.activity,
      totalCost: Math.round(g.totalCost),
      count: g.count,
    }));

    // Urutkan berdasarkan total biaya terbesar
    activities.sort((a, b) => b.totalCost - a.totalCost);

    return NextResponse.json({
      activities,
      totalCost: Math.round(totalCost),
      transactionCount: records.length,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Gagal memuat rincian aktivitas OPEX" },
      { status: 500 }
    );
  }
}
