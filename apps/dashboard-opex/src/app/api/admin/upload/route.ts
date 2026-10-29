import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import * as path from "path";
import { Prisma } from "@/generated/client";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB Limit

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Helper untuk mengambil nilai kolom fleksibel
function getVal(row: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    const foundKey = Object.keys(row).find(
      (rk) =>
        rk.trim().toLowerCase().replace(/[\s_-]/g, "") ===
        k.trim().toLowerCase().replace(/[\s_-]/g, "")
    );
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return row[foundKey];
    }
  }
  return undefined;
}

/**
 * Helper parsing angka yang mendukung:
 * - Titik sebagai pemisah ribuan Indonesia (contoh: "48.500.000", "1.000.000")
 * - Koma sebagai desimal Indonesia (contoh: "48.500.000,50")
 * - Format internasional / US (contoh: "48,500,000.50")
 * - Awalan mata uang (contoh: "Rp 48.500.000")
 * - Format akuntansi minus dalam tanda kurung (contoh: "(15.000.000)")
 */
function parseNum(val: unknown): number {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;

  let str = String(val).trim();
  if (!str) return 0;

  const isNegative = str.startsWith("-") || /^\(.*\)$/.test(str);
  str = str.replace(/[()]/g, "").replace(/[^0-9.,-]/g, "").trim();
  if (!str) return 0;

  const hasDot = str.includes(".");
  const hasComma = str.includes(",");

  if (hasDot && hasComma) {
    const lastDot = str.lastIndexOf(".");
    const lastComma = str.lastIndexOf(",");
    if (lastComma > lastDot) {
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      str = str.replace(/,/g, "");
    }
  } else if (hasDot) {
    if ((str.match(/\./g) || []).length > 1) {
      str = str.replace(/\./g, "");
    } else if (/\.\d{3}$/.test(str)) {
      str = str.replace(/\./g, "");
    }
  } else if (hasComma) {
    if ((str.match(/,/g) || []).length > 1) {
      str = str.replace(/,/g, "");
    } else if (/,\d{3}$/.test(str)) {
      str = str.replace(/,/g, "");
    } else {
      str = str.replace(",", ".");
    }
  }

  let n = parseFloat(str);
  if (isNaN(n)) return 0;
  if (isNegative && n > 0) n = -n;
  return n;
}

/**
 * Helper parsing tanggal yang mendukung:
 * - Date object dari SheetJS (cellDates: true)
 * - Serial date Excel (angka murni misal: 45678)
 * - Format teks Indonesia: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
 * - Format teks ISO: YYYY-MM-DD
 * - Format teks nama bulan Indonesia / Inggris
 */
function parseDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }

  if (typeof val === "number") {
    if (val > 20000 && val < 75000) {
      const utcMs = Math.round((val - 25569) * 86400 * 1000);
      const d = new Date(utcMs);
      if (!isNaN(d.getTime())) {
        return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      }
    }
    return null;
  }

  const str = String(val).trim();
  if (!str) return null;

  if (/^\d{5}$/.test(str)) {
    const num = parseInt(str, 10);
    if (num > 20000 && num < 75000) {
      const utcMs = Math.round((num - 25569) * 86400 * 1000);
      const d = new Date(utcMs);
      if (!isNaN(d.getTime())) {
        return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      }
    }
  }

  const dmyMatch = str.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const d = new Date(year, month - 1, day);
      return isNaN(d.getTime()) ? null : d;
    }
  }

  const ymdMatch = str.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const d = new Date(year, month - 1, day);
      return isNaN(d.getTime()) ? null : d;
    }
  }

  const monthNamesMap: Record<string, number> = {
    jan: 1, januari: 1, january: 1,
    feb: 2, februari: 2, february: 2,
    mar: 3, maret: 3, march: 3,
    apr: 4, april: 4,
    mei: 5, may: 5,
    jun: 6, juni: 6, june: 6,
    jul: 7, juli: 7, july: 7,
    agu: 8, agustus: 8, aug: 8, august: 8,
    sep: 9, september: 9,
    okt: 10, oktober: 10, oct: 10, october: 10,
    nov: 11, november: 11,
    des: 12, desember: 12, dec: 12, december: 12,
  };

  for (const [mName, mNum] of Object.entries(monthNamesMap)) {
    if (new RegExp(`(^|[^a-z])${mName}([^a-z]|$)`, "i").test(str.toLowerCase())) {
      const digits = str.match(/\d+/g);
      if (digits && digits.length >= 2) {
        let day = parseInt(digits[0], 10);
        let year = parseInt(digits[1], 10);
        if (day > 31 && year <= 31) {
          const temp = day;
          day = year;
          year = temp;
        }
        if (year < 100) year += 2000;
        const d = new Date(year, mNum - 1, day);
        if (!isNaN(d.getTime())) return d;
      }
    }
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

const monthNames: Record<string, number> = {
  jan: 1, januari: 1, january: 1,
  feb: 2, februari: 2, february: 2,
  mar: 3, maret: 3, march: 3,
  apr: 4, april: 4,
  mei: 5, may: 5,
  jun: 6, juni: 6, june: 6,
  jul: 7, juli: 7, july: 7,
  agu: 8, agustus: 8, aug: 8, august: 8,
  sep: 9, september: 9,
  okt: 10, oktober: 10, oct: 10, october: 10,
  nov: 11, november: 11,
  des: 12, desember: 12, dec: 12, december: 12,
};

/**
 * Helper untuk mengekstrak angka bulan (1–12) dan tanggal objek
 * dari kolom 'periode' yang berformat Bulan-Tahun
 */
function parsePeriodMonth(val: unknown): { period: number; monthDate: Date | null } {
  if (val === undefined || val === null || val === "") {
    return { period: 1, monthDate: null };
  }

  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      return {
        period: val.getMonth() + 1,
        monthDate: val,
      };
    }
    return { period: 1, monthDate: null };
  }

  if (typeof val === "number") {
    if (val >= 1 && val <= 12) {
      const p = Math.round(val);
      return {
        period: p,
        monthDate: new Date(new Date().getFullYear(), p - 1, 1),
      };
    }
    if (val > 25000 && val < 60000) {
      const d = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(d.getTime())) {
        return {
          period: d.getUTCMonth() + 1,
          monthDate: d,
        };
      }
    }
    if (val >= 199001 && val <= 210012) {
      const m = val % 100;
      const y = Math.floor(val / 100);
      if (m >= 1 && m <= 12) {
        return {
          period: m,
          monthDate: new Date(y, m - 1, 1),
        };
      }
    }
  }

  const str = String(val).trim();

  if (/^(0?[1-9]|1[0-2])$/.test(str)) {
    const p = parseInt(str, 10);
    return {
      period: p,
      monthDate: new Date(new Date().getFullYear(), p - 1, 1),
    };
  }

  const yyyyMmMatch = str.match(/^(\d{4})[-/.](0?[1-9]|1[0-2])([-/.]\d+)?$/);
  if (yyyyMmMatch) {
    const y = parseInt(yyyyMmMatch[1], 10);
    const m = parseInt(yyyyMmMatch[2], 10);
    return {
      period: m,
      monthDate: new Date(y, m - 1, 1),
    };
  }

  const mmYyyyMatch = str.match(/^(0?[1-9]|1[0-2])[-/.](\d{4})$/);
  if (mmYyyyMatch) {
    const m = parseInt(mmYyyyMatch[1], 10);
    const y = parseInt(mmYyyyMatch[2], 10);
    return {
      period: m,
      monthDate: new Date(y, m - 1, 1),
    };
  }

  const lower = str.toLowerCase();
  for (const [name, num] of Object.entries(monthNames)) {
    if (new RegExp(`(^|[^a-z])${name}([^a-z]|$)`, "i").test(lower)) {
      const yearMatch = str.match(/\b(20\d{2}|\d{2})\b/);
      let y = new Date().getFullYear();
      if (yearMatch) {
        y = yearMatch[1].length === 2 ? 2000 + parseInt(yearMatch[1], 10) : parseInt(yearMatch[1], 10);
      }
      return {
        period: num,
        monthDate: new Date(y, num - 1, 1),
      };
    }
  }

  const parsedD = new Date(str);
  if (!isNaN(parsedD.getTime())) {
    return {
      period: parsedD.getMonth() + 1,
      monthDate: parsedD,
    };
  }

  return { period: 1, monthDate: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSFORMATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function mapActualRows(rawRows: Record<string, unknown>[]) {
  const actualRecords: Prisma.DataActualCreateManyInput[] = [];
  const costCenterMap = new Map<string, string>();
  const ce2Map = new Map<string, string>();

  for (const row of rawRows) {
    const costcenter = String(getVal(row, ["costcenter", "cost_center", "Cost Center"]) || "").trim();
    const ce2 = String(getVal(row, ["ce2", "cost_element_2", "Cost Element 2", "CE2"]) || "").trim();
    if (!costcenter || !ce2) continue;

    const deskripsiCostcenter = String(getVal(row, ["deskripsi_costcenter", "deskripsi costcenter", "Cost Center Description"]) || "").trim();
    const deskripsiCe2 = String(getVal(row, ["deskripsi_ce2", "deskripsi ce2", "CE2 Description"]) || "").trim();
    const rawPeriodVal = getVal(row, ["period", "periode", "bulan", "Period", "Periode", "month"]);
    const { period } = parsePeriodMonth(rawPeriodVal);
    const pg = String(getVal(row, ["pg", "plantation_group", "PG"]) || "PG1").trim().toUpperCase();

    if (!costCenterMap.has(costcenter) && deskripsiCostcenter) {
      costCenterMap.set(costcenter, deskripsiCostcenter);
    } else if (!costCenterMap.has(costcenter)) {
      costCenterMap.set(costcenter, costcenter);
    }

    if (!ce2Map.has(ce2) && deskripsiCe2) {
      ce2Map.set(ce2, deskripsiCe2);
    } else if (!ce2Map.has(ce2)) {
      ce2Map.set(ce2, ce2);
    }

    const idrAct = parseNum(getVal(row, ["idr_act", "idr act", "idr", "actual", "Actual IDR"]));
    const usdAct = parseNum(getVal(row, ["usd_act", "usd act", "usd", "Actual USD"]));
    const totalQuantity = parseNum(getVal(row, ["total_quantity", "total quantity", "quantity", "qty"]));
    const kode = String(getVal(row, ["kode", "Kode"]) || `${period}${costcenter}${ce2}${pg}`).trim();

    actualRecords.push({
      kode,
      costcenter,
      deskripsiCostcenter: deskripsiCostcenter || null,
      costControl: String(getVal(row, ["costelement", "cost_element", "cost element", "Cost Element", "costcontrol", "cost_control", "cost control"]) || "").trim() || null,
      costDescription: String(getVal(row, ["deskripsi_costelement", "deskripsi costelement", "cost_description", "cost description"]) || "").trim() || null,
      idrAct: new Prisma.Decimal(idrAct),
      objectCurrency: String(getVal(row, ["object_currency", "currency"]) || "IDR").trim() || null,
      usdAct: new Prisma.Decimal(usdAct),
      notes: String(getVal(row, ["notes", "catatan", "keterangan", "uraian", "aktivitas"]) || "").trim() || null,
      ce2,
      deskripsiCe2: deskripsiCe2 || null,
      totalQuantity: new Prisma.Decimal(totalQuantity),
      postedUnitOfMeas: String(getVal(row, ["posted_unit_of_meas", "uom", "unit"]) || "").trim() || null,
      documentNumber: String(getVal(row, ["document_number", "doc_number", "no_dokumen"]) || "").trim() || null,
      documentDate: parseDate(getVal(row, ["document_date", "doc_date"])),
      postingDate: parseDate(getVal(row, ["posting_date", "post_date"])),
      period,
      pg,
      groupingDepartement: String(getVal(row, ["grouping_departement", "department"]) || "").trim() || null,
      subgrup: String(getVal(row, ["subgrup", "subgroup"]) || "").trim() || null,
      grupExp: String(getVal(row, ["grup_exp", "group_exp"]) || "").trim() || null,
      jenisBiaya: String(getVal(row, ["jenis_biaya", "cost_type"]) || "").trim() || null,
      ceGrup: String(getVal(row, ["ce_grup", "ce_group"]) || "").trim() || null,
      grupAktivitas: String(getVal(row, ["grup_aktivitas", "activity_group"]) || "").trim() || null,
      mappingBiaya: String(getVal(row, ["mapping_biaya", "cost_mapping"]) || "").trim() || null,
    });
  }

  return { actualRecords, costCenterMap, ce2Map };
}

function mapBudgetRows(rawRows: Record<string, unknown>[]) {
  const budgetRecords: Prisma.DataBudgetCreateManyInput[] = [];
  const costCenterMap = new Map<string, string>();
  const ce2Map = new Map<string, string>();

  for (const row of rawRows) {
    const costcenter = String(getVal(row, ["costcenter", "cost_center", "Cost Center"]) || "").trim();
    const ce2 = String(getVal(row, ["ce2", "cost_element_2", "Cost Element 2", "CE2"]) || "").trim();
    if (!costcenter || !ce2) continue;

    const deskripsiCostcenter = String(getVal(row, ["deskripsi_costcenter", "deskripsi costcenter", "Cost Center Description"]) || "").trim();
    const deskripsiCe2 = String(getVal(row, ["deskripsi_ce2", "deskripsi ce2", "CE2 Description"]) || "").trim();
    const rawPeriodVal = getVal(row, ["periode", "period", "month", "bulan", "Periode", "Period"]);
    const { period, monthDate } = parsePeriodMonth(rawPeriodVal);

    if (!costCenterMap.has(costcenter) && deskripsiCostcenter) {
      costCenterMap.set(costcenter, deskripsiCostcenter);
    } else if (!costCenterMap.has(costcenter)) {
      costCenterMap.set(costcenter, costcenter);
    }

    if (!ce2Map.has(ce2) && deskripsiCe2) {
      ce2Map.set(ce2, deskripsiCe2);
    } else if (!ce2Map.has(ce2)) {
      ce2Map.set(ce2, ce2);
    }

    const amountIdr = parseNum(getVal(row, ["amount_idr", "amount idr", "budget", "anggaran", "Budget IDR"]));
    const amountUsd = parseNum(getVal(row, ["amount_usd", "amount usd", "Budget USD"]));
    const kode = String(getVal(row, ["kode", "Kode"]) || `${period}${costcenter}${ce2}`).trim();

    budgetRecords.push({
      kode,
      costcenter,
      deskripsiCostcenter: deskripsiCostcenter || null,
      ce2,
      deskripsiCe2: deskripsiCe2 || null,
      amountIdr: new Prisma.Decimal(amountIdr),
      amountUsd: new Prisma.Decimal(amountUsd),
      month: monthDate,
      period,
      bbp: String(getVal(row, ["bbp"]) || "").trim() || null,
      groupExp: String(getVal(row, ["group_exp", "grup_exp", "group exp"]) || "").trim() || null,
    });
  }

  return { budgetRecords, costCenterMap, ce2Map };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN API ROUTE HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // ═════════════════════════════════════════════════════════════════════════
    // MODE 1: CHUNK / BATCH JSON UPLOAD (Solusi Anti-Timeout & Anti-Limit)
    // ═════════════════════════════════════════════════════════════════════════
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { category, rows, chunkIndex = 0, totalChunks = 1, isFirstChunk = false, isLastChunk = false } = body;

      const normCategory = String(category || "").toLowerCase().trim();
      if (!Array.isArray(rows)) {
        return NextResponse.json({ success: false, message: "Field 'rows' harus berupa array data." }, { status: 400 });
      }

      if (normCategory === "actual" || normCategory === "data_actual" || normCategory === "data actual") {
        // Jika batch pertama, hapus seluruh data actual lama untuk mode replace
        if (isFirstChunk) {
          await prisma.dataActual.deleteMany();
        }

        const { actualRecords, costCenterMap, ce2Map } = mapActualRows(rows);

        // Upsert mastersheet costcenter & ce2 yang ada di batch ini
        for (const [cc, desc] of costCenterMap.entries()) {
          await prisma.mastersheetCostcenter.upsert({
            where: { costcenter: cc },
            create: { costcenter: cc, deskripsiCostcenter: desc, isview: true },
            update: { deskripsiCostcenter: desc },
          });
        }

        for (const [ce, desc] of ce2Map.entries()) {
          await prisma.mastersheetCe2.upsert({
            where: { ce2: ce },
            create: { ce2: ce, deskripsiCe2: desc, isview: true },
            update: { deskripsiCe2: desc },
          });
        }

        // Simpan baris data actual di batch ini
        if (actualRecords.length > 0) {
          const CHUNK_SIZE = 1000;
          for (let i = 0; i < actualRecords.length; i += CHUNK_SIZE) {
            await prisma.dataActual.createMany({
              data: actualRecords.slice(i, i + CHUNK_SIZE),
            });
          }
        }

        // Jika batch terakhir, bangun ulang tabel Summary
        if (isLastChunk) {
          await rebuildSummaryTable();
          return NextResponse.json({
            success: true,
            isLastChunk: true,
            message: "Semua batch Data Actual berhasil disimpan & tabel Summary telah disinkronkan.",
          });
        }

        return NextResponse.json({
          success: true,
          isLastChunk: false,
          chunkIndex,
          totalChunks,
          insertedCount: actualRecords.length,
          message: `Batch ${chunkIndex + 1} dari ${totalChunks} berhasil diproses.`,
        });
      }

      if (normCategory === "budget" || normCategory === "data_budget" || normCategory === "data budget") {
        // Jika batch pertama, hapus seluruh data budget lama
        if (isFirstChunk) {
          await prisma.dataBudget.deleteMany();
        }

        const { budgetRecords, costCenterMap, ce2Map } = mapBudgetRows(rows);

        for (const [cc, desc] of costCenterMap.entries()) {
          await prisma.mastersheetCostcenter.upsert({
            where: { costcenter: cc },
            create: { costcenter: cc, deskripsiCostcenter: desc, isview: true },
            update: { deskripsiCostcenter: desc },
          });
        }

        for (const [ce, desc] of ce2Map.entries()) {
          await prisma.mastersheetCe2.upsert({
            where: { ce2: ce },
            create: { ce2: ce, deskripsiCe2: desc, isview: true },
            update: { deskripsiCe2: desc },
          });
        }

        if (budgetRecords.length > 0) {
          const CHUNK_SIZE = 1000;
          for (let i = 0; i < budgetRecords.length; i += CHUNK_SIZE) {
            await prisma.dataBudget.createMany({
              data: budgetRecords.slice(i, i + CHUNK_SIZE),
            });
          }
        }

        if (isLastChunk) {
          await rebuildSummaryTable();
          return NextResponse.json({
            success: true,
            isLastChunk: true,
            message: "Semua batch Data Budget berhasil disimpan & tabel Summary telah disinkronkan.",
          });
        }

        return NextResponse.json({
          success: true,
          isLastChunk: false,
          chunkIndex,
          totalChunks,
          insertedCount: budgetRecords.length,
          message: `Batch ${chunkIndex + 1} dari ${totalChunks} berhasil diproses.`,
        });
      }

      return NextResponse.json(
        { success: false, message: `Kategori '${category}' tidak valid. Gunakan 'actual' atau 'budget'.` },
        { status: 400 }
      );
    }

    // ═════════════════════════════════════════════════════════════════════════
    // MODE 2: MONOLITHIC DIRECT BINARY STREAM / FORMDATA (Fallback)
    // ═════════════════════════════════════════════════════════════════════════
    let category = "";
    let fileName = "";
    let buffer: Buffer;

    if (contentType.includes("application/octet-stream")) {
      const url = new URL(request.url);
      category = String(url.searchParams.get("category") || "").toLowerCase().trim();
      fileName = decodeURIComponent(url.searchParams.get("fileName") || "upload.xlsx");

      const arrayBuffer = await request.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        return NextResponse.json({ success: false, message: "File kosong atau data tidak diterima." }, { status: 400 });
      }
      buffer = Buffer.from(arrayBuffer);
    } else {
      const formData = await request.formData();
      category = String(formData.get("category") || "").toLowerCase().trim();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ success: false, message: "File wajib diunggah." }, { status: 400 });
      }
      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "Ukuran file terlalu besar. Batas maksimal adalah 25 MB." },
        { status: 400 }
      );
    }

    const fileExt = path.extname(fileName).toLowerCase();
    if (fileExt && ![".xlsx", ".xls", ".csv"].includes(fileExt)) {
      return NextResponse.json(
        { success: false, message: "Format file tidak didukung. Gunakan file .xlsx, .xls, atau .csv." },
        { status: 400 }
      );
    }

    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return NextResponse.json({ success: false, message: "File Excel kosong atau tidak memiliki sheet." }, { status: 400 });
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (rawRows.length === 0) {
      return NextResponse.json({ success: false, message: "File Excel tidak memiliki baris data." }, { status: 400 });
    }

    if (category === "actual" || category === "data_actual" || category === "data actual") {
      const { actualRecords, costCenterMap, ce2Map } = mapActualRows(rawRows);

      if (actualRecords.length === 0) {
        return NextResponse.json(
          { success: false, message: "Tidak ada baris valid dengan kolom 'costcenter' dan 'ce2'." },
          { status: 400 }
        );
      }

      for (const [cc, desc] of costCenterMap.entries()) {
        await prisma.mastersheetCostcenter.upsert({
          where: { costcenter: cc },
          create: { costcenter: cc, deskripsiCostcenter: desc, isview: true },
          update: { deskripsiCostcenter: desc },
        });
      }

      for (const [ce, desc] of ce2Map.entries()) {
        await prisma.mastersheetCe2.upsert({
          where: { ce2: ce },
          create: { ce2: ce, deskripsiCe2: desc, isview: true },
          update: { deskripsiCe2: desc },
        });
      }

      await prisma.$transaction(
        async (tx) => {
          await tx.dataActual.deleteMany();
          const CHUNK_SIZE = 1000;
          for (let i = 0; i < actualRecords.length; i += CHUNK_SIZE) {
            await tx.dataActual.createMany({
              data: actualRecords.slice(i, i + CHUNK_SIZE),
            });
          }
        },
        { maxWait: 15000, timeout: 60000 }
      );

      await rebuildSummaryTable();

      return NextResponse.json({
        success: true,
        message: `Berhasil mengganti data: ${actualRecords.length.toLocaleString("id-ID")} baris Data Actual disimpan & tabel Summary disinkronkan.`,
      });
    } else if (category === "budget" || category === "data_budget" || category === "data budget") {
      const { budgetRecords, costCenterMap, ce2Map } = mapBudgetRows(rawRows);

      if (budgetRecords.length === 0) {
        return NextResponse.json(
          { success: false, message: "Tidak ada baris valid dengan kolom 'costcenter' dan 'ce2'." },
          { status: 400 }
        );
      }

      for (const [cc, desc] of costCenterMap.entries()) {
        await prisma.mastersheetCostcenter.upsert({
          where: { costcenter: cc },
          create: { costcenter: cc, deskripsiCostcenter: desc, isview: true },
          update: { deskripsiCostcenter: desc },
        });
      }

      for (const [ce, desc] of ce2Map.entries()) {
        await prisma.mastersheetCe2.upsert({
          where: { ce2: ce },
          create: { ce2: ce, deskripsiCe2: desc, isview: true },
          update: { deskripsiCe2: desc },
        });
      }

      await prisma.$transaction(
        async (tx) => {
          await tx.dataBudget.deleteMany();
          const CHUNK_SIZE = 1000;
          for (let i = 0; i < budgetRecords.length; i += CHUNK_SIZE) {
            await tx.dataBudget.createMany({
              data: budgetRecords.slice(i, i + CHUNK_SIZE),
            });
          }
        },
        { maxWait: 15000, timeout: 60000 }
      );

      await rebuildSummaryTable();

      return NextResponse.json({
        success: true,
        message: `Berhasil mengganti data: ${budgetRecords.length.toLocaleString("id-ID")} baris Data Budget disimpan & tabel Summary disinkronkan.`,
      });
    } else {
      return NextResponse.json(
        { success: false, message: `Kategori '${category}' tidak dikenal. Pilih Data Actual atau Data Budget.` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error upload file admin:", error);
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan internal saat memproses Excel.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

/**
 * Helper untuk menyinkronkan ulang seluruh tabel `Summary` dari gabungan `data_actual` & `data_budget`
 */
async function rebuildSummaryTable() {
  const actualAggregates = await prisma.dataActual.groupBy({
    by: ["period", "costcenter", "ce2", "pg"],
    _sum: { idrAct: true },
  });

  const budgetAggregates = await prisma.dataBudget.groupBy({
    by: ["period", "costcenter", "ce2"],
    _sum: { amountIdr: true },
  });

  const [ccList, ceList] = await Promise.all([
    prisma.mastersheetCostcenter.findMany({ select: { costcenter: true, deskripsiCostcenter: true } }),
    prisma.mastersheetCe2.findMany({ select: { ce2: true, deskripsiCe2: true } }),
  ]);
  const ccDescMap = new Map(ccList.map((c) => [c.costcenter, c.deskripsiCostcenter || c.costcenter]));
  const ceDescMap = new Map(ceList.map((c) => [c.ce2, c.deskripsiCe2 || c.ce2]));

  const budgetMap = new Map<string, number>();
  for (const b of budgetAggregates) {
    if (b.period && b.costcenter && b.ce2) {
      budgetMap.set(`${b.period}-${b.costcenter}-${b.ce2}`, Number(b._sum.amountIdr || 0));
    }
  }

  const actualMap = new Map<string, number>();
  const allCombos = new Map<string, { period: number; costcenter: string; ce2: string; pg: string }>();

  for (const a of actualAggregates) {
    if (!a.period || !a.costcenter || !a.ce2) continue;
    const pg = a.pg || "PG1";
    const key = `${a.period}|${a.costcenter}|${a.ce2}|${pg}`;
    actualMap.set(key, Number(a._sum.idrAct || 0));
    allCombos.set(key, { period: a.period, costcenter: a.costcenter, ce2: a.ce2, pg });
  }

  for (const b of budgetAggregates) {
    if (!b.period || !b.costcenter || !b.ce2) continue;
    const cc = b.costcenter;
    const defaultPg = cc.startsWith("CC2") ? "PG2" : cc.startsWith("CC3") ? "PG3" : "PG1";
    const key = `${b.period}|${cc}|${b.ce2}|${defaultPg}`;
    if (!allCombos.has(key)) {
      allCombos.set(key, { period: b.period, costcenter: cc, ce2: b.ce2, pg: defaultPg });
    }
  }

  const summaryRecords: Prisma.SummaryCreateManyInput[] = [];
  for (const combo of allCombos.values()) {
    const { period, costcenter, ce2, pg } = combo;
    const actualKey = `${period}|${costcenter}|${ce2}|${pg}`;
    const budgetKey = `${period}-${costcenter}-${ce2}`;

    const hasActual = actualMap.has(actualKey);
    const actualVal = hasActual ? actualMap.get(actualKey)! : null;
    const budgetVal = budgetMap.get(budgetKey) || 0;

    const variance =
      actualVal !== null && budgetVal > 0
        ? Number((((actualVal - budgetVal) / budgetVal) * 100).toFixed(2))
        : null;

    const kode = `${period}${costcenter}${ce2}${pg}`;
    const deskripsiCostcenter = ccDescMap.get(costcenter) || costcenter;
    const deskripsiCe2 = ceDescMap.get(ce2) || ce2;

    summaryRecords.push({
      kode,
      periode: period,
      costcenter,
      deskripsiCostcenter,
      ce2,
      deskripsiCe2,
      pg,
      nilaiActual: actualVal !== null ? new Prisma.Decimal(actualVal) : null,
      nilaiBudget: budgetVal > 0 ? new Prisma.Decimal(budgetVal) : null,
      variance: variance !== null ? new Prisma.Decimal(variance) : null,
    });
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.summary.deleteMany();
      const chunkSize = 1000;
      for (let i = 0; i < summaryRecords.length; i += chunkSize) {
        await tx.summary.createMany({
          data: summaryRecords.slice(i, i + chunkSize),
        });
      }
    },
    { maxWait: 15000, timeout: 60000 }
  );
}
