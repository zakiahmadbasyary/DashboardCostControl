import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "mastersheet";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)));
    const search = (searchParams.get("search") || "").trim();
    const skip = (page - 1) * limit;

    let data: any[] = [];
    let total = 0;

    if (tab === "mastersheet") {
      const where: any = search
        ? {
            OR: [
              { lokasi: { contains: search, mode: "insensitive" } },
              { wilayah: { contains: search, mode: "insensitive" } },
              { status: { contains: search, mode: "insensitive" } },
              { jenis: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      [total, data] = await Promise.all([
        prisma.mastersheet.count({ where }),
        prisma.mastersheet.findMany({
          where,
          orderBy: { lokasi: "asc" },
          skip,
          take: limit,
        }),
      ]);
    } else if (tab === "cost_umur") {
      const where: any = search
        ? {
            OR: [
              { lokasi: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      [total, data] = await Promise.all([
        prisma.costUmur.count({ where }),
        prisma.costUmur.findMany({
          where,
          orderBy: [{ lokasi: "asc" }, { umur: "asc" }],
          skip,
          take: limit,
        }),
      ]);
    } else if (tab === "data_timeline") {
      const where: any = search
        ? {
            OR: [
              { lokasi: { contains: search, mode: "insensitive" } },
              { aktivitas: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      [total, data] = await Promise.all([
        prisma.dataTimeline.count({ where }),
        prisma.dataTimeline.findMany({
          where,
          orderBy: [{ tanggalRealisasi: "desc" }, { id: "asc" }],
          skip,
          take: limit,
          include: {
            materialList: true,
          },
        }),
      ]);
    } else if (tab === "data_material") {
      const where: any = search
        ? {
            OR: [
              { namaMaterial: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      [total, data] = await Promise.all([
        prisma.dataMaterial.count({ where }),
        prisma.dataMaterial.findMany({
          where,
          orderBy: [{ id: "asc" }],
          skip,
          take: limit,
        }),
      ]);
    } else if (tab === "data_aktivitas") {
      const where: any = search
        ? {
            OR: [
              { lokasi: { contains: search, mode: "insensitive" } },
              { aktivitas: { contains: search, mode: "insensitive" } },
              { kode: { contains: search, mode: "insensitive" } },
              { activityGroup: { contains: search, mode: "insensitive" } },
              { wilayah: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      [total, data] = await Promise.all([
        prisma.dataAktivitas.count({ where }),
        prisma.dataAktivitas.findMany({
          where,
          orderBy: [{ id: "asc" }],
          skip,
          take: limit,
        }),
      ]);
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (err: any) {
    console.error("Error in preview route:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Gagal mengambil data preview." },
      { status: 500 }
    );
  }
}
