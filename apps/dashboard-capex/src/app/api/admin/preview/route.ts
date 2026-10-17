import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Safe serializer for BigInt and Decimal
function serializeData<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, v) => {
      if (typeof v === "bigint") return v.toString();
      return v;
    })
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = (searchParams.get("table") || "created").toLowerCase().trim();
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "50", 10));

    const skip = (page - 1) * limit;

    let data: unknown[] = [];
    let total = 0;

    if (table === "created") {
      const where = search
        ? {
            OR: [
              { capexNo: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { requestor: { contains: search, mode: "insensitive" as const } },
              { io: { contains: search, mode: "insensitive" as const } },
              { mo: { contains: search, mode: "insensitive" as const } },
              { wbs: { contains: search, mode: "insensitive" as const } },
              { costCenter: { contains: search, mode: "insensitive" as const } },
              { noPr: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      [data, total] = await Promise.all([
        prisma.created.findMany({
          where,
          skip,
          take: limit,
          orderBy: { idCreated: "desc" },
        }),
        prisma.created.count({ where }),
      ]);
    } else if (table === "po") {
      const where = search
        ? {
            OR: [
              { nomorPr: { contains: search, mode: "insensitive" as const } },
              { keterangan: { contains: search, mode: "insensitive" as const } },
              { noPo: { contains: search, mode: "insensitive" as const } },
              { pgr: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      [data, total] = await Promise.all([
        prisma.po.findMany({
          where,
          skip,
          take: limit,
          orderBy: { nomorPr: "asc" },
        }),
        prisma.po.count({ where }),
      ]);
    } else if (table === "budget") {
      const where = search
        ? {
            OR: [
              { capexNo: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { io: { contains: search, mode: "insensitive" as const } },
              { mo: { contains: search, mode: "insensitive" as const } },
              { wbs: { contains: search, mode: "insensitive" as const } },
              { costCenter: { contains: search, mode: "insensitive" as const } },
              { groupCapex: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      [data, total] = await Promise.all([
        prisma.budget.findMany({
          where,
          skip,
          take: limit,
          orderBy: { idBudget: "desc" },
        }),
        prisma.budget.count({ where }),
      ]);
    } else if (table === "purchasing") {
      const where = search
        ? {
            OR: [
              { pgr: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      [data, total] = await Promise.all([
        prisma.purchasing.findMany({
          where,
          skip,
          take: limit,
          orderBy: { pgr: "asc" },
        }),
        prisma.purchasing.count({ where }),
      ]);
    } else if (table === "kategori") {
      const where = search
        ? {
            OR: [
              { capexNo: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { costCenter: { contains: search, mode: "insensitive" as const } },
              { kategori: { contains: search, mode: "insensitive" as const } },
              { komoditi: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      [data, total] = await Promise.all([
        prisma.kategori.findMany({
          where,
          skip,
          take: limit,
          orderBy: { capexNo: "asc" },
        }),
        prisma.kategori.count({ where }),
      ]);
    } else if (table === "approver" || table === "user_approver") {
      const where = search
        ? {
            OR: [
              { kodeApprover: { contains: search, mode: "insensitive" as const } },
              { nama: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      [data, total] = await Promise.all([
        prisma.userApprover.findMany({
          where,
          skip,
          take: limit,
          orderBy: { kodeApprover: "asc" },
        }),
        prisma.userApprover.count({ where }),
      ]);
    } else if (table === "cost_center" || table === "costcenter" || table === "cost center") {
      const where = search
        ? {
            OR: [
              { kodeCostCenter: { contains: search, mode: "insensitive" as const } },
              { keterangan: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      [data, total] = await Promise.all([
        prisma.costCenter.findMany({
          where,
          skip,
          take: limit,
          orderBy: { kodeCostCenter: "asc" },
        }),
        prisma.costCenter.count({ where }),
      ]);
    } else if (table === "total") {
      const where = search
        ? {
            OR: [
              { capexNo: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { io: { contains: search, mode: "insensitive" as const } },
              { mo: { contains: search, mode: "insensitive" as const } },
              { wbs: { contains: search, mode: "insensitive" as const } },
              { costCenter: { contains: search, mode: "insensitive" as const } },
              { nomorPr: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      [data, total] = await Promise.all([
        prisma.total.findMany({
          where,
          skip,
          take: limit,
          orderBy: { idTotal: "desc" },
        }),
        prisma.total.count({ where }),
      ]);
    } else {
      return NextResponse.json({ success: false, message: "Tabel tidak ditemukan." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: serializeData(data),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error previewing table data:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat preview data." },
      { status: 500 }
    );
  }
}
