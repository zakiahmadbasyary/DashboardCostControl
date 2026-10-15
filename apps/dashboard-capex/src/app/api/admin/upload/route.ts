import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import * as path from "path";
import { BudgetStatus, Prisma } from "@prisma/client";
import { runCapexReconciliation } from "@/lib/reconciliation";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function parseExcelDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === "number") {
    // Excel serial date to JS Date
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(date.getTime()) ? null : date;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function parseDecimal(val: unknown): number | null {
  if (val === undefined || val === null || val === "") return null;
  if (typeof val === "number") return isNaN(val) ? null : val;
  if (typeof val === "string") {
    const clean = val.replace(/,/g, "").trim();
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  }
  return null;
}

function parseBudgetStatus(val: unknown): BudgetStatus | null {
  if (!val) return null;
  const s = String(val).toLowerCase().trim();
  if (s.includes("approv") || s.includes("setuju")) return BudgetStatus.approved;
  if (s.includes("process") || s.includes("proses") || s.includes("in")) return BudgetStatus.in_process;
  return null;
}

// Case-insensitive key lookup helper
function getVal(row: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    const target = k.trim().toLowerCase().replace(/[\s_-]+/g, "");
    const foundKey = Object.keys(row).find(
      (rk) => rk.trim().toLowerCase().replace(/[\s_-]+/g, "") === target
    );
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return row[foundKey];
    }
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const category = String(formData.get("category") || "").toLowerCase().trim();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "File wajib diunggah." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "Ukuran file terlalu besar. Batas maksimal ukuran file adalah 25 MB." },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileExt = path.extname(fileName).toLowerCase();

    if (![".xlsx", ".xls", ".csv"].includes(fileExt)) {
      return NextResponse.json(
        { success: false, message: "Format file tidak didukung. Gunakan file .xlsx, .xls, atau .csv." },
        { status: 400 }
      );
    }

    // 1. Read file directly into buffer in memory — DO NOT save file to disk/storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return NextResponse.json({ success: false, message: "File Excel kosong atau tidak memiliki sheet." }, { status: 400 });
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (rawRows.length === 0) {
      return NextResponse.json({ success: false, message: "File Excel tidak memiliki baris data." }, { status: 400 });
    }

    let importedCount = 0;
    let categoryTitle = "";
    let shouldReconcile = false;

    // 2. Process data per Category
    if (category === "created") {
      categoryTitle = "Created";
      shouldReconcile = true;

      const parsedRows = rawRows
        .map((row) => {
          const capexNo = String(getVal(row, ["capex_no", "capexno", "no_capex", "capex"]) || "").trim() || null;
          const description = String(getVal(row, ["description", "deskripsi", "keterangan"]) || "").trim() || null;
          const requestor = String(getVal(row, ["requestor", "pemohon"]) || "").trim() || null;
          const type = String(getVal(row, ["type", "tipe", "jenis"]) || "").trim() || null;
          const reqDate = parseExcelDate(getVal(row, ["req_date", "reqdate", "request_date", "tanggal_request"]));
          const budgetType = String(getVal(row, ["budget_type", "budgettype", "tipe_budget"]) || "").trim() || null;
          const io = String(getVal(row, ["io", "internal_order"]) || "").trim() || null;
          const mo = String(getVal(row, ["mo", "maintenance_order"]) || "").trim() || null;
          const wbs = String(getVal(row, ["wbs", "wbs_element"]) || "").trim() || null;
          const costCenter = String(getVal(row, ["cost_center", "costcenter", "cc"]) || "").trim() || null;
          const quantity = parseDecimal(getVal(row, ["quantity", "qty", "jumlah"]));
          const amount = parseDecimal(getVal(row, ["amount", "nilai", "total_amount", "biaya"]));
          const kodeApprover = String(getVal(row, ["kode_approver", "kodeapprover", "approver_code"]) || "").trim() || null;
          const nama = String(getVal(row, ["nama", "nama_approver", "approver_name"]) || "").trim() || null;
          const dateApprove = parseExcelDate(getVal(row, ["date_approve", "dateapprove", "tanggal_approve", "approval_date"]));
          const noPr = String(getVal(row, ["no_pr", "nopr", "nomor_pr", "pr_no"]) || "").trim() || null;
          const orderNo = String(getVal(row, ["order_no", "orderno", "no_order"]) || "").trim() || null;
          const notes = String(getVal(row, ["notes", "catatan"]) || "").trim() || null;
          const budgetStatus = parseBudgetStatus(getVal(row, ["budget_status", "budgetstatus", "status_budget"]));
          const kategoriVal = String(getVal(row, ["kategori", "category"]) || "").trim() || null;
          const komoditiVal = String(getVal(row, ["komoditi", "commodity"]) || "").trim() || null;

          // Require at least capexNo, description, io, mo, or wbs
          if (!capexNo && !description && !io && !mo && !wbs) return null;

          return {
            capexNo,
            type,
            requestor,
            reqDate,
            budgetType,
            io,
            mo,
            wbs,
            costCenter,
            quantity: quantity !== null ? new Prisma.Decimal(quantity) : null,
            amount: amount !== null ? new Prisma.Decimal(amount) : null,
            description,
            kodeApprover,
            nama,
            dateApprove,
            noPr,
            orderNo,
            notes,
            budgetStatus,
            kategori: kategoriVal,
            komoditi: komoditiVal,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (parsedRows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Tidak ada baris data valid pada file Created." },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        // REPLACE: Delete all old Created data
        await tx.created.deleteMany();

        // Batch insert in chunks of 1000
        const chunkSize = 1000;
        for (let i = 0; i < parsedRows.length; i += chunkSize) {
          const chunk = parsedRows.slice(i, i + chunkSize);
          await tx.created.createMany({ data: chunk });
        }
      });

      importedCount = parsedRows.length;
    } else if (category === "po") {
      categoryTitle = "PO";
      shouldReconcile = true;

      const parsedRows = rawRows
        .map((row) => {
          const nomorPr = String(getVal(row, ["nomor_pr", "nomorpr", "no_pr", "pr_no"]) || "").trim();
          if (!nomorPr) return null;

          const keterangan = String(getVal(row, ["keterangan", "description", "deskripsi"]) || "").trim() || null;
          const quantity = parseDecimal(getVal(row, ["quantity", "qty", "jumlah"]));
          const unitOfMeasure = String(getVal(row, ["unit_of_measure", "unit", "uom", "satuan"]) || "").trim() || null;
          const valuationPrice = parseDecimal(getVal(row, ["valuation_price", "valuationprice", "harga_satuan", "price"]));
          const total = parseDecimal(getVal(row, ["total", "total_price", "nilai_total", "amount"]));
          const requestDate = parseExcelDate(getVal(row, ["request_date", "requestdate", "req_date", "tanggal_request"]));
          const pgr = String(getVal(row, ["pgr", "purchasing_group"]) || "").trim() || null;
          const noPo = String(getVal(row, ["no_po", "nopo", "nomor_po", "po_no"]) || "").trim() || null;

          return {
            nomorPr,
            keterangan,
            quantity: quantity !== null ? new Prisma.Decimal(quantity) : null,
            unitOfMeasure,
            valuationPrice: valuationPrice !== null ? new Prisma.Decimal(valuationPrice) : null,
            total: total !== null ? new Prisma.Decimal(total) : null,
            requestDate,
            pgr,
            noPo,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (parsedRows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Kolom wajib 'nomor_pr' tidak ditemukan atau kosong." },
          { status: 400 }
        );
      }

      // Unique by nomorPr
      const uniquePoMap = new Map<string, typeof parsedRows[0]>();
      parsedRows.forEach((r) => uniquePoMap.set(r.nomorPr, r));
      const uniquePoList = Array.from(uniquePoMap.values());

      await prisma.$transaction(async (tx) => {
        // REPLACE: Delete all old PO data
        // Must unlink total.nomor_pr first to avoid foreign key errors
        await tx.total.updateMany({
          data: { nomorPr: null },
        });
        await tx.po.deleteMany();

        const chunkSize = 1000;
        for (let i = 0; i < uniquePoList.length; i += chunkSize) {
          const chunk = uniquePoList.slice(i, i + chunkSize);
          await tx.po.createMany({ data: chunk });
        }
      });

      importedCount = uniquePoList.length;
    } else if (category === "budget") {
      categoryTitle = "Budget";
      shouldReconcile = true;

      const parsedRows = rawRows
        .map((row) => {
          const io = String(getVal(row, ["io", "internal_order"]) || "").trim() || null;
          const mo = String(getVal(row, ["mo", "maintenance_order"]) || "").trim() || null;
          const wbs = String(getVal(row, ["wbs", "wbs_element"]) || "").trim() || null;
          const description = String(getVal(row, ["description", "deskripsi", "keterangan"]) || "").trim() || null;
          const costCenter = String(getVal(row, ["cost_center", "costcenter", "cc"]) || "").trim() || null;
          const quantity = parseDecimal(getVal(row, ["quantity", "qty", "jumlah"]));
          const amount = parseDecimal(getVal(row, ["amount", "nilai", "total_amount", "biaya"]));
          const groupCapex = String(getVal(row, ["group_capex", "groupcapex", "group"]) || "").trim() || null;
          const capexNo = String(getVal(row, ["capex_no", "capexno", "no_capex"]) || "").trim() || null;
          const kategoriVal = String(getVal(row, ["kategori", "category"]) || "").trim() || null;
          const komoditiVal = String(getVal(row, ["komoditi", "commodity"]) || "").trim() || null;
          const budgetStatus = parseBudgetStatus(getVal(row, ["budget_status", "budgetstatus", "status_budget"]));

          if (!io && !mo && !wbs && !description && !capexNo) return null;

          return {
            io,
            mo,
            wbs,
            description,
            costCenter,
            quantity: quantity !== null ? new Prisma.Decimal(quantity) : null,
            amount: amount !== null ? new Prisma.Decimal(amount) : null,
            groupCapex,
            capexNo,
            kategori: kategoriVal,
            komoditi: komoditiVal,
            budgetStatus,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (parsedRows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Tidak ada baris data valid pada file Budget." },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        // REPLACE: Delete all old Budget data
        await tx.budget.deleteMany();

        const chunkSize = 1000;
        for (let i = 0; i < parsedRows.length; i += chunkSize) {
          const chunk = parsedRows.slice(i, i + chunkSize);
          await tx.budget.createMany({ data: chunk });
        }
      });

      importedCount = parsedRows.length;
    } else if (category === "purchasing") {
      categoryTitle = "Purchasing";

      const parsedRows = rawRows
        .map((row) => {
          const pgr = String(getVal(row, ["pgr", "purchasing_group", "kode_pgr"]) || "").trim();
          if (!pgr) return null;

          const description = String(getVal(row, ["description", "deskripsi", "keterangan"]) || "").trim() || null;
          const telephone = String(getVal(row, ["telephone", "telp", "no_telp", "telepon"]) || "").trim() || null;
          const faxNumber = String(getVal(row, ["fax_number", "fax", "no_fax"]) || "").trim() || null;

          return {
            pgr,
            description,
            telephone,
            faxNumber,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (parsedRows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Kolom wajib 'pgr' tidak ditemukan atau kosong." },
          { status: 400 }
        );
      }

      const uniquePurchasingMap = new Map<string, typeof parsedRows[0]>();
      parsedRows.forEach((r) => uniquePurchasingMap.set(r.pgr, r));
      const uniquePurchasingList = Array.from(uniquePurchasingMap.values());

      await prisma.$transaction(async (tx) => {
        // REPLACE: Delete all old Purchasing data
        await tx.po.updateMany({ data: { pgr: null } });
        await tx.purchasing.deleteMany();

        const chunkSize = 1000;
        for (let i = 0; i < uniquePurchasingList.length; i += chunkSize) {
          const chunk = uniquePurchasingList.slice(i, i + chunkSize);
          await tx.purchasing.createMany({ data: chunk });
        }
      });

      importedCount = uniquePurchasingList.length;
    } else if (category === "kategori") {
      categoryTitle = "Kategori";

      const parsedRows = rawRows
        .map((row) => {
          const capexNo = String(getVal(row, ["capex_no", "capexno", "no_capex"]) || "").trim();
          if (!capexNo) return null;

          const description = String(getVal(row, ["description", "deskripsi", "keterangan"]) || "").trim() || null;
          const costCenter = String(getVal(row, ["cost_center", "costcenter", "cc"]) || "").trim() || null;
          const kategoriVal = String(getVal(row, ["kategori", "category"]) || "").trim() || null;
          const komoditiVal = String(getVal(row, ["komoditi", "commodity"]) || "").trim() || null;

          return {
            capexNo,
            description,
            costCenter,
            kategori: kategoriVal,
            komoditi: komoditiVal,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (parsedRows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Kolom wajib 'capex_no' tidak ditemukan atau kosong." },
          { status: 400 }
        );
      }

      // UPSERT (Opsi A): Insert or Update without deleting existing records
      await prisma.$transaction(async (tx) => {
        for (const item of parsedRows) {
          await tx.kategori.upsert({
            where: { capexNo: item.capexNo },
            create: item,
            update: {
              description: item.description,
              costCenter: item.costCenter,
              kategori: item.kategori,
              komoditi: item.komoditi,
            },
          });
        }
      });

      importedCount = parsedRows.length;
    } else if (category === "approver" || category === "user_approver") {
      categoryTitle = "User Approver";

      const parsedRows = rawRows
        .map((row) => {
          const kodeApprover = String(getVal(row, ["kode_approver", "kodeapprover", "kode", "approver_code"]) || "").trim();
          if (!kodeApprover) return null;

          const nama = String(getVal(row, ["nama", "nama_approver", "name"]) || "").trim() || null;

          return {
            kodeApprover,
            nama,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (parsedRows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Kolom wajib 'kode_approver' tidak ditemukan atau kosong." },
          { status: 400 }
        );
      }

      // UPSERT (Opsi A): Insert or Update without deleting existing records
      await prisma.$transaction(async (tx) => {
        for (const item of parsedRows) {
          await tx.userApprover.upsert({
            where: { kodeApprover: item.kodeApprover },
            create: item,
            update: {
              nama: item.nama,
            },
          });
        }
      });

      importedCount = parsedRows.length;
    } else {
      return NextResponse.json({ success: false, message: "Kategori data tidak dikenal." }, { status: 400 });
    }

    // 3. Automatically run reconciliation if transactional data was updated
    let reconMessage = "";
    if (shouldReconcile) {
      try {
        const reconRes = await runCapexReconciliation();
        reconMessage = ` Rekonsiliasi otomatis berhasil diperbarui (${reconRes.totalCount} total record).`;
      } catch (err) {
        console.error("Error during auto-reconciliation:", err);
        reconMessage = " (Peringatan: rekonsiliasi otomatis menemukan kendala relasi data).";
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengunggah ${importedCount} data ${categoryTitle}.${reconMessage}`,
      importedCount,
    });
  } catch (error) {
    console.error("Error handling Excel upload:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Terjadi kesalahan saat memproses file Excel.",
      },
      { status: 500 }
    );
  }
}
