import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OPEX_VISIBILITY_FILTER } from "@/lib/filters";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export async function GET() {
  try {
    // 1. Ambil periode unik dari summary (hanya data dengan isview: true)
    const periodsRaw = await prisma.summary.findMany({
      where: OPEX_VISIBILITY_FILTER,
      select: { periode: true },
      distinct: ["periode"],
      orderBy: { periode: "asc" },
    });

    const periods = periodsRaw.map((p) => ({
      periode: p.periode,
      label: MONTH_NAMES[p.periode - 1] || `Bulan ${p.periode}`,
    }));

    // Fallback jika database masih kosong
    const finalPeriods =
      periods.length > 0
        ? periods
        : Array.from({ length: 12 }, (_, i) => ({
            periode: i + 1,
            label: MONTH_NAMES[i],
          }));

    // 2. Ambil master CE2 untuk filter Trend Antar PG
    const ce2List = await prisma.mastersheetCe2.findMany({
      where: { isview: true },
      select: {
        ce2: true,
        deskripsiCe2: true,
      },
      orderBy: { ce2: "asc" },
    });

    return NextResponse.json({
      periods: finalPeriods,
      ce2List: ce2List.map((c) => ({
        ce2: c.ce2,
        deskripsiCe2: c.deskripsiCe2 || c.ce2,
      })),
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { error: "Gagal memuat filter dashboard OPEX" },
      { status: 500 }
    );
  }
}
