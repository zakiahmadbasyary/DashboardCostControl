import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TrendDataPoint } from "@/types/dashboard";
import { matchesGroupCost } from "@/lib/filterUtils";

const REGIONS = ["AW01", "AW02", "AW03", "AW04", "AW05", "AW06", "AW07"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.trim();
    const jenisBibit = searchParams.get("jenisBibit")?.trim();
    const kelasBibit = searchParams.get("kelasBibit")?.trim();
    const groupCost = searchParams.get("groupCost")?.trim();

    // Build database WHERE clause for Prisma SQL execution
    const where: any = {};

    if (status && status !== "all") {
      if (status === "NS") {
        where.status = { in: ["NSSC", "NSFC"] };
      } else {
        where.status = status;
      }
    }

    const masterSheetWhere: any = {};
    if (jenisBibit && jenisBibit !== "all") {
      masterSheetWhere.jenisBibit = jenisBibit;
    }
    if (kelasBibit && kelasBibit !== "all") {
      masterSheetWhere.kelasBibit = kelasBibit;
    }

    if (Object.keys(masterSheetWhere).length > 0) {
      where.masterSheet = masterSheetWhere;
    }

    const dbLokasi = await prisma.lokasi.findMany({
      where,
      include: {
        masterSheet: true,
      },
    });

    // Filter groupCost if specific option active
    const filtered = dbLokasi.filter((item) => {
      if (!item.masterSheet) return false;
      if (!matchesGroupCost(item, groupCost)) return false;
      return true;
    });

    // Single-pass O(N) Map grouping by (wilayah_umur)
    const map = new Map<string, { totalCost: number; uniqueLocations: Map<string, number> }>();

    filtered.forEach((item) => {
      const region = item.masterSheet.wilayah;
      const age = item.umur;
      const key = `${region}_${age}`;

      if (!map.has(key)) {
        map.set(key, { totalCost: 0, uniqueLocations: new Map() });
      }

      const group = map.get(key)!;
      group.totalCost += item.cost;
      if (!group.uniqueLocations.has(item.lokasi)) {
        group.uniqueLocations.set(item.lokasi, item.masterSheet.luas);
      }
    });

    const result: TrendDataPoint[] = Array.from({ length: 22 }, (_, age) => {
      const point: TrendDataPoint = { umur: age };

      REGIONS.forEach((region) => {
        const key = `${region}_${age}`;
        const group = map.get(key);

        if (group && group.totalCost > 0) {
          const totalLuas = Array.from(group.uniqueLocations.values()).reduce((acc, l) => acc + l, 0);
          if (totalLuas > 0) {
            const costHaRp = group.totalCost / totalLuas;
            const costHaJuta = costHaRp / 1000000;
            point[region] = costHaJuta < 1 ? Number(costHaJuta.toFixed(2)) : Number(costHaJuta.toFixed(1));
          } else {
            point[region] = 0;
          }
        } else {
          point[region] = 0;
        }
      });

      return point;
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

