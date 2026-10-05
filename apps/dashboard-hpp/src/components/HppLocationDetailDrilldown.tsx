"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Layers,
  Activity,
  Calendar,
  Sprout,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { LokasiHppItem } from "@/components/HppLokasiTable";

export interface AktivitasHppItem {
  idAktivitas: string;
  lokasi: string;
  tanggalMulaiRawat?: string;
  tanggalMulaiTanam?: string;
  tanggalForcingStandard?: string;
  rencanaForcing?: string;
  realForcing?: string;
  rencanaPanen?: string;
  aktivitas: string;
  biaya: number;
  hasil?: number;
  UoM?: string;
  group?: string;
}

export interface BudgetItem {
  idBudget: string;
  group: string;
  status: string;
  periode: number;
  budget: number;
}

interface HppLocationDetailDrilldownProps {
  lokasiCode: string;
  lokasiItems: LokasiHppItem[];
  aktivitasItems: AktivitasHppItem[];
  budgetItems: BudgetItem[];
  reportFilter: "rp_kg" | "rp_ha";
}

export default function HppLocationDetailDrilldown({
  lokasiCode,
  lokasiItems,
  aktivitasItems,
  budgetItems,
  reportFilter,
}: HppLocationDetailDrilldownProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [aktCurrentPage, setAktCurrentPage] = useState<number>(1);
  const AKT_ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setAktCurrentPage(1);
  }, [selectedGroup, lokasiCode]);

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatNumber = (val: number | null | undefined, decimals = 2) => {
    if (val === null || val === undefined) return "-";
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals > 0 ? 1 : 0,
    }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // 1. Compute Master Location Metrics from lokasiItems
  const validItem = lokasiItems.find((i) => Number(i.luasPanen || 0) > 0 || Number(i.luasAktif || 0) > 0) || lokasiItems[0];
  const masterSheet = validItem?.masterSheet;
  const wilayah = masterSheet?.wilayah || "W01";
  const jenisBibit = masterSheet?.jenisBibit || "-";
  const kelasBibit = masterSheet?.kelasBibit || "-";

  // Use active and harvested area for the selected period
  const luasAktif = Number(validItem?.luasAktif || 0);
  const luasPanen = Number(validItem?.luasPanen || 0);

  // Find forcing & panen dates from location's activities if available
  const locAktivitas = aktivitasItems.filter((a) => a.lokasi === lokasiCode);
  const sampleAktivitas = locAktivitas[0];
  const rencanaForcing = formatDate(sampleAktivitas?.rencanaForcing);
  const rencanaPanen = formatDate(sampleAktivitas?.rencanaPanen);

  // Helper to extract numeric value from ZN code (e.g. "ZN01" -> 1, "ZN10" -> 10)
  const getZnNumber = (groupStr: string): number => {
    const match = groupStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 999;
  };

  const status = validItem?.status || "NSFC";
  const periode = validItem?.periode || 1;

  // 2. Direct Cost (ZN) & Indirect Cost (ZW) totals and budget lookups
  let totalBiayaDirect = 0;
  let totalBiayaIndirect = 0;

  const groupCostMap: Record<string, { group: string; descGroup: string; totalBiaya: number; status: string; periode: number }> = {};

  lokasiItems.forEach((item) => {
    const grp = item.group;
    const b = Number(item.biaya || 0);

    if (grp && grp.trim().toUpperCase().startsWith("ZN")) {
      totalBiayaDirect += b;

      if (!groupCostMap[grp]) {
        groupCostMap[grp] = {
          group: grp,
          descGroup: item.descGroup || `Group ${grp}`,
          totalBiaya: 0,
          status: item.status,
          periode: item.periode,
        };
      }
      groupCostMap[grp].totalBiaya += b;
    } else if (grp && grp.trim().toUpperCase().startsWith("ZW")) {
      totalBiayaIndirect += b;
    }
  });

  const costPerHaDirect = luasPanen > 0 ? totalBiayaDirect / luasPanen : 0;
  const costPerHaIndirect = luasPanen > 0 ? totalBiayaIndirect / luasPanen : 0;

  // Budget Lookups for Direct Cost (ZN{status}{periode}) & Indirect Cost (ZW{status}{periode})
  const directBudgetId = `ZN${status}${periode}`;
  const indirectBudgetId = `ZW${status}${periode}`;

  const matchedDirectBudget = budgetItems.find(
    (b) => b.idBudget === directBudgetId || (b.group === "ZN" && b.status === status && b.periode === periode)
  );
  const budgetValDirect = matchedDirectBudget ? Number(matchedDirectBudget.budget) : null;

  const matchedIndirectBudget = budgetItems.find(
    (b) => b.idBudget === indirectBudgetId || (b.group === "ZW" && b.status === status && b.periode === periode)
  );
  const budgetValIndirect = matchedIndirectBudget ? Number(matchedIndirectBudget.budget) : null;

  const groupCostList = Object.values(groupCostMap).map((gc) => {
    const costPerHa = luasPanen > 0 ? gc.totalBiaya / luasPanen : 0;
    
    // PRD Section 12 Budget Lookup: match (periode, status, group)
    const matchedBudget = budgetItems.find(
      (b) => b.group === gc.group && b.status === gc.status && b.periode === gc.periode
    );
    const budgetVal = matchedBudget ? Number(matchedBudget.budget) : null;

    return {
      ...gc,
      costPerHa,
      budgetVal,
    };
  });

  // Sort group cost list ascending starting from ZN 1 (ZN01 -> ZN02 -> ZN03 ... dst)
  groupCostList.sort((a, b) => getZnNumber(a.group) - getZnNumber(b.group));

  // Automatically select first group if none selected (default to "direct_cost" or first ZN group)
  const activeGroup = selectedGroup || "direct_cost";

  // 3. Filtered & Sorted Aktivitas for active group descending by Cost/Ha (Largest to Smallest)
  const filteredAktivitas = locAktivitas
    .filter((a) => {
      if (!activeGroup || activeGroup === "all") return true;
      if (activeGroup === "direct_cost" || activeGroup === "ZN") {
        return a.group && a.group.trim().toUpperCase().startsWith("ZN");
      }
      if (activeGroup === "indirect_cost" || activeGroup === "ZW") {
        return a.group && a.group.trim().toUpperCase().startsWith("ZW");
      }
      return a.group === activeGroup;
    })
    .sort((a, b) => {
      const costPerHaA = luasPanen > 0 ? Number(a.biaya || 0) / luasPanen : 0;
      const costPerHaB = luasPanen > 0 ? Number(b.biaya || 0) / luasPanen : 0;
      return costPerHaB - costPerHaA;
    });

  const totalAktPages = Math.ceil(filteredAktivitas.length / AKT_ITEMS_PER_PAGE) || 1;
  const startAktIndex = (aktCurrentPage - 1) * AKT_ITEMS_PER_PAGE;
  const paginatedAktivitas = filteredAktivitas.slice(startAktIndex, startAktIndex + AKT_ITEMS_PER_PAGE);

  return (
    <div className="space-y-6" suppressHydrationWarning>
      
      {/* ------------------------------------------------------------- */}
      {/* SECTION 11: DETAIL LOKASI HEADER CARD                         */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-[#DDE5DF] shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#16823B] to-[#0B6B32] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <FileText className="w-6 h-6 text-[#A8D437]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Detail Lokasi {lokasiCode}</h2>
                <span className="px-2 py-0.5 rounded bg-[#A8D437] text-[#0B6B32] font-black text-xs">
                  Wilayah {wilayah}
                </span>
              </div>
              <p className="text-xs text-[#E8F3EA] mt-0.5 font-medium">
                Profil komprehensif bibit, pemetaan luas, dan jadwal panen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold bg-white/15 px-3 py-1.5 rounded-xl border border-white/20">
            <Sprout className="w-4 h-4 text-[#A8D437]" />
            <span className="capitalize">{jenisBibit}</span>
            <span>•</span>
            <span className="capitalize">Kelas: {kelasBibit}</span>
          </div>
        </div>

        {/* Info Grid Cards */}
        <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 bg-[#F8FAF9]">
          
          <div className="p-3 bg-white rounded-xl border border-[#E0E8E2] shadow-2xs">
            <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider block">Lokasi</span>
            <span className="text-base font-black text-[#17231B]">{lokasiCode}</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#E0E8E2] shadow-2xs">
            <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider block">Jenis Bibit</span>
            <span className="text-sm font-extrabold text-[#16823B] capitalize">{jenisBibit}</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#E0E8E2] shadow-2xs">
            <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider block">Kelas Bibit</span>
            <span className="text-sm font-extrabold text-[#2C3830] capitalize">{kelasBibit}</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#E0E8E2] shadow-2xs">
            <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider block">Luas Aktif</span>
            <span className="text-sm font-extrabold text-[#17231B]">{formatNumber(luasAktif)} Ha</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#E0E8E2] shadow-2xs">
            <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider block">Luas Panen</span>
            <span className="text-sm font-extrabold text-[#16823B]">{formatNumber(luasPanen)} Ha</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#E0E8E2] shadow-2xs">
            <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-purple-600" />
              Rencana Forcing / Panen
            </span>
            <span className="text-xs font-bold text-purple-900 block truncate">
              {rencanaForcing} / {rencanaPanen}
            </span>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 12 & 13: GROUP COST & AKTIVITAS TABLES (SIDE-BY-SIDE) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ----------------------------------------------------------- */}
        {/* LEFT COLUMN: TABEL GROUP COST LOKASI                        */}
        {/* ----------------------------------------------------------- */}
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDE5DF]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B] shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#17231B]">
                    Group Cost ({lokasiCode})
                  </h3>
                  <p className="text-xs text-[#5F6B63]">
                    Kelompok biaya &amp; anggaran budget
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16823B] bg-[#16823B]/10 px-2.5 py-1 rounded-lg border border-[#16823B]/20 shrink-0">
                Klik Group untuk Filter Aktivitas
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                  <tr>
                    <th className="py-2.5 px-3">Group Cost</th>
                    <th className="py-2.5 px-3 text-right">Cost / Ha (Rp)</th>
                    <th className="py-2.5 px-3 text-right">Budget (Rp)</th>
                    <th className="py-2.5 px-3 text-center">Status Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF]/60">
                  {/* 1. Direct Cost Summary Row */}
                  <tr
                    onClick={() => setSelectedGroup("direct_cost")}
                    className={`cursor-pointer transition-all border-b-2 border-b-[#16823B]/30 ${
                      activeGroup === "direct_cost" || activeGroup === "ZN"
                        ? "bg-[#A8D437]/20 border-l-4 border-l-[#16823B] font-bold text-[#0B6B32]"
                        : "hover:bg-[#F7F9F7] text-[#17231B] font-bold"
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-[#16823B] text-white font-bold text-[10px] shrink-0">
                          ZN (Direct)
                        </span>
                        <span className="font-bold text-[#16823B] uppercase tracking-wide">
                          Direct Cost
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                      {formatNumber(costPerHaDirect, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#5F6B63]">
                      {budgetValDirect !== null ? formatNumber(budgetValDirect, 0) : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {activeGroup === "direct_cost" || activeGroup === "ZN" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16823B] text-white text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#89938D]">Klik pilih</span>
                      )}
                    </td>
                  </tr>

                  {/* 2. Individual ZN Group Rows */}
                  {groupCostList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-[#89938D] text-xs font-medium italic">
                        Belum ada Group Cost ZN spesifik untuk lokasi ini.
                      </td>
                    </tr>
                  ) : (
                    groupCostList.map((gc) => {
                      const isGroupSelected = activeGroup === gc.group;
                      const hasBudget = gc.budgetVal !== null;

                      return (
                        <tr
                          key={gc.group}
                          onClick={() => setSelectedGroup(gc.group)}
                          className={`cursor-pointer transition-all ${
                            isGroupSelected
                              ? "bg-[#A8D437]/20 border-l-4 border-l-[#16823B] font-semibold text-[#0B6B32]"
                              : "hover:bg-[#F7F9F7] text-[#17231B]"
                          }`}
                        >
                          {/* Group Cost */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-[#16823B]/10 text-[#16823B] font-bold text-[10px] border border-[#16823B]/20 shrink-0">
                                {gc.group}
                              </span>
                              <span className="font-bold text-[#17231B] truncate max-w-[140px]" title={gc.descGroup}>
                                {gc.descGroup}
                              </span>
                            </div>
                          </td>

                          {/* Cost / Ha */}
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                            {formatNumber(gc.costPerHa, 0)}
                          </td>

                          {/* Budget */}
                          <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">
                            {hasBudget ? formatNumber(gc.budgetVal, 0) : "-"}
                          </td>

                          {/* Status Select Column */}
                          <td className="py-2.5 px-3 text-center">
                            {isGroupSelected ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16823B] text-white text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Selected
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#89938D]">Klik pilih</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {/* 3. Indirect Cost Summary Row */}
                  <tr
                    onClick={() => setSelectedGroup("indirect_cost")}
                    className={`cursor-pointer transition-all border-t-2 border-t-amber-300 ${
                      activeGroup === "indirect_cost" || activeGroup === "ZW"
                        ? "bg-amber-100/60 border-l-4 border-l-amber-600 font-bold text-amber-900"
                        : "hover:bg-amber-50/50 text-[#17231B] font-bold"
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px] shrink-0">
                          ZW (Indirect)
                        </span>
                        <span className="font-bold text-amber-900 uppercase tracking-wide">
                          Indirect Cost
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-800">
                      {formatNumber(costPerHaIndirect, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">
                      {budgetValIndirect !== null ? formatNumber(budgetValIndirect, 0) : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {activeGroup === "indirect_cost" || activeGroup === "ZW" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-700 text-white text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#89938D]">Klik pilih</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DDE5DF] text-xs text-[#5F6B63] flex justify-between items-center">
            <span>Menampilkan {groupCostList.length} kelompok biaya</span>
            {selectedGroup && <span className="font-semibold text-[#16823B]">Terpilih: {selectedGroup}</span>}
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* RIGHT COLUMN: TABEL AKTIVITAS                               */}
        {/* ----------------------------------------------------------- */}
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDE5DF]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#16823B]/10 text-[#16823B] shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#17231B]">
                    Aktivitas Lapangan
                  </h3>
                  <p className="text-xs text-[#5F6B63]">
                    {activeGroup ? `Filter Aktivitas: Group ${activeGroup}` : "Semua Aktivitas Pekerjaan"}
                  </p>
                </div>
              </div>

              {activeGroup && (
                <span className="text-xs font-bold text-[#16823B] bg-[#16823B]/10 px-2.5 py-1 rounded-lg border border-[#16823B]/20 shrink-0">
                  Group {activeGroup}
                </span>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                  <tr>
                    <th className="py-2.5 px-3">Nama Aktivitas</th>
                    <th className="py-2.5 px-3 text-right">Cost / Ha (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                  {filteredAktivitas.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-[#89938D] font-medium">
                        Belum ada aktivitas untuk lokasi dan group cost yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    paginatedAktivitas.map((act) => {
                      const costPerHa = luasPanen > 0 ? Number(act.biaya || 0) / luasPanen : 0;

                      return (
                        <tr key={act.idAktivitas} className="hover:bg-[#F7F9F7] transition-colors">
                          {/* Nama Aktivitas */}
                          <td className="py-2.5 px-3 font-medium text-[#17231B]">
                            {act.aktivitas}
                          </td>

                          {/* Cost / Ha */}
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                            {formatNumber(costPerHa, 0)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer info & Pagination */}
          <div className="mt-4 pt-3 border-t border-[#DDE5DF] text-xs text-[#5F6B63] flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>
              Menampilkan {filteredAktivitas.length === 0 ? 0 : startAktIndex + 1} - {Math.min(startAktIndex + AKT_ITEMS_PER_PAGE, filteredAktivitas.length)} dari {filteredAktivitas.length} aktivitas
            </span>

            {totalAktPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAktCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={aktCurrentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-[#17231B] hover:bg-[#F7F9F7] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <span className="px-2.5 py-1 text-xs font-bold text-[#16823B] bg-[#16823B]/10 rounded-lg border border-[#16823B]/20">
                  {aktCurrentPage} / {totalAktPages}
                </span>

                <button
                  onClick={() => setAktCurrentPage((prev) => Math.min(prev + 1, totalAktPages))}
                  disabled={aktCurrentPage === totalAktPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-[#17231B] hover:bg-[#F7F9F7] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
                  title="Halaman Selanjutnya"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
