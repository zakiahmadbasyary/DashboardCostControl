import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ActivityData } from "@/types/dashboard";
import { getGroupCostVariants, normalizeGroupCostName } from "@/lib/filterUtils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupCost = searchParams.get("groupCost");
    const lokasi = searchParams.get("lokasi");

    if (!groupCost && !lokasi) {
      return NextResponse.json([]);
    }

    const cleanLokasi = lokasi ? lokasi.replace("LOC-", "") : undefined;
    const gcVariants = groupCost && groupCost !== "all" ? getGroupCostVariants(groupCost) : [];

    const actMatches = await prisma.aktivitas.findMany({
      where: {
        ...(gcVariants.length > 0
          ? {
              OR: gcVariants.flatMap((v) => [
                { groupCost: { equals: v, mode: "insensitive" } },
                { keteranganGroupCost: { equals: v, mode: "insensitive" } },
              ]),
            }
          : {}),
        ...(cleanLokasi && cleanLokasi !== "all"
          ? { lokasi: cleanLokasi }
          : {}),
      },
      include: {
        masterSheet: true,
      },
    });

    const lokasiCodes = Array.from(new Set(actMatches.map((a) => a.lokasi)));
    const lokasiList = await prisma.lokasi.findMany({
      where: { lokasi: { in: lokasiCodes } },
      select: { lokasi: true, status: true },
    });
    const locStatusMap = new Map(lokasiList.map((l) => [l.lokasi, l.status]));

    const result: ActivityData[] = actMatches
      .map((item) => {
        const luas = item.masterSheet?.luas || 1;
        const rawGc = item.keteranganGroupCost || item.groupCost || "";
        return {
          idAktivitas: `ACT-${item.idAktivitas}`,
          aktivitas: item.aktivitas,
          kelas: item.masterSheet?.kelasBibit || "Regular",
          kelasBibit: item.masterSheet?.kelasBibit || "Regular",
          cost: item.biaya,
          biaya: item.biaya,
          luas: luas,
          costHa: luas > 0 ? Math.round(item.biaya / luas) : 0,
          groupCost: normalizeGroupCostName(rawGc),
          lokasi: item.lokasi,
          status: locStatusMap.get(item.lokasi) || "",
          wilayah: item.masterSheet?.wilayah,
        };
      })
      .sort((a, b) => b.costHa - a.costHa);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
