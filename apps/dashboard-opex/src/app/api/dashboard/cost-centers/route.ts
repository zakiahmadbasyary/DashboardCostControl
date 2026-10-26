import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get("period");
    const period = periodParam ? parseInt(periodParam, 10) : 1;

    // Ambil data summary untuk PG1 dan periode terpilih
    const rows = await prisma.summary.findMany({
      where: {
        pg: "PG1",
        periode: period,
      },
      select: {
        costcenter: true,
        deskripsiCostcenter: true,
        nilaiActual: true,
        nilaiBudget: true,
      },
      orderBy: { costcenter: "asc" },
    });

    // Agregasi per Cost Center (menghindari duplikasi perhitungan)
    const map = new Map<
      string,
      {
        costcenter: string;
        deskripsiCostcenter: string;
        actual: number;
        budget: number;
      }
    >();

    for (const r of rows) {
      const cc = r.costcenter || "UNKNOWN";
      const desc = r.deskripsiCostcenter || cc;
      const act = r.nilaiActual ? Number(r.nilaiActual) : 0;
      const bgt = r.nilaiBudget ? Number(r.nilaiBudget) : 0;

      if (!map.has(cc)) {
        map.set(cc, {
          costcenter: cc,
          deskripsiCostcenter: desc,
          actual: 0,
          budget: 0,
        });
      }

      const existing = map.get(cc)!;
      existing.actual += act;
      existing.budget += bgt;
    }

    const result = Array.from(map.values()).map((item) => {
      const variance =
        item.budget > 0
          ? Number((((item.actual - item.budget) / item.budget) * 100).toFixed(2))
          : null;

      return {
        costcenter: item.costcenter,
        deskripsiCostcenter: item.deskripsiCostcenter,
        actual: Math.round(item.actual),
        budget: Math.round(item.budget),
        variance,
      };
    });
    // Urutkan dari variance paling besar ke kecil (Descending)
    result.sort((a, b) => {
      const vA = a.variance ?? -Infinity;
      const vB = b.variance ?? -Infinity;
      return vB - vA;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching cost centers:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar Cost Center OPEX" },
      { status: 500 }
    );
  }
}
