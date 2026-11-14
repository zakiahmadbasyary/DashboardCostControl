import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawRowLabels = searchParams.get("rowLabels")?.trim();

    if (!rawRowLabels) {
      return NextResponse.json({ success: false, data: [], message: "Parameter 'rowLabels' diperlukan." }, { status: 400 });
    }

    const kelengkapanItems = await prisma.kelengkapan.findMany({
      where: {
        rowLabels: {
          equals: rawRowLabels,
          mode: "insensitive",
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: kelengkapanItems,
    });
  } catch (error: unknown) {
    console.error("Error fetching kelengkapan data:", error);
    return NextResponse.json(
      { success: false, data: [], message: "Gagal memuat data kelengkapan." },
      { status: 500 }
    );
  }
}

