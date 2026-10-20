import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/client";
import { runCapexReconciliation } from "@/lib/reconciliation";

// Ensure a cost center code exists in the cost_center table
async function ensureCostCenter(kode: string | null | undefined) {
  if (!kode) return;
  const cleanCode = kode.trim();
  if (!cleanCode) return;
  const existing = await prisma.costCenter.findUnique({
    where: { kodeCostCenter: cleanCode },
  });
  if (!existing) {
    await prisma.costCenter.create({
      data: {
        kodeCostCenter: cleanCode,
        keterangan: cleanCode,
      },
    });
  }
}

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
      const searchCondition = search
        ? Prisma.sql`
            AND (
              "capex_no" ILIKE ${`%${search}%`} OR
              "description" ILIKE ${`%${search}%`} OR
              "cost_center" ILIKE ${`%${search}%`} OR
              "kategori" ILIKE ${`%${search}%`} OR
              "komoditi" ILIKE ${`%${search}%`}
            )
          `
        : Prisma.empty;

      const [countResult, rows] = await Promise.all([
        prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*)::bigint AS count
          FROM "kategori"
          WHERE 1=1 ${searchCondition}
        `,
        prisma.$queryRaw<Record<string, unknown>[]>`
          SELECT 
            "capex_no" AS "capexNo",
            "description",
            "cost_center" AS "costCenter",
            "kategori",
            "komoditi"
          FROM "kategori"
          WHERE 1=1 ${searchCondition}
          ORDER BY 
            CASE WHEN ("kategori" IS NULL OR TRIM("kategori") = '') THEN 0 ELSE 1 END ASC,
            "capex_no" ASC
          LIMIT ${limit} OFFSET ${skip}
        `,
      ]);

      total = Number(countResult[0]?.count || 0);
      data = rows;
    } else if (table === "approver" || table === "user_approver") {
      const searchCondition = search
        ? Prisma.sql`
            AND (
              "kode_approver" ILIKE ${`%${search}%`} OR
              "nama" ILIKE ${`%${search}%`}
            )
          `
        : Prisma.empty;

      const [countResult, rows] = await Promise.all([
        prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*)::bigint AS count
          FROM "user_approver"
          WHERE 1=1 ${searchCondition}
        `,
        prisma.$queryRaw<Record<string, unknown>[]>`
          SELECT 
            "kode_approver" AS "kodeApprover",
            "nama"
          FROM "user_approver"
          WHERE 1=1 ${searchCondition}
          ORDER BY 
            CASE WHEN ("nama" IS NULL OR TRIM("nama") = '') THEN 0 ELSE 1 END ASC,
            "kode_approver" ASC
          LIMIT ${limit} OFFSET ${skip}
        `,
      ]);

      total = Number(countResult[0]?.count || 0);
      data = rows;
    } else if (table === "cost_center" || table === "costcenter" || table === "cost center") {
      const searchCondition = search
        ? Prisma.sql`
            AND (
              "kode_cost_center" ILIKE ${`%${search}%`} OR
              "keterangan" ILIKE ${`%${search}%`}
            )
          `
        : Prisma.empty;

      const [countResult, rows] = await Promise.all([
        prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*)::bigint AS count
          FROM "cost_center"
          WHERE 1=1 ${searchCondition}
        `,
        prisma.$queryRaw<Record<string, unknown>[]>`
          SELECT 
            "kode_cost_center" AS "kodeCostCenter",
            "keterangan",
            "created_at" AS "createdAt",
            "updated_at" AS "updatedAt"
          FROM "cost_center"
          WHERE 1=1 ${searchCondition}
          ORDER BY 
            CASE 
              WHEN ("keterangan" IS NULL OR TRIM("keterangan") = '' OR TRIM("keterangan") = TRIM("kode_cost_center")) THEN 0 
              ELSE 1 
            END ASC,
            "kode_cost_center" ASC
          LIMIT ${limit} OFFSET ${skip}
        `,
      ]);

      total = Number(countResult[0]?.count || 0);
      data = rows;
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const table = (body.table || "").toLowerCase().trim();
    const data = body.data || {};

    if (table === "kategori") {
      const capexNo = String(data.capexNo || "").trim();
      if (!capexNo) {
        return NextResponse.json({ success: false, message: "Nomor CAPEX wajib diisi." }, { status: 400 });
      }

      const existing = await prisma.kategori.findUnique({
        where: { capexNo },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: `Nomor CAPEX "${capexNo}" sudah terdaftar.` },
          { status: 400 }
        );
      }

      const costCenter = data.costCenter ? String(data.costCenter).trim() : null;
      if (costCenter) {
        await ensureCostCenter(costCenter);
      }

      await prisma.kategori.create({
        data: {
          capexNo,
          description: data.description ? String(data.description).trim() : null,
          costCenter,
          kategori: data.kategori ? String(data.kategori).trim() : null,
          komoditi: data.komoditi ? String(data.komoditi).trim() : null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Data Kategori CAPEX berhasil ditambahkan.",
      });
    }

    if (table === "approver" || table === "user_approver") {
      const kodeApprover = String(data.kodeApprover || "").trim();
      if (!kodeApprover) {
        return NextResponse.json({ success: false, message: "Kode Approver wajib diisi." }, { status: 400 });
      }

      const existing = await prisma.userApprover.findUnique({
        where: { kodeApprover },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: `Kode Approver "${kodeApprover}" sudah terdaftar.` },
          { status: 400 }
        );
      }

      await prisma.userApprover.create({
        data: {
          kodeApprover,
          nama: data.nama ? String(data.nama).trim() : null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Data User Approver berhasil ditambahkan.",
      });
    }

    if (table === "cost_center" || table === "costcenter" || table === "cost center") {
      const kodeCostCenter = String(data.kodeCostCenter || "").trim();
      if (!kodeCostCenter) {
        return NextResponse.json({ success: false, message: "Kode Cost Center wajib diisi." }, { status: 400 });
      }

      const existing = await prisma.costCenter.findUnique({
        where: { kodeCostCenter },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: `Kode Cost Center "${kodeCostCenter}" sudah terdaftar.` },
          { status: 400 }
        );
      }

      const keterangan = String(data.keterangan || "").trim() || kodeCostCenter;

      await prisma.costCenter.create({
        data: {
          kodeCostCenter,
          keterangan,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Data Master Cost Center berhasil ditambahkan.",
      });
    }

    return NextResponse.json({ success: false, message: "Operasi tambah data tidak didukung untuk tabel ini." }, { status: 400 });
  } catch (error: any) {
    console.error("Error adding table data:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menambahkan data." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const table = (body.table || "").toLowerCase().trim();
    const id = body.id;
    const data = body.data || {};

    if (!id && id !== 0) {
      return NextResponse.json({ success: false, message: "ID atau Kunci data wajib disertakan." }, { status: 400 });
    }

    if (table === "budget") {
      let idBudget: bigint;
      try {
        idBudget = BigInt(id);
      } catch {
        return NextResponse.json({ success: false, message: "ID Budget tidak valid." }, { status: 400 });
      }

      const existing = await prisma.budget.findUnique({
        where: { idBudget },
      });
      if (!existing) {
        return NextResponse.json({ success: false, message: "Data Budget tidak ditemukan." }, { status: 404 });
      }

      const costCenter = data.costCenter !== undefined 
        ? (String(data.costCenter).trim() || null) 
        : existing.costCenter;

      if (costCenter) {
        await ensureCostCenter(costCenter);
      }

      let quantity: Prisma.Decimal | null = null;
      if (data.quantity !== undefined && data.quantity !== null && data.quantity !== "") {
        quantity = new Prisma.Decimal(data.quantity);
      }

      let amount: Prisma.Decimal | null = null;
      if (data.amount !== undefined && data.amount !== null && data.amount !== "") {
        amount = new Prisma.Decimal(data.amount);
      }

      await prisma.budget.update({
        where: { idBudget },
        data: {
          capexNo: data.capexNo !== undefined ? (String(data.capexNo).trim() || null) : existing.capexNo,
          description: data.description !== undefined ? (String(data.description).trim() || null) : existing.description,
          io: data.io !== undefined ? (String(data.io).trim() || null) : existing.io,
          mo: data.mo !== undefined ? (String(data.mo).trim() || null) : existing.mo,
          wbs: data.wbs !== undefined ? (String(data.wbs).trim() || null) : existing.wbs,
          costCenter,
          quantity: data.quantity !== undefined ? quantity : existing.quantity,
          amount: data.amount !== undefined ? amount : existing.amount,
          groupCapex: data.groupCapex !== undefined ? (String(data.groupCapex).trim() || null) : existing.groupCapex,
          kategori: data.kategori !== undefined ? (String(data.kategori).trim() || null) : existing.kategori,
          komoditi: data.komoditi !== undefined ? (String(data.komoditi).trim() || null) : existing.komoditi,
        },
      });

      // Pemicu rekonsiliasi otomatis agar tabel Total & Dashboard langsung sinkron
      try {
        await runCapexReconciliation();
      } catch (reconErr) {
        console.error("Warning: Error during reconciliation after budget update:", reconErr);
      }

      return NextResponse.json({
        success: true,
        message: "Data Budget berhasil diperbarui dan rekonsiliasi telah disinkronkan.",
      });
    }

    if (table === "kategori") {
      const capexNo = String(id).trim();
      const existing = await prisma.kategori.findUnique({
        where: { capexNo },
      });
      if (!existing) {
        return NextResponse.json({ success: false, message: "Data Kategori tidak ditemukan." }, { status: 404 });
      }

      const costCenter = data.costCenter !== undefined 
        ? (String(data.costCenter).trim() || null) 
        : existing.costCenter;

      if (costCenter) {
        await ensureCostCenter(costCenter);
      }

      await prisma.kategori.update({
        where: { capexNo },
        data: {
          description: data.description !== undefined ? (String(data.description).trim() || null) : existing.description,
          costCenter,
          kategori: data.kategori !== undefined ? (String(data.kategori).trim() || null) : existing.kategori,
          komoditi: data.komoditi !== undefined ? (String(data.komoditi).trim() || null) : existing.komoditi,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Data Kategori berhasil diperbarui.",
      });
    }

    if (table === "approver" || table === "user_approver") {
      const kodeApprover = String(id).trim();
      const existing = await prisma.userApprover.findUnique({
        where: { kodeApprover },
      });
      if (!existing) {
        return NextResponse.json({ success: false, message: "Data User Approver tidak ditemukan." }, { status: 404 });
      }

      await prisma.userApprover.update({
        where: { kodeApprover },
        data: {
          nama: data.nama !== undefined ? (String(data.nama).trim() || null) : existing.nama,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Data User Approver berhasil diperbarui.",
      });
    }

    if (table === "cost_center" || table === "costcenter" || table === "cost center") {
      const kodeCostCenter = String(id).trim();
      const existing = await prisma.costCenter.findUnique({
        where: { kodeCostCenter },
      });
      if (!existing) {
        return NextResponse.json({ success: false, message: "Data Cost Center tidak ditemukan." }, { status: 404 });
      }

      const keterangan = String(data.keterangan || "").trim();
      if (!keterangan) {
        return NextResponse.json({ success: false, message: "Keterangan Cost Center tidak boleh kosong." }, { status: 400 });
      }

      await prisma.costCenter.update({
        where: { kodeCostCenter },
        data: {
          keterangan,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Data Cost Center berhasil diperbarui.",
      });
    }

    return NextResponse.json({ success: false, message: "Operasi edit data tidak didukung untuk tabel ini." }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating table data:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memperbarui data." },
      { status: 500 }
    );
  }
}

