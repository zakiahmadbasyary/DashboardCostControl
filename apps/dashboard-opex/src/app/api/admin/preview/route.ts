import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = (searchParams.get("table") || searchParams.get("category") || "actual").toLowerCase().trim();
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "50", 10));

    const skip = (page - 1) * limit;

    let data: unknown[] = [];
    let total = 0;

    // 1. DATA ACTUAL
    if (table === "actual" || table === "data_actual") {
      const where = search
        ? {
            OR: [
              { costcenter: { contains: search, mode: "insensitive" as const } },
              { deskripsiCostcenter: { contains: search, mode: "insensitive" as const } },
              { ce2: { contains: search, mode: "insensitive" as const } },
              { deskripsiCe2: { contains: search, mode: "insensitive" as const } },
              { notes: { contains: search, mode: "insensitive" as const } },
              { pg: { contains: search, mode: "insensitive" as const } },
              { documentNumber: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [records, count] = await Promise.all([
        prisma.dataActual.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ period: "asc" }, { costcenter: "asc" }, { idActual: "asc" }],
        }),
        prisma.dataActual.count({ where }),
      ]);

      // Serialisasi BigInt & Decimal
      data = records.map((r) => ({
        idActual: Number(r.idActual),
        kode: r.kode,
        costcenter: r.costcenter,
        deskripsiCostcenter: r.deskripsiCostcenter,
        ce2: r.ce2,
        deskripsiCe2: r.deskripsiCe2,
        notes: r.notes,
        period: r.period,
        pg: r.pg,
        idrAct: r.idrAct ? Number(r.idrAct) : 0,
        usdAct: r.usdAct ? Number(r.usdAct) : 0,
        totalQuantity: r.totalQuantity ? Number(r.totalQuantity) : 0,
        postedUnitOfMeas: r.postedUnitOfMeas,
        documentNumber: r.documentNumber,
        postingDate: r.postingDate ? r.postingDate.toISOString().split("T")[0] : null,
      }));
      total = count;
    }

    // 2. DATA BUDGET
    else if (table === "budget" || table === "data_budget") {
      const where = search
        ? {
            OR: [
              { costcenter: { contains: search, mode: "insensitive" as const } },
              { deskripsiCostcenter: { contains: search, mode: "insensitive" as const } },
              { ce2: { contains: search, mode: "insensitive" as const } },
              { deskripsiCe2: { contains: search, mode: "insensitive" as const } },
              { bbp: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [records, count] = await Promise.all([
        prisma.dataBudget.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ period: "asc" }, { costcenter: "asc" }, { idBudget: "asc" }],
        }),
        prisma.dataBudget.count({ where }),
      ]);

      data = records.map((r) => ({
        idBudget: Number(r.idBudget),
        kode: r.kode,
        costcenter: r.costcenter,
        deskripsiCostcenter: r.deskripsiCostcenter,
        ce2: r.ce2,
        deskripsiCe2: r.deskripsiCe2,
        amountIdr: r.amountIdr ? Number(r.amountIdr) : 0,
        amountUsd: r.amountUsd ? Number(r.amountUsd) : 0,
        period: r.period,
        bbp: r.bbp,
        groupExp: r.groupExp,
      }));
      total = count;
    }

    // 3. TABEL SUMMARY
    else if (table === "summary") {
      const where = search
        ? {
            OR: [
              { costcenter: { contains: search, mode: "insensitive" as const } },
              { deskripsiCostcenter: { contains: search, mode: "insensitive" as const } },
              { ce2: { contains: search, mode: "insensitive" as const } },
              { deskripsiCe2: { contains: search, mode: "insensitive" as const } },
              { pg: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [records, count] = await Promise.all([
        prisma.summary.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ periode: "asc" }, { costcenter: "asc" }, { ce2: "asc" }],
        }),
        prisma.summary.count({ where }),
      ]);

      data = records.map((r) => ({
        kode: r.kode,
        periode: r.periode,
        costcenter: r.costcenter,
        deskripsiCostcenter: r.deskripsiCostcenter,
        ce2: r.ce2,
        deskripsiCe2: r.deskripsiCe2,
        pg: r.pg,
        nilaiActual: r.nilaiActual ? Number(r.nilaiActual) : null,
        nilaiBudget: r.nilaiBudget ? Number(r.nilaiBudget) : null,
        variance: r.variance ? Number(r.variance) : null,
      }));
      total = count;
    }

    // 4. TABEL MASTER COST CENTER & CE2
    else if (table === "master") {
      const [ccList, ceList] = await Promise.all([
        prisma.mastersheetCostcenter.findMany({ orderBy: { costcenter: "asc" } }),
        prisma.mastersheetCe2.findMany({ orderBy: { ce2: "asc" } }),
      ]);

      const formatted = [
        ...ccList.map((c) => ({
          type: "Cost Center",
          code: c.costcenter,
          description: c.deskripsiCostcenter,
          isview: c.isview,
        })),
        ...ceList.map((e) => ({
          type: "Cost Element (CE2)",
          code: e.ce2,
          description: e.deskripsiCe2,
          isview: e.isview,
        })),
      ];

      const filtered = search
        ? formatted.filter(
            (item) =>
              item.code.toLowerCase().includes(search.toLowerCase()) ||
              (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
              item.type.toLowerCase().includes(search.toLowerCase())
          )
        : formatted;

      total = filtered.length;
      data = filtered.slice(skip, skip + limit);
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Error in admin preview API:", error);
    return NextResponse.json({ success: false, error: "Gagal memuat data preview." }, { status: 500 });
  }
}
