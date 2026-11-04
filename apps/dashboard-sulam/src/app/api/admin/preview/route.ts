import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pg = searchParams.get("pg");
    const wilayah = searchParams.get("wilayah");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const search = searchParams.get("search")?.trim();
    const jenisData = searchParams.get("jenisData");
    const limitParam = searchParams.get("limit");
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    // 1. Where clause untuk tabel summary_sulam
    const whereSummary: any = {};
    if (pg && pg !== "all") whereSummary.pg = pg;
    if (wilayah && wilayah !== "all") whereSummary.wilayah = wilayah;
    if (year && year !== "all") whereSummary.year = parseInt(year, 10);
    if (month && month !== "all") whereSummary.month = parseInt(month, 10);

    // 2. Where clause untuk tabel sulam (transaksi)
    const whereTx: any = {};
    if (pg && pg !== "all") whereTx.pg = pg;
    if (wilayah && wilayah !== "all") whereTx.wilayah = wilayah;
    if (year && year !== "all") whereTx.year = parseInt(year, 10);
    if (month && month !== "all") whereTx.month = parseInt(month, 10);
    if (jenisData && jenisData !== "all") whereTx.jenisData = jenisData;

    if (search) {
      whereTx.OR = [
        { spkId: { contains: search, mode: "insensitive" } },
        { lokasi: { contains: search, mode: "insensitive" } },
        { wilayah: { contains: search, mode: "insensitive" } },
        { deskripsi: { contains: search, mode: "insensitive" } },
        { kodeAktivitas: { contains: search, mode: "insensitive" } },
        { deskripsiBahanAlatLainlain: { contains: search, mode: "insensitive" } },
        { groupBahanAlat: { contains: search, mode: "insensitive" } },
      ];
    }

    // Pagination untuk transaksi
    const isAll = limitParam === "all" || limitParam === "-1";
    const limit = isAll ? undefined : Math.max(1, parseInt(limitParam || "50", 10));
    const skip = isAll ? undefined : (Math.max(1, pageParam) - 1) * (limit || 50);

    const [summaryList, totalSummaryCount, transactions, totalTransactionsCount] =
      await Promise.all([
        prisma.summarySulam.findMany({
          where: whereSummary,
          orderBy: [{ year: "desc" }, { month: "desc" }, { pg: "asc" }, { wilayah: "asc" }],
          select: {
            pg: true,
            wilayah: true,
            year: true,
            month: true,
            material: true,
            upah: true,
            batang: true,
            jumlahTk: true,
            luas: true,
          },
        }),
        prisma.summarySulam.count({ where: whereSummary }),
        prisma.sulam.findMany({
          where: whereTx,
          orderBy: [
            { tanggalRealisasi: "desc" },
            { wilayah: "asc" },
            { spkId: "asc" },
          ],
          take: limit,
          skip: skip,
          select: {
            // TIDAK MENAMPILKAN idSulam & kode sesuai instruksi user
            tanggalRealisasi: true,
            spkId: true,
            pg: true,
            wilayah: true,
            lokasi: true,
            statusTanaman: true,
            tanggalSpk: true,
            kodeAktivitas: true,
            deskripsi: true,
            jenisData: true,
            groupBahanAlat: true,
            kodeBahanAlatLainlain: true,
            deskripsiBahanAlatLainlain: true,
            resourceBahanAlat: true,
            hasilEfektif: true,
            satuanHasil: true,
            totalRealisasiBiaya: true,
            costCenterName: true,
            orderNo: true,
            pasDocument: true,
          },
        }),
        prisma.sulam.count({ where: whereTx }),
      ]);

    // Agregasi tabel rekapitulasi Per PG
    const byPgMap: Record<
      string,
      {
        pg: string;
        material: number;
        upah: number;
        totalBiaya: number;
        batang: number;
        jumlahTk: number;
        luas: number;
        countWilayah: Set<string>;
      }
    > = {};

    summaryList.forEach((s) => {
      if (!byPgMap[s.pg]) {
        byPgMap[s.pg] = {
          pg: s.pg,
          material: 0,
          upah: 0,
          totalBiaya: 0,
          batang: 0,
          jumlahTk: 0,
          luas: 0,
          countWilayah: new Set<string>(),
        };
      }
      const mat = Number(s.material) || 0;
      const uph = Number(s.upah) || 0;
      byPgMap[s.pg].material += mat;
      byPgMap[s.pg].upah += uph;
      byPgMap[s.pg].totalBiaya += mat + uph;
      byPgMap[s.pg].batang += Number(s.batang) || 0;
      byPgMap[s.pg].jumlahTk += Number(s.jumlahTk) || 0;
      byPgMap[s.pg].luas += Number(s.luas) || 0;
      byPgMap[s.pg].countWilayah.add(s.wilayah);
    });

    const summaryByPg = Object.values(byPgMap)
      .map((row) => ({
        pg: row.pg,
        wilayahCount: row.countWilayah.size,
        material: row.material,
        upah: row.upah,
        totalBiaya: row.totalBiaya,
        batang: row.batang,
        jumlahTk: row.jumlahTk,
        luas: row.luas,
        biayaPerHa: row.luas > 0 ? row.totalBiaya / row.luas : 0,
      }))
      .sort((a, b) => a.pg.localeCompare(b.pg));

    // Total Agregat Keseluruhan
    const totals = summaryList.reduce(
      (acc, curr) => {
        const mat = Number(curr.material) || 0;
        const uph = Number(curr.upah) || 0;
        acc.totalMaterial += mat;
        acc.totalUpah += uph;
        acc.totalBiaya += mat + uph;
        acc.totalBatang += Number(curr.batang) || 0;
        acc.totalJumlahTk += Number(curr.jumlahTk) || 0;
        acc.totalLuas += Number(curr.luas) || 0;
        return acc;
      },
      {
        totalMaterial: 0,
        totalUpah: 0,
        totalBiaya: 0,
        totalBatang: 0,
        totalJumlahTk: 0,
        totalLuas: 0,
      }
    );

    return NextResponse.json({
      success: true,
      summaryList,
      summaryByPg,
      totalSummaryCount,
      transactions,
      totalTransactionsCount,
      pagination: {
        page: pageParam,
        limit: isAll ? totalTransactionsCount : limit || 50,
        totalPages: isAll ? 1 : Math.ceil(totalTransactionsCount / (limit || 50)),
      },
      totals: {
        ...totals,
        biayaPerHa: totals.totalLuas > 0 ? totals.totalBiaya / totals.totalLuas : 0,
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
