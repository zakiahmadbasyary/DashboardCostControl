import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (group && group !== "all") where.group = group;
    if (status && status !== "all") where.status = status;
    if (search) {
      where.OR = [
        { lokasi: { contains: search, mode: "insensitive" } },
        { descGroup: { contains: search, mode: "insensitive" } },
        { jenisBiaya: { contains: search, mode: "insensitive" } },
      ];
    }

    const lokasiList = await prisma.lokasiHPP.findMany({
      where,
      include: {
        masterSheet: true,
        budgetItem: true,
      },
      orderBy: { idLokasiHpp: "asc" },
    });

    return NextResponse.json({
      status: "success",
      data: lokasiList,
    });
  } catch (error: any) {
    console.error("Error fetching Lokasi HPP list:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengambil data lokasi HPP" },
      { status: 500 }
    );
  }
}
