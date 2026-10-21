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
      let whereClause = "";
      const params: (string | number)[] = [];
      if (search) {
        whereClause = `WHERE ("pgr" ILIKE $1 OR "description" ILIKE $1)`;
        params.push(`%${search}%`);
      }

      const countSql = `SELECT COUNT(*)::bigint AS count FROM "purchasing" ${whereClause}`;
      const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(countSql, ...params);

      const limitIdx = params.length + 1;
      const skipIdx = params.length + 2;
      const dataSql = `
        SELECT 
          "pgr",
          "description",
          "telephone",
          "fax_number" AS "faxNumber"
        FROM "purchasing"
        ${whereClause}
        ORDER BY 
          CASE WHEN ("description" IS NULL OR TRIM("description") = '') THEN 0 ELSE 1 END ASC,
          "pgr" ASC
        LIMIT $${limitIdx} OFFSET $${skipIdx}
      `;
      const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(dataSql, ...params, limit, skip);

      total = Number(countResult[0]?.count || 0);
      data = rows;
    } else if (table === "kategori") {
      let whereClause = "";
      const params: (string | number)[] = [];
      if (search) {
        whereClause = `WHERE ("capex_no" ILIKE $1 OR "description" ILIKE $1 OR "cost_center" ILIKE $1 OR "kategori" ILIKE $1 OR "komoditi" ILIKE $1)`;
        params.push(`%${search}%`);
      }

      const countSql = `SELECT COUNT(*)::bigint AS count FROM "kategori" ${whereClause}`;
      const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(countSql, ...params);

      const limitIdx = params.length + 1;
      const skipIdx = params.length + 2;
      const dataSql = `
        SELECT 
          "capex_no" AS "capexNo",
          "description",
          "cost_center" AS "costCenter",
          "kategori",
          "komoditi"
        FROM "kategori"
        ${whereClause}
        ORDER BY 
          CASE 
            WHEN ("kategori" IS NULL OR TRIM("kategori") = '') AND ("komoditi" IS NULL OR TRIM("komoditi") = '') THEN 0 
            WHEN ("kategori" IS NULL OR TRIM("kategori") = '') OR ("komoditi" IS NULL OR TRIM("komoditi") = '') THEN 1 
            ELSE 2 
          END ASC,
          "capex_no" ASC
        LIMIT $${limitIdx} OFFSET $${skipIdx}
      `;
      const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(dataSql, ...params, limit, skip);

      total = Number(countResult[0]?.count || 0);
      data = rows;
    } else if (table === "approver" || table === "user_approver") {
      let whereClause = "";
      const params: (string | number)[] = [];
      if (search) {
        whereClause = `WHERE ("kode_approver" ILIKE $1 OR "nama" ILIKE $1)`;
        params.push(`%${search}%`);
      }

      const countSql = `SELECT COUNT(*)::bigint AS count FROM "user_approver" ${whereClause}`;
      const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(countSql, ...params);

      const limitIdx = params.length + 1;
      const skipIdx = params.length + 2;
      const dataSql = `
        SELECT 
          "kode_approver" AS "kodeApprover",
          "nama"
        FROM "user_approver"
        ${whereClause}
        ORDER BY 
          CASE WHEN ("nama" IS NULL OR TRIM("nama") = '') THEN 0 ELSE 1 END ASC,
          "kode_approver" ASC
        LIMIT $${limitIdx} OFFSET $${skipIdx}
      `;
      const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(dataSql, ...params, limit, skip);

      total = Number(countResult[0]?.count || 0);
      data = rows;
    } else if (table === "cost_center" || table === "costcenter" || table === "cost center") {
      let whereClause = "";
      const params: (string | number)[] = [];
      if (search) {
        whereClause = `WHERE ("kode_cost_center" ILIKE $1 OR "keterangan" ILIKE $1)`;
        params.push(`%${search}%`);
      }

      const countSql = `SELECT COUNT(*)::bigint AS count FROM "cost_center" ${whereClause}`;
      const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(countSql, ...params);

      const limitIdx = params.length + 1;
      const skipIdx = params.length + 2;
      const dataSql = `
        SELECT 
          "kode_cost_center" AS "kodeCostCenter",
          "keterangan",
          "created_at" AS "createdAt",
          "updated_at" AS "updatedAt"
        FROM "cost_center"
        ${whereClause}
        ORDER BY 
          CASE 
            WHEN ("keterangan" IS NULL OR TRIM("keterangan") = '' OR TRIM("keterangan") = TRIM("kode_cost_center")) THEN 0 
            ELSE 1 
          END ASC,
          "kode_cost_center" ASC
        LIMIT $${limitIdx} OFFSET $${skipIdx}
      `;
      const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(dataSql, ...params, limit, skip);

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
  } catch (error: any) {
    console.error("Error previewing table data:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memuat preview data." },
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

    if (table === "purchasing") {
      const pgr = String(data.pgr || "").trim();
      if (!pgr) {
        return NextResponse.json({ success: false, message: "Kode Purchasing Group (PGR) wajib diisi." }, { status: 400 });
      }

      const existing = await prisma.purchasing.findUnique({
        where: { pgr },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: `Purchasing Group "${pgr}" sudah terdaftar.` },
          { status: 400 }
        );
      }

      await prisma.purchasing.create({
        data: {
          pgr,
          description: data.description ? String(data.description).trim() : null,
          telephone: data.telephone ? String(data.telephone).trim() : null,
          faxNumber: data.faxNumber ? String(data.faxNumber).trim() : null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Data Purchasing Group berhasil ditambahkan.",
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

      // Validasi: Data yang sudah memiliki pasangan Kategori dan Komoditi lengkap tidak dapat diedit lagi
      const isAlreadyComplete = Boolean(
        existing.kategori &&
        existing.kategori.trim() &&
        existing.komoditi &&
        existing.komoditi.trim()
      );

      if (isAlreadyComplete) {
        return NextResponse.json(
          {
            success: false,
            message: `Data CAPEX "${capexNo}" sudah memiliki pasangan Kategori dan Komoditi lengkap sehingga tidak dapat diedit lagi.`,
          },
          { status: 403 }
        );
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

    if (table === "purchasing") {
      const pgr = String(id).trim();
      const existing = await prisma.purchasing.findUnique({
        where: { pgr },
      });
      if (!existing) {
        return NextResponse.json({ success: false, message: "Data Purchasing Group tidak ditemukan." }, { status: 404 });
      }

      // Validasi: Data yang sudah memiliki pasangan description tidak dapat diedit lagi
      const isAlreadyComplete = Boolean(existing.description && existing.description.trim());
      if (isAlreadyComplete) {
        return NextResponse.json(
          {
            success: false,
            message: `Data Purchasing Group "${pgr}" sudah lengkap sehingga tidak dapat diedit lagi.`,
          },
          { status: 403 }
        );
      }

      await prisma.purchasing.update({
        where: { pgr },
        data: {
          description: data.description !== undefined ? (String(data.description).trim() || null) : existing.description,
          telephone: data.telephone !== undefined ? (String(data.telephone).trim() || null) : existing.telephone,
          faxNumber: data.faxNumber !== undefined ? (String(data.faxNumber).trim() || null) : existing.faxNumber,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Data Purchasing Group berhasil diperbarui.",
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

      // Validasi: Data yang sudah memiliki nama approver lengkap tidak dapat diedit lagi
      const isAlreadyComplete = Boolean(existing.nama && existing.nama.trim());
      if (isAlreadyComplete) {
        return NextResponse.json(
          {
            success: false,
            message: `Data User Approver "${kodeApprover}" sudah lengkap sehingga tidak dapat diedit lagi.`,
          },
          { status: 403 }
        );
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

      // Validasi: Data yang sudah memiliki keterangan valid (bukan sama dengan kode dan bukan kosong) tidak dapat diedit lagi
      const isAlreadyComplete = Boolean(
        existing.keterangan &&
        existing.keterangan.trim() &&
        existing.keterangan.trim().toLowerCase() !== existing.kodeCostCenter.trim().toLowerCase()
      );
      if (isAlreadyComplete) {
        return NextResponse.json(
          {
            success: false,
            message: `Data Cost Center "${kodeCostCenter}" sudah lengkap sehingga tidak dapat diedit lagi.`,
          },
          { status: 403 }
        );
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

