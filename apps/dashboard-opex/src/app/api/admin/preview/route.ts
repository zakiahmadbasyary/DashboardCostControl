import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = (searchParams.get("table") || searchParams.get("category") || "summary").toLowerCase().trim();
    const summaryMode = (searchParams.get("summary_mode") || "both").toLowerCase().trim();
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "50", 10));

    const skip = (page - 1) * limit;

    let data: unknown[] = [];
    let total = 0;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. PREVIEW SUMMARY (DENGAN 3 PILIHAN MODE AGREGASI)
    // ─────────────────────────────────────────────────────────────────────────
    if (table === "summary") {
      // Mode A: Per Cost Center Saja
      if (summaryMode === "cc") {
        const where = search
          ? {
              OR: [
                { costcenter: { contains: search, mode: "insensitive" as const } },
                { deskripsiCostcenter: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {};

        const grouped = await prisma.summary.groupBy({
          by: ["costcenter", "deskripsiCostcenter"],
          where,
          _sum: {
            nilaiActual: true,
            nilaiBudget: true,
          },
          orderBy: { costcenter: "asc" },
        });

        total = grouped.length;
        const paged = grouped.slice(skip, skip + limit);

        data = paged.map((g) => {
          const act = g._sum.nilaiActual ? Number(g._sum.nilaiActual) : 0;
          const bgt = g._sum.nilaiBudget ? Number(g._sum.nilaiBudget) : 0;
          const variance = bgt > 0 ? Number((((act - bgt) / bgt) * 100).toFixed(2)) : null;
          return {
            costcenter: g.costcenter,
            deskripsiCostcenter: g.deskripsiCostcenter,
            nilaiActual: act,
            nilaiBudget: bgt,
            variance,
          };
        });
      }
      // Mode B: Per Cost Element (CE2) Saja
      else if (summaryMode === "ce2") {
        const where = search
          ? {
              OR: [
                { ce2: { contains: search, mode: "insensitive" as const } },
                { deskripsiCe2: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {};

        const grouped = await prisma.summary.groupBy({
          by: ["ce2", "deskripsiCe2"],
          where,
          _sum: {
            nilaiActual: true,
            nilaiBudget: true,
          },
          orderBy: { ce2: "asc" },
        });

        total = grouped.length;
        const paged = grouped.slice(skip, skip + limit);

        data = paged.map((g) => {
          const act = g._sum.nilaiActual ? Number(g._sum.nilaiActual) : 0;
          const bgt = g._sum.nilaiBudget ? Number(g._sum.nilaiBudget) : 0;
          const variance = bgt > 0 ? Number((((act - bgt) / bgt) * 100).toFixed(2)) : null;
          return {
            ce2: g.ce2,
            deskripsiCe2: g.deskripsiCe2,
            nilaiActual: act,
            nilaiBudget: bgt,
            variance,
          };
        });
      }
      // Mode C: Per Cost Center & Cost Element (Detail Penuh)
      else {
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
          periode: r.periode,
          pg: r.pg,
          costcenter: r.costcenter,
          deskripsiCostcenter: r.deskripsiCostcenter,
          ce2: r.ce2,
          deskripsiCe2: r.deskripsiCe2,
          nilaiActual: r.nilaiActual ? Number(r.nilaiActual) : null,
          nilaiBudget: r.nilaiBudget ? Number(r.nilaiBudget) : null,
          variance: r.variance ? Number(r.variance) : null,
        }));
        total = count;
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. DATA ACTUAL (SEMUA KOLOM KECUALI ID & KODE)
    // ─────────────────────────────────────────────────────────────────────────
    else if (table === "actual" || table === "data_actual") {
      const where = search
        ? {
            OR: [
              { costcenter: { contains: search, mode: "insensitive" as const } },
              { deskripsiCostcenter: { contains: search, mode: "insensitive" as const } },
              { ce2: { contains: search, mode: "insensitive" as const } },
              { deskripsiCe2: { contains: search, mode: "insensitive" as const } },
              { costControl: { contains: search, mode: "insensitive" as const } },
              { costDescription: { contains: search, mode: "insensitive" as const } },
              { notes: { contains: search, mode: "insensitive" as const } },
              { pg: { contains: search, mode: "insensitive" as const } },
              { documentNumber: { contains: search, mode: "insensitive" as const } },
              { groupingDepartement: { contains: search, mode: "insensitive" as const } },
              { subgrup: { contains: search, mode: "insensitive" as const } },
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

      // Tanpa idActual dan kode
      data = records.map((r) => ({
        period: r.period,
        pg: r.pg,
        costcenter: r.costcenter,
        deskripsiCostcenter: r.deskripsiCostcenter,
        costControl: r.costControl,
        costDescription: r.costDescription,
        ce2: r.ce2,
        deskripsiCe2: r.deskripsiCe2,
        notes: r.notes,
        idrAct: r.idrAct ? Number(r.idrAct) : 0,
        usdAct: r.usdAct ? Number(r.usdAct) : 0,
        objectCurrency: r.objectCurrency || "IDR",
        totalQuantity: r.totalQuantity ? Number(r.totalQuantity) : 0,
        postedUnitOfMeas: r.postedUnitOfMeas,
        documentNumber: r.documentNumber,
        documentDate: r.documentDate ? r.documentDate.toISOString().split("T")[0] : null,
        postingDate: r.postingDate ? r.postingDate.toISOString().split("T")[0] : null,
        groupingDepartement: r.groupingDepartement,
        subgrup: r.subgrup,
        grupExp: r.grupExp,
        jenisBiaya: r.jenisBiaya,
        ceGrup: r.ceGrup,
        grupAktivitas: r.grupAktivitas,
        mappingBiaya: r.mappingBiaya,
      }));
      total = count;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. DATA BUDGET (SEMUA KOLOM KECUALI ID & KODE)
    // ─────────────────────────────────────────────────────────────────────────
    else if (table === "budget" || table === "data_budget") {
      const where = search
        ? {
            OR: [
              { costcenter: { contains: search, mode: "insensitive" as const } },
              { deskripsiCostcenter: { contains: search, mode: "insensitive" as const } },
              { ce2: { contains: search, mode: "insensitive" as const } },
              { deskripsiCe2: { contains: search, mode: "insensitive" as const } },
              { bbp: { contains: search, mode: "insensitive" as const } },
              { groupExp: { contains: search, mode: "insensitive" as const } },
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

      // Tanpa idBudget dan kode
      data = records.map((r) => ({
        period: r.period,
        month: r.month ? r.month.toISOString().split("T")[0] : null,
        costcenter: r.costcenter,
        deskripsiCostcenter: r.deskripsiCostcenter,
        ce2: r.ce2,
        deskripsiCe2: r.deskripsiCe2,
        amountIdr: r.amountIdr ? Number(r.amountIdr) : 0,
        amountUsd: r.amountUsd ? Number(r.amountUsd) : 0,
        bbp: r.bbp,
        groupExp: r.groupExp,
      }));
      total = count;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. MASTERSHEET COST CENTER (DENGAN STATUS VISIBILITAS)
    // ─────────────────────────────────────────────────────────────────────────
    else if (table === "master_cc" || table === "costcenter") {
      const where = search
        ? {
            OR: [
              { costcenter: { contains: search, mode: "insensitive" as const } },
              { deskripsiCostcenter: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [records, count] = await Promise.all([
        prisma.mastersheetCostcenter.findMany({
          where,
          skip,
          take: limit,
          orderBy: { costcenter: "asc" },
        }),
        prisma.mastersheetCostcenter.count({ where }),
      ]);

      data = records.map((c) => ({
        costcenter: c.costcenter,
        deskripsiCostcenter: c.deskripsiCostcenter,
        isview: c.isview,
        createdAt: c.createdAt ? c.createdAt.toISOString() : null,
        updatedAt: c.updatedAt ? c.updatedAt.toISOString() : null,
      }));
      total = count;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. MASTERSHEET COST ELEMENT CE2 (DENGAN STATUS VISIBILITAS)
    // ─────────────────────────────────────────────────────────────────────────
    else if (table === "master_ce2" || table === "ce2") {
      const where = search
        ? {
            OR: [
              { ce2: { contains: search, mode: "insensitive" as const } },
              { deskripsiCe2: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [records, count] = await Promise.all([
        prisma.mastersheetCe2.findMany({
          where,
          skip,
          take: limit,
          orderBy: { ce2: "asc" },
        }),
        prisma.mastersheetCe2.count({ where }),
      ]);

      data = records.map((e) => ({
        ce2: e.ce2,
        deskripsiCe2: e.deskripsiCe2,
        isview: e.isview,
        createdAt: e.createdAt ? e.createdAt.toISOString() : null,
        updatedAt: e.updatedAt ? e.updatedAt.toISOString() : null,
      }));
      total = count;
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

/**
 * PATCH handler untuk toggle status 'isview' pada master costcenter atau master ce2
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, isview } = body;

    if (!type || !id || typeof isview !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Parameter 'type', 'id', dan 'isview' wajib diisi." },
        { status: 400 }
      );
    }

    // A. Bulk update: Tampilkan Semua / Sembunyikan Semua
    if (id === "all" || body.all === true) {
      if (type === "cc" || type === "costcenter") {
        const result = await prisma.mastersheetCostcenter.updateMany({
          data: { isview },
        });
        return NextResponse.json({
          success: true,
          message: `Seluruh Cost Center (${result.count} data) berhasil diatur ke ${isview ? "Tampil (View)" : "Sembunyi (Tidak View)"}.`,
        });
      } else if (type === "ce2" || type === "costelement") {
        const result = await prisma.mastersheetCe2.updateMany({
          data: { isview },
        });
        return NextResponse.json({
          success: true,
          message: `Seluruh Cost Element CE2 (${result.count} data) berhasil diatur ke ${isview ? "Tampil (View)" : "Sembunyi (Tidak View)"}.`,
        });
      } else {
        return NextResponse.json({ success: false, message: "Tipe master tidak valid." }, { status: 400 });
      }
    }

    // B. Single update per record
    if (type === "cc" || type === "costcenter") {
      const updated = await prisma.mastersheetCostcenter.update({
        where: { costcenter: id },
        data: { isview },
      });
      return NextResponse.json({
        success: true,
        message: `Cost Center ${id} berhasil diatur ke ${isview ? "Tampil (View)" : "Sembunyi (Tidak View)"}.`,
        item: updated,
      });
    } else if (type === "ce2" || type === "costelement") {
      const updated = await prisma.mastersheetCe2.update({
        where: { ce2: id },
        data: { isview },
      });
      return NextResponse.json({
        success: true,
        message: `Cost Element ${id} berhasil diatur ke ${isview ? "Tampil (View)" : "Sembunyi (Tidak View)"}.`,
        item: updated,
      });
    } else {
      return NextResponse.json({ success: false, message: "Tipe master tidak valid." }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating isview status:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status visibilitas master data." },
      { status: 500 }
    );
  }
}
