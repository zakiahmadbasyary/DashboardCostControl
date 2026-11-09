import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  cleanLokasi,
  cleanString,
  parseIndonesianNumber,
  parseInteger,
  parseExcelDate,
  isHeaderRow,
  extractCostUmurRows,
  extractDataMaterialRows,
} from "@/lib/weedControlParser";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Helper untuk membaca nilai field dengan variasi nama kolom
function getVal(row: Record<string, any>, ...keys: string[]): any {
  for (const k of keys) {
    if (k in row && row[k] !== undefined && row[k] !== null) return row[k];
    // case-insensitive check
    const found = Object.keys(row).find(
      (rk) => rk.toLowerCase().replace(/[\s_]/g, "") === k.toLowerCase().replace(/[\s_]/g, "")
    );
    if (found && row[found] !== undefined && row[found] !== null) return row[found];
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      category,
      rows,
      dynamicMaterialHeaders = [],
      isFirstChunk = true,
      isLastChunk = true,
    } = body;

    if (!category || !rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { success: false, message: "Payload tidak valid atau baris data kosong." },
        { status: 400 }
      );
    }

    // =========================================================================
    // 1. UPLOAD DATA LOKASI (Target: mastersheet & cost_umur)
    // =========================================================================
    if (category === "lokasi") {
      // Validasi awal pada chunk pertama
      if (isFirstChunk) {
        const incomingLocations = new Set<string>();
        const duplicates = new Set<string>();

        for (const row of rows) {
          const rawLoc = getVal(row, "lokasi", "location");
          const loc = cleanLokasi(rawLoc);
          if (!loc) {
            return NextResponse.json(
              { success: false, message: "Ditemukan baris data lokasi dengan nilai 'Lokasi' kosong atau tidak valid." },
              { status: 400 }
            );
          }
          if (incomingLocations.has(loc)) {
            duplicates.add(loc);
          }
          incomingLocations.add(loc);
        }

        if (duplicates.size > 0) {
          return NextResponse.json(
            {
              success: false,
              message: `Ditemukan duplikasi kode Lokasi pada file Excel: ${Array.from(duplicates).slice(0, 5).join(", ")}${
                duplicates.size > 5 ? " dan lainnya..." : ""
              }`,
            },
            { status: 400 }
          );
        }

        // Cek lokasi lama di database yang berpotensi hilang padahal masih direferensikan oleh timeline atau aktivitas
        const [existingTimelineLocs, existingAktivitasLocs] = await Promise.all([
          prisma.dataTimeline.findMany({ select: { lokasi: true }, distinct: ["lokasi"] }),
          prisma.dataAktivitas.findMany({ select: { lokasi: true }, distinct: ["lokasi"] }),
        ]);

        const referencedLocations = new Set<string>([
          ...existingTimelineLocs.map((t) => t.lokasi),
          ...existingAktivitasLocs.map((a) => a.lokasi),
        ]);

        const missingReferenced: string[] = [];
        for (const refLoc of referencedLocations) {
          if (!incomingLocations.has(refLoc)) {
            missingReferenced.push(refLoc);
          }
        }

        if (missingReferenced.length > 0) {
          return NextResponse.json(
            {
              success: false,
              message: `Replace ditolak: ${missingReferenced.length} lokasi lama masih direferensikan oleh Data Timeline atau Data Aktivitas, namun tidak ada pada file Data Lokasi baru: ${missingReferenced
                .slice(0, 6)
                .join(", ")}${missingReferenced.length > 6 ? "..." : ""}. Harap sertakan lokasi tersebut atau bersihkan data timeline/aktivitas terlebih dahulu.`,
            },
            { status: 400 }
          );
        }
      }

      // Siapkan item mastersheet dan costUmur
      const mastersheetItems: Array<{ lokasi: string; data: any }> = [];
      const allCostUmurRows: Array<{ lokasi: string; umur: number; cost: number }> = [];

      for (const row of rows) {
        const loc = cleanLokasi(getVal(row, "lokasi", "location"));
        if (!loc) continue;

        const status = cleanString(getVal(row, "status"));
        const wilayah = cleanString(getVal(row, "wilayah"));
        const luas = parseIndonesianNumber(getVal(row, "luas"));
        const jenis = cleanString(getVal(row, "jenis", "varietas"));
        const kelas = cleanString(getVal(row, "kelas"));
        const mulaiRawat = parseExcelDate(getVal(row, "mulai_rawat", "mulai rawat", "awal_rawat"));
        const mulaiTanam = parseExcelDate(getVal(row, "mulai_tanam", "mulai tanam", "tgl_tanam"));
        const forcingStandar = parseExcelDate(getVal(row, "forcing_standar", "forcing standar", "std_forcing"));
        const realForcing = parseExcelDate(getVal(row, "real_forcing", "real forcing", "tgl_forcing"));
        const selesaiPanen = parseExcelDate(getVal(row, "selesai_panen", "selesai panen", "tgl_panen"));
        const umurForcing = parseInteger(getVal(row, "umur_forcing", "umur forcing"));
        const umur = parseInteger(getVal(row, "umur"));
        const totalCost = parseIndonesianNumber(getVal(row, "total_cost", "total cost", "total_biaya"));

        mastersheetItems.push({
          lokasi: loc,
          data: {
            status,
            wilayah,
            luas,
            jenis,
            kelas,
            mulaiRawat,
            mulaiTanam,
            forcingStandar,
            realForcing,
            selesaiPanen,
            umurForcing,
            umur,
            totalCost,
          },
        });

        const costUmurRows = extractCostUmurRows(loc, row);
        allCostUmurRows.push(...costUmurRows);
      }

      // Jalankan transaksi Replace dengan timeout yang aman
      await prisma.$transaction(
        async (tx) => {
          if (isFirstChunk) {
            await tx.costUmur.deleteMany({});
          } else {
            const locsInChunk = mastersheetItems.map((m) => m.lokasi);
            if (locsInChunk.length > 0) {
              await tx.costUmur.deleteMany({
                where: { lokasi: { in: locsInChunk } },
              });
            }
          }

          // Upsert Mastersheet secara concurrent batch 50
          const BATCH_SIZE = 50;
          for (let b = 0; b < mastersheetItems.length; b += BATCH_SIZE) {
            const slice = mastersheetItems.slice(b, b + BATCH_SIZE);
            await Promise.all(
              slice.map((item) =>
                tx.mastersheet.upsert({
                  where: { lokasi: item.lokasi },
                  update: item.data,
                  create: { lokasi: item.lokasi, ...item.data },
                })
              )
            );
          }

          // Insert batch Cost Umur dalam chunk 1000
          if (allCostUmurRows.length > 0) {
            const CHUNK = 1000;
            for (let cIdx = 0; cIdx < allCostUmurRows.length; cIdx += CHUNK) {
              await tx.costUmur.createMany({
                data: allCostUmurRows.slice(cIdx, cIdx + CHUNK),
              });
            }
          }
        },
        { maxWait: 20000, timeout: 60000 }
      );

      return NextResponse.json({
        success: true,
        message: `Batch Data Lokasi berhasil disimpan (${rows.length} baris).`,
      });
    }

    // =========================================================================
    // 2. UPLOAD DATA TIMELINE (Target: data_timeline & data_material)
    // =========================================================================
    if (category === "timeline") {
      // 1. Validasi keberadaan Lokasi di mastersheet
      const distinctIncomingLocs = Array.from(
        new Set(rows.map((r: any) => cleanLokasi(getVal(r, "lokasi", "location"))).filter(Boolean))
      );

      const existingMasters = await prisma.mastersheet.findMany({
        where: { lokasi: { in: distinctIncomingLocs } },
        select: { lokasi: true },
      });
      const validMasterSet = new Set(existingMasters.map((m) => m.lokasi));

      const unmappedLocations = distinctIncomingLocs.filter((l) => !validMasterSet.has(l));
      if (unmappedLocations.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Tolak upload: Ditemukan ${unmappedLocations.length} lokasi pada Data Timeline yang belum terdaftar di Mastersheet Lokasi: ${unmappedLocations
              .slice(0, 5)
              .join(", ")}${unmappedLocations.length > 5 ? "..." : ""}. Harap daftarkan di Data Lokasi terlebih dahulu.`,
          },
          { status: 400 }
        );
      }

      // Siapkan array timeline inserts & mapping ke original row
      const timelineInserts: any[] = [];
      const rowMapping: Record<number, any> = {};

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const loc = cleanLokasi(getVal(row, "lokasi", "location"));
        if (!loc || !validMasterSet.has(loc)) continue;

        const awalRawat = parseExcelDate(getVal(row, "awal_rawat", "awal rawat", "mulai_rawat"));
        const aktivitas = cleanString(getVal(row, "aktivitas", "activity", "kegiatan"));
        const tanggalRealisasi = parseExcelDate(getVal(row, "tanggal_realisasi", "tanggal realisasi", "tgl_realisasi", "tanggal"));
        const umur = parseInteger(getVal(row, "umur")); // mendukung negatif
        const hasil = parseIndonesianNumber(getVal(row, "hasil", "hasil_efektif"));
        const uom = cleanString(getVal(row, "uom", "satuan"));
        const tk = parseIndonesianNumber(getVal(row, "tk", "tenaga_kerja"));
        const kapasitasPerTk = parseIndonesianNumber(getVal(row, "kapasitas_per_tk", "kapasitas per tk", "kapasitas"));
        const totalCost = parseIndonesianNumber(getVal(row, "total_cost", "total cost", "total_biaya"));
        const upah = parseIndonesianNumber(getVal(row, "upah"));
        const charge = parseIndonesianNumber(getVal(row, "charge"));
        const material = parseIndonesianNumber(getVal(row, "material"));

        rowMapping[timelineInserts.length] = row;
        timelineInserts.push({
          lokasi: loc,
          awalRawat,
          aktivitas,
          tanggalRealisasi,
          umur,
          hasil,
          uom,
          tk,
          kapasitasPerTk,
          totalCost,
          upah,
          charge,
          material,
        });
      }

      await prisma.$transaction(
        async (tx) => {
          // Pada chunk pertama, bersihkan data timeline & material lama (Replace Mode)
          if (isFirstChunk) {
            await tx.dataMaterial.deleteMany({});
            await tx.dataTimeline.deleteMany({});
          }

          if (timelineInserts.length > 0) {
            // Bulk insert timeline dan dapatkan seluruh generated ID dalam 1 SQL statement
            const createdTimelines = await tx.dataTimeline.createManyAndReturn({
              data: timelineInserts,
            });

            // Ekstraksi kolom material dinamis
            if (dynamicMaterialHeaders && dynamicMaterialHeaders.length > 0) {
              const allMaterials: Array<{
                timelineId: bigint;
                namaMaterial: string;
                quantity: number;
              }> = [];

              for (let i = 0; i < createdTimelines.length; i++) {
                const timeline = createdTimelines[i];
                const originalRow = rowMapping[i];
                if (!originalRow) continue;

                const matRows = extractDataMaterialRows(timeline.id, originalRow, dynamicMaterialHeaders);
                for (const m of matRows) {
                  allMaterials.push({
                    timelineId: timeline.id,
                    namaMaterial: m.namaMaterial,
                    quantity: m.quantity,
                  });
                }
              }

              if (allMaterials.length > 0) {
                const CHUNK = 1000;
                for (let mIdx = 0; mIdx < allMaterials.length; mIdx += CHUNK) {
                  await tx.dataMaterial.createMany({
                    data: allMaterials.slice(mIdx, mIdx + CHUNK),
                  });
                }
              }
            }
          }
        },
        { maxWait: 20000, timeout: 60000 }
      );

      return NextResponse.json({
        success: true,
        message: `Batch Data Timeline & Rincian Material berhasil disimpan (${rows.length} baris).`,
      });
    }

    // =========================================================================
    // 3. UPLOAD DATA AKTIVITAS (Target: data_aktivitas)
    // =========================================================================
    if (category === "aktivitas") {
      // Filter out repeated header rows
      const cleanRows = rows.filter((r: any) => !isHeaderRow(r));

      const distinctIncomingLocs = Array.from(
        new Set(cleanRows.map((r: any) => cleanLokasi(getVal(r, "lokasi", "location"))).filter(Boolean))
      );

      const existingMasters = await prisma.mastersheet.findMany({
        where: { lokasi: { in: distinctIncomingLocs } },
        select: { lokasi: true },
      });
      const validMasterSet = new Set(existingMasters.map((m) => m.lokasi));

      const unmappedLocations = distinctIncomingLocs.filter((l) => !validMasterSet.has(l));
      if (unmappedLocations.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Tolak upload: Ditemukan ${unmappedLocations.length} lokasi pada Data Aktivitas yang belum terdaftar di Mastersheet: ${unmappedLocations
              .slice(0, 5)
              .join(", ")}${unmappedLocations.length > 5 ? "..." : ""}. Harap daftarkan di Data Lokasi terlebih dahulu.`,
          },
          { status: 400 }
        );
      }

      const insertData: any[] = [];
      for (const row of cleanRows) {
        const loc = cleanLokasi(getVal(row, "lokasi", "location"));
        if (!loc || !validMasterSet.has(loc)) continue;

        const status = cleanString(getVal(row, "status"));
        const wilayah = cleanString(getVal(row, "wilayah"));
        const luas = parseIndonesianNumber(getVal(row, "luas"));
        const kelas = cleanString(getVal(row, "kelas"));
        const kode = cleanString(getVal(row, "kode"));
        const aktivitas = cleanString(getVal(row, "aktivitas", "activity", "kegiatan"));
        const biaya = parseIndonesianNumber(getVal(row, "biaya", "total_biaya"));
        const biayaPerHa = parseIndonesianNumber(getVal(row, "biaya_per_ha", "biaya per ha", "biaya_per_hektar", "biaya/ha"));
        const upah = parseIndonesianNumber(getVal(row, "upah"));
        const charge = parseIndonesianNumber(getVal(row, "charge"));
        const material = parseIndonesianNumber(getVal(row, "material"));
        const bibit = parseIndonesianNumber(getVal(row, "bibit"));
        const hasil = parseIndonesianNumber(getVal(row, "hasil"));
        const uom = cleanString(getVal(row, "uom", "satuan"));
        const activityGroup = cleanString(getVal(row, "activity_group", "activity group", "group"));

        insertData.push({
          lokasi: loc,
          status,
          wilayah,
          luas,
          kelas,
          kode,
          aktivitas,
          biaya,
          biayaPerHa,
          upah,
          charge,
          material,
          bibit,
          hasil,
          uom,
          activityGroup,
        });
      }

      await prisma.$transaction(
        async (tx) => {
          // Bersihkan data aktivitas lama pada chunk pertama (Replace Mode)
          if (isFirstChunk) {
            await tx.dataAktivitas.deleteMany({});
          }

          if (insertData.length > 0) {
            const CHUNK = 1000;
            for (let aIdx = 0; aIdx < insertData.length; aIdx += CHUNK) {
              await tx.dataAktivitas.createMany({
                data: insertData.slice(aIdx, aIdx + CHUNK),
              });
            }
          }
        },
        { maxWait: 20000, timeout: 60000 }
      );

      return NextResponse.json({
        success: true,
        message: `Batch Data Aktivitas berhasil disimpan (${cleanRows.length} baris).`,
      });
    }

    return NextResponse.json(
      { success: false, message: `Kategori '${category}' tidak dikenali.` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Error in upload route:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Terjadi kesalahan server saat memproses upload." },
      { status: 500 }
    );
  }
}
