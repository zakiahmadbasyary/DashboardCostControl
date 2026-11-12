import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [rawActivities, rawWilayah, rawUmur] = await Promise.all([
      prisma.dataAktivitas.findMany({
        where: {
          aktivitas: {
            not: null,
          },
        },
        select: {
          aktivitas: true,
        },
        distinct: ["aktivitas"],
        orderBy: {
          aktivitas: "asc",
        },
      }),
      prisma.mastersheet.findMany({
        where: {
          wilayah: {
            not: null,
          },
        },
        select: {
          wilayah: true,
        },
        distinct: ["wilayah"],
        orderBy: {
          wilayah: "asc",
        },
      }),
      prisma.mastersheet.findMany({
        where: {
          umur: {
            not: null,
          },
        },
        select: {
          umur: true,
        },
        distinct: ["umur"],
        orderBy: {
          umur: "asc",
        },
      }),
    ]);

    const activities = rawActivities
      .map((a) => (a.aktivitas || "").trim())
      .filter((a) => a.length > 0);

    const wilayah = rawWilayah
      .map((w) => (w.wilayah || "").trim())
      .filter((w) => w.length > 0);

    const umurList = rawUmur
      .map((u) => u.umur)
      .filter((u): u is number => u !== null && !isNaN(u));

    return NextResponse.json({
      success: true,
      data: {
        activities: ["Total Aktivitas", ...activities],
        statuses: [
          { value: "NS", label: "NS (NSFC & NSSC)" },
          { value: "NSFC", label: "NSFC" },
          { value: "NSSC", label: "NSSC" },
          { value: "all", label: "Semua Status" },
        ],
        wilayah,
        umurList,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/dashboard/filters:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal mengambil data filter",
      },
      { status: 500 }
    );
  }
}

