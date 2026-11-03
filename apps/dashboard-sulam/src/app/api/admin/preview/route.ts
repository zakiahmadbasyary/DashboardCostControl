import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pg = searchParams.get("pg");
    const wilayah = searchParams.get("wilayah");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const whereSummary: any = {};
    if (pg && pg !== "all") whereSummary.pg = pg;
    if (wilayah && wilayah !== "all") whereSummary.wilayah = wilayah;
    if (year && year !== "all") whereSummary.year = parseInt(year, 10);
    if (month && month !== "all") whereSummary.month = parseInt(month, 10);

    const [summaryList, totalSulamCount, totalSummaryCount] = await Promise.all([
      prisma.summarySulam.findMany({
        where: whereSummary,
        orderBy: [{ year: "desc" }, { month: "desc" }, { wilayah: "asc" }],
      }),
      prisma.sulam.count(),
      prisma.summarySulam.count(),
    ]);

    // Ambil sampel transaksi sulam untuk preview tabel detail
    const transactions = await prisma.sulam.findMany({
      take: Math.min(limit, 100),
      skip: offset,
      orderBy: { idSulam: "asc" },
      select: {
        idSulam: true,
        tanggalRealisasi: true,
        spkId: true,
        wilayah: true,
        lokasi: true,
        kodeAktivitas: true,
        jenisData: true,
        jenis: true,
        resourceBahanAlat: true,
        hasilEfektif: true,
        totalRealisasiBiaya: true,
        pg: true,
        kode: true,
      },
    });

    // Hitung total agregat keseluruhan
    const totals = summaryList.reduce(
      (acc, curr) => {
        acc.totalMaterial += Number(curr.material);
        acc.totalUpah += Number(curr.upah);
        acc.totalBatang += Number(curr.batang);
        acc.totalJumlahTk += Number(curr.jumlahTk);
        acc.totalLuas += Number(curr.luas);
        return acc;
      },
      {
        totalMaterial: 0,
        totalUpah: 0,
        totalBatang: 0,
        totalJumlahTk: 0,
        totalLuas: 0,
      }
    );

    return NextResponse.json({
      success: true,
      summaryList,
      transactions,
      stats: {
        totalSulamCount,
        totalSummaryCount,
        ...totals,
      },
    });
  } catch (error: any) {
    console.error("Gagal mengambil data preview Sulam:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data preview Sulam dari database.",
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
