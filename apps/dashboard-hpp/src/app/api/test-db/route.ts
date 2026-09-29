import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startTime = Date.now();

  try {
    // 1. Connection check & query execution time
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;

    // 2. Fetch row counts for all HPP tables
    const [masterCount, budgetCount, lokasiCount, aktivitasCount] = await Promise.all([
      prisma.masterSheet.count().catch(() => 0),
      prisma.budget.count().catch(() => 0),
      prisma.lokasiHPP.count().catch(() => 0),
      prisma.aktivitasHPP.count().catch(() => 0),
    ]);

    // 3. Fetch top sample rows for inspection
    const [masterSamples, budgetSamples, lokasiSamples, aktivitasSamples] = await Promise.all([
      prisma.masterSheet.findMany({ take: 10, orderBy: { createdAt: "desc" } }).catch(() => []),
      prisma.budget.findMany({ take: 10, orderBy: { createdAt: "desc" } }).catch(() => []),
      prisma.lokasiHPP.findMany({ take: 10, orderBy: { createdAt: "desc" } }).catch(() => []),
      prisma.aktivitasHPP.findMany({ take: 10, orderBy: { createdAt: "desc" } }).catch(() => []),
    ]);

    // Mask database URL for safety
    const rawDbUrl = process.env.DATABASE_URL || "";
    const maskedDbUrl = rawDbUrl.replace(/:([^:@]+)@/, ":****@");

    return NextResponse.json({
      status: "success",
      connected: true,
      latencyMs: latency,
      timestamp: new Date().toISOString(),
      databaseInfo: {
        provider: "postgresql",
        schema: "hpp",
        maskedUrl: maskedDbUrl,
        clientVersion: "6.19.3",
      },
      counts: {
        masterSheet: masterCount,
        budget: budgetCount,
        lokasiHpp: lokasiCount,
        aktivitasHpp: aktivitasCount,
        totalRecords: masterCount + budgetCount + lokasiCount + aktivitasCount,
      },
      tables: {
        masterSheet: masterSamples,
        budget: budgetSamples,
        lokasiHpp: lokasiSamples,
        aktivitasHpp: aktivitasSamples,
      },
    });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error("Database test error:", error);

    const rawDbUrl = process.env.DATABASE_URL || "";
    const maskedDbUrl = rawDbUrl.replace(/:([^:@]+)@/, ":****@");

    return NextResponse.json(
      {
        status: "error",
        connected: false,
        latencyMs: latency,
        timestamp: new Date().toISOString(),
        error: error.message || "Failed to connect to PostgreSQL database",
        databaseInfo: {
          provider: "postgresql",
          schema: "hpp",
          maskedUrl: maskedDbUrl,
        },
        counts: {
          masterSheet: 0,
          budget: 0,
          lokasiHpp: 0,
          aktivitasHpp: 0,
          totalRecords: 0,
        },
        tables: {
          masterSheet: [],
          budget: [],
          lokasiHpp: [],
          aktivitasHpp: [],
        },
      },
      { status: 500 }
    );
  }
}
