import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const masterCount = await prisma.masterSheet.count();
    const bahanCount = await prisma.bahanMaterial.count();

    return NextResponse.json({
      status: "online",
      database: "cost_control_db",
      schema: "harga_material",
      counts: {
        mastersheet: masterCount,
        bahanMaterial: bahanCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to connect to database",
        errorDetail: String(error),
      },
      { status: 500 }
    );
  }
}
