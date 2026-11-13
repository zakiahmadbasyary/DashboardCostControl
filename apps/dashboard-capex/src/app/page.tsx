"use client";

import React, { useState, useEffect, useCallback } from "react";
import CapexDashboardHeader, { CapexSectionTab } from "@/components/CapexDashboardHeader";
import CapexMainFilters from "@/components/CapexMainFilters";
import CapexAnalyticsChartsCard, { ChartFilterMode } from "@/components/CapexAnalyticsChartsCard";
import CapexListCard from "@/components/CapexListCard";
import CapexDetailCard from "@/components/CapexDetailCard";
import UserApproverSection from "@/components/UserApproverSection";
import { CapexItem, UserApproverItem, CapexMainFilterValues } from "@/types/capex";
import { registerCostCenters } from "@/lib/costCenters";
import {
  Layers,
} from "lucide-react";

export default function DashboardCapexPage() {
  // ─── FILTER STATES (Main Filter: Kategori, Cost Center, Status CAPEX) ─────
  const [kategoris, setKategoris] = useState<string[]>([]);
  const [costCenters, setCostCenters] = useState<string[]>([]);
  const [statusList, setStatusList] = useState<string[]>([]);

  // Filters are only applied when user clicks "Terapkan" or "Reset"
  const [appliedFilters, setAppliedFilters] = useState<CapexMainFilterValues>({
    kategori: "Semua",
    costCenter: "Semua",
    statusCapex: "Semua",
  });

  // ─── DATA STATES ────────────────────────────────────────────────────────────
  const [capexList, setCapexList] = useState<CapexItem[]>([]);
  const [allCapexList, setAllCapexList] = useState<CapexItem[]>([]);
  const [chartFilterMode, setChartFilterMode] = useState<ChartFilterMode>("locked");
  const [selectedCapex, setSelectedCapex] = useState<CapexItem | null>(null);

  const [approvers, setApprovers] = useState<UserApproverItem[]>([]);
  const [lastCreatedUpdate, setLastCreatedUpdate] = useState<string | null>(null);

  // ─── LOADING & ERROR STATES ─────────────────────────────────────────────────
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingCapex, setLoadingCapex] = useState(true);
  const [loadingApprovers, setLoadingApprovers] = useState(true);

  const [errorCapex, setErrorCapex] = useState<string | null>(null);
  const [errorApprovers, setErrorApprovers] = useState<string | null>(null);

  // ─── 1. FETCH FILTER OPTIONS ────────────────────────────────────────────────
  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch("/api/capex/filters");
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.costCenterMap) {
          registerCostCenters(json.data.costCenterMap);
        }
        setKategoris(json.data.kategoris || []);
        setCostCenters(json.data.costCenters || []);
        setStatusList(json.data.statusCapexList || []);
        if (json.data.lastCreatedUpdate) {
          setLastCreatedUpdate(json.data.lastCreatedUpdate);
        }
      }
    } catch (err) {
      console.error("Gagal memuat filter opsi:", err);
    } finally {
      setLoadingFilters(false);
    }
  }, []);

  // ─── 2. FETCH CAPEX LIST (AFFECTED ONLY BY APPLIED MAIN FILTER) ─────────────
  const fetchCapexList = useCallback(async (filters: CapexMainFilterValues, isRefresh = false) => {
    try {
      if (isRefresh) setLoadingCapex(true);
      setErrorCapex(null);

      const params = new URLSearchParams();
      if (filters.kategori !== "Semua") params.append("kategori", filters.kategori);
      if (filters.costCenter !== "Semua") params.append("costCenter", filters.costCenter);
      if (filters.statusCapex !== "Semua") params.append("statusCapex", filters.statusCapex);

      const res = await fetch(`/api/capex/list?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat data CAPEX");
      }

      const list: CapexItem[] = json.data || [];
      setCapexList(list);

      // Simpan data global jika filter dalam kondisi default/tanpa filter
      if (
        filters.kategori === "Semua" &&
        filters.costCenter === "Semua" &&
        filters.statusCapex === "Semua"
      ) {
        setAllCapexList(list);
      }

      // Auto-selection rule (requirement #32):
      // Jika pilihan CAPEX aktif tidak lagi termasuk hasil filter, pilih baris pertama yang tersedia atau empty state
      setSelectedCapex((prevSelected) => {
        if (!prevSelected) return list[0] || null;
        const exists = list.find((item) => item.idTotal === prevSelected.idTotal);
        return exists || list[0] || null;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data";
      setErrorCapex(msg);
      setCapexList([]);
      setSelectedCapex(null);
    } finally {
      setLoadingCapex(false);
    }
  }, []);

  // ─── 3. FETCH APPROVERS (INDEPENDENT FROM MAIN FILTER) ───────────────────────
  const fetchApprovers = useCallback(async () => {
    try {
      setErrorApprovers(null);

      const res = await fetch("/api/capex/approvers");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat data User Approver");
      }

      setApprovers(json.data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setErrorApprovers(msg);
    } finally {
      setLoadingApprovers(false);
    }
  }, []);

  // ─── 4. FETCH GLOBAL CAPEX (FOR LOCKED GLOBAL CHART VIEW) ───────────────────
  const fetchAllCapex = useCallback(async () => {
    try {
      const res = await fetch("/api/capex/list");
      const json = await res.json();
      if (res.ok && json.success) {
        setAllCapexList(json.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat data global CAPEX:", err);
    }
  }, []);

  // ─── LIFECYCLE ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchFilters();
    fetchApprovers();
    fetchAllCapex();
  }, [fetchFilters, fetchApprovers, fetchAllCapex]);

  useEffect(() => {
    fetchCapexList(appliedFilters);
  }, [fetchCapexList, appliedFilters]);

  // Handle Apply from Main Filter (only triggers on Terapkan or Reset)
  const handleApplyFilters = (newFilters: CapexMainFilterValues) => {
    setAppliedFilters(newFilters);
  };

  // ─── ACTION FILTER DARI GRAFIK BATANG ─────────────────────────────────────────
  // 1. Klik batang status (contoh: klik Belum Created)
  const handleSelectStatusFromChart = (statusLabel: string) => {
    const norm = statusLabel.trim().toLowerCase().replace(/[\s-]+/g, "_");
    const matched =
      statusList.find(
        (s) => s.trim().toLowerCase().replace(/[\s-]+/g, "_") === norm
      ) || statusLabel;

    const currentNorm = appliedFilters.statusCapex.trim().toLowerCase().replace(/[\s-]+/g, "_");
    const nextStatus = currentNorm === norm ? "Semua" : matched;

    setAppliedFilters((prev) => ({
      ...prev,
      statusCapex: nextStatus,
    }));
  };

  // 2. Klik batang kategori (contoh: klik salah satu kategori)
  const handleSelectCategoryFromChart = (categoryName: string) => {
    const nextCategory =
      appliedFilters.kategori.toLowerCase() === categoryName.toLowerCase()
        ? "Semua"
        : categoryName;

    setAppliedFilters((prev) => ({
      ...prev,
      kategori: nextCategory,
    }));
  };

  const handleResetStatusFromChart = () => {
    setAppliedFilters((prev) => ({
      ...prev,
      statusCapex: "Semua",
    }));
  };

  const handleResetCategoryFromChart = () => {
    setAppliedFilters((prev) => ({
      ...prev,
      kategori: "Semua",
    }));
  };

  // ─── 5. SUB-MENU NAVIGATION STATE & SCROLLSPY ──────────────────────────────
  const [activeSection, setActiveSection] = useState<CapexSectionTab>("capex");

  const scrollToElement = useCallback((elementId: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSelectSubNav = useCallback(
    (section: CapexSectionTab) => {
      setActiveSection(section);
      if (section === "capex") {
        scrollToElement("section-data-capex");
      } else if (section === "approver") {
        scrollToElement("section-pending-approver");
      }
    },
    [scrollToElement]
  );

  // ScrollSpy: Mengupdate activeSection otomatis saat user scroll manual
  useEffect(() => {
    const handleScroll = () => {
      const approverEl = document.getElementById("section-pending-approver");
      if (!approverEl) return;
      const rect = approverEl.getBoundingClientRect();
      // Saat card Pending Approver sudah mencapai area pandang atas (<= 320px dari top viewport)
      if (rect.top <= 320) {
        setActiveSection("approver");
      } else {
        setActiveSection("capex");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9F7] font-sans antialiased flex flex-col">
      {/* ── GLOBAL NAVBAR WITH CENTER SUB-MENU NAVIGATION ── */}
      <CapexDashboardHeader
        activeSection={activeSection}
        onSelectSection={handleSelectSubNav}
        lastUpdated={lastCreatedUpdate}
      />

      {/* ── MAIN CONTENT ── */}
      <main className="w-full md:w-[calc(100%-4rem)] md:ml-16 px-3 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col gap-2.5 sm:gap-3 flex-1">
        {/* ── MAIN FILTER SECTION (Sticky / Freeze like WIP) ── */}
        <section className="sticky top-16 sm:top-20 z-20 bg-[#F7F9F7] py-1" suppressHydrationWarning>
          <CapexMainFilters
            kategoris={kategoris}
            costCenters={costCenters}
            statusList={statusList}
            initialFilters={appliedFilters}
            onApplyFilters={handleApplyFilters}
            loading={loadingCapex || loadingFilters}
          />
        </section>

        {/* ── CARD BARU: GRAFIK ANALISIS STATUS & KATEGORI CAPEX (INTERAKTIF FILTER) ── */}
        <section id="section-data-capex" className="scroll-mt-24 sm:scroll-mt-28">
          <CapexAnalyticsChartsCard
            items={capexList}
            globalItems={allCapexList.length > 0 ? allCapexList : capexList}
            loading={loadingCapex}
            activeFilters={appliedFilters}
            statusList={statusList}
            filterMode={chartFilterMode}
            onToggleFilterMode={setChartFilterMode}
            onSelectStatus={handleSelectStatusFromChart}
            onSelectCategory={handleSelectCategoryFromChart}
            onResetStatus={handleResetStatusFromChart}
            onResetCategory={handleResetCategoryFromChart}
          />
        </section>

        {/* ── AREA CAPEX: DUA CARD KIRI & KANAN ── */}
        <section className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#16823B]/10 text-[#16823B] shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#17231B]">
                Area Informasi & Tracking CAPEX
              </h3>
              <p className="text-xs text-[#5F6B63]">
                Pilih salah satu baris CAPEX untuk melihat rincian & tracking persetujuan.{" "}
                <span className="font-semibold text-[#16823B]">
                  * Seluruh nilai biaya disajikan dalam Rupiah (Rp)
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5 sm:gap-5 items-start">
            {/* CARD KIRI: TABEL DAFTAR CAPEX (60% = 3/5 cols) */}
            <div className="lg:col-span-3 h-full">
              <CapexListCard
                items={capexList}
                selectedId={selectedCapex?.idTotal || null}
                onSelect={setSelectedCapex}
                loading={loadingCapex}
                error={errorCapex}
                onRetry={() => fetchCapexList(appliedFilters, true)}
              />
            </div>

            {/* CARD KANAN: INFORMASI CAPEX TERPILIH (40% = 2/5 cols) */}
            <div className="lg:col-span-2 h-full">
              <CapexDetailCard
                selectedItem={selectedCapex}
                loading={loadingCapex}
              />
            </div>
          </div>
        </section>

        {/* ── 4. AREA USER APPROVER (DUA CARD KIRI & KANAN, INDEPENDEN DARI FILTER) ── */}
        <div id="section-pending-approver" className="pt-2 sm:pt-3 scroll-mt-24 sm:scroll-mt-28">
          <UserApproverSection
            approvers={approvers}
            loading={loadingApprovers}
            error={errorApprovers}
            onRetry={fetchApprovers}
          />
        </div>
      </main>

      {/* ── GLOBAL FOOTER ── */}
      <footer className="mt-auto border-t border-[#DDE5DF] bg-white py-4 w-full md:w-[calc(100%-4rem)] md:ml-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#89938D]">
          <span>
            © 2026 Great Giant Foods · Dashboard CAPEX — Capital Expenditure Management
          </span>
          <span>
            Database schema: <code className="font-mono text-[#5F6B63]">capex</code> · Terintegrasi PostgreSQL Prisma
          </span>
        </div>
      </footer>
    </div>
  );
}
