import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LocationData } from "@/types/dashboard";
import { matchesStatus, matchesGroupCost } from "@/lib/filterUtils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const jenisBibit = searchParams.get("jenisBibit");
    const kelasBibit = searchParams.get("kelasBibit");
    const groupCost = searchParams.get("groupCost");
    const umurStr = searchParams.get("umur");
    const wilayah = searchParams.get("wilayah");

    const umurNum = umurStr !== null && umurStr !== "all" ? Number(umurStr) : undefined;

    const dbLokasi = await prisma.lokasi.findMany({
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

      if (!matchesStatus(item.status, status)) return;
      if (jenisBibit && jenisBibit !== "all" && ms.jenisBibit !== jenisBibit) return;
      if (kelasBibit && kelasBibit !== "all" && ms.kelasBibit !== kelasBibit) return;
      if (!matchesGroupCost(item, groupCost)) return;

      if (umurNum !== undefined && item.umur !== umurNum) return;
      if (wilayah && wilayah !== "all" && ms.wilayah !== wilayah) return;

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
