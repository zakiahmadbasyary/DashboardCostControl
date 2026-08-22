import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GroupCostData } from "@/types/dashboard";
import { normalizeGroupCostName, getZnSortOrder } from "@/lib/filterUtils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lokasi = searchParams.get("lokasi");

    if (!lokasi) {
      return NextResponse.json([]);
    }

    const cleanLokasi = lokasi.replace("LOC-", "");
    const locMatches = await prisma.lokasi.findMany({
      where: {
        lokasi: cleanLokasi,
      },
      include: {
        masterSheet: true,
        sbt: true,
      },
    });

    if (locMatches.length > 0) {
      const gcMap: Record<string, { totalCost: number; luas: number; sbtVal: number; codeSbt: string }> = {};

      locMatches.forEach((item) => {
        const rawGcName = item.keteranganGroupCost?.trim();
        if (!rawGcName) return;
        const gcName = normalizeGroupCostName(rawGcName);

        const luas = item.masterSheet?.luas || 1;
        const sbtVal = item.sbt?.nilaiSbt || 0;

        if (!gcMap[gcName]) {
          gcMap[gcName] = { totalCost: 0, luas, sbtVal: sbtVal || 0, codeSbt: item.kodeSbt || "" };
        }
        gcMap[gcName].totalCost += item.cost;
      });

      const result: GroupCostData[] = Object.keys(gcMap)
        .map((gcKey) => {
          const entry = gcMap[gcKey];
          const costHa = entry.luas > 0 ? entry.totalCost / entry.luas : 0;
          return {
            groupCost: gcKey,
            costHa: Math.round(costHa),
            sbt: Math.round(entry.sbtVal),
            codeSbt: entry.codeSbt,
          };
        })
        .sort((a, b) => {
          const orderA = getZnSortOrder(a);
          const orderB = getZnSortOrder(b);
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return a.groupCost.localeCompare(b.groupCost);
        });

      return NextResponse.json(result);
    }

    return NextResponse.json([]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
