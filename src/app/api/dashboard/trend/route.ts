import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TrendDataPoint } from "@/types/dashboard";
import { matchesStatus, matchesGroupCost } from "@/lib/filterUtils";

const REGIONS = ["AW01", "AW02", "AW03", "AW04", "AW05", "AW06", "AW07"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const jenisBibit = searchParams.get("jenisBibit");
    const kelasBibit = searchParams.get("kelasBibit");
    const groupCost = searchParams.get("groupCost");

    const dbLokasi = await prisma.lokasi.findMany({
      include: {
        masterSheet: true,
      },
    });

    const filtered = dbLokasi.filter((item) => {
      const ms = item.masterSheet;
      if (!ms) return false;
      if (!matchesStatus(item.status, status)) return false;
      if (jenisBibit && jenisBibit !== "all" && ms.jenisBibit !== jenisBibit) return false;
      if (kelasBibit && kelasBibit !== "all" && ms.kelasBibit !== kelasBibit) return false;
      if (!matchesGroupCost(item, groupCost)) return false;
      return true;
    });

    const result: TrendDataPoint[] = Array.from({ length: 22 }, (_, i) => {
      const age = i;
      const point: TrendDataPoint = { umur: age };

      REGIONS.forEach((region) => {
        const matches = filtered.filter(
          (src) => src.masterSheet.wilayah === region && src.umur === age
        );

        // Sum cost for all filtered items in this region and age
        const totalCostWilayah = matches.reduce((acc, curr) => acc + curr.cost, 0);

        // Find unique locations for this region and age, then sum their luas
        const uniqueLocations = new Map<string, number>();
        matches.forEach((item) => {
          if (!uniqueLocations.has(item.lokasi)) {
            uniqueLocations.set(item.lokasi, item.masterSheet.luas);
          }
        });
        const totalLuasWilayah = Array.from(uniqueLocations.values()).reduce(
          (acc, luas) => acc + luas,
          0
        );

        if (totalLuasWilayah > 0 && totalCostWilayah > 0) {
          const costHaRp = totalCostWilayah / totalLuasWilayah;
          const costHaJuta = costHaRp / 1000000;
          point[region] = Math.round(costHaJuta * 10) / 10;
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
