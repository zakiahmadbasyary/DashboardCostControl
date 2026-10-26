import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
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

    let grandTotalActual = 0;
    let grandTotalBudget = 0;

    // Agregasikan per bulan
    for (const row of rawData) {
      const p = row.periode;
      if (monthlyMap[p]) {
        const act = row.nilaiActual ? Number(row.nilaiActual) : 0;
        const bgt = row.nilaiBudget ? Number(row.nilaiBudget) : 0;

        monthlyMap[p].actual += act;
        monthlyMap[p].budget += bgt;

        grandTotalActual += act;
        grandTotalBudget += bgt;
      }
    }

    const months = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const data = monthlyMap[monthNum];
      const variance =
        data.budget > 0
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

    const totalVariance =
      grandTotalBudget > 0
        ? Number((((grandTotalActual - grandTotalBudget) / grandTotalBudget) * 100).toFixed(2))
        : null;

    return NextResponse.json({
      months,
      totalActual: Math.round(grandTotalActual),
      totalBudget: Math.round(grandTotalBudget),
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
