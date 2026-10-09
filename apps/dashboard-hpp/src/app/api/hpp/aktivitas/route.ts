import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLokasi = searchParams.get("lokasi")?.trim();
    const rawGroup = searchParams.get("group")?.trim();

    // Security sanitization: truncate parameter values
    const lokasi = rawLokasi ? rawLokasi.slice(0, 50) : "";
    const group = rawGroup ? rawGroup.slice(0, 20) : "";

    const where: any = {};
    if (lokasi && lokasi !== "all") where.lokasi = lokasi;
    if (group && group !== "all") where.group = group;

    const aktivitasList = await prisma.aktivitasHPP.findMany({
      where,
      select: {
        idAktivitas: true,
        lokasi: true,
        tanggalMulaiRawat: true,
        tanggalMulaiTanam: true,
        tanggalForcingStandard: true,
        rencanaForcing: true,
        realForcing: true,
        rencanaPanen: true,
        aktivitas: true,
        biaya: true,
        hasil: true,
        uom: true,
        group: true,
      },
      orderBy: { createdAt: "desc" },
      take: (!lokasi || lokasi === "all") ? 500 : undefined,
    });

    const response = NextResponse.json({
      status: "success",
      count: aktivitasList.length,
      data: aktivitasList,
    });

    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=60"
    );

    return response;
  } catch (error: any) {
    console.error("Error fetching Aktivitas HPP list:", error);
    return NextResponse.json(
      { status: "error", message: "Gagal mengambil data aktivitas HPP" },
      { status: 500 }
    );
  }
}


