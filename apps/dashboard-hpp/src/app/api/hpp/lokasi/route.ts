import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group")?.trim();
    const status = searchParams.get("status")?.trim();
    const rawSearch = searchParams.get("search")?.trim();

    // Security & input sanitization: truncate long search inputs
    const search = rawSearch ? rawSearch.slice(0, 100).replace(/[^\w\s-]/gi, "") : "";

    const where: any = {};
    if (group && group !== "all") where.group = group.slice(0, 20);
    if (status && status !== "all") where.status = status.slice(0, 20);
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
      { status: "error", message: "Gagal mengambil data lokasi HPP" },
      { status: 500 }
    );
  }
}

