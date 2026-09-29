import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [budgets, lokasiHpps, masterSheets, aktivitasHpps] = await Promise.all([
      prisma.budget.findMany(),
      prisma.lokasiHPP.findMany(),
      prisma.masterSheet.findMany(),
      prisma.aktivitasHPP.findMany(),
    ]);

    // Calculate aggregated metrics
    const totalBudget = budgets.reduce((acc, b) => acc + Number(b.budget || 0), 0);
    const totalBiayaLokasi = lokasiHpps.reduce((acc, l) => acc + Number(l.biaya || 0), 0);
    const totalBiayaAktivitas = aktivitasHpps.reduce((acc, a) => acc + Number(a.biaya || 0), 0);
    const totalBiayaHpp = totalBiayaLokasi + totalBiayaAktivitas;

    const totalQtyPanen = lokasiHpps.reduce((acc, l) => acc + Number(l.qtyPanen || 0), 0);
    const totalLuasPanen = lokasiHpps.reduce((acc, l) => acc + Number(l.luasPanen || 0), 0);
    const totalLuasAktif = lokasiHpps.reduce((acc, l) => acc + Number(l.luasAktif || 0), 0);

    const costVariance = totalBudget - totalBiayaHpp;
    const realizationPercent = totalBudget > 0 ? (totalBiayaHpp / totalBudget) * 100 : 0;
    const avgHppPerKg = totalQtyPanen > 0 ? totalBiayaHpp / totalQtyPanen : 0;
    const avgYieldPerHa = totalLuasPanen > 0 ? totalQtyPanen / totalLuasPanen : 0;

    // Breakdown by Group / Zone
    const groupMap: Record<string, { group: string; budget: number; realisasi: number; qty: number }> = {};

    budgets.forEach((b) => {
      if (!groupMap[b.group]) {
        groupMap[b.group] = { group: b.group, budget: 0, realisasi: 0, qty: 0 };
      }
      groupMap[b.group].budget += Number(b.budget || 0);
    });

    lokasiHpps.forEach((l) => {
      if (!groupMap[l.group]) {
        groupMap[l.group] = { group: l.group, budget: 0, realisasi: 0, qty: 0 };
      }
      groupMap[l.group].realisasi += Number(l.biaya || 0);
      groupMap[l.group].qty += Number(l.qtyPanen || 0);
    });

    aktivitasHpps.forEach((a) => {
      if (a.group && groupMap[a.group]) {
        groupMap[a.group].realisasi += Number(a.biaya || 0);
      }
    });

    const groupBreakdown = Object.values(groupMap);

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
        totalLokasi: masterSheets.length,
        totalAktivitas: aktivitasHpps.length,
      },
      groupBreakdown,
    });
  } catch (error: any) {
    console.error("Error fetching HPP summary:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengambil ringkasan data HPP" },
      { status: 500 }
    );
  }
}
