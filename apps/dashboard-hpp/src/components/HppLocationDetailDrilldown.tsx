"use client";

import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  MapPin,
  Ruler,
  Sprout,
  Award,
  Calendar,
  Layers,
  Activity,
  CheckCircle2,
  X,
  ArrowUp,
} from "lucide-react";
import { LokasiHppItem } from "@/components/HppLokasiTable";

export interface AktivitasHppItem {
  idAktivitas: string;
  idMaster?: string;
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
  onClose?: () => void;
}

export default function HppLocationDetailDrilldown({
  lokasiCode,
  lokasiItems,
  aktivitasItems,
  budgetItems,
  reportFilter,
  onClose,
}: HppLocationDetailDrilldownProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

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
  const displayLokasi = validItem?.lokasi || masterSheet?.lokasi || (lokasiCode.includes("_") ? lokasiCode.split("_")[0] : lokasiCode) || "-";
  const wilayah = validItem?.wilayah || masterSheet?.wilayah || "-";
  const jenisBibit = validItem?.jenisBibit || masterSheet?.jenisBibit || "-";
  const kelasBibit = validItem?.kelasBibit || masterSheet?.kelasBibit || "-";

  // Use active and harvested area for the selected period
  const luasAktif = Number(validItem?.luasAktif || 0);
  const luasPanen = Number(validItem?.luasPanen || 0);

  // Find forcing & panen dates from masterSheet first, fallback to location's activities if available
  const locAktivitas = aktivitasItems.filter(
    (a) => (a.idMaster && a.idMaster === validItem?.idMaster) || a.lokasi === lokasiCode
  );
  const sampleAktivitas = locAktivitas[0];
  const tglRawat = formatDate(masterSheet?.tanggalRawat || sampleAktivitas?.tanggalMulaiRawat);
  const tglTanam = formatDate(masterSheet?.tanggalTanam || sampleAktivitas?.tanggalMulaiTanam);
  const rencanaForcing = formatDate(masterSheet?.tanggalRenForcing || sampleAktivitas?.rencanaForcing);
  const realForcing = formatDate(masterSheet?.tanggalRealForcing || sampleAktivitas?.realForcing);
  const selesaiPanen = formatDate(masterSheet?.tanggalSelesaiPanen || sampleAktivitas?.rencanaPanen);

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

  const totalAktivitasCostHa = filteredAktivitas.reduce(
    (acc, act) => acc + (luasPanen > 0 ? Number(act.biaya || 0) / luasPanen : 0),
    0
  );

  return (
    <div className="space-y-6" suppressHydrationWarning>
      
      {/* ------------------------------------------------------------- */}
      {/* SECTION 11: DETAIL LOKASI HEADER CARD (Sticky / Freeze on Desktop, Normal on Mobile) */}
      {/* ------------------------------------------------------------- */}
      <div className="sm:sticky sm:top-20 sm:z-30 sm:bg-[#F7F9F7] sm:py-2 sm:-my-2">
        <div className="bg-white border border-[#DDE5DF] rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-200">
          {/* 1. Top Banner Header (Hijau) */}
          <div className="bg-[#16823B] px-4 py-3 sm:px-5 sm:py-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm sm:text-base text-white">
                    Detail Profil Lokasi {displayLokasi}
                  </h4>
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-100 font-normal mt-0.5 hidden sm:block">
                  Profil komprehensif bibit, pemetaan luas, dan jadwal panen dari database HPP
                </p>
              </div>
            </div>

            {/* Right side info pill & Close button */}
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/25 text-xs font-medium text-white shrink-0">
                <span>🌱</span>
                <span>
                  Wilayah <strong className="font-semibold">{wilayah}</strong> • Kelas:{" "}
                  <strong className="font-semibold capitalize">{kelasBibit}</strong>
                </span>
              </div>

              {onClose && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      const tableEl = document.getElementById("daftar-lokasi-section");
                      if (tableEl) {
                        const yOffset = -185;
                        const y = tableEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
                      }
                    }, 50);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-all cursor-pointer border border-white/25 shadow-2xs"
                  title="Tutup Detail & Kembali ke Tabel"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tutup Detail</span>
                  <X className="w-3.5 h-3.5 sm:hidden" />
                </button>
              )}
            </div>
          </div>

          {/* 2. 7 Core Detail Tiles Grid (Berdampingan Langsung Sampingnya & Ketebalan Ringan) */}
          <div className="p-2.5 sm:p-3 bg-[#F7F9F7]/60 border-t border-[#DDE5DF]">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-y sm:divide-y-0 lg:divide-x divide-[#DDE5DF] gap-y-2 lg:gap-y-0 items-center">
              {/* 1. Lokasi */}
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
                <span className="text-[11px] text-[#5F6B63] font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#16823B]" /> Lokasi :
                </span>
                <span className="text-xs sm:text-[13px] font-semibold text-[#16823B] truncate" title={displayLokasi}>
                  {displayLokasi}
                </span>
              </div>

              {/* 2. Jenis Bibit */}
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
                <span className="text-[11px] text-[#5F6B63] font-medium flex items-center gap-1">
                  <Sprout className="w-3 h-3 text-[#16823B]" /> Jenis :
                </span>
                <span className="text-xs sm:text-[13px] font-semibold text-[#16823B] capitalize truncate" title={jenisBibit}>
                  {jenisBibit}
                </span>
              </div>

              {/* 3. Kelas Bibit */}
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
                <span className="text-[11px] text-[#5F6B63] font-medium flex items-center gap-1">
                  <Award className="w-3 h-3 text-[#16823B]" /> Kelas :
                </span>
                <span className="text-xs sm:text-[13px] font-medium text-[#17231B] capitalize truncate" title={kelasBibit}>
                  {kelasBibit}
                </span>
              </div>

              {/* 4. Luas Aktif */}
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
                <span className="text-[11px] text-[#5F6B63] font-medium flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-[#16823B]" /> Luas Aktif :
                </span>
                <span className="text-xs sm:text-[13px] font-medium text-[#17231B] truncate">
                  {formatNumber(luasAktif)} Ha
                </span>
              </div>

              {/* 5. Luas Panen */}
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
                <span className="text-[11px] text-[#5F6B63] font-medium flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-[#16823B]" /> Luas Panen :
                </span>
                <span className="text-xs sm:text-[13px] font-semibold text-[#16823B] truncate">
                  {formatNumber(luasPanen)} Ha
                </span>
              </div>

              {/* 6. Forcing (Ren / Real) */}
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
                <span className="text-[11px] text-[#5F6B63] font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#16823B]" /> Forcing :
                </span>
                <span className="text-xs sm:text-[12px] font-semibold text-purple-900 truncate" title={`${rencanaForcing} / ${realForcing}`}>
                  {rencanaForcing} / {realForcing}
                </span>
              </div>

              {/* 7. Selesai Panen */}
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 whitespace-nowrap">
                <span className="text-[11px] text-[#5F6B63] font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#16823B]" /> Panen :
                </span>
                <span className="text-xs sm:text-[12px] font-semibold text-[#16823B] truncate" title={selesaiPanen}>
                  {selesaiPanen}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 12 & 13: GROUP COST & AKTIVITAS TABLES (SIDE-BY-SIDE) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 relative z-0 isolate">

        {/* ----------------------------------------------------------- */}
        {/* LEFT COLUMN: TABEL GROUP COST LOKASI                        */}
        {/* ----------------------------------------------------------- */}
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-[#DDE5DF]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-[#16823B]/10 text-[#16823B] shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#17231B]">
                    Group Cost ({displayLokasi})
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#5F6B63]">
                    Kelompok biaya &amp; anggaran budget
                  </p>
                </div>
              </div>
              <span className="text-[10.5px] sm:text-xs font-bold text-[#16823B] bg-[#16823B]/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-[#16823B]/20 self-start sm:self-auto shrink-0">
                Klik Group untuk Filter Aktivitas
              </span>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[250px] sm:max-h-[280px] rounded-xl border border-[#DDE5DF]">
              <table className="w-full text-[11px] sm:text-xs text-left border-collapse min-w-[360px] sm:min-w-full">
                <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
                  <tr>
                    <th className="py-2 sm:py-2.5 px-2 sm:px-3 bg-[#F7F9F7]">Group Cost</th>
                    <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-right bg-[#F7F9F7]">Cost / Ha (Rp)</th>
                    <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-right bg-[#F7F9F7]">Budget (Rp)</th>
                    <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center bg-[#F7F9F7]">Status</th>
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
                    <td className="py-2 sm:py-2.5 px-2 sm:px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 sm:px-2 py-0.5 rounded bg-[#16823B] text-white font-bold text-[9.5px] sm:text-[10px] shrink-0">
                          ZN (Direct)
                        </span>
                        <span className="font-bold text-[#16823B] uppercase tracking-wide truncate">
                          Direct Cost
                        </span>
                      </div>
                    </td>
                    <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right font-mono font-bold text-[#16823B]">
                      {formatNumber(costPerHaDirect, 0)}
                    </td>
                    <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right font-mono font-semibold text-[#5F6B63]">
                      {budgetValDirect !== null ? formatNumber(budgetValDirect, 0) : "-"}
                    </td>
                    <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">
                      {activeGroup === "direct_cost" || activeGroup === "ZN" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#16823B] text-white text-[9.5px] sm:text-[10px] font-bold">
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
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-[#16823B]/10 text-[#16823B] font-bold text-[9.5px] sm:text-[10px] border border-[#16823B]/20 shrink-0">
                                {gc.group}
                              </span>
                              <span className="font-bold text-[#17231B] truncate max-w-[100px] sm:max-w-[140px]" title={gc.descGroup}>
                                {gc.descGroup}
                              </span>
                            </div>
                          </td>

                          {/* Cost / Ha */}
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right font-mono font-bold text-[#16823B]">
                            {formatNumber(gc.costPerHa, 0)}
                          </td>

                          {/* Budget */}
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right font-mono text-[#5F6B63]">
                            {hasBudget ? formatNumber(gc.budgetVal, 0) : "-"}
                          </td>

                          {/* Status Select Column */}
                          <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">
                            {isGroupSelected ? (
                              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#16823B] text-white text-[9.5px] sm:text-[10px] font-bold">
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
                    <td className="py-2 sm:py-2.5 px-2 sm:px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 sm:px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[9.5px] sm:text-[10px] shrink-0">
                          ZW (Indirect)
                        </span>
                        <span className="font-bold text-amber-900 uppercase tracking-wide truncate">
                          Indirect Cost
                        </span>
                      </div>
                    </td>
                    <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right font-mono font-bold text-amber-800">
                      {formatNumber(costPerHaIndirect, 0)}
                    </td>
                    <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right font-mono text-[#5F6B63]">
                      {budgetValIndirect !== null ? formatNumber(budgetValIndirect, 0) : "-"}
                    </td>
                    <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">
                      {activeGroup === "indirect_cost" || activeGroup === "ZW" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-700 text-white text-[9.5px] sm:text-[10px] font-bold">
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

          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#DDE5DF] text-[11px] sm:text-xs text-[#5F6B63] flex flex-wrap justify-between items-center gap-1.5">
            <span>Menampilkan {groupCostList.length} kelompok biaya</span>
            {selectedGroup && <span className="font-semibold text-[#16823B]">Terpilih: {selectedGroup}</span>}
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* RIGHT COLUMN: TABEL AKTIVITAS                               */}
        {/* ----------------------------------------------------------- */}
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-[#DDE5DF]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-[#16823B]/10 text-[#16823B] shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#17231B]">
                    Aktivitas Lapangan
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#5F6B63]">
                    {activeGroup ? `Filter Aktivitas: Group ${activeGroup}` : "Semua Aktivitas Pekerjaan"}
                  </p>
                </div>
              </div>

              {activeGroup && (
                <span className="text-[10.5px] sm:text-xs font-bold text-[#16823B] bg-[#16823B]/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-[#16823B]/20 self-start sm:self-auto shrink-0">
                  Group {activeGroup}
                </span>
              )}
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[250px] sm:max-h-[280px] rounded-xl border border-[#DDE5DF]">
              <table className="w-full text-[11px] sm:text-xs text-left border-collapse">
                <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
                  <tr>
                    <th className="py-2 sm:py-2.5 px-2.5 sm:px-3 bg-[#F7F9F7]">Nama Aktivitas</th>
                    <th className="py-2 sm:py-2.5 px-2.5 sm:px-3 text-right bg-[#F7F9F7] whitespace-nowrap">Cost / Ha (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                  {filteredAktivitas.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-6 sm:py-8 text-center text-[#89938D] font-medium text-xs">
                        Belum ada aktivitas untuk lokasi dan group cost yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    filteredAktivitas.map((act) => {
                      const costPerHa = luasPanen > 0 ? Number(act.biaya || 0) / luasPanen : 0;

                      return (
                        <tr key={act.idAktivitas} className="hover:bg-[#F7F9F7] transition-colors">
                          {/* Nama Aktivitas */}
                          <td className="py-2 sm:py-2.5 px-2.5 sm:px-3 font-medium text-[#17231B] leading-snug">
                            {act.aktivitas}
                          </td>

                          {/* Cost / Ha */}
                          <td className="py-2 sm:py-2.5 px-2.5 sm:px-3 text-right font-mono font-bold text-[#16823B] whitespace-nowrap">
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

          {/* Footer info matching WIP */}
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#DDE5DF] text-[11px] sm:text-xs text-[#5F6B63] flex flex-wrap justify-between items-center gap-1.5">
            <span>Total {filteredAktivitas.length} aktivitas terdaftar</span>
            <span className="font-semibold text-[#17231B]">
              Total Cost / Ha: <span className="font-bold text-[#16823B]">Rp {formatNumber(totalAktivitasCostHa, 0)}</span>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}