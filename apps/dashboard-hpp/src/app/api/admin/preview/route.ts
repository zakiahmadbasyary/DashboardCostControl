import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || searchParams.get("table") || "mastersheet";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "50", 10));

    // Filter dropdown params
    const wilayah = searchParams.get("wilayah")?.trim();
    const status = searchParams.get("status")?.trim();
    const periode = searchParams.get("periode")?.trim();
    const tahun = searchParams.get("tahun")?.trim();

    const skip = (page - 1) * limit;

    let data: unknown[] = [];
    let total = 0;
    let filterOptions: Record<string, unknown> = {};

    if (tab === "mastersheet") {
      // Filter MasterSheet: wilayah & status
      const andConditions: Record<string, unknown>[] = [];

      if (search) {
        andConditions.push({
          OR: [
            { idMaster: { contains: search, mode: "insensitive" as const } },
            { lokasi: { contains: search, mode: "insensitive" as const } },
            { wilayah: { contains: search, mode: "insensitive" as const } },
            { jenisBibit: { contains: search, mode: "insensitive" as const } },
            { kelasBibit: { contains: search, mode: "insensitive" as const } },
            { status: { contains: search, mode: "insensitive" as const } },
          ],
        });
      }

      if (wilayah && wilayah !== "all") {
        andConditions.push({ wilayah: { equals: wilayah, mode: "insensitive" as const } });
      }

      if (status && status !== "all") {
        andConditions.push({ status: { equals: status, mode: "insensitive" as const } });
      }

      const where = andConditions.length > 0 ? { AND: andConditions } : {};

      const [rawList, rawCount, distinctWilayah, distinctStatus] = await Promise.all([
        prisma.masterSheet.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ wilayah: "asc" }, { lokasi: "asc" }, { idMaster: "asc" }],
        }),
        prisma.masterSheet.count({ where }),
        prisma.masterSheet.findMany({
          select: { wilayah: true },
          distinct: ["wilayah"],
          orderBy: { wilayah: "asc" },
        }),
        prisma.masterSheet.findMany({
          select: { status: true },
          distinct: ["status"],
          orderBy: { status: "asc" },
        }),
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

      filterOptions = {
        wilayahList: distinctWilayah.map((x) => x.wilayah).filter(Boolean),
        statusList: distinctStatus.map((x) => x.status).filter(Boolean),
      };
    } else if (tab === "budget") {
      // Filter Budget: status & periode
      const andConditions: Record<string, unknown>[] = [];

      if (search) {
        andConditions.push({
          OR: [
            { idBudget: { contains: search, mode: "insensitive" as const } },
            { group: { contains: search, mode: "insensitive" as const } },
            { status: { contains: search, mode: "insensitive" as const } },
          ],
        });
      }

      if (status && status !== "all") {
        andConditions.push({ status: { equals: status, mode: "insensitive" as const } });
      }

      if (periode && periode !== "all") {
        const pNum = parseInt(periode, 10);
        if (!isNaN(pNum)) {
          andConditions.push({ periode: pNum });
        }
      }

      const where = andConditions.length > 0 ? { AND: andConditions } : {};

      const [rawList, rawCount, distinctStatus, distinctPeriode] = await Promise.all([
        prisma.budget.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ periode: "asc" }, { group: "asc" }, { idBudget: "asc" }],
        }),
        prisma.budget.count({ where }),
        prisma.budget.findMany({
          select: { status: true },
          distinct: ["status"],
          orderBy: { status: "asc" },
        }),
        prisma.budget.findMany({
          select: { periode: true },
          distinct: ["periode"],
          orderBy: { periode: "asc" },
        }),
      ]);

      data = rawList;
      total = rawCount;

      filterOptions = {
        statusList: distinctStatus.map((x) => x.status).filter(Boolean),
        periodeList: distinctPeriode.map((x) => x.periode).filter((p) => p !== null && p !== undefined),
      };
    } else if (tab === "lokasi") {
      // Filter Lokasi: periode & tahun
      const andConditions: Record<string, unknown>[] = [];

      if (search) {
        andConditions.push({
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
        });
      }

      if (periode && periode !== "all") {
        const pNum = parseInt(periode, 10);
        if (!isNaN(pNum)) {
          andConditions.push({ periode: pNum });
        }
      }

      if (tahun && tahun !== "all") {
        const tNum = parseInt(tahun, 10);
        if (!isNaN(tNum)) {
          andConditions.push({ tahun: tNum });
        }
      }

      const where = andConditions.length > 0 ? { AND: andConditions } : {};

      const [rawList, rawCount, distinctPeriode, distinctTahun] = await Promise.all([
        prisma.lokasiHPP.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ periode: "asc" }, { lokasi: "asc" }, { idLokasiHpp: "asc" }],
        }),
        prisma.lokasiHPP.count({ where }),
        prisma.lokasiHPP.findMany({
          select: { periode: true },
          distinct: ["periode"],
          orderBy: { periode: "asc" },
        }),
        prisma.lokasiHPP.findMany({
          select: { tahun: true },
          distinct: ["tahun"],
          where: { tahun: { not: null } },
          orderBy: { tahun: "asc" },
        }),
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

      filterOptions = {
        periodeList: distinctPeriode.map((x) => x.periode).filter((p) => p !== null && p !== undefined),
        tahunList: distinctTahun.map((x) => x.tahun).filter((t): t is number => t !== null && t !== undefined),
      };
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
          orderBy: [{ lokasi: "asc" }, { idAktivitas: "asc" }],
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
      filterOptions,
    });
  } catch (error: unknown) {
    console.error("Error in admin preview API route:", error);
    return NextResponse.json({ status: "error", message: "Gagal memuat data preview." }, { status: 500 });
  }
}
