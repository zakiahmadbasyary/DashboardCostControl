import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group")?.trim();
    const status = searchParams.get("status")?.trim();
    const periode = searchParams.get("periode")?.trim();
    const wilayah = searchParams.get("wilayah")?.trim();
    const rawSearch = searchParams.get("search")?.trim();

    // Security & input sanitization: truncate long search inputs
    const search = rawSearch ? rawSearch.slice(0, 100).replace(/[^\w\s-]/gi, "") : "";

    const where: any = {};
    if (group && group !== "all") where.group = group.slice(0, 20);
    if (status && status !== "all") where.status = status.slice(0, 20);
    if (periode && periode !== "all" && !isNaN(Number(periode))) {
      where.periode = Number(periode);
    }
    if (wilayah && wilayah !== "all") {
      where.masterSheet = {
        wilayah: { equals: wilayah.slice(0, 10), mode: "insensitive" },
      };
    }
    if (search) {
      where.OR = [
        { lokasi: { contains: search, mode: "insensitive" } },
        { descGroup: { contains: search, mode: "insensitive" } },
        { jenisBiaya: { contains: search, mode: "insensitive" } },
      ];
    }

    const lokasiList = await prisma.lokasiHPP.findMany({
      where,
      select: {
        idLokasiHpp: true,
        lokasi: true,
        idBudget: true,
        periode: true,
        status: true,
        qtyPanen: true,
        luasPanen: true,
        luasAktif: true,
        group: true,
        descGroup: true,
        jenisBiaya: true,
        biaya: true,
        masterSheet: {
          select: {
            wilayah: true,
            kodeBibit: true,
            jenisBibit: true,
            kelasBibit: true,
          },
        },
        budgetItem: {
          select: {
            budget: true,
          },
        },
      },
      orderBy: { idLokasiHpp: "asc" },
    });

    const response = NextResponse.json({
      status: "success",
      count: lokasiList.length,
      data: lokasiList,
    });

    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=60"
    );

    return response;
  } catch (error: any) {
    console.error("Error fetching Lokasi HPP list:", error);
    return NextResponse.json(
      { status: "error", message: "Gagal mengambil data lokasi HPP" },
      { status: 500 }
    );
  }
}


