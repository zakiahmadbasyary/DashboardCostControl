import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connectivity with lightweight query
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      success: true,
      status: "connected",
      message: "Berhasil terhubung ke database PostgreSQL via Prisma!",
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        status: "disconnected",
        message:
          "Gagal terhubung ke database PostgreSQL. Pastikan service PostgreSQL sudah berjalan dan nilai DATABASE_URL di file .env sudah sesuai.",
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
