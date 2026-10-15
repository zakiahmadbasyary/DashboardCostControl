"use client";

import React, { useState, useEffect, useCallback } from "react";
import CapexDashboardHeader from "@/components/CapexDashboardHeader";
import CapexMainFilters from "@/components/CapexMainFilters";
import CapexListCard from "@/components/CapexListCard";
import CapexDetailCard from "@/components/CapexDetailCard";
import UserApproverSection from "@/components/UserApproverSection";
import { CapexItem, UserApproverItem } from "@/types/capex";
import {
  Layers,
} from "lucide-react";

export default function DashboardCapexPage() {
  // ─── FILTER STATES ──────────────────────────────────────────────────────────
  const [kategoris, setKategoris] = useState<string[]>([]);
  const [costCenters, setCostCenters] = useState<string[]>([]);
  const [statusList, setStatusList] = useState<string[]>([]);
  const [tahuns, setTahuns] = useState<string[]>([]);

  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [selectedCostCenter, setSelectedCostCenter] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedTahun, setSelectedTahun] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // ─── DATA STATES ────────────────────────────────────────────────────────────
  const [capexList, setCapexList] = useState<CapexItem[]>([]);
  const [selectedCapex, setSelectedCapex] = useState<CapexItem | null>(null);

  const [approvers, setApprovers] = useState<UserApproverItem[]>([]);

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
        setKategoris(json.data.kategoris || []);
        setCostCenters(json.data.costCenters || []);
        setStatusList(json.data.statusCapexList || []);
        setTahuns(json.data.tahuns || []);
      }
    } catch (err) {
      console.error("Gagal memuat filter opsi:", err);
    } finally {
      setLoadingFilters(false);
    }
  }, []);

  // ─── 2. FETCH CAPEX LIST (AFFECTED BY MAIN FILTER) ──────────────────────────
  const fetchCapexList = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setLoadingCapex(true);
      setErrorCapex(null);

      const params = new URLSearchParams();
      if (selectedKategori !== "Semua") params.append("kategori", selectedKategori);
      if (selectedCostCenter !== "Semua") params.append("costCenter", selectedCostCenter);
      if (selectedStatus !== "Semua") params.append("statusCapex", selectedStatus);
      if (selectedTahun !== "Semua") params.append("tahun", selectedTahun);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/capex/list?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat data CAPEX");
      }

      const list: CapexItem[] = json.data || [];
      setCapexList(list);

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
  }, [selectedKategori, selectedCostCenter, selectedStatus, selectedTahun, searchQuery]);

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

  // ─── LIFECYCLE ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchFilters();
    fetchApprovers();
  }, [fetchFilters, fetchApprovers]);

  useEffect(() => {
    fetchCapexList();
  }, [fetchCapexList]);

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSelectedKategori("Semua");
    setSelectedCostCenter("Semua");
    setSelectedStatus("Semua");
    setSelectedTahun("Semua");
    setSearchQuery("");
  };

  const handleGlobalRefresh = () => {
    fetchFilters();
    fetchCapexList();
    fetchApprovers();
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] font-sans antialiased flex flex-col">
      {/* ── GLOBAL NAVBAR (Kept untouched as required) ── */}
      <CapexDashboardHeader />

      {/* ── MAIN CONTENT ── */}
      <main className="w-full max-w-[95%] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 flex-1">
        {/* ── 2. MAIN FILTER (Kategori, Cost Center, Status CAPEX, Tahun, Search) ── */}
        <CapexMainFilters
          kategoris={kategoris}
          costCenters={costCenters}
          statusList={statusList}
          tahuns={tahuns}
          selectedKategori={selectedKategori}
          selectedCostCenter={selectedCostCenter}
          selectedStatus={selectedStatus}
          selectedTahun={selectedTahun}
          searchQuery={searchQuery}
          onKategoriChange={setSelectedKategori}
          onCostCenterChange={setSelectedCostCenter}
          onStatusChange={setSelectedStatus}
          onTahunChange={setSelectedTahun}
          onSearchChange={setSearchQuery}
          onReset={handleResetFilters}
          onRefresh={handleGlobalRefresh}
          loading={loadingCapex || loadingFilters}
        />

        {/* ── 3. AREA CAPEX: DUA CARD KIRI & KANAN ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#16823B]" />
            <h2 className="text-sm font-bold text-[#17231B] uppercase tracking-wider">
              3. Area Informasi & Tracking CAPEX
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* CARD KIRI: TABEL DAFTAR CAPEX (5 cols) */}
            <div className="lg:col-span-5 h-full">
              <CapexListCard
                items={capexList}
                selectedId={selectedCapex?.idTotal || null}
                onSelect={setSelectedCapex}
                loading={loadingCapex}
                error={errorCapex}
                onRetry={fetchCapexList}
              />
            </div>

            {/* CARD KANAN: INFORMASI CAPEX TERPILIH (7 cols) */}
            <div className="lg:col-span-7 h-full">
              <CapexDetailCard
                selectedItem={selectedCapex}
                loading={loadingCapex}
              />
            </div>
          </div>
        </section>

        {/* ── 4. AREA USER APPROVER (DUA CARD KIRI & KANAN, INDEPENDEN DARI FILTER) ── */}
        <UserApproverSection
          approvers={approvers}
          loading={loadingApprovers}
          error={errorApprovers}
          onRetry={fetchApprovers}
        />
      </main>

      {/* ── GLOBAL FOOTER ── */}
      <footer className="mt-auto border-t border-[#DDE5DF] bg-white py-4 px-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-[95%] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#89938D]">
          <span>
            © 2026 GGF AgroMetric · Dashboard CAPEX — Capital Expenditure Management
          </span>
          <span>
            Database schema: <code className="font-mono text-[#5F6B63]">capex</code> · Terintegrasi PostgreSQL Prisma
          </span>
        </div>
      </footer>
    </div>
  );
}
