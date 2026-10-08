import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import * as path from "path";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB Limit

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "File Excel/CSV wajib diunggah." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "Ukuran file terlalu besar. Batas maksimal ukuran file adalah 15 MB." },
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

    // 1. Read file buffer & parse Excel directly in memory (No disk storage write)
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

    // Flexible column helper
    const getVal = (row: Record<string, unknown>, keys: string[]): unknown => {
      for (const k of keys) {
        const foundKey = Object.keys(row).find(
          (rk) => rk.trim().toLowerCase().replace(/_/g, " ") === k.trim().toLowerCase().replace(/_/g, " ")
        );
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
          return row[foundKey];
        }
      }
      return undefined;
    };

    const parseDate = (val: unknown): Date | null => {
      if (!val) return null;
      if (val instanceof Date) return val;
      if (typeof val === "number") {
        // Excel serial date number
        const dateObj = XLSX.SSF.parse_date_code(val);
        if (dateObj) {
          return new Date(Date.UTC(dateObj.y, dateObj.m - 1, dateObj.d));
        }
      }
      const parsed = new Date(String(val));
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    // Extract MasterSheet & BahanMaterial records
    const masterMap = new Map<string, {
      material: string;
      materialDescription: string | null;
      group: string | null;
      baseUnitOfMeasure: string | null;
      abcIndicator: string | null;
    }>();

    const bahanList: {
      material: string;
      price: number | null;
      currency: string | null;
      priceUnit: number | null;
      materialGroup: string | null;
      plant: string | null;
      purchasingGroup: string | null;
      lastChange: Date | null;
      createdBy: string | null;
      update: Date | null;
      nilai: number | null;
    }[] = [];

    rawRows.forEach((row) => {
      const materialCode = String(
        getVal(row, ["material", "kode_material", "kode material", "Kode Material", "Material Code"]) || ""
      ).trim();

      if (!materialCode) return;

      const description = String(
        getVal(row, ["material_description", "material description", "deskripsi", "Deskripsi", "Material Description"]) || ""
      ).trim() || null;

      const rawGroup = String(
        getVal(row, ["group", "Group", "material_group", "material group", "Material Group"]) || ""
      ).trim();
      const group = rawGroup || "-";

      const uom = String(
        getVal(row, ["base_unit_of_measure", "satuan", "Satuan", "UoM", "Base Unit Of Measure"]) || ""
      ).trim() || null;

      const abcIndicator = String(
        getVal(row, ["abc_indicator", "abc indicator", "ABC Indicator"]) || ""
      ).trim() || null;

      if (!masterMap.has(materialCode)) {
        masterMap.set(materialCode, {
          material: materialCode,
          materialDescription: description,
          group,
          baseUnitOfMeasure: uom,
          abcIndicator,
        });
      } else {
        // Update master description/group if previously empty or '-'
        const existing = masterMap.get(materialCode)!;
        if (!existing.materialDescription && description) existing.materialDescription = description;
        if ((!existing.group || existing.group === "-") && group !== "-") existing.group = group;
        if (!existing.baseUnitOfMeasure && uom) existing.baseUnitOfMeasure = uom;
      }

      // Read price fields
      const priceVal = Number(getVal(row, ["price", "Harga", "harga", "Price"])) || null;
      const priceUnitVal = Number(getVal(row, ["price_unit", "Price Unit", "satuan_harga", "PriceUnit"])) || 1;
      const currencyVal = String(getVal(row, ["currency", "Currency", "Mata Uang"]) || "IDR").trim();
      const plantVal = String(getVal(row, ["plant", "Plant", "Pabrik"]) || "").trim() || null;
      const purchasingGroupVal = String(getVal(row, ["purchasing_group", "Purchasing Group"]) || "").trim() || null;
      const createdByVal = String(getVal(row, ["created_by", "Created By"]) || "").trim() || null;

      const lastChangeDate = parseDate(getVal(row, ["last_change", "Last Change", "tanggal_ubah"]));
      const updateDate = parseDate(getVal(row, ["update", "Update", "tanggal_update", "date", "Date"]));

      // Calculate nilai = price / price_unit
      let calculatedNilai = Number(getVal(row, ["nilai", "Nilai", "NILAI"])) || null;
      if (calculatedNilai === null && priceVal !== null && priceUnitVal > 0) {
        calculatedNilai = priceVal / priceUnitVal;
      }

      bahanList.push({
        material: materialCode,
        price: priceVal,
        currency: currencyVal,
        priceUnit: priceUnitVal,
        materialGroup: group,
        plant: plantVal,
        purchasingGroup: purchasingGroupVal,
        lastChange: lastChangeDate,
        createdBy: createdByVal,
        update: updateDate,
        nilai: calculatedNilai,
      });
    });

    const masterList = Array.from(masterMap.values());

    if (masterList.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kolom wajib 'material' (Kode Material) tidak ditemukan atau seluruh baris data kosong." },
        { status: 400 }
      );
    }

    // Execute database update inside Prisma Transaction
    await prisma.$transaction(
      async (tx) => {
        // 1. Incremental MasterSheet update (Upsert: only insert if new material code or update metadata)
        for (const m of masterList) {
          await tx.masterSheet.upsert({
            where: { material: m.material },
            update: {
              materialDescription: m.materialDescription,
              group: m.group,
              baseUnitOfMeasure: m.baseUnitOfMeasure,
              abcIndicator: m.abcIndicator,
            },
            create: {
              material: m.material,
              materialDescription: m.materialDescription,
              group: m.group,
              baseUnitOfMeasure: m.baseUnitOfMeasure,
              abcIndicator: m.abcIndicator,
            },
          });
        }

        // 2. BahanMaterial update: Overwrite/Replace existing records for the target months being uploaded to prevent duplicate rows
        if (bahanList.length > 0) {
          // Collect all unique Year-Month combinations in the incoming upload file
          const dateFilters: { gte: Date; lt: Date }[] = [];
          const monthMap = new Set<string>();

          for (const item of bahanList) {
            if (item.update) {
              const year = item.update.getUTCFullYear();
              const month = item.update.getUTCMonth(); // 0-indexed
              const key = `${year}-${month}`;
              if (!monthMap.has(key)) {
                monthMap.add(key);
                const startOfMonth = new Date(Date.UTC(year, month, 1));
                const endOfMonth = new Date(Date.UTC(year, month + 1, 1));
                dateFilters.push({ gte: startOfMonth, lt: endOfMonth });
              }
            }
          }

          // Delete existing BahanMaterial records for the months being uploaded
          if (dateFilters.length > 0) {
            await tx.bahanMaterial.deleteMany({
              where: {
                OR: dateFilters.map((df) => ({
                  update: {
                    gte: df.gte,
                    lt: df.lt,
                  },
                })),
              },
            });
          }

          // Insert the new updated records
          const chunkSize = 1000;
          for (let i = 0; i < bahanList.length; i += chunkSize) {
            const chunk = bahanList.slice(i, i + chunkSize);
            await tx.bahanMaterial.createMany({
              data: chunk,
            });
          }
        }
      },
      { maxWait: 15000, timeout: 60000 }
    );

    return NextResponse.json({
      success: true,
      message: `Berhasil menambahkan & memperbarui ${masterList.length} master material dan ${bahanList.length} histori harga material baru ke database PostgreSQL!`,
    });
  } catch (error: unknown) {
    console.error("Error processing material price upload:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, message: `Gagal memproses file Excel: ${msg}` },
      { status: 500 }
    );
  }
}
