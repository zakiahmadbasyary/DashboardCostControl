import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LocationData } from "@/types/dashboard";
import { matchesGroupCost } from "@/lib/filterUtils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.trim();
    const jenisBibit = searchParams.get("jenisBibit")?.trim();
    const kelasBibit = searchParams.get("kelasBibit")?.trim();
    const groupCost = searchParams.get("groupCost")?.trim();
    const umurStr = searchParams.get("umur");
    const umurArr =
      umurStr !== null && umurStr !== "all" && umurStr !== ""
        ? umurStr.split(",").map(Number).filter((n) => !isNaN(n))
        : [];

    const wilayahStr = searchParams.get("wilayah");
    const wilayahArr = wilayahStr ? wilayahStr.split(",").map((w) => w.trim()).filter(Boolean) : [];

    const where: any = {};

    if (status && status !== "all") {
      if (status === "NS") {
        where.status = { in: ["NSSC", "NSFC"] };
      } else {
        where.status = status;
      }
    }

    if (umurArr.length > 0 && !umurStr?.includes("all")) {
      where.umur = { in: umurArr };
    }

    const masterSheetWhere: any = {};
    if (jenisBibit && jenisBibit !== "all") {
      masterSheetWhere.jenisBibit = jenisBibit;
    }
    if (kelasBibit && kelasBibit !== "all") {
      masterSheetWhere.kelasBibit = kelasBibit;
    }
    if (wilayahArr.length > 0 && !wilayahArr.includes("all")) {
      masterSheetWhere.wilayah = { in: wilayahArr };
    }

    if (Object.keys(masterSheetWhere).length > 0) {
      where.masterSheet = masterSheetWhere;
    }

    const dbLokasi = await prisma.lokasi.findMany({
      where,
      include: {
        masterSheet: true,
        sbt: true,
      },
    });

    const locGroupMap = new Map<string, {
      idLokasi: string;
      lokasi: string;
      wilayah: string;
      umur: number;
      kelas: string;
      jenisBibit: string;
      groupCost: string;
      cost: number;
      luas: number;
      status: string;
      codeSbt: string;
      pupuk: string;
    }>();

    dbLokasi.forEach((item) => {
      const ms = item.masterSheet;
      if (!ms) return;

      if (!matchesGroupCost(item, groupCost)) return;

      const key = `${item.lokasi}`;
      if (!locGroupMap.has(key)) {
        locGroupMap.set(key, {
          idLokasi: `LOC-${item.idLokasi}`,
          lokasi: item.lokasi,
          wilayah: ms.wilayah,
          umur: item.umur,
          kelas: ms.kelasBibit,
          jenisBibit: ms.jenisBibit,
          groupCost: item.keteranganGroupCost || item.groupCost,
          cost: 0,
          luas: ms.luas,
          status: item.status,
          codeSbt: item.kodeSbt,
          pupuk: item.pupuk || "",
        });
      }
      const curr = locGroupMap.get(key)!;
      curr.cost += item.cost;
    });

    const result: LocationData[] = Array.from(locGroupMap.values())
      .map((loc) => ({
        ...loc,
        costHa: loc.luas > 0 ? Math.round(loc.cost / loc.luas) : 0,
      }))
      .sort((a, b) => b.costHa - a.costHa);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

