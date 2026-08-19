import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table") || "mastersheet";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "50", 10));

    const skip = (page - 1) * limit;

    let data: unknown[] = [];
    let total = 0;

    if (table === "mastersheet") {
      const where = search
        ? {
            OR: [
              { lokasi: { contains: search, mode: "insensitive" as const } },
              { wilayah: { contains: search, mode: "insensitive" as const } },
              { kodeBibit: { contains: search, mode: "insensitive" as const } },
              { jenisBibit: { contains: search, mode: "insensitive" as const } },
              { kelasBibit: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      [data, total] = await Promise.all([
        prisma.masterSheet.findMany({
          where,
          skip,
          take: limit,
          orderBy: { lokasi: "asc" },
        }),
        prisma.masterSheet.count({ where }),
      ]);
    } else if (table === "lokasi") {
      const where = search
        ? {
            OR: [
              { lokasi: { contains: search, mode: "insensitive" as const } },
              { status: { contains: search, mode: "insensitive" as const } },
              { kodeSbt: { contains: search, mode: "insensitive" as const } },
              { groupCost: { contains: search, mode: "insensitive" as const } },
              { keteranganGroupCost: { contains: search, mode: "insensitive" as const } },
              { pupuk: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [rawList, rawCount] = await Promise.all([
        prisma.lokasi.findMany({
          where,
          include: { masterSheet: true },
          skip,
          take: limit,
          orderBy: { idLokasi: "asc" },
        }),
        prisma.lokasi.count({ where }),
      ]);

      data = rawList.map((item) => ({
        idLokasi: item.idLokasi,
        lokasi: item.lokasi,
        status: item.status,
        kodeSbt: item.kodeSbt,
        umur: item.umur,
        groupCost: item.groupCost,
        keteranganGroupCost: item.keteranganGroupCost || "",
        cost: item.cost,
        luas: item.masterSheet?.luas || 0,
        costHa: item.masterSheet?.luas ? Math.round(item.cost / item.masterSheet.luas) : 0,
        pupuk: item.pupuk || "",
        wilayah: item.masterSheet?.wilayah || "",
        jenisBibit: item.masterSheet?.jenisBibit || "",
        kelasBibit: item.masterSheet?.kelasBibit || "",
      }));
      total = rawCount;
    } else if (table === "sbt") {
      const where = search
        ? {
            OR: [
              { kodeSbt: { contains: search, mode: "insensitive" as const } },
              { status: { contains: search, mode: "insensitive" as const } },
              { pupuk: { contains: search, mode: "insensitive" as const } },
              { jenis: { contains: search, mode: "insensitive" as const } },
              { kelas: { contains: search, mode: "insensitive" as const } },
              { groupCost: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      [data, total] = await Promise.all([
        prisma.sbt.findMany({
          where,
          skip,
          take: limit,
          orderBy: { kodeSbt: "asc" },
        }),
        prisma.sbt.count({ where }),
      ]);
    } else if (table === "aktivitas") {
      const where = search
        ? {
            OR: [
              { lokasi: { contains: search, mode: "insensitive" as const } },
              { aktivitas: { contains: search, mode: "insensitive" as const } },
              { groupCost: { contains: search, mode: "insensitive" as const } },
              { keteranganGroupCost: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [rawList, rawCount] = await Promise.all([
        prisma.aktivitas.findMany({
          where,
          include: { masterSheet: true },
          skip,
          take: limit,
          orderBy: { idAktivitas: "asc" },
        }),
        prisma.aktivitas.count({ where }),
      ]);

      data = rawList.map((item) => ({
        idAktivitas: item.idAktivitas,
        lokasi: item.lokasi,
        aktivitas: item.aktivitas,
        groupCost: item.groupCost,
        keteranganGroupCost: item.keteranganGroupCost || "",
        biaya: item.biaya,
        luas: item.masterSheet?.luas || 0,
        costHa: item.masterSheet?.luas ? Math.round(item.biaya / item.masterSheet.luas) : 0,
        wilayah: item.masterSheet?.wilayah || "",
        kelasBibit: item.masterSheet?.kelasBibit || "",
      }));
      total = rawCount;
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
