import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "mastersheet";

    if (tab === "mastersheet") {
      const records = await prisma.masterSheet.findMany({
        orderBy: { material: "asc" },
        take: 500,
      });
      return NextResponse.json({ success: true, data: records });
    } else {
      const records = await prisma.bahanMaterial.findMany({
        orderBy: [{ update: "desc" }, { material: "asc" }],
        take: 500,
      });

      // Convert BigInt id to string for JSON serialization
      const serialized = records.map((r) => ({
        ...r,
        id: r.id.toString(),
        price: r.price ? Number(r.price) : null,
        priceUnit: r.priceUnit ? Number(r.priceUnit) : null,
        nilai: r.nilai ? Number(r.nilai) : null,
      }));

      return NextResponse.json({ success: true, data: serialized });
    }
  } catch (error: unknown) {
    console.error("Error fetching preview data:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
