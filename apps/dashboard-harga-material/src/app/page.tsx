"use client";

import React, { useState, useEffect } from "react";
import HargaMaterialDashboardHeader from "@/components/HargaMaterialDashboardHeader";
import MaterialMainFilters from "@/components/MaterialMainFilters";
import MaterialVarianceChartCard from "@/components/MaterialVarianceChartCard";
import MaterialAnalysisCard, {
  MonthlyChartItem,
  MasterMaterialOption,
} from "@/components/MaterialAnalysisCard";
import MaterialDetailTableCard, {
  PivotedTableRow,
} from "@/components/MaterialDetailTableCard";

export default function DashboardHargaMaterialPage() {
  const [mounted, setMounted] = useState<boolean>(false);

  // Filter States
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");

  // Data States
  const [groups, setGroups] = useState<string[]>([]);
  const [materials, setMaterials] = useState<MasterMaterialOption[]>([]);
  const [chartData, setChartData] = useState<MonthlyChartItem[]>([]);
  const [activeMaster, setActiveMaster] = useState<MasterMaterialOption | null>(null);
  const [latestNilai, setLatestNilai] = useState<number | null>(null);
  const [latestUpdateDate, setLatestUpdateDate] = useState<string | null>(null);
  const [tableRows, setTableRows] = useState<PivotedTableRow[]>([]);

  // UX States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDashboardData = async (groupParam: string, materialParam: string) => {
    setLoading(true);
    setError(null);
    const startTime = Date.now();
    try {
      const url = `/api/material/prd-data?group=${encodeURIComponent(
        groupParam
      )}&material=${encodeURIComponent(materialParam)}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Gagal memuat data harga material.");
      }

      setGroups(json.groups || []);
      setMaterials(json.materials || []);

      // Sync activeGroupCode from server if local state is empty
      if (json.activeGroupCode && json.activeGroupCode !== selectedGroup) {
        setSelectedGroup(json.activeGroupCode);
      }

      // If activeMaterialCode from server differs from local state, sync it
      if (json.activeMaterialCode && json.activeMaterialCode !== selectedMaterial) {
        setSelectedMaterial(json.activeMaterialCode);
      }

      setChartData(json.card1?.chart || []);
      setActiveMaster(json.card1?.activeMaster || null);
      setLatestNilai(json.card1?.latestNilai ?? null);
      setLatestUpdateDate(json.card1?.latestUpdateDate ?? null);
      setTableRows(json.card2?.tableRows || []);
    } catch (err: any) {
      console.error("Error fetching PRD dashboard data:", err);
      setError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      const elapsed = Date.now() - startTime;
      const minLoadingMs = 1000;
      if (elapsed < minLoadingMs) {
        await new Promise((resolve) => setTimeout(resolve, minLoadingMs - elapsed));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchDashboardData(selectedGroup, selectedMaterial);
    }
  }, [mounted, selectedGroup, selectedMaterial]);

  // Handle group change: reset selected material per Section 7 of PRD
  const handleGroupChange = (newGroup: string) => {
    setSelectedGroup(newGroup);
    setSelectedMaterial(""); // Server will validate and pick default available material
  };

  const handleMaterialChange = (newMaterial: string) => {
    setSelectedMaterial(newMaterial);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#17231B] flex flex-col justify-between font-sans selection:bg-[#16823B] selection:text-white" suppressHydrationWarning>
      
      {/* 1. Header Navigation Bar (Preserved as requested: navbarnya jangan diubah) */}
      <HargaMaterialDashboardHeader />

      {/* 2. Content Body */}
      <main className="flex-1 max-w-[95%] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" suppressHydrationWarning>
        
        {/* MAIN FILTERS CARD (Frozen/Sticky Filter Bar) */}
        <MaterialMainFilters
          groups={groups}
          materials={materials}
          selectedGroup={selectedGroup}
          selectedMaterial={selectedMaterial}
          onGroupChange={handleGroupChange}
          onMaterialChange={handleMaterialChange}
        />

        {/* GRAFIK PERBANDINGAN TREND HARGA MATERIAL PER GROUP (Multi-Line Chart) */}
        <MaterialVarianceChartCard
          rows={tableRows}
          selectedGroup={selectedGroup}
          loading={loading}
          error={error}
        />

        {/* CARD 1 — ANALISIS HARGA MATERIAL */}
        <MaterialAnalysisCard
          chartData={chartData}
          activeMaster={activeMaster}
          latestNilai={latestNilai}
          latestUpdateDate={latestUpdateDate}
          loading={loading}
          error={error}
          onRetry={() => fetchDashboardData(selectedGroup, selectedMaterial)}
        />

        {/* CARD 2 — DETAIL HARGA MATERIAL */}
        <MaterialDetailTableCard
          rows={tableRows}
          loading={loading}
          error={error}
          onRetry={() => fetchDashboardData(selectedGroup, selectedMaterial)}
        />

      </main>

      {/* 3. Footer */}
      <footer className="border-t border-[#DDE5DF] bg-white py-6 px-4 text-center text-xs text-[#5F6B63]" suppressHydrationWarning>
        <div className="max-w-[95%] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Great Giant Foods (GGF).</span>
          <span className="font-semibold text-[#16823B]">
            Dashboard Harga Material • Master Data Logistik PG 1
          </span>
        </div>
      </footer>

    </div>
  );
}
