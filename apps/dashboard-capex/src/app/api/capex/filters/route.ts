import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Get distinct cost_center from Total
    const costCentersRaw = await prisma.total.findMany({
      where: {
        costCenter: {
          not: null,
        },
      },
      select: {
        costCenter: true,
      },
      distinct: ["costCenter"],
      orderBy: {
        costCenter: "asc",
      },
    });
    const costCenters = costCentersRaw
      .map((r) => r.costCenter?.trim())
      .filter((cc): cc is string => Boolean(cc && cc.length > 0));

    // 2. Get distinct status_capex from Total (sorted in business flow)
    const statusOrder = [
      "belum_created",
      "sudah_created",
      "final_approve",
      "sudah_po",
      "sudah_close",
    ];
    const statusCapexRaw = await prisma.total.findMany({
      where: {
        statusCapex: {
          not: null,
        },
      },
      select: {
        statusCapex: true,
      },
      distinct: ["statusCapex"],
    });
    const statusCapexList = statusCapexRaw
      .map((r) => r.statusCapex)
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .sort((a, b) => {
        const normA = a.trim().toLowerCase().replace(/[\s-]+/g, "_");
        const normB = b.trim().toLowerCase().replace(/[\s-]+/g, "_");
        const idxA = statusOrder.indexOf(normA);
        const idxB = statusOrder.indexOf(normB);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      });

    // 3. Get distinct kategori from Kategori master and Budget
    const kategoriMaster = await prisma.kategori.findMany({
      where: { kategori: { not: null } },
      select: { kategori: true },
      distinct: ["kategori"],
    });
    const kategoriBudget = await prisma.budget.findMany({
      where: { kategori: { not: null } },
      select: { kategori: true },
      distinct: ["kategori"],
    });

    const kategoriSet = new Set<string>();
    [...kategoriMaster, ...kategoriBudget].forEach((item) => {
      const trimmed = item.kategori?.trim();
      if (trimmed) kategoriSet.add(trimmed);
    });
    const kategoris = Array.from(kategoriSet).sort();

    // 4. Get distinct tahun from Total
    const tahunRaw = await prisma.total.findMany({
      where: { tahun: { not: null } },
      select: { tahun: true },
      distinct: ["tahun"],
      orderBy: { tahun: "desc" },
    });
    const tahuns = tahunRaw
      .map((r) => (r.tahun ? String(r.tahun) : null))
      .filter((t): t is string => Boolean(t));

    // 5. Get all cost center descriptions from Master Cost Center
    const costCenterRecords = await prisma.costCenter.findMany({
      select: { kodeCostCenter: true, keterangan: true },
    });
    const costCenterMap: Record<string, string> = {};
    costCenterRecords.forEach((cc) => {
      if (cc.kodeCostCenter && cc.keterangan) {
        costCenterMap[cc.kodeCostCenter.trim()] = cc.keterangan.trim();
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        kategoris,
        costCenters,
        statusCapexList,
        tahuns,
        costCenterMap,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data opsi filter",
        error: message,
      },
      { status: 500 }
    );
  }
}
