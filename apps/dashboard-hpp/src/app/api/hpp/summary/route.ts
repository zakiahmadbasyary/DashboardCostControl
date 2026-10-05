import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [budgets, lokasiAgg, aktivitasAgg, totalLokasiCount] = await Promise.all([
      prisma.budget.findMany(),
      prisma.lokasiHPP.aggregate({
        _sum: {
          biaya: true,
          qtyPanen: true,
          luasPanen: true,
          luasAktif: true,
        },
      }),
      prisma.aktivitasHPP.aggregate({
        _sum: {
          biaya: true,
        },
        _count: true,
      }),
      prisma.masterSheet.count(),
    ]);

    // Calculate aggregated metrics via database sums
    const totalBudget = budgets.reduce((acc, b) => acc + Number(b.budget || 0), 0);
    const totalBiayaLokasi = Number(lokasiAgg._sum.biaya || 0);
    const totalBiayaAktivitas = Number(aktivitasAgg._sum.biaya || 0);
    const totalBiayaHpp = totalBiayaLokasi + totalBiayaAktivitas;

    const totalQtyPanen = Number(lokasiAgg._sum.qtyPanen || 0);
    const totalLuasPanen = Number(lokasiAgg._sum.luasPanen || 0);
    const totalLuasAktif = Number(lokasiAgg._sum.luasAktif || 0);

    const costVariance = totalBudget - totalBiayaHpp;
    const realizationPercent = totalBudget > 0 ? (totalBiayaHpp / totalBudget) * 100 : 0;
    const avgHppPerKg = totalQtyPanen > 0 ? totalBiayaHpp / totalQtyPanen : 0;
    const avgYieldPerHa = totalLuasPanen > 0 ? totalQtyPanen / totalLuasPanen : 0;

    return NextResponse.json({
      status: "success",
      metrics: {
        totalBudget,
        totalBiayaHpp,
        totalBiayaLokasi,
        totalBiayaAktivitas,
        costVariance,
        realizationPercent,
        totalQtyPanen,
        totalLuasPanen,
        totalLuasAktif,
        avgHppPerKg,
        avgYieldPerHa,
        totalLokasi: totalLokasiCount,
        totalAktivitas: aktivitasAgg._count || 0,
      },
      budgets,
    });
  } catch (error: any) {
    console.error("Error fetching HPP summary:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengambil ringkasan data HPP" },
      { status: 500 }
    );
  }
}

