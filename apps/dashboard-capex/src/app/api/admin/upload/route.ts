import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import * as path from "path";
import { BudgetStatus, Prisma } from "@/generated/client";
import { runCapexReconciliation } from "@/lib/reconciliation";
import { COST_CENTER_MAP } from "@/lib/costCenters";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function parseExcelDate(val: unknown): Date | null {
  if (!val) return null;

  // 1. If already Date object, normalize to UTC Date at midnight based on local date
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return new Date(Date.UTC(val.getFullYear(), val.getMonth(), val.getDate()));
  }

  // 2. Numeric SAP format YYYYMMDD (e.g. 20240115 or 20251231) or Excel serial number
  if (typeof val === "number") {
    if (isNaN(val) || val <= 0) return null;

    // SAP integer date 20240115 (8 digits between 1970 and 2099)
    if (val >= 19700101 && val <= 20991231) {
      const s = String(Math.floor(val));
      if (s.length === 8) {
        const y = parseInt(s.substring(0, 4), 10);
        const m = parseInt(s.substring(4, 6), 10) - 1;
        const d = parseInt(s.substring(6, 8), 10);
        const dt = new Date(Date.UTC(y, m, d));
        if (!isNaN(dt.getTime()) && m >= 0 && m <= 11 && d >= 1 && d <= 31) return dt;
      }
    }

    // Standard Excel serial date code
    try {
      const parsed = XLSX.SSF.parse_date_code(val);
      if (parsed && parsed.y && parsed.m && parsed.d) {
        const d = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
        return isNaN(d.getTime()) ? null : d;
      }
    } catch {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      }
      return null;
    }
  }

  // 3. String date handling
  if (typeof val === "string") {
    let trimmed = val.trim();
    if (!trimmed || trimmed === "-" || trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "n/a") {
      return null;
    }

    // A. SAP 8-digit date string '20240115'
    if (/^\d{8}$/.test(trimmed)) {
      const y = parseInt(trimmed.substring(0, 4), 10);
      const m = parseInt(trimmed.substring(4, 6), 10) - 1;
      const d = parseInt(trimmed.substring(6, 8), 10);
      const dt = new Date(Date.UTC(y, m, d));
      if (!isNaN(dt.getTime()) && m >= 0 && m <= 11 && d >= 1 && d <= 31) return dt;
    }

    // B. Check if string is actually a numeric serial date (e.g. '45678' or '45678.5')
    if (/^\d{5}(?:\.\d+)?$/.test(trimmed)) {
      const numVal = parseFloat(trimmed);
      return parseExcelDate(numVal);
    }

    // C. Format YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD (with optional timestamp)
    const ymdMatch = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})(?:[T\s]+.*)?$/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      const d = new Date(Date.UTC(year, month, day));
      if (!isNaN(d.getTime())) return d;
    }

    // D. Format DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY (support 2 or 4 digit year!)
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})(?:[T\s]+.*)?$/);
    if (dmyMatch) {
      let p1 = parseInt(dmyMatch[1], 10);
      let p2 = parseInt(dmyMatch[2], 10);
      let year = parseInt(dmyMatch[3], 10);
      if (year < 100) year += 2000;

      let day = p1;
      let month = p2 - 1;

      // If second part > 12 and first part <= 12, it is MM/DD/YYYY
      if (p2 > 12 && p1 <= 12) {
        day = p2;
        month = p1 - 1;
      }

      const d = new Date(Date.UTC(year, month, day));
      if (!isNaN(d.getTime())) return d;
    }

    // E. Format DD-Mon-YYYY or DD Mon YYYY (Indonesian / English month names)
    const monthNames: Record<string, number> = {
      jan: 0, januari: 0, january: 0,
      feb: 1, februari: 1, february: 1,
      mar: 2, maret: 2, march: 2,
      apr: 3, april: 3,
      mei: 4, may: 4,
      jun: 5, juni: 5, june: 5,
      jul: 6, juli: 6, july: 6,
      agu: 7, ags: 7, agt: 7, agustus: 7, aug: 7, august: 7,
      sep: 8, sept: 8, september: 8,
      okt: 9, oktober: 9, oct: 9, october: 9,
      nop: 10, nov: 10, nopember: 10, november: 10,
      des: 11, desember: 11, dec: 11, december: 11,
    };
    const textMatch = trimmed.match(/^(\d{1,2})[\s\-\/\.]+([a-zA-Z]+)[\s\-\/\.]+(\d{2,4})$/);
    if (textMatch) {
      const day = parseInt(textMatch[1], 10);
      const mStr = textMatch[2].toLowerCase();
      let year = parseInt(textMatch[3], 10);
      if (year < 100) year += 2000;
      if (monthNames[mStr] !== undefined) {
        const d = new Date(Date.UTC(year, monthNames[mStr], day));
        if (!isNaN(d.getTime())) return d;
      }
    }

    // F. Generic fallback via Date.parse, then convert to UTC midnight
    const fallback = new Date(trimmed);
    if (!isNaN(fallback.getTime())) {
      return new Date(Date.UTC(fallback.getFullYear(), fallback.getMonth(), fallback.getDate()));
    }
  }

  return null;
}

function parseDecimal(val: unknown): number | null {
  if (val === undefined || val === null || val === "") return null;
  if (typeof val === "number") return isNaN(val) ? null : val;
  if (typeof val === "string") {
    let clean = val.trim();
    if (!clean || clean === "-" || clean.toLowerCase() === "null" || clean.toLowerCase() === "n/a") {
      return null;
    }

    // Remove "Rp", "IDR", and spaces
    clean = clean.replace(/^(rp|idr)\s*/i, "").trim();

    // Handle Indonesian format 1.000.000,00 vs standard 1,000,000.00
    if (clean.includes(",") && clean.includes(".")) {
      if (clean.lastIndexOf(",") > clean.lastIndexOf(".")) {
        // 1.000.000,00 -> 1000000.00
        clean = clean.replace(/\./g, "").replace(",", ".");
      } else {
        // 1,000,000.00 -> 1000000.00
        clean = clean.replace(/,/g, "");
      }
    } else if (clean.includes(",")) {
      const parts = clean.split(",");
      if (parts.length === 2 && parts[1].length <= 2) {
        clean = clean.replace(",", ".");
      } else {
        clean = clean.replace(/,/g, "");
      }
    } else if (clean.includes(".")) {
      const parts = clean.split(".");
      if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3 && parts[0].length >= 1)) {
        clean = clean.replace(/\./g, "");
      }
    }

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

// Case-insensitive key lookup helper (removes spaces, underscores, dashes, and dots)
function getVal(row: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    const target = k.trim().toLowerCase().replace(/[\s_\-\.]+/g, "");
    const foundKey = Object.keys(row).find(
      (rk) => rk.trim().toLowerCase().replace(/[\s_\-\.]+/g, "") === target
    );
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return row[foundKey];
    }
  }
  return undefined;
}

// Ensure all referenced cost center codes exist in cost_center table
async function ensureCostCentersExist(
  tx: Prisma.TransactionClient,
  costCenters: (string | null | undefined)[]
) {
  const distinct = Array.from(
    new Set(
      costCenters
        .filter((cc): cc is string => Boolean(cc && cc.trim()))
        .map((cc) => cc.trim())
    )
  );

  for (const code of distinct) {
    const existing = await tx.costCenter.findUnique({
      where: { kodeCostCenter: code },
    });
    if (!existing) {
      const ket = COST_CENTER_MAP[code] || code;
      await tx.costCenter.create({
        data: {
          kodeCostCenter: code,
          keterangan: ket,
        },
      });
    }
  }
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
          const reqDate = parseExcelDate(
            getVal(row, [
              "req_date", "reqdate", "request_date", "requestdate", "tanggal_request",
              "tgl_request", "tgl_req", "tanggal_req", "tanggal", "tgl", "date",
              "created_date", "tanggal_dibuat", "tgl_dibuat", "pengajuan_date", "tanggal_pengajuan"
            ])
          );
          const budgetType = String(getVal(row, ["budget_type", "budgettype", "tipe_budget"]) || "").trim() || null;
          const io = String(getVal(row, ["io", "internal_order"]) || "").trim() || null;
          const mo = String(getVal(row, ["mo", "maintenance_order"]) || "").trim() || null;
          const wbs = String(getVal(row, ["wbs", "wbs_element"]) || "").trim() || null;
          const costCenter = String(getVal(row, ["cost_center", "costcenter", "cc"]) || "").trim() || null;
          const quantity = parseDecimal(getVal(row, ["quantity", "qty", "jumlah"]));
          const amount = parseDecimal(getVal(row, ["amount", "nilai", "total_amount", "biaya"]));
          const kodeApprover = String(getVal(row, ["kode_approver", "kodeapprover", "approver_code"]) || "").trim() || null;
          const nama = String(getVal(row, ["nama", "nama_approver", "approver_name"]) || "").trim() || null;
          const dateApprove = parseExcelDate(
            getVal(row, [
              "date_approve", "dateapprove", "date_approver", "dateapprover", "tanggal_approve", "approval_date", "approvaldate",
              "tgl_approve", "tgl_disetujui", "tanggal_disetujui", "approved_date",
              "date_approved", "tanggal_approval", "tgl_approval", "tgl_persetujuan"
            ])
          );
          const noPr = String(getVal(row, ["no_pr", "nopr", "nomor_pr", "pr_no", "banfn"]) || "").trim() || null;
          const orderNo = String(getVal(row, ["order_no", "orderno", "no_order"]) || "").trim() || null;
          const notes = String(getVal(row, ["notes", "catatan"]) || "").trim() || null;
          const budgetStatus = parseBudgetStatus(getVal(row, ["budget_status", "budgetstatus", "status_budget"]));
          const kategoriVal = String(getVal(row, ["kategori", "category"]) || "").trim() || null;
          const komoditiVal = String(getVal(row, ["komoditi", "commodity"]) || "").trim() || null;

          const rawByte = getVal(row, [
            "byte", "no_urut", "nourut", "urutan", "step", "sequence", "seq", "no"
          ]);
          let byte: number | null = null;
          if (rawByte !== undefined && rawByte !== null && String(rawByte).trim() !== "") {
            const parsedInt = parseInt(String(rawByte).trim(), 10);
            if (!isNaN(parsedInt)) {
              byte = parsedInt;
            }
          }

          // Require at least capexNo, description, io, mo, or wbs
          if (!capexNo && !description && !io && !mo && !wbs) return null;

          return {
            byte,
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
        // 1. Auto-insert UserApprover jika kodeApprover belum ada di tabel user_approver
        const approverMap = new Map<string, string | null>();
        for (const row of parsedRows) {
          if (row.kodeApprover) {
            if (!approverMap.has(row.kodeApprover) || (!approverMap.get(row.kodeApprover) && row.nama)) {
              approverMap.set(row.kodeApprover, row.nama || null);
            }
          }
        }

        for (const [kodeApprover, nama] of approverMap.entries()) {
          const existingApprover = await tx.userApprover.findUnique({
            where: { kodeApprover },
          });

          if (!existingApprover) {
            await tx.userApprover.create({
              data: {
                kodeApprover,
                nama: nama || null,
              },
            });
          } else if (!existingApprover.nama && nama) {
            await tx.userApprover.update({
              where: { kodeApprover },
              data: { nama },
            });
          }
        }

        // 2. Auto-insert CostCenter jika costCenter belum ada di tabel cost_center
        await ensureCostCentersExist(
          tx,
          parsedRows.map((r) => r.costCenter)
        );

        // 3. Auto-insert Kategori jika capexNo belum ada di tabel kategori
        // Aturan:
        // - Cek tabel kategori: jika belum ada:
        //   - Cek tabel budget berdasarkan capex_no: jika ada, ambil kategori & komoditinya.
        //   - Jika tidak ada di budget juga: simpan dengan kategori & komoditi NULL agar bisa diedit manual.
        const distinctCapex = new Map<
          string,
          {
            description: string | null;
            costCenter: string | null;
          }
        >();

        for (const row of parsedRows) {
          if (row.capexNo) {
            if (!distinctCapex.has(row.capexNo)) {
              distinctCapex.set(row.capexNo, {
                description: row.description,
                costCenter: row.costCenter,
              });
            }
          }
        }

        for (const [capexNo, meta] of distinctCapex.entries()) {
          const existingKategori = await tx.kategori.findUnique({
            where: { capexNo },
          });

          if (!existingKategori) {
            // Cek di tabel budget berdasarkan capexNo
            const budgetMatch = await tx.budget.findFirst({
              where: {
                capexNo,
                OR: [
                  { kategori: { not: null } },
                  { komoditi: { not: null } },
                ],
              },
              select: {
                kategori: true,
                komoditi: true,
                description: true,
                costCenter: true,
              },
            });

            const kategori = budgetMatch?.kategori ? budgetMatch.kategori.trim() : null;
            const komoditi = budgetMatch?.komoditi ? budgetMatch.komoditi.trim() : null;
            const desc = meta.description || budgetMatch?.description?.trim() || null;
            const cc = meta.costCenter || budgetMatch?.costCenter?.trim() || null;

            if (cc) {
              await ensureCostCentersExist(tx, [cc]);
            }

            await tx.kategori.create({
              data: {
                capexNo,
                description: desc,
                costCenter: cc,
                kategori,
                komoditi,
              },
            });
          }
        }

        // 3. REPLACE: Delete all old Created data
        await tx.created.deleteMany();

        // 4. Batch insert in chunks of 1000
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
          const nomorPr = String(
            getVal(row, [
              "nomor_pr", "nomorpr", "no_pr", "nopr", "pr_no", "prno",
              "banfn", "pr_number", "no_purchase_requisition", "purchase_requisition"
            ]) || ""
          ).trim();
          if (!nomorPr) return null;

          const keterangan = String(
            getVal(row, ["keterangan", "description", "deskripsi", "nama_barang", "item_description", "txz01", "matnr"]) || ""
          ).trim() || null;
          const quantity = parseDecimal(getVal(row, ["quantity", "qty", "jumlah", "menge"]));
          const unitOfMeasure = String(
            getVal(row, ["unit_of_measure", "unit", "uom", "satuan", "meins"]) || ""
          ).trim() || null;
          const valuationPrice = parseDecimal(
            getVal(row, ["valuation_price", "valuationprice", "harga_satuan", "price", "harga", "preis"])
          );
          const total = parseDecimal(
            getVal(row, ["total", "total_price", "totalprice", "nilai_total", "amount", "netwr"])
          );
          const requestDate = parseExcelDate(
            getVal(row, [
              "request_date", "requestdate", "req_date", "reqdate", "tanggal_request",
              "tgl_request", "tgl_req", "tanggal_req", "pr_date", "tanggal_pr", "tgl_pr",
              "badat", "erdat", "tanggal", "date"
            ])
          );
          const pgr = String(
            getVal(row, ["pgr", "purchasing_group", "purchasinggroup", "ekgrp", "kode_pgr", "grup_purchasing"]) || ""
          ).trim() || null;
          const noPo = String(
            getVal(row, ["no_po", "nopo", "nomor_po", "nomorpo", "po_no", "pono", "ebeln", "po_number", "purchase_order", "no_purchase_order"]) || ""
          ).trim() || null;

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

      // Jika nomor_pr duplikat, ambil kemunculan pertama (first occurrence)
      const uniquePoMap = new Map<string, typeof parsedRows[0]>();
      let duplicatePrCount = 0;
      for (const r of parsedRows) {
        if (!uniquePoMap.has(r.nomorPr)) {
          uniquePoMap.set(r.nomorPr, r);
        } else {
          duplicatePrCount++;
        }
      }
      const uniquePoList = Array.from(uniquePoMap.values());

      await prisma.$transaction(async (tx) => {
        // Auto-insert missing PGR into purchasing table to prevent foreign key errors
        const pgrSet = new Set<string>();
        uniquePoList.forEach((r) => {
          if (r.pgr) pgrSet.add(r.pgr);
        });

        for (const pgr of pgrSet) {
          const existingPgr = await tx.purchasing.findUnique({
            where: { pgr },
          });
          if (!existingPgr) {
            await tx.purchasing.create({
              data: {
                pgr,
                description: `Purchasing Group ${pgr}`,
              },
            });
          }
        }

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
      if (duplicatePrCount > 0) {
        categoryTitle = `PO (${duplicatePrCount} baris duplikat diabaikan, diambil baris pertama)`;
      }
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

          // capexNo is optional: will be auto-derived from Created via WBS -> MO -> IO during reconciliation
          if (!io && !mo && !wbs && !description) return null;

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
        // Auto-insert CostCenter jika costCenter dari Budget belum ada di tabel cost_center
        await ensureCostCentersExist(
          tx,
          parsedRows.map((r) => r.costCenter)
        );

        // Auto-insert Kategori jika capexNo dari Budget belum ada di tabel kategori
        const kategoriMap = new Map<
          string,
          {
            description: string | null;
            costCenter: string | null;
            kategori: string | null;
            komoditi: string | null;
          }
        >();

        for (const row of parsedRows) {
          if (row.capexNo) {
            if (!kategoriMap.has(row.capexNo)) {
              kategoriMap.set(row.capexNo, {
                description: row.description,
                costCenter: row.costCenter,
                kategori: row.kategori,
                komoditi: row.komoditi,
              });
            }
          }
        }

        for (const [capexNo, data] of kategoriMap.entries()) {
          const existingKategori = await tx.kategori.findUnique({
            where: { capexNo },
          });

          if (!existingKategori) {
            await tx.kategori.create({
              data: {
                capexNo,
                description: data.description,
                costCenter: data.costCenter,
                kategori: data.kategori,
                komoditi: data.komoditi,
              },
            });
          }
        }

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
      for (const r of parsedRows) {
        if (!uniquePurchasingMap.has(r.pgr)) {
          uniquePurchasingMap.set(r.pgr, r);
        }
      }
      const uniquePurchasingList = Array.from(uniquePurchasingMap.values());

      // UPSERT: Insert or Update without deleting existing records (mencegah po.pgr terhapus)
      await prisma.$transaction(async (tx) => {
        for (const item of uniquePurchasingList) {
          await tx.purchasing.upsert({
            where: { pgr: item.pgr },
            create: item,
            update: {
              description: item.description,
              telephone: item.telephone,
              faxNumber: item.faxNumber,
            },
          });
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
        await ensureCostCentersExist(
          tx,
          parsedRows.map((r) => r.costCenter)
        );

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
    } else if (
      category === "cost_center" ||
      category === "costcenter" ||
      category === "cost center" ||
      category === "master_cost_center"
    ) {
      categoryTitle = "Master Cost Center";

      const parsedRows = rawRows
        .map((row) => {
          const kodeCostCenter = String(
            getVal(row, [
              "kode_cost_center",
              "kodecostcenter",
              "cost_center",
              "costcenter",
              "kode_cc",
              "kode",
              "cc",
            ]) || ""
          ).trim();
          if (!kodeCostCenter) return null;

          const keterangan =
            String(
              getVal(row, [
                "keterangan",
                "description",
                "deskripsi",
                "nama",
                "nama_cost_center",
                "nama_bagian",
                "bagian",
              ]) || ""
            ).trim() || kodeCostCenter;

          return {
            kodeCostCenter,
            keterangan,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (parsedRows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Kolom wajib 'kode_cost_center' tidak ditemukan atau kosong.",
          },
          { status: 400 }
        );
      }

      // UPSERT: Insert or update without deleting
      await prisma.$transaction(async (tx) => {
        for (const item of parsedRows) {
          await tx.costCenter.upsert({
            where: { kodeCostCenter: item.kodeCostCenter },
            create: item,
            update: {
              keterangan: item.keterangan,
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
