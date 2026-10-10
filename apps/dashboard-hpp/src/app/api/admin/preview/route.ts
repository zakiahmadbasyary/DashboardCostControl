import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || searchParams.get("table") || "mastersheet";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "50", 10));

    const skip = (page - 1) * limit;

    let data: unknown[] = [];
    let total = 0;

    if (tab === "mastersheet") {
      const where = search
        ? {
            OR: [
              { idMaster: { contains: search, mode: "insensitive" as const } },
              { lokasi: { contains: search, mode: "insensitive" as const } },
              { wilayah: { contains: search, mode: "insensitive" as const } },
              { jenisBibit: { contains: search, mode: "insensitive" as const } },
              { kelasBibit: { contains: search, mode: "insensitive" as const } },
              { status: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [rawList, rawCount] = await Promise.all([
        prisma.masterSheet.findMany({
          where,
          skip,
          take: limit,
          orderBy: { idMaster: "asc" },
        }),
        prisma.masterSheet.count({ where }),
      ]);

      data = rawList.map((item) => ({
        ...item,
        tanggalRawat: item.tanggalRawat ? item.tanggalRawat.toISOString().split("T")[0] : null,
        tanggalTanam: item.tanggalTanam ? item.tanggalTanam.toISOString().split("T")[0] : null,
        tanggalForcingStandard: item.tanggalForcingStandard ? item.tanggalForcingStandard.toISOString().split("T")[0] : null,
        tanggalRenForcing: item.tanggalRenForcing ? item.tanggalRenForcing.toISOString().split("T")[0] : null,
        tanggalRealForcing: item.tanggalRealForcing ? item.tanggalRealForcing.toISOString().split("T")[0] : null,
        tanggalSelesaiPanen: item.tanggalSelesaiPanen ? item.tanggalSelesaiPanen.toISOString().split("T")[0] : null,
      }));
      total = rawCount;
    } else if (tab === "budget") {
      const where = search
        ? {
            OR: [
              { idBudget: { contains: search, mode: "insensitive" as const } },
              { group: { contains: search, mode: "insensitive" as const } },
              { status: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      [data, total] = await Promise.all([
        prisma.budget.findMany({
          where,
          skip,
          take: limit,
          orderBy: { idBudget: "asc" },
        }),
        prisma.budget.count({ where }),
      ]);
    } else if (tab === "lokasi") {
      const where = search
        ? {
            OR: [
              { idLokasiHpp: { contains: search, mode: "insensitive" as const } },
              { idMaster: { contains: search, mode: "insensitive" as const } },
              { lokasi: { contains: search, mode: "insensitive" as const } },
              { idBudget: { contains: search, mode: "insensitive" as const } },
              { status: { contains: search, mode: "insensitive" as const } },
              { group: { contains: search, mode: "insensitive" as const } },
              { descGroup: { contains: search, mode: "insensitive" as const } },
              { jenisBiaya: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [rawList, rawCount] = await Promise.all([
        prisma.lokasiHPP.findMany({
          where,
          skip,
          take: limit,
          orderBy: { idLokasiHpp: "asc" },
        }),
        prisma.lokasiHPP.count({ where }),
      ]);

      data = rawList.map((item) => ({
        idLokasiHpp: item.idLokasiHpp,
        idMaster: item.idMaster,
        lokasi: item.lokasi,
        idBudget: item.idBudget,
        periode: item.periode,
        tahun: item.tahun,
        tanggalRawat: item.tanggalRawat ? item.tanggalRawat.toISOString().split("T")[0] : null,
        status: item.status,
        jenisBibit: item.jenisBibit,
        kelasBibit: item.kelasBibit,
        qtyPanen: item.qtyPanen ? Number(item.qtyPanen) : 0,
        luasPanen: item.luasPanen ? Number(item.luasPanen) : 0,
        luasAktif: item.luasAktif ? Number(item.luasAktif) : 0,
        group: item.group,
        descGroup: item.descGroup,
        jenisBiaya: item.jenisBiaya,
        biaya: item.biaya ? Number(item.biaya) : 0,
      }));
      total = rawCount;
    } else if (tab === "aktivitas") {
      const where = search
        ? {
            OR: [
              { idAktivitas: { contains: search, mode: "insensitive" as const } },
              { idMaster: { contains: search, mode: "insensitive" as const } },
              { lokasi: { contains: search, mode: "insensitive" as const } },
              { aktivitas: { contains: search, mode: "insensitive" as const } },
              { group: { contains: search, mode: "insensitive" as const } },
              { uom: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [rawList, rawCount] = await Promise.all([
        prisma.aktivitasHPP.findMany({
          where,
          skip,
          take: limit,
          orderBy: { idAktivitas: "asc" },
        }),
        prisma.aktivitasHPP.count({ where }),
      ]);

      data = rawList.map((item) => ({
        idAktivitas: item.idAktivitas,
        idMaster: item.idMaster,
        lokasi: item.lokasi,
        tanggalMulaiRawat: item.tanggalMulaiRawat ? item.tanggalMulaiRawat.toISOString().split("T")[0] : null,
        tanggalMulaiTanam: item.tanggalMulaiTanam ? item.tanggalMulaiTanam.toISOString().split("T")[0] : null,
        tanggalForcingStandard: item.tanggalForcingStandard ? item.tanggalForcingStandard.toISOString().split("T")[0] : null,
        rencanaForcing: item.rencanaForcing ? item.rencanaForcing.toISOString().split("T")[0] : null,
        realForcing: item.realForcing ? item.realForcing.toISOString().split("T")[0] : null,
        rencanaPanen: item.rencanaPanen ? item.rencanaPanen.toISOString().split("T")[0] : null,
        aktivitas: item.aktivitas,
        biaya: item.biaya ? Number(item.biaya) : 0,
        hasil: item.hasil ? Number(item.hasil) : 0,
        uom: item.uom,
        group: item.group,
      }));
      total = rawCount;
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      status: "success",
      data,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: unknown) {
    console.error("Error in admin preview API route:", error);
    return NextResponse.json({ status: "error", message: "Gagal memuat data preview." }, { status: 500 });
  }
}
