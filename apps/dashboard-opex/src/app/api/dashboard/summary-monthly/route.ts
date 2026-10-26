import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export async function GET() {
  try {
    // Ambil data summary khusus PG1 untuk 12 bulan
    const rawData = await prisma.summary.findMany({
      where: { pg: "PG1" },
      select: {
        periode: true,
        nilaiActual: true,
        nilaiBudget: true,
      },
      orderBy: { periode: "asc" },
    });

    // Inisialisasi 12 bulan
    const monthlyMap: Record<number, { actual: number; budget: number }> = {};
    for (let m = 1; m <= 12; m++) {
      monthlyMap[m] = { actual: 0, budget: 0 };
    }

    // Agregasikan per bulan
    for (const row of rawData) {
      const p = row.periode;
      if (monthlyMap[p]) {
        const act = row.nilaiActual ? Number(row.nilaiActual) : 0;
        const bgt = row.nilaiBudget ? Number(row.nilaiBudget) : 0;

        monthlyMap[p].actual += act;
        monthlyMap[p].budget += bgt;
      }
    }

    const months = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const data = monthlyMap[monthNum];
      const variance =
        data.actual > 0 && data.budget > 0
          ? Number((((data.actual - data.budget) / data.budget) * 100).toFixed(2))
          : null;

      return {
        month: monthNum,
        monthName: MONTH_NAMES[i],
        actual: Math.round(data.actual),
        budget: Math.round(data.budget),
        variance,
      };
    });

    // Hitung Total YTD (Year To Date): Akumulasi bulan yang sudah memiliki transaksi Actual
    let ytdActual = 0;
    let ytdBudget = 0;

    for (let m = 1; m <= 12; m++) {
      const data = monthlyMap[m];
      if (data.actual > 0) {
        ytdActual += data.actual;
        ytdBudget += data.budget;
      }
    }

    // Fallback jika belum ada actual sama sekali
    if (ytdActual === 0) {
      ytdBudget = Object.values(monthlyMap).reduce((acc, curr) => acc + curr.budget, 0);
    }

    const totalVariance =
      ytdBudget > 0
        ? Number((((ytdActual - ytdBudget) / ytdBudget) * 100).toFixed(2))
        : null;

    return NextResponse.json({
      months,
      totalActual: Math.round(ytdActual),
      totalBudget: Math.round(ytdBudget),
      totalVariance,
    });
  } catch (error) {
    console.error("Error fetching summary monthly:", error);
    return NextResponse.json(
      { error: "Gagal memuat grafik ringkasan bulanan OPEX" },
      { status: 500 }
    );
  }
}
