import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lokasi = (searchParams.get("lokasi") || "").trim();

    if (!lokasi) {
      return NextResponse.json(
        { success: false, error: "Parameter lokasi wajib diisi" },
        { status: 400 }
      );
    }

    const row = await prisma.mastersheet.findUnique({
      where: { lokasi },
    });

    if (!row) {
      return NextResponse.json(
        { success: false, error: `Lokasi ${lokasi} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        lokasi: row.lokasi,
        status: row.status || "-",
        wilayah: row.wilayah || "-",
        luas: row.luas !== null ? Number(row.luas) : 0,
        jenis: row.jenis || "-",
        kelas: row.kelas || "-",
        umur: row.umur ?? 0,
        totalCost: row.totalCost !== null ? Number(row.totalCost) : 0,
        mulaiRawat: row.mulaiRawat ? row.mulaiRawat.toISOString() : null,
        mulaiTanam: row.mulaiTanam ? row.mulaiTanam.toISOString() : null,
        forcingStandar: row.forcingStandar ? row.forcingStandar.toISOString() : null,
        realForcing: row.realForcing ? row.realForcing.toISOString() : null,
        selesaiPanen: row.selesaiPanen ? row.selesaiPanen.toISOString() : null,
        umurForcing: row.umurForcing ?? null,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/dashboard/location-detail:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal mengambil detail lokasi",
      },
      { status: 500 }
    );
  }
}

