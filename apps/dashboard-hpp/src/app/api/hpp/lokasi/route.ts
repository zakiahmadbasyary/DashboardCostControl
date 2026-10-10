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

    const andConditions: any[] = [];
    if (group && group !== "all") andConditions.push({ group: group.slice(0, 20) });
    if (status && status !== "all") andConditions.push({ status: status.slice(0, 20) });
    if (periode && periode !== "all" && !isNaN(Number(periode))) {
      andConditions.push({ periode: Number(periode) });
    }
    if (wilayah && wilayah !== "all") {
      const wTarget = wilayah.slice(0, 10);
      andConditions.push({
        OR: [
          { wilayah: { equals: wTarget, mode: "insensitive" } },
          {
            wilayah: null,
            masterSheet: {
              wilayah: { equals: wTarget, mode: "insensitive" },
            },
          },
        ],
      });
    }
    if (search) {
      andConditions.push({
        OR: [
          { lokasi: { contains: search, mode: "insensitive" } },
          { descGroup: { contains: search, mode: "insensitive" } },
          { jenisBiaya: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const lokasiList = await prisma.lokasiHPP.findMany({
      where,
      select: {
        idLokasiHpp: true,
        idMaster: true,
        lokasi: true,
        wilayah: true,
        idBudget: true,
        periode: true,
        tahun: true,
        tanggalRawat: true,
        status: true,
        jenisBibit: true,
        kelasBibit: true,
        qtyPanen: true,
        luasPanen: true,
        luasAktif: true,
        group: true,
        descGroup: true,
        jenisBiaya: true,
        biaya: true,
        masterSheet: {
          select: {
            idMaster: true,
            lokasi: true,
            wilayah: true,
            jenisBibit: true,
            kelasBibit: true,
            status: true,
            tanggalRawat: true,
            tanggalTanam: true,
            tanggalForcingStandard: true,
            tanggalRenForcing: true,
            tanggalSelesaiPanen: true,
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


