import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OPEX_VISIBILITY_FILTER } from "@/lib/filters";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ce2 = searchParams.get("ce2");
    const periodParam = searchParams.get("period");
    const period = periodParam ? parseInt(periodParam, 10) : 1;

    if (!ce2) {
      return NextResponse.json({
        monthlyTrend: [],
        costCenterTable: [],
      });
    }

    // 1. Ambil data bulanan 1-12 untuk PG1, PG2, PG3 khusus CE2 terpilih (dengan filter isview: true)
    const monthlyRaw = await prisma.summary.findMany({
      where: {
        ce2: ce2,
        pg: { in: ["PG1", "PG2", "PG3"] },
        ...OPEX_VISIBILITY_FILTER,
      },
      select: {
        periode: true,
        pg: true,
        nilaiActual: true,
      },
    });

    // Inisialisasi 12 bulan
    const monthMap: Record<
      number,
      { pg1: number; pg2: number; pg3: number }
    > = {};

    for (let m = 1; m <= 12; m++) {
      monthMap[m] = { pg1: 0, pg2: 0, pg3: 0 };
    }

    for (const row of monthlyRaw) {
      const p = row.periode;
      const act = row.nilaiActual ? Number(row.nilaiActual) : 0;
      if (monthMap[p]) {
        if (row.pg === "PG1") monthMap[p].pg1 += act;
        else if (row.pg === "PG2") monthMap[p].pg2 += act;
        else if (row.pg === "PG3") monthMap[p].pg3 += act;
      }
    }

    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      return {
        month: m,
        monthName: MONTH_NAMES[i],
        pg1: Math.round(monthMap[m].pg1),
        pg2: Math.round(monthMap[m].pg2),
        pg3: Math.round(monthMap[m].pg3),
      };
    });

    // 2. Ambil data Cost Center per PG untuk periode dan CE2 terpilih (dengan filter isview: true)
    const tableRaw = await prisma.summary.findMany({
      where: {
        ce2: ce2,
        periode: period,
        pg: { in: ["PG1", "PG2", "PG3"] },
        ...OPEX_VISIBILITY_FILTER,
      },
      select: {
        costcenter: true,
        deskripsiCostcenter: true,
        pg: true,
        nilaiActual: true,
      },
      orderBy: { costcenter: "asc" },
    });

    const ccMap = new Map<
      string,
      {
        costcenter: string;
        deskripsiCostcenter: string;
        pg1: number | null;
        pg2: number | null;
        pg3: number | null;
      }
    >();

    for (const r of tableRaw) {
      const cc = r.costcenter || "UNKNOWN";
      const desc = r.deskripsiCostcenter || cc;
      const act = r.nilaiActual !== null && r.nilaiActual !== undefined ? Number(r.nilaiActual) : null;

      if (!ccMap.has(cc)) {
        ccMap.set(cc, {
          costcenter: cc,
          deskripsiCostcenter: desc,
          pg1: null,
          pg2: null,
          pg3: null,
        });
      }

      const existing = ccMap.get(cc)!;
      if (r.pg === "PG1") existing.pg1 = (existing.pg1 ?? 0) + (act ?? 0);
      else if (r.pg === "PG2") existing.pg2 = (existing.pg2 ?? 0) + (act ?? 0);
      else if (r.pg === "PG3") existing.pg3 = (existing.pg3 ?? 0) + (act ?? 0);
    }

    const costCenterTable = Array.from(ccMap.values()).map((c) => ({
      costcenter: c.costcenter,
      deskripsiCostcenter: c.deskripsiCostcenter,
      pg1: c.pg1 !== null ? Math.round(c.pg1) : null,
      pg2: c.pg2 !== null ? Math.round(c.pg2) : null,
      pg3: c.pg3 !== null ? Math.round(c.pg3) : null,
    }));

    return NextResponse.json({
      monthlyTrend,
      costCenterTable,
    });
  } catch (error) {
    console.error("Error fetching trend PG:", error);
    return NextResponse.json(
      { error: "Gagal memuat tren perbandingan antar PG" },
      { status: 500 }
    );
  }
}
