import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lokasi = searchParams.get("lokasi");
    const group = searchParams.get("group");

    const where: any = {};
    if (lokasi && lokasi !== "all") where.lokasi = lokasi;
    if (group && group !== "all") where.group = group;

    const aktivitasList = await prisma.aktivitasHPP.findMany({
      where,
      include: {
        masterSheet: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      status: "success",
      data: aktivitasList,
    });
  } catch (error: any) {
    console.error("Error fetching Aktivitas HPP list:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengambil data aktivitas HPP" },
      { status: 500 }
    );
  }
}
