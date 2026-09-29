"use client";

import React, { useState } from "react";
import {
  FileText,
  Layers,
  Activity,
  Calendar,
  Sprout,
  ChevronRight,
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
  const firstItem = lokasiItems[0];
  const masterSheet = firstItem?.masterSheet;
  const wilayah = masterSheet?.wilayah || "W01";
  const jenisBibit = masterSheet?.jenisBibit || "-";
  const kelasBibit = masterSheet?.kelasBibit || "-";

  // Use max or first values for active and harvested area
  const luasAktif = Number(firstItem?.luasAktif || 0);
  const luasPanen = Number(firstItem?.luasPanen || 0);

  // Find forcing & panen dates from location's activities if available
  const locAktivitas = aktivitasItems.filter((a) => a.lokasi === lokasiCode);
  const sampleAktivitas = locAktivitas[0];
  const rencanaForcing = formatDate(sampleAktivitas?.rencanaForcing);
  const rencanaPanen = formatDate(sampleAktivitas?.rencanaPanen);

  // 2. Group cost aggregation per PRD Section 12
  const groupCostMap: Record<string, { group: string; descGroup: string; totalBiaya: number; status: string; periode: number }> = {};

  lokasiItems.forEach((item) => {
    const grp = item.group;
    if (!groupCostMap[grp]) {
      groupCostMap[grp] = {
        group: grp,
        descGroup: item.descGroup || `Group ${grp}`,
        totalBiaya: 0,
        status: item.status,
        periode: item.periode,
      };
    }
    groupCostMap[grp].totalBiaya += Number(item.biaya || 0);
  });

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

  // Automatically select first group if none selected
  const activeGroup = selectedGroup || (groupCostList.length > 0 ? groupCostList[0].group : null);

  // 3. Filtered Aktivitas for active group per PRD Section 13
  const filteredAktivitas = locAktivitas.filter((a) => a.group === activeGroup);

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
        <div className="bg-white rounded-2xl border border-[#DDE5DF] shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-[#EAEFEB] bg-[#F8FAF9] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-2xs shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#17231B] text-sm sm:text-base">
                    Group Cost ({lokasiCode})
                  </h3>
                  <p className="text-[11px] text-[#5F6B63]">
                    Kelompok biaya & anggaran budget
                  </p>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-[#16823B] bg-[#EAF3EC] px-2.5 py-1 rounded-lg border border-[#CBE0D1] shrink-0">
                Klik Group untuk Filter Aktivitas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F0F4F1] text-[#455248] uppercase tracking-wider font-extrabold border-b border-[#E0E8E2]">
                    <th className="py-2.5 px-3">Group Cost</th>
                    <th className="py-2.5 px-3 text-right">Cost / Ha</th>
                    <th className="py-2.5 px-3 text-right">Budget</th>
                    <th className="py-2.5 px-3 text-center">STATUS SELECT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEFEB]">
                  {groupCostList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#8C9890] font-medium">
                        Belum ada Group Cost untuk lokasi ini.
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
                              ? "bg-[#EFF7DB] font-semibold"
                              : "hover:bg-[#F8FAF9]"
                          }`}
                        >
                          {/* Group Cost */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-black text-[10px] border border-amber-200 shrink-0">
                                {gc.group}
                              </span>
                              <span className="font-extrabold text-[#17231B] truncate max-w-[140px]" title={gc.descGroup}>
                                {gc.descGroup}
                              </span>
                            </div>
                          </td>

                          {/* Cost / Ha (No Rp prefix) */}
                          <td className="py-3 px-3 text-right font-extrabold text-[#16823B]">
                            {formatNumber(gc.costPerHa, 0)}
                          </td>

                          {/* Budget (No Rp prefix) */}
                          <td className="py-3 px-3 text-right font-bold">
                            {hasBudget ? (
                              <span className="text-[#17231B]">{formatNumber(gc.budgetVal, 0)}</span>
                            ) : (
                              <span className="text-gray-400 italic">-</span>
                            )}
                          </td>

                          {/* Status Select Column */}
                          <td className="py-3 px-3 text-center">
                            {isGroupSelected ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGroup(gc.group);
                                }}
                                className="px-3.5 py-1 rounded-full bg-[#0B6B32] text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 hover:bg-[#074f24] transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                <span>Selected</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGroup(gc.group);
                                }}
                                className="text-xs text-[#89958C] hover:text-[#16823B] font-medium transition-colors cursor-pointer"
                              >
                                Klik pilih
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-[#F8FAF9] border-t border-[#EAEFEB] text-xs text-[#5F6B63] flex justify-between items-center">
            <span>Menampilkan {groupCostList.length} kelompok biaya</span>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* RIGHT COLUMN: TABEL AKTIVITAS                               */}
        {/* ----------------------------------------------------------- */}
        <div className="bg-white rounded-2xl border border-[#DDE5DF] shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-[#EAEFEB] bg-[#F8FAF9] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-2xs shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#17231B] text-sm sm:text-base">
                    Rincian Aktivitas Lapangan
                  </h3>
                  <p className="text-[11px] text-[#5F6B63]">
                    {activeGroup ? `Filter Aktivitas: Group ${activeGroup}` : "Semua Aktivitas Pekerjaan"}
                  </p>
                </div>
              </div>

              {activeGroup && (
                <span className="text-[10px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                  Group {activeGroup}
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F0F4F1] text-[#455248] uppercase tracking-wider font-extrabold border-b border-[#E0E8E2]">
                    <th className="py-2.5 px-4">Nama Aktivitas</th>
                    <th className="py-2.5 px-4 text-right">Cost / Ha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEFEB]">
                  {filteredAktivitas.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-[#8C9890] font-medium">
                        Belum ada aktivitas untuk lokasi dan group cost yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    filteredAktivitas.map((act) => {
                      const costPerHa = luasPanen > 0 ? Number(act.biaya || 0) / luasPanen : 0;

                      return (
                        <tr key={act.idAktivitas} className="hover:bg-[#F4F8F5] transition-colors">
                          {/* Nama Aktivitas */}
                          <td className="py-3 px-4 font-bold text-[#17231B]">
                            {act.aktivitas}
                          </td>

                          {/* Cost / Ha (No Rp prefix) */}
                          <td className="py-3 px-4 text-right font-extrabold text-[#16823B]">
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

          {/* Footer info */}
          <div className="p-3 bg-[#F8FAF9] border-t border-[#EAEFEB] text-xs text-[#5F6B63] flex justify-between items-center">
            <span>Menampilkan {filteredAktivitas.length} aktivitas pekerjaan</span>
          </div>
        </div>

      </div>

    </div>
  );
}
