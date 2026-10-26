import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import * as path from "path";
import { Prisma } from "@/generated/client";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB Limit

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
        { success: false, message: "Ukuran file terlalu besar. Batas maksimal adalah 25 MB." },
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

    // 1. Baca buffer file & parse dengan SheetJS (in-memory tanpa disimpan ke disk)
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

    // Helper untuk mengambil nilai kolom fleksibel
    const getVal = (row: Record<string, unknown>, keys: string[]): unknown => {
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
    };

    const parseNum = (val: unknown): number => {
      if (val === undefined || val === null) return 0;
      if (typeof val === "number") return val;
      const str = String(val).replace(/[^0-9.-]/g, "").trim();
      const n = parseFloat(str);
      return isNaN(n) ? 0 : n;
    };

    const parseDate = (val: unknown): Date | null => {
      if (!val) return null;
      if (val instanceof Date) return val;
      if (typeof val === "number") {
        // Excel serial date to JS Date
        return new Date(Math.round((val - 25569) * 86400 * 1000));
      }
      const d = new Date(String(val));
      return isNaN(d.getTime()) ? null : d;
    };

    let importedCount = 0;

    // ─────────────────────────────────────────────────────────────────────────
    // A. PROSES DATA ACTUAL
    // ─────────────────────────────────────────────────────────────────────────
    if (category === "actual" || category === "data_actual" || category === "data actual") {
      const actualRecords: Prisma.DataActualCreateManyInput[] = [];
      const costCenterMap = new Map<string, string>();
      const ce2Map = new Map<string, string>();
      const periodsSet = new Set<number>();

      for (const row of rawRows) {
        const costcenter = String(getVal(row, ["costcenter", "cost_center", "Cost Center"]) || "").trim();
        const ce2 = String(getVal(row, ["ce2", "cost_element_2", "Cost Element 2", "CE2"]) || "").trim();
        if (!costcenter || !ce2) continue;

        const deskripsiCostcenter = String(getVal(row, ["deskripsi_costcenter", "deskripsi costcenter", "Cost Center Description"]) || "").trim();
        const deskripsiCe2 = String(getVal(row, ["deskripsi_ce2", "deskripsi ce2", "CE2 Description"]) || "").trim();
        const rawPeriod = parseNum(getVal(row, ["period", "periode", "bulan", "Period"]));
        const period = rawPeriod >= 1 && rawPeriod <= 12 ? Math.round(rawPeriod) : 1;
        const pg = String(getVal(row, ["pg", "plantation_group", "PG"]) || "PG1").trim().toUpperCase();

        periodsSet.add(period);
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
          costControl: String(getVal(row, ["cost_control", "cost control", "cost element"]) || "").trim() || null,
          costDescription: String(getVal(row, ["cost_description", "cost description"]) || "").trim() || null,
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

      if (actualRecords.length === 0) {
        return NextResponse.json(
          { success: false, message: "Tidak ada baris valid dengan kolom 'costcenter' dan 'ce2'." },
          { status: 400 }
        );
      }

      // Pastikan Master Cost Center & Master CE2 terisi
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

      // Insert actual records dalam chunk
      const CHUNK_SIZE = 1000;
      for (let i = 0; i < actualRecords.length; i += CHUNK_SIZE) {
        await prisma.dataActual.createMany({
          data: actualRecords.slice(i, i + CHUNK_SIZE),
        });
      }
      importedCount = actualRecords.length;

      // Sinkronisasi Tabel Summary
      await syncSummaryTable(Array.from(periodsSet));

      return NextResponse.json({
        success: true,
        message: `Berhasil mengimpor ${importedCount.toLocaleString("id-ID")} baris Data Actual & menyinkronkan Summary OPEX.`,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // B. PROSES DATA BUDGET
    // ─────────────────────────────────────────────────────────────────────────
    else if (category === "budget" || category === "data_budget" || category === "data budget") {
      const budgetRecords: Prisma.DataBudgetCreateManyInput[] = [];
      const costCenterMap = new Map<string, string>();
      const ce2Map = new Map<string, string>();
      const periodsSet = new Set<number>();

      for (const row of rawRows) {
        const costcenter = String(getVal(row, ["costcenter", "cost_center", "Cost Center"]) || "").trim();
        const ce2 = String(getVal(row, ["ce2", "cost_element_2", "Cost Element 2", "CE2"]) || "").trim();
        if (!costcenter || !ce2) continue;

        const deskripsiCostcenter = String(getVal(row, ["deskripsi_costcenter", "deskripsi costcenter", "Cost Center Description"]) || "").trim();
        const deskripsiCe2 = String(getVal(row, ["deskripsi_ce2", "deskripsi ce2", "CE2 Description"]) || "").trim();
        const rawPeriod = parseNum(getVal(row, ["period", "periode", "bulan", "Period"]));
        const period = rawPeriod >= 1 && rawPeriod <= 12 ? Math.round(rawPeriod) : 1;

        periodsSet.add(period);
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
          month: parseDate(getVal(row, ["month", "bulan", "tanggal", "Date"])),
          period,
          bbp: String(getVal(row, ["bbp"]) || "").trim() || null,
          groupExp: String(getVal(row, ["group_exp", "grup_exp", "group exp"]) || "").trim() || null,
        });
      }

      if (budgetRecords.length === 0) {
        return NextResponse.json(
          { success: false, message: "Tidak ada baris valid dengan kolom 'costcenter' dan 'ce2'." },
          { status: 400 }
        );
      }

      // Pastikan Master Cost Center & Master CE2 terisi
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

      // Insert budget records dalam chunk
      const CHUNK_SIZE = 1000;
      for (let i = 0; i < budgetRecords.length; i += CHUNK_SIZE) {
        await prisma.dataBudget.createMany({
          data: budgetRecords.slice(i, i + CHUNK_SIZE),
        });
      }
      importedCount = budgetRecords.length;

      // Sinkronisasi Tabel Summary
      await syncSummaryTable(Array.from(periodsSet));

      return NextResponse.json({
        success: true,
        message: `Berhasil mengimpor ${importedCount.toLocaleString("id-ID")} baris Data Budget & menyinkronkan Summary OPEX.`,
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
 * Helper untuk menyinkronkan tabel `Summary` dari gabungan `data_actual` & `data_budget`
 */
async function syncSummaryTable(periods: number[]) {
  if (periods.length === 0) return;

  // 1. Ambil agregat actual per (period, costcenter, ce2, pg)
  const actualAggregates = await prisma.dataActual.groupBy({
    by: ["period", "costcenter", "ce2", "pg"],
    where: { period: { in: periods } },
    _sum: { idrAct: true },
  });

  // 2. Ambil agregat budget per (period, costcenter, ce2)
  const budgetAggregates = await prisma.dataBudget.groupBy({
    by: ["period", "costcenter", "ce2"],
    where: { period: { in: periods } },
    _sum: { amountIdr: true },
  });

  // Buat lookup budget: key `${period}-${cc}-${ce2}`
  const budgetMap = new Map<string, number>();
  for (const b of budgetAggregates) {
    if (b.period && b.costcenter && b.ce2) {
      const key = `${b.period}-${b.costcenter}-${b.ce2}`;
      budgetMap.set(key, Number(b._sum.amountIdr || 0));
    }
  }

  // 3. Upsert Summary records
  for (const a of actualAggregates) {
    if (!a.period || !a.costcenter || !a.ce2) continue;
    const pg = a.pg || "PG1";
    const actualVal = Number(a._sum.idrAct || 0);
    const budgetKey = `${a.period}-${a.costcenter}-${a.ce2}`;
    const budgetVal = budgetMap.get(budgetKey) || 0;

    const variance =
      budgetVal > 0
        ? Number((((actualVal - budgetVal) / budgetVal) * 100).toFixed(2))
        : null;

    const kode = `${a.period}${a.costcenter}${a.ce2}${pg}`;

    await prisma.summary.upsert({
      where: { kode },
      create: {
        kode,
        periode: a.period,
        costcenter: a.costcenter,
        ce2: a.ce2,
        pg,
        nilaiActual: new Prisma.Decimal(actualVal),
        nilaiBudget: new Prisma.Decimal(budgetVal),
        variance: variance !== null ? new Prisma.Decimal(variance) : null,
      },
      update: {
        nilaiActual: new Prisma.Decimal(actualVal),
        nilaiBudget: new Prisma.Decimal(budgetVal),
        variance: variance !== null ? new Prisma.Decimal(variance) : null,
      },
    });
  }
}
