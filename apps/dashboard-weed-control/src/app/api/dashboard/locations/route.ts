import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LocationItem } from "@/types/dashboard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const aktivitas = (searchParams.get("aktivitas") || "Total Aktivitas").trim();
    const status = (searchParams.get("status") || "NS").trim();
    const umurParam = searchParams.get("umur");
    const wilayahParam = searchParams.get("wilayah");
    const search = (searchParams.get("search") || "").trim();

    // 1. Status Filter
    let statusCondition = "m.status IN ('NSFC', 'NSSC')";
    if (status === "NSFC") {
      statusCondition = "m.status = 'NSFC'";
    } else if (status === "NSSC") {
      statusCondition = "m.status = 'NSSC'";
    } else if (status === "all") {
      statusCondition = "1=1";
    }

    // 2. Umur Filter
    let umurCondition = "1=1";
    if (umurParam && umurParam !== "all") {
      const umurs = umurParam
        .split(",")
        .map((u) => parseInt(u.trim(), 10))
        .filter((u) => !isNaN(u));
      if (umurs.length > 0) {
        umurCondition = `m.umur IN (${umurs.join(",")})`;
      }
    }

    // 3. Wilayah Filter
    let wilayahCondition = "1=1";
    if (wilayahParam && wilayahParam !== "all") {
      const wilayahs = wilayahParam
        .split(",")
        .map((w) => `'${w.trim().replace(/'/g, "''")}'`)
        .filter(Boolean);
      if (wilayahs.length > 0) {
        wilayahCondition = `m.wilayah IN (${wilayahs.join(",")})`;
      }
    }

    // 4. Search Filter
    let searchCondition = "1=1";
    if (search) {
      const escSearch = search.replace(/'/g, "''");
      searchCondition = `(m.lokasi ILIKE '%${escSearch}%' OR m.wilayah ILIKE '%${escSearch}%')`;
    }

    let items: LocationItem[] = [];

    if (aktivitas === "Total Aktivitas") {
      const rows = await prisma.$queryRawUnsafe<
        Array<{
          lokasi: string;
          wilayah: string | null;
          umur: number | null;
          luas: number | null;
          status: string | null;
          jenis: string | null;
          kelas: string | null;
          total_cost: number | null;
          cost_per_ha: number | null;
        }>
      >(`
        SELECT 
          m.lokasi,
          m.wilayah,
          m.umur,
          m.luas::float,
          m.status,
          m.jenis,
          m.kelas,
          m.total_cost::float,
          CASE 
            WHEN COALESCE(m.luas, 0) > 0 THEN (m.total_cost / m.luas)::float 
            ELSE 0 
          END AS cost_per_ha
        FROM mastersheet m
        WHERE ${statusCondition}
          AND ${umurCondition}
          AND ${wilayahCondition}
          AND ${searchCondition}
        ORDER BY m.wilayah ASC, cost_per_ha DESC, m.lokasi ASC;
      `);

      items = rows.map((r) => ({
        lokasi: r.lokasi,
        wilayah: r.wilayah || "-",
        umur: r.umur ?? 0,
        luas: r.luas ?? 0,
        status: r.status || "-",
        jenis: r.jenis || "-",
        kelas: r.kelas || "-",
        totalCost: r.total_cost ?? 0,
        costHa: r.cost_per_ha ?? 0,
      }));
    } else {
      // Aktivitas tertentu: jumlahkan biaya transaksi untuk aktivitas tersebut per lokasi, bagi luas lokasi 1 kali
      const escapedAktivitas = aktivitas.replace(/'/g, "''");
      const rows = await prisma.$queryRawUnsafe<
        Array<{
          lokasi: string;
          wilayah: string | null;
          umur: number | null;
          luas: number | null;
          status: string | null;
          jenis: string | null;
          kelas: string | null;
          total_biaya: number | null;
          cost_per_ha: number | null;
        }>
      >(`
        SELECT 
          m.lokasi,
          m.wilayah,
          m.umur,
          m.luas::float,
          m.status,
          m.jenis,
          m.kelas,
          SUM(da.biaya)::float AS total_biaya,
          CASE 
            WHEN COALESCE(m.luas, 0) > 0 THEN (SUM(da.biaya) / m.luas)::float 
            ELSE 0 
          END AS cost_per_ha
        FROM data_aktivitas da
        JOIN mastersheet m ON da.lokasi = m.lokasi
        WHERE da.aktivitas = '${escapedAktivitas}'
          AND ${statusCondition}
          AND ${umurCondition}
          AND ${wilayahCondition}
          AND ${searchCondition}
        GROUP BY m.lokasi, m.wilayah, m.umur, m.luas, m.status, m.jenis, m.kelas
        ORDER BY m.wilayah ASC, cost_per_ha DESC, m.lokasi ASC;
      `);

      items = rows.map((r) => ({
        lokasi: r.lokasi,
        wilayah: r.wilayah || "-",
        umur: r.umur ?? 0,
        luas: r.luas ?? 0,
        status: r.status || "-",
        jenis: r.jenis || "-",
        kelas: r.kelas || "-",
        totalCost: r.total_biaya ?? 0,
        costHa: r.cost_per_ha ?? 0,
      }));
    }

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
    });
  } catch (error: any) {
    console.error("Error in /api/dashboard/locations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal mengambil data lokasi",
      },
      { status: 500 }
    );
  }
}

