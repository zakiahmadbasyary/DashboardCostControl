import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OPEX_VISIBILITY_FILTER } from "@/lib/filters";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get("period");
    const costcenter = searchParams.get("costcenter");

    if (!costcenter) {
      return NextResponse.json([]);
    }

    const period = periodParam ? parseInt(periodParam, 10) : 1;

    // Ambil baris summary untuk PG1, periode, dan costcenter terpilih (hanya yang isview: true)
    const rows = await prisma.summary.findMany({
      where: {
        pg: "PG1",
        periode: period,
        costcenter: costcenter,
        ...OPEX_VISIBILITY_FILTER,
      },
      select: {
        ce2: true,
        deskripsiCe2: true,
        nilaiActual: true,
        nilaiBudget: true,
      },
      orderBy: { ce2: "asc" },
    });

    const map = new Map<
      string,
      {
        ce2: string;
        deskripsiCe2: string;
        actual: number;
        budget: number;
      }
    >();

    for (const r of rows) {
      const ce = r.ce2 || "UNKNOWN";
      const desc = r.deskripsiCe2 || ce;
      const act = r.nilaiActual ? Number(r.nilaiActual) : 0;
      const bgt = r.nilaiBudget ? Number(r.nilaiBudget) : 0;

      if (!map.has(ce)) {
        map.set(ce, {
          ce2: ce,
          deskripsiCe2: desc,
          actual: 0,
          budget: 0,
        });
      }

      const existing = map.get(ce)!;
      existing.actual += act;
      existing.budget += bgt;
    }

    const result = Array.from(map.values()).map((item) => {
      const variance =
        item.budget > 0
          ? Number((((item.actual - item.budget) / item.budget) * 100).toFixed(2))
          : null;

      return {
        ce2: item.ce2,
        deskripsiCe2: item.deskripsiCe2,
        actual: Math.round(item.actual),
        budget: Math.round(item.budget),
        variance,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching cost elements:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar Cost Element OPEX" },
      { status: 500 }
    );
  }
}
