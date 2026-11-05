import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const MONTH_NAMES_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pgFilter = searchParams.get("pg") || "PG1"; // Default PG1 untuk tabel summary

    // Dapatkan daftar tahun unik yang tersedia
    const distinctYears = await prisma.summarySulam.findMany({
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    });

    const availableYears = distinctYears.map((y) => y.year);
    const defaultYear = availableYears.length > 0 ? availableYears[0] : new Date().getFullYear();
    const selectedYear = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : defaultYear;

    // Ambil data summary_sulam untuk tahun terpilih
    const rawSummaries = await prisma.summarySulam.findMany({
      where: { year: selectedYear },
      orderBy: [{ month: "asc" }, { pg: "asc" }],
    });

    // 1. Olah data untuk Grafik Perbandingan Antar-PG (12 Bulan, PG1, PG2, PG3)
    // Agregasikan dulu nilai dasar per PG dan per Bulan
    type BaseAgg = {
      material: number;
      upah: number;
      batang: number;
      jumlahTk: number;
      luas: number;
      hasData: boolean;
    };

    const pgMonthMap: Record<string, Record<number, BaseAgg>> = {
      PG1: {},
      PG2: {},
      PG3: {},
    };

    for (let m = 1; m <= 12; m++) {
      pgMonthMap.PG1[m] = { material: 0, upah: 0, batang: 0, jumlahTk: 0, luas: 0, hasData: false };
      pgMonthMap.PG2[m] = { material: 0, upah: 0, batang: 0, jumlahTk: 0, luas: 0, hasData: false };
      pgMonthMap.PG3[m] = { material: 0, upah: 0, batang: 0, jumlahTk: 0, luas: 0, hasData: false };
    }

    for (const row of rawSummaries) {
      const pg = row.pg as "PG1" | "PG2" | "PG3";
      const m = row.month;
      if (pgMonthMap[pg] && pgMonthMap[pg][m]) {
        pgMonthMap[pg][m].material += Number(row.material);
        pgMonthMap[pg][m].upah += Number(row.upah);
        pgMonthMap[pg][m].batang += Number(row.batang);
        pgMonthMap[pg][m].jumlahTk += Number(row.jumlahTk);
        pgMonthMap[pg][m].luas += Number(row.luas);
        pgMonthMap[pg][m].hasData = true;
      }
    }

    // Fungsi bantu hitung rasio indikator
    const calculateIndicators = (agg: BaseAgg) => {
      if (!agg.hasData) {
        return {
          upahHa: null,
          batangHa: null,
          upahBatang: null,
          batangTk: null,
          tkBulan: null,
          costTkBulan: null,
          hasData: false,
        };
      }
      return {
        upahHa: agg.luas > 0 ? agg.upah / agg.luas : null,
        batangHa: agg.luas > 0 ? agg.batang / agg.luas : null,
        upahBatang: agg.batang > 0 ? agg.upah / agg.batang : null,
        batangTk: agg.jumlahTk > 0 ? agg.batang / agg.jumlahTk : null,
        tkBulan: agg.jumlahTk,
        costTkBulan: agg.upah,
        hasData: true,
      };
    };

    const chartData = [];
    for (let m = 1; m <= 12; m++) {
      chartData.push({
        month: m,
        monthName: MONTH_NAMES_SHORT[m - 1],
        monthFull: MONTH_NAMES_FULL[m - 1],
        PG1: calculateIndicators(pgMonthMap.PG1[m]),
        PG2: calculateIndicators(pgMonthMap.PG2[m]),
        PG3: calculateIndicators(pgMonthMap.PG3[m]),
      });
    }

    // 2. Olah data untuk Tabel Summary Bulanan per PG
    const targetPg = pgFilter in pgMonthMap ? (pgFilter as "PG1" | "PG2" | "PG3") : "PG1";
    const summaryTable = [];
    let totMaterial = 0;
    let totUpah = 0;
    let totBatang = 0;
    let totJumlahTk = 0;
    let totLuas = 0;
    let hasAnyData = false;

    for (let m = 1; m <= 12; m++) {
      const agg = pgMonthMap[targetPg][m];
      if (agg.hasData) {
        hasAnyData = true;
        totMaterial += agg.material;
        totUpah += agg.upah;
        totBatang += agg.batang;
        totJumlahTk += agg.jumlahTk;
        totLuas += agg.luas;
      }

      summaryTable.push({
        month: m,
        monthName: MONTH_NAMES_FULL[m - 1],
        material: agg.hasData ? agg.material : 0,
        upah: agg.hasData ? agg.upah : 0,
        batang: agg.hasData ? agg.batang : 0,
        jumlahTk: agg.hasData ? agg.jumlahTk : 0,
        luas: agg.hasData ? agg.luas : 0,
        upahHa: agg.hasData && agg.luas > 0 ? agg.upah / agg.luas : null,
        batangHa: agg.hasData && agg.luas > 0 ? agg.batang / agg.luas : null,
        upahBatang: agg.hasData && agg.batang > 0 ? agg.upah / agg.batang : null,
        batangTk: agg.hasData && agg.jumlahTk > 0 ? agg.batang / agg.jumlahTk : null,
        tkBulan: agg.hasData ? agg.jumlahTk : 0,
        costTkBulan: agg.hasData ? agg.upah : 0,
        hasData: agg.hasData,
      });
    }

    const tableTotal = {
      material: totMaterial,
      upah: totUpah,
      batang: totBatang,
      jumlahTk: totJumlahTk,
      luas: totLuas,
      upahHa: totLuas > 0 ? totUpah / totLuas : null,
      batangHa: totLuas > 0 ? totBatang / totLuas : null,
      upahBatang: totBatang > 0 ? totUpah / totBatang : null,
      batangTk: totJumlahTk > 0 ? totBatang / totJumlahTk : null,
      tkBulan: totJumlahTk,
      costTkBulan: totUpah,
      hasData: hasAnyData,
    };

    return NextResponse.json({
      success: true,
      selectedYear,
      availableYears: availableYears.length > 0 ? availableYears : [selectedYear],
      selectedPg: targetPg,
      chartData,
      summaryTable,
      tableTotal,
    });
  } catch (error: any) {
    console.error("Gagal mengambil data agregasi Antar PG:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat mengagregasi data Antar PG.", error: error.message },
      { status: 500 }
    );
  }
}

