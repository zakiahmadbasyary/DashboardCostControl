import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processSulamRows, ParsedSulamRow, SummarySulamData } from "@/lib/sulamParser";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  try {
    let rawRows: Record<string, any>[] = [];

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, message: "Berkas file Excel tidak ditemukan dalam request." },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        return NextResponse.json(
          { success: false, message: "File Excel kosong atau tidak memiliki lembar kerja (sheet)." },
          { status: 400 }
        );
      }

      const sheet = workbook.Sheets[firstSheetName];
      rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
    } else {
      const body = await req.json();
      if (!body.data || !Array.isArray(body.data)) {
        return NextResponse.json(
          { success: false, message: "Format payload salah. Wajib menyertakan array 'data'." },
          { status: 400 }
        );
      }
      rawRows = body.data;
    }

    if (rawRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada baris data untuk diproses." },
        { status: 400 }
      );
    }

    // Proses dan validasi baris transaksi
    const { validRows, summaryRows, errors } = processSulamRows(rawRows);

    if (validRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada data valid yang dapat disimpan.",
          errors: errors.slice(0, 10),
        },
        { status: 400 }
      );
    }

    // Jalankan dalam Database Transaction dengan mode REPLACE ALL
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Bersihkan seluruh data transaksi sulam
        await tx.sulam.deleteMany();

        // 2. Bersihkan seluruh summary sulam
        await tx.summarySulam.deleteMany();

        // 3. Masukkan data summary_sulam terlebih dahulu agar Foreign Key terpenuhi
        for (const s of summaryRows) {
          await tx.summarySulam.create({
            data: {
              kode: s.kode,
              pg: s.pg,
              wilayah: s.wilayah,
              year: s.year,
              month: s.month,
              material: s.material,
              upah: s.upah,
              batang: s.batang,
              jumlahTk: s.jumlahTk,
              luas: s.luas,
            },
          });
        }

        // 4. Masukkan data transaksi sulam dalam batch
        const BATCH_SIZE = 500;
        let insertedCount = 0;

        for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
          const chunk = validRows.slice(i, i + BATCH_SIZE);
          await tx.sulam.createMany({
            data: chunk.map((r) => ({
              tanggalRealisasi: r.tanggalRealisasi,
              spkId: r.spkId,
              plantationGroup: r.plantationGroup,
              wilayah: r.wilayah,
              lokasi: r.lokasi,
              statusTanaman: r.statusTanaman,
              tanggalSpk: r.tanggalSpk,
              kodeAktivitas: r.kodeAktivitas,
              deskripsi: r.deskripsi,
              jenisData: r.jenisData,
              groupBahanAlat: r.groupBahanAlat,
              kodeBahanAlatLainlain: r.kodeBahanAlatLainlain,
              deskripsiBahanAlatLainlain: r.deskripsiBahanAlatLainlain,
              resourceBahanAlat: r.resourceBahanAlat,
              hasilEfektif: r.hasilEfektif,
              satuanHasil: r.satuanHasil,
              totalRealisasiBiaya: r.totalRealisasiBiaya,
              referensiLokasi: r.referensiLokasi,
              costCenterName: r.costCenterName,
              costWorkingHour: r.costWorkingHour,
              indeksBiaya: r.indeksBiaya,
              indexResourceQty: r.indexResourceQty,
              pasDocument: r.pasDocument,
              orderNo: r.orderNo,
              actCostGroup: r.actCostGroup,
              jenis: r.jenis,
              pg: r.pg,
              year: r.year,
              month: r.month,
              kode: r.kode,
            })),
          });
          insertedCount += chunk.length;
        }

        return {
          totalSummary: summaryRows.length,
          totalSulam: insertedCount,
        };
      },
      {
        timeout: 90000, // 90 detik untuk menangani volume data besar
      }
    );

    return NextResponse.json({
      success: true,
      message: `Berhasil me-replace database: ${result.totalSulam} transaksi sulam dan ${result.totalSummary} summary kode disimpan.`,
      data: {
        totalRows: rawRows.length,
        validRows: validRows.length,
        summaryCount: result.totalSummary,
        errorCount: errors.length,
        sampleErrors: errors.slice(0, 10),
      },
    });
  } catch (error: any) {
    console.error("Gagal melakukan upload data Sulam:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal server saat menyimpan data Sulam.",
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
