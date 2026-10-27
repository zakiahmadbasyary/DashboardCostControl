"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { previewService } from "@/services/previewService";

const MONTHS_CONFIG = [
  { m: 1, label: "Bln 1 (Jan)" },
  { m: 2, label: "Bln 2 (Feb)" },
  { m: 3, label: "Bln 3 (Mar)" },
  { m: 4, label: "Bln 4 (Apr)" },
  { m: 5, label: "Bln 5 (Mei)" },
  { m: 6, label: "Bln 6 (Jun)" },
  { m: 7, label: "Bln 7 (Jul)" },
  { m: 8, label: "Bln 8 (Ags)" },
  { m: 9, label: "Bln 9 (Sep)" },
  { m: 10, label: "Bln 10 (Okt)" },
  { m: 11, label: "Bln 11 (Nov)" },
  { m: 12, label: "Bln 12 (Des)" },
];
import {
  Search,
  X,
  Layers,
  FileSpreadsheet,
  Building2,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  EyeOff,
  Boxes,
  CheckCircle2,
  SlidersHorizontal,
  Loader2,
  RefreshCw,
  ArrowRightLeft,
} from "lucide-react";

type TabType = "summary" | "actual" | "budget" | "master_cc" | "master_ce2";
type SummaryMode = "both" | "cc" | "ce2";

interface TabMeta {
  key: TabType;
  label: string;
  shortLabel: string;
  icon: typeof Layers;
  description: string;
}

const TABS: TabMeta[] = [
  {
    key: "summary",
    label: "Preview Summary",
    shortLabel: "Summary",
    icon: Layers,
    description: "Ringkasan Realisasi vs Budget (hanya Cost Center & CE2 aktif isview = true). YTD Budget dihitung dari Bln 1 s.d. periode data actual terakhir.",
  },
  {
    key: "actual",
    label: "Data Actual",
    shortLabel: "Actual",
    icon: FileSpreadsheet,
    description: "Seluruh transaksi pengeluaran aktual mentah dari tabel data_actual.",
  },
  {
    key: "budget",
    label: "Data Budget",
    shortLabel: "Budget",
    icon: TableIcon,
    description: "Seluruh alokasi pagu anggaran operasional dari tabel data_budget.",
  },
  {
    key: "master_cc",
    label: "Mastersheet Cost Center",
    shortLabel: "Master CC",
    icon: Building2,
    description: "Daftar kelompok fungsi Cost Center (antar PG) dengan tombol kontrol visibilitas serentak (Solusi C).",
  },
  {
    key: "master_ce2",
    label: "Mastersheet Cost Element (CE2)",
    shortLabel: "Master CE2",
    icon: Boxes,
    description: "Daftar master Cost Element 2 dengan tombol kontrol visibilitas (isview).",
  },
];

export default function AdminPreviewPage() {
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [summaryMode, setSummaryMode] = useState<SummaryMode>("both");
  const [selectedPg, setSelectedPg] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);

  // Data states
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [maxActualPeriod, setMaxActualPeriod] = useState<number>(3);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [bulkToggling, setBulkToggling] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const tableScrollRef = useRef<HTMLDivElement>(null);

  // Active tab meta
  const activeTabMeta = TABS.find((t) => t.key === activeTab) || TABS[0];

  // Reset page when tab, submode, or search changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
    setStatusMessage(null);
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
      tableScrollRef.current.scrollLeft = 0;
    }
  };

  const handleSummaryModeChange = (mode: SummaryMode) => {
    setSummaryMode(mode);
    setPage(1);
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
      tableScrollRef.current.scrollLeft = 0;
    }
  };

  const handlePgChange = (pg: string) => {
    setSelectedPg(pg);
    setPage(1);
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
      tableScrollRef.current.scrollLeft = 0;
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await previewService.getTableData(
        activeTab,
        searchQuery,
        page,
        limit,
        summaryMode,
        selectedPg
      );
      setTableData(res.data);
      setTotalRecords(res.total);
      setTotalPages(res.totalPages);
      if (res.maxActualPeriod !== undefined) {
        setMaxActualPeriod(res.maxActualPeriod);
      }
    } catch (err) {
      console.error("Error fetching preview data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, page, limit, summaryMode, selectedPg]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Toggle IsView untuk Master Cost Center & Master CE2
  const handleToggleView = async (type: "cc" | "ce2", id: string, currentIsView: boolean) => {
    setTogglingId(id);
    const targetState = !currentIsView;

    try {
      const res = await previewService.toggleView(type, id, targetState);
      if (res.success) {
        // Optimistic UI update
        setTableData((prev) =>
          prev.map((row) => {
            const rowKey = type === "cc" ? String(row.costcenter) : String(row.ce2);
            if (rowKey === id) {
              return { ...row, isview: targetState };
            }
            return row;
          })
        );
        setStatusMessage({
          text: `Status visibilitas ${id} berhasil diubah menjadi ${targetState ? "Tampil (View)" : "Sembunyi (Tidak View)"}.`,
          type: "success",
        });
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error("Error toggling view:", err);
      setStatusMessage({
        text: "Gagal memperbarui status visibilitas. Silakan coba lagi.",
        type: "error",
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setTogglingId(null);
    }
  };

  // Handle Bulk Toggle IsView (Tampilkan Semua / Sembunyikan Semua)
  const handleToggleViewAll = async (type: "cc" | "ce2", targetState: boolean) => {
    setBulkToggling(true);
    try {
      const res = await previewService.toggleViewAll(type, targetState);
      if (res.success) {
        // Optimistic UI update untuk seluruh baris
        setTableData((prev) =>
          prev.map((row) => ({
            ...row,
            isview: targetState,
          }))
        );
        setStatusMessage({
          text:
            res.message ||
            `Seluruh ${type === "cc" ? "Cost Center" : "Cost Element CE2"} berhasil ${
              targetState ? "ditampilkan" : "disembunyikan"
            }.`,
          type: "success",
        });
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error("Error bulk toggling view:", err);
      setStatusMessage({
        text: "Gagal memperbarui status seluruh data. Silakan coba lagi.",
        type: "error",
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setBulkToggling(false);
    }
  };

  // Hitung jumlah kolom untuk petunjuk mobile
  const getColumnCount = () => {
    if (activeTab === "summary") {
      return summaryMode === "both" ? 33 : 30;
    }
    if (activeTab === "actual") return 24;
    if (activeTab === "budget") return 10;
    return 4;
  };

  const startRecord = totalRecords > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(page * limit, totalRecords);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── 1. PAGE HEADER (RESPONSIVE SEPERTI CAPEX) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-extrabold text-[#17231B] tracking-tight">
              Preview Data Database OPEX
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF3EC] text-[#16823B] font-bold text-xs border border-[#D5E7DA]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16823B] animate-pulse" />
              {activeTabMeta.shortLabel} · {totalRecords.toLocaleString("id-ID")} Data
            </span>
          </div>
          <p className="text-xs text-[#5F6B63] mt-1 line-clamp-1 sm:line-clamp-none">
            {activeTabMeta.description}
          </p>
        </div>

        {/* Action Button: Refresh */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => fetchData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#16823B] bg-[#EAF3EC] hover:bg-[#D5E7DA] border border-[#D5E7DA] transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs"
            title="Muat ulang data tabel"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Status Notification Banner */}
      {statusMessage && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${
            statusMessage.type === "success"
              ? "bg-[#EAF3EC] border-[#CBE0D1] text-[#16823B]"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ── 2. CONTROLS CARD: TABS & SEARCH & ROWS LIMIT ── */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3.5 sm:space-y-4">
        {/* Navigation Tabs */}
        <div>
          {/* Mobile Select (sm:hidden) */}
          <div className="sm:hidden">
            <label className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 block">
              Pilih Tabel Preview
            </label>
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value as TabType)}
                className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2.5 text-xs font-bold text-[#17231B] focus:outline-none focus:border-[#16823B] appearance-none cursor-pointer"
              >
                {TABS.map((tab) => (
                  <option key={tab.key} value={tab.key}>
                    {tab.label}
                  </option>
                ))}
              </select>
              <SlidersHorizontal className="w-4 h-4 text-[#5F6B63] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Tablet & Desktop Horizontal Pill Tabs */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#DDE5DF]/60 pb-3">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-[#16823B] text-white shadow-xs scale-100"
                      : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B] hover:bg-[#EAF3EC]/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Khusus Tab Preview Summary: Filter PG & Mode Tampilan */}
        {activeTab === "summary" && (
          <div className="bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Filter PG */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[#17231B] font-bold shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#16823B] shrink-0" />
                <span>Filter PG:</span>
              </div>
              <div className="inline-flex p-1 bg-white border border-[#DDE5DF] rounded-xl gap-1 text-xs font-semibold">
                {[
                  { key: "ALL", label: "Semua PG" },
                  { key: "PG1", label: "PG1" },
                  { key: "PG2", label: "PG2" },
                  { key: "PG3", label: "PG3" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handlePgChange(item.key)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center whitespace-nowrap ${
                      selectedPg === item.key
                        ? "bg-[#16823B] text-white shadow-2xs font-bold"
                        : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F8FAF9]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Tampilan Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs text-[#5F6B63] font-bold shrink-0">Mode Agregasi:</span>
              <div className="grid grid-cols-1 xs:grid-cols-3 sm:inline-flex p-1 bg-white border border-[#DDE5DF] rounded-xl gap-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleSummaryModeChange("both")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center whitespace-nowrap ${
                    summaryMode === "both"
                      ? "bg-[#16823B] text-white shadow-2xs font-bold"
                      : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F8FAF9]"
                  }`}
                >
                  Cost Center & CE2
                </button>

                <button
                  type="button"
                  onClick={() => handleSummaryModeChange("cc")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center whitespace-nowrap ${
                    summaryMode === "cc"
                      ? "bg-[#16823B] text-white shadow-2xs font-bold"
                      : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F8FAF9]"
                  }`}
                >
                  Per Cost Center
                </button>

                <button
                  type="button"
                  onClick={() => handleSummaryModeChange("ce2")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center whitespace-nowrap ${
                    summaryMode === "ce2"
                      ? "bg-[#16823B] text-white shadow-2xs font-bold"
                      : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F8FAF9]"
                  }`}
                >
                  Per CE2
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Khusus Tab Mastersheet: Aksi Masal Visibilitas (Tampilkan Semua & Sembunyikan Semua) */}
        {(activeTab === "master_cc" || activeTab === "master_ce2") && (
          <div className="bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs text-[#17231B] font-bold">
              <SlidersHorizontal className="w-4 h-4 text-[#16823B] shrink-0" />
              <span>
                Kontrol Visibilitas Masal ({activeTab === "master_cc" ? "Cost Center" : "Cost Element CE2"}):
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={bulkToggling || tableData.length === 0}
                onClick={() => handleToggleViewAll(activeTab === "master_cc" ? "cc" : "ce2", true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EAF3EC] hover:bg-[#D5E7DA] text-[#16823B] border border-[#D5E7DA] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs active:scale-95"
                title="Tampilkan semua data di dashboard"
              >
                {bulkToggling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-[#16823B]" />
                )}
                <span>Tampilkan Semua</span>
              </button>

              <button
                type="button"
                disabled={bulkToggling || tableData.length === 0}
                onClick={() => handleToggleViewAll(activeTab === "master_cc" ? "cc" : "ce2", false)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs active:scale-95"
                title="Sembunyikan semua data dari dashboard"
              >
                {bulkToggling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>Sembunyikan Semua</span>
              </button>
            </div>
          </div>
        )}

        {/* Search Bar & Rows Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Box with Clear Button */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Cari di tabel ${activeTabMeta.shortLabel}...`}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-9 pr-8 py-2 text-xs text-[#17231B] placeholder-[#89938D] focus:outline-none focus:border-[#16823B] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#89938D] hover:text-[#17231B] hover:bg-neutral-200 transition-colors cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Rows Limit Selector & Data Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs text-[#5F6B63]">
            <span className="text-[11px] text-[#5F6B63]">
              <strong>{startRecord}</strong>–<strong>{endRecord}</strong> dari <strong>{totalRecords.toLocaleString("id-ID")}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#89938D] hidden xs:inline">Baris:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#17231B] focus:outline-none focus:border-[#16823B] cursor-pointer"
              >
                <option value={25}>25 / hal</option>
                <option value={50}>50 / hal</option>
                <option value={100}>100 / hal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Scroll Hint (sm:hidden) */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-[#89938D] bg-[#F7F9F7] px-2.5 py-1.5 rounded-lg border border-[#DDE5DF]/60">
          <div className="flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#16823B]" />
            <span>Geser horizontal untuk melihat semua kolom</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-[#16823B]">
            {getColumnCount()} Kolom
          </span>
        </div>

        {/* ── 3. DATA TABLE CARD (STICKY TOP HEADER + STICKY LEFT ROW NUMBER # SEPERTI CAPEX) ── */}
        <div className="border border-[#DDE5DF] rounded-xl overflow-hidden bg-white shadow-2xs">
          <div
            ref={tableScrollRef}
            className="overflow-x-auto max-h-[58vh] sm:max-h-[64vh] overflow-y-auto relative divide-y divide-[#DDE5DF]/60"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-[#5F6B63]">
                <RefreshCw className="w-7 h-7 animate-spin text-[#16823B]" />
                <span className="text-xs font-semibold">Memuat data dari database...</span>
              </div>
            ) : tableData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-2.5">
                <div className="p-3 rounded-full bg-[#F7F9F7] border border-[#DDE5DF]">
                  <TableIcon className="w-8 h-8 text-[#89938D]/60" />
                </div>
                <p className="text-sm font-bold text-[#17231B]">Tidak ada data ditemukan</p>
                <p className="text-xs text-[#5F6B63] max-w-sm">
                  {searchQuery
                    ? `Tidak ada hasil pencarian untuk "${searchQuery}". Coba kata kunci lain.`
                    : `Belum ada data pada tabel ${activeTabMeta.label}. Silakan unggah file Excel terkait.`}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="mt-1 px-3 py-1.5 rounded-xl bg-[#EAF3EC] text-[#16823B] font-bold text-xs hover:bg-[#D5E7DA] transition-colors cursor-pointer"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                {/* Sticky Header Top */}
                <thead className="sticky top-0 z-20 bg-[#F7F9F7] backdrop-blur-md shadow-2xs border-b border-[#DDE5DF]">
                  {/* ─────────────────────────────────────────────────────────────
                      A. HEADER SUMMARY (3 MODE)
                  ────────────────────────────────────────────────────────────── */}
                  {activeTab === "summary" && (
                    <>
                      {/* Baris 1: Header Kelompok Identitas + Periode 1..12 + Total YTD */}
                      <tr className="text-[#5F6B63] font-bold whitespace-nowrap">
                        <th
                          rowSpan={2}
                          className="py-3 px-3 text-center whitespace-nowrap text-[11px] uppercase tracking-wider sticky left-0 z-30 bg-[#F7F9F7] border-r border-[#DDE5DF] w-12 min-w-[48px]"
                        >
                          #
                        </th>

                        {summaryMode === "both" && (
                          <>
                            <th rowSpan={2} className="py-3 px-3 border-r border-[#DDE5DF] min-w-[60px]">PG</th>
                            <th rowSpan={2} className="py-3 px-3 border-r border-[#DDE5DF] min-w-[110px]">Cost Center</th>
                            <th rowSpan={2} className="py-3 px-3 border-r border-[#DDE5DF] min-w-[180px]">Deskripsi Cost Center</th>
                            <th rowSpan={2} className="py-3 px-3 border-r border-[#DDE5DF] min-w-[90px]">Cost Element (CE2)</th>
                            <th rowSpan={2} className="py-3 px-3 border-r border-[#DDE5DF] min-w-[180px]">Deskripsi CE2</th>
                          </>
                        )}
                        {summaryMode === "cc" && (
                          <>
                            <th rowSpan={2} className="py-3 px-3 border-r border-[#DDE5DF] min-w-[120px]">Cost Center</th>
                            <th rowSpan={2} className="py-3 px-3 border-r border-[#DDE5DF] min-w-[220px]">Deskripsi Cost Center</th>
                          </>
                        )}
                        {summaryMode === "ce2" && (
                          <>
                            <th rowSpan={2} className="py-3 px-3 border-r border-[#DDE5DF] min-w-[110px]">Cost Element (CE2)</th>
                            <th rowSpan={2} className="py-3 px-3 border-r border-[#DDE5DF] min-w-[220px]">Deskripsi Cost Element 2</th>
                          </>
                        )}

                        {/* 12 Bulan (Periode) */}
                        {MONTHS_CONFIG.map((b) => (
                          <th
                            key={b.m}
                            colSpan={2}
                            className="py-2 px-2 text-center border-r border-b border-[#DDE5DF] bg-[#F0F5F1] text-[#16823B] font-bold text-[11px]"
                          >
                            {b.label}
                          </th>
                        ))}

                        {/* Total YTD */}
                        <th
                          colSpan={3}
                          className="py-2 px-3 text-center border-b border-[#DDE5DF] bg-[#EAF3EC] text-[#17231B] font-bold text-[11px]"
                        >
                          Total YTD (Bln 1 - {maxActualPeriod})
                        </th>
                      </tr>

                      {/* Baris 2: Sub-Header Budget & Actual per Periode */}
                      <tr className="text-[#5F6B63] font-bold whitespace-nowrap bg-[#F7F9F7]">
                        {MONTHS_CONFIG.map((b) => (
                          <Fragment key={b.m}>
                            <th className="py-1.5 px-2 text-right text-[10px] text-[#5F6B63] font-semibold min-w-[85px] border-b border-[#DDE5DF]">
                              Budget (Rp)
                            </th>
                            <th className="py-1.5 px-2 text-right text-[10px] text-[#17231B] font-bold min-w-[85px] border-r border-b border-[#DDE5DF]">
                              Actual (Rp)
                            </th>
                          </Fragment>
                        ))}
                        <th
                          className="py-1.5 px-2 text-right text-[10px] text-[#5F6B63] font-semibold min-w-[95px] bg-[#EAF3EC]/60 border-b border-[#DDE5DF]"
                          title={`Kumulatif Budget Bln 1 s.d. Bln ${maxActualPeriod} (sesuai periode data actual terakhir yang tersedia)`}
                        >
                          Total Bgt (Rp)
                        </th>
                        <th
                          className="py-1.5 px-2 text-right text-[10px] text-[#17231B] font-bold min-w-[95px] bg-[#EAF3EC]/60 border-b border-[#DDE5DF]"
                          title={`Kumulatif Actual Bln 1 s.d. Bln ${maxActualPeriod}`}
                        >
                          Total Act (Rp)
                        </th>
                        <th className="py-1.5 px-2 text-right text-[10px] text-[#5F6B63] font-semibold min-w-[65px] bg-[#EAF3EC]/60 border-b border-[#DDE5DF]">
                          Var (%)
                        </th>
                      </tr>
                    </>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      B. HEADER DATA ACTUAL (SEMUA KOLOM NON-ID/KODE)
                  ────────────────────────────────────────────────────────────── */}
                  {activeTab === "actual" && (
                    <tr className="text-[#5F6B63] font-bold whitespace-nowrap">
                      <th className="py-3 px-3 text-center whitespace-nowrap text-[11px] uppercase tracking-wider sticky left-0 z-30 bg-[#F7F9F7] border-r border-[#DDE5DF] w-12 min-w-[48px]">
                        #
                      </th>
                      <th className="py-3 px-3">Periode (Bln)</th>
                      <th className="py-3 px-3">PG</th>
                      <th className="py-3 px-3">Cost Center</th>
                      <th className="py-3 px-3">Deskripsi Cost Center</th>
                      <th className="py-3 px-3">Cost Element (Trans.)</th>
                      <th className="py-3 px-3">Deskripsi Biaya</th>
                      <th className="py-3 px-3">CE2</th>
                      <th className="py-3 px-3">Deskripsi CE2</th>
                      <th className="py-3 px-3 text-right">Actual (IDR)</th>
                      <th className="py-3 px-3">Currency</th>
                      <th className="py-3 px-3 text-right">Actual (USD)</th>
                      <th className="py-3 px-3 text-right">Total Qty</th>
                      <th className="py-3 px-3">Satuan (UoM)</th>
                      <th className="py-3 px-3">No. Dokumen</th>
                      <th className="py-3 px-3">Tgl Dokumen</th>
                      <th className="py-3 px-3">Tgl Posting</th>
                      <th className="py-3 px-3 min-w-[220px]">Catatan / Aktivitas</th>
                      <th className="py-3 px-3">Departemen</th>
                      <th className="py-3 px-3">Subgrup</th>
                      <th className="py-3 px-3">Grup Exp</th>
                      <th className="py-3 px-3">Jenis Biaya</th>
                      <th className="py-3 px-3">CE Grup</th>
                      <th className="py-3 px-3">Grup Aktivitas</th>
                      <th className="py-3 px-3">Mapping Biaya</th>
                    </tr>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      C. HEADER DATA BUDGET (SEMUA KOLOM NON-ID/KODE)
                  ────────────────────────────────────────────────────────────── */}
                  {activeTab === "budget" && (
                    <tr className="text-[#5F6B63] font-bold whitespace-nowrap">
                      <th className="py-3 px-3 text-center whitespace-nowrap text-[11px] uppercase tracking-wider sticky left-0 z-30 bg-[#F7F9F7] border-r border-[#DDE5DF] w-12 min-w-[48px]">
                        #
                      </th>
                      <th className="py-3 px-3">Periode (Bln)</th>
                      <th className="py-3 px-3">Tgl Bulan (Month)</th>
                      <th className="py-3 px-3">Cost Center</th>
                      <th className="py-3 px-3">Deskripsi Cost Center</th>
                      <th className="py-3 px-3">Cost Element (CE2)</th>
                      <th className="py-3 px-3">Deskripsi CE2</th>
                      <th className="py-3 px-3 text-right">Budget (IDR)</th>
                      <th className="py-3 px-3 text-right">Budget (USD)</th>
                      <th className="py-3 px-3">BBP</th>
                      <th className="py-3 px-3">Group Exp</th>
                    </tr>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      D. HEADER MASTERSHEET COST CENTER (KELOMPOK FUNGSI GENERIK)
                  ────────────────────────────────────────────────────────────── */}
                  {activeTab === "master_cc" && (
                    <tr className="text-[#5F6B63] font-bold whitespace-nowrap">
                      <th className="py-3 px-3 text-center whitespace-nowrap text-[11px] uppercase tracking-wider sticky left-0 z-30 bg-[#F7F9F7] border-r border-[#DDE5DF] w-12 min-w-[48px]">
                        #
                      </th>
                      <th className="py-3 px-3">Kode Fungsi Generik</th>
                      <th className="py-3 px-3">Fungsi / Deskripsi Cost Center</th>
                      <th className="py-3 px-3">Unit Tercakup</th>
                      <th className="py-3 px-3">Status Visibilitas</th>
                      <th className="py-3 px-3 text-center w-36">Aksi (View / Sembunyi)</th>
                    </tr>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      E. HEADER MASTERSHEET CE2
                  ────────────────────────────────────────────────────────────── */}
                  {activeTab === "master_ce2" && (
                    <tr className="text-[#5F6B63] font-bold whitespace-nowrap">
                      <th className="py-3 px-3 text-center whitespace-nowrap text-[11px] uppercase tracking-wider sticky left-0 z-30 bg-[#F7F9F7] border-r border-[#DDE5DF] w-12 min-w-[48px]">
                        #
                      </th>
                      <th className="py-3 px-3">Kode CE2</th>
                      <th className="py-3 px-3">Deskripsi Cost Element 2</th>
                      <th className="py-3 px-3">Status Visibilitas</th>
                      <th className="py-3 px-3 text-center w-36">Aksi (View / Sembunyi)</th>
                    </tr>
                  )}
                </thead>

                <tbody className="divide-y divide-[#DDE5DF]/60 bg-white">
                  {tableData.map((row, idx) => {
                    const rowNumber = (page - 1) * limit + idx + 1;
                    return (
                      <tr key={idx} className="hover:bg-[#F8FAF9] transition-colors whitespace-nowrap group">
                        {/* Sticky Left Row Number # Column (Capex style) */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono text-[11px] text-[#89938D] sticky left-0 z-10 bg-white group-hover:bg-[#F8FAF9] border-r border-[#DDE5DF] select-none font-semibold w-12 min-w-[48px]">
                          {rowNumber}
                        </td>

                        {/* ─────────────────────────────────────────────────────────
                            BODY SUMMARY (3 MODE)
                        ────────────────────────────────────────────────────────── */}
                        {/* ─────────────────────────────────────────────────────────
                            BODY SUMMARY (MATRIX BULAN 1..12 & TOTAL YTD)
                        ────────────────────────────────────────────────────────── */}
                        {activeTab === "summary" && (
                          <>
                            {summaryMode === "both" && (
                              <>
                                <td className="py-2.5 px-3 font-bold text-[#17231B] border-r border-[#EBEFEA]">{String(row.pg || "-")}</td>
                                <td className="py-2.5 px-3 font-mono font-bold text-[#17231B] border-r border-[#EBEFEA]">{String(row.costcenter)}</td>
                                <td className="py-2.5 px-3 text-[#5F6B63] max-w-xs truncate border-r border-[#EBEFEA]" title={String(row.deskripsiCostcenter || "")}>
                                  {String(row.deskripsiCostcenter || "-")}
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-[#17231B] border-r border-[#EBEFEA]">{String(row.ce2)}</td>
                                <td className="py-2.5 px-3 text-[#5F6B63] max-w-xs truncate border-r border-[#EBEFEA]" title={String(row.deskripsiCe2 || "")}>
                                  {String(row.deskripsiCe2 || "-")}
                                </td>
                              </>
                            )}
                            {summaryMode === "cc" && (
                              <>
                                <td className="py-2.5 px-3 font-mono font-bold text-[#17231B] border-r border-[#EBEFEA]">{String(row.costcenter)}</td>
                                <td className="py-2.5 px-3 text-[#17231B] font-medium max-w-sm truncate border-r border-[#EBEFEA]" title={String(row.deskripsiCostcenter || "")}>
                                  {String(row.deskripsiCostcenter || "-")}
                                </td>
                              </>
                            )}
                            {summaryMode === "ce2" && (
                              <>
                                <td className="py-2.5 px-3 font-mono font-bold text-[#17231B] border-r border-[#EBEFEA]">{String(row.ce2)}</td>
                                <td className="py-2.5 px-3 text-[#17231B] font-medium max-w-sm truncate border-r border-[#EBEFEA]" title={String(row.deskripsiCe2 || "")}>
                                  {String(row.deskripsiCe2 || "-")}
                                </td>
                              </>
                            )}

                            {/* 12 Bulan: Kolom Budget & Actual */}
                            {MONTHS_CONFIG.map((b) => {
                              const monthsObj = (row.months || {}) as Record<number, { actual: number; budget: number }>;
                              const mData = monthsObj[b.m] || { actual: 0, budget: 0 };
                              return (
                                <Fragment key={b.m}>
                                  <td className="py-2.5 px-2 text-right font-mono text-[#5F6B63] whitespace-nowrap">
                                    {mData.budget ? Number(mData.budget).toLocaleString("id-ID") : "-"}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono font-bold text-[#17231B] border-r border-[#EBEFEA] whitespace-nowrap">
                                    {mData.actual ? Number(mData.actual).toLocaleString("id-ID") : "-"}
                                  </td>
                                </Fragment>
                              );
                            })}

                            {/* Total YTD */}
                            <td className="py-2.5 px-2 text-right font-mono text-[#5F6B63] bg-[#F7F9F7] whitespace-nowrap">
                              {Number(row.totalBudget || 0) > 0 ? Number(row.totalBudget).toLocaleString("id-ID") : "-"}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-[#17231B] bg-[#F7F9F7] whitespace-nowrap">
                              {Number(row.totalActual || 0) > 0 ? Number(row.totalActual).toLocaleString("id-ID") : "-"}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono bg-[#F7F9F7] whitespace-nowrap">
                              {row.variance !== null && row.variance !== undefined ? (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    Number(row.variance) > 0
                                      ? "bg-rose-50 text-rose-600 border border-rose-200"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}
                                >
                                  {Number(row.variance) > 0 ? `+${row.variance}%` : `${row.variance}%`}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                          </>
                        )}

                        {/* ─────────────────────────────────────────────────────────
                            BODY DATA ACTUAL (SEMUA KOLOM NON-ID/KODE)
                        ────────────────────────────────────────────────────────── */}
                        {activeTab === "actual" && (
                          <>
                            <td className="py-2.5 px-3 font-semibold text-[#16823B]">Bln {String(row.period)}</td>
                            <td className="py-2.5 px-3 font-bold text-[#17231B]">{String(row.pg || "-")}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#17231B]">{String(row.costcenter)}</td>
                            <td className="py-2.5 px-3 text-[#5F6B63] max-w-xs truncate" title={String(row.deskripsiCostcenter || "")}>
                              {String(row.deskripsiCostcenter || "-")}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[#17231B]">{String(row.costControl || "-")}</td>
                            <td className="py-2.5 px-3 text-[#5F6B63] max-w-xs truncate" title={String(row.costDescription || "")}>
                              {String(row.costDescription || "-")}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#17231B]">{String(row.ce2)}</td>
                            <td className="py-2.5 px-3 text-[#5F6B63] max-w-xs truncate" title={String(row.deskripsiCe2 || "")}>
                              {String(row.deskripsiCe2 || "-")}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#17231B]">
                              {Number(row.idrAct || 0).toLocaleString("id-ID")}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-[#5F6B63]">{String(row.objectCurrency || "IDR")}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">
                              {Number(row.usdAct || 0).toLocaleString("id-ID")}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[#17231B]">
                              {Number(row.totalQuantity || 0).toLocaleString("id-ID")}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-[#5F6B63]">{String(row.postedUnitOfMeas || "-")}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{String(row.documentNumber || "-")}</td>
                            <td className="py-2.5 px-3 text-[11px] text-[#5F6B63]">{String(row.documentDate || "-")}</td>
                            <td className="py-2.5 px-3 text-[11px] text-[#5F6B63]">{String(row.postingDate || "-")}</td>
                            <td className="py-2.5 px-3 min-w-[220px] max-w-xs truncate" title={String(row.notes || "")}>
                              {String(row.notes || "-")}
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-[#5F6B63]">{String(row.groupingDepartement || "-")}</td>
                            <td className="py-2.5 px-3 text-[11px] text-[#5F6B63]">{String(row.subgrup || "-")}</td>
                            <td className="py-2.5 px-3 text-[11px] text-[#5F6B63]">{String(row.grupExp || "-")}</td>
                            <td className="py-2.5 px-3 text-[11px] text-[#5F6B63]">{String(row.jenisBiaya || "-")}</td>
                            <td className="py-2.5 px-3 text-[11px] text-[#5F6B63]">{String(row.ceGrup || "-")}</td>
                            <td className="py-2.5 px-3 text-[11px] text-[#5F6B63]">{String(row.grupAktivitas || "-")}</td>
                            <td className="py-2.5 px-3 text-[11px] text-[#5F6B63]">{String(row.mappingBiaya || "-")}</td>
                          </>
                        )}

                        {/* ─────────────────────────────────────────────────────────
                            BODY DATA BUDGET (SEMUA KOLOM NON-ID/KODE)
                        ────────────────────────────────────────────────────────── */}
                        {activeTab === "budget" && (
                          <>
                            <td className="py-2.5 px-3 font-semibold text-[#16823B]">Bln {String(row.period)}</td>
                            <td className="py-2.5 px-3 text-[11px] text-[#5F6B63]">{String(row.month || "-")}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#17231B]">{String(row.costcenter)}</td>
                            <td className="py-2.5 px-3 text-[#5F6B63] max-w-xs truncate" title={String(row.deskripsiCostcenter || "")}>
                              {String(row.deskripsiCostcenter || "-")}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#17231B]">{String(row.ce2)}</td>
                            <td className="py-2.5 px-3 text-[#5F6B63] max-w-xs truncate" title={String(row.deskripsiCe2 || "")}>
                              {String(row.deskripsiCe2 || "-")}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#17231B]">
                              {Number(row.amountIdr || 0).toLocaleString("id-ID")}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">
                              {Number(row.amountUsd || 0).toLocaleString("id-ID")}
                            </td>
                            <td className="py-2.5 px-3 text-[#17231B] font-medium">{String(row.bbp || "-")}</td>
                            <td className="py-2.5 px-3 text-[#5F6B63] text-[11px]">{String(row.groupExp || "-")}</td>
                          </>
                        )}

                        {/* ─────────────────────────────────────────────────────────
                            BODY MASTERSHEET COST CENTER
                        ────────────────────────────────────────────────────────── */}
                        {activeTab === "master_cc" && (
                          <>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#17231B]">{String(row.costcenter)}</td>
                            <td className="py-2.5 px-3 text-[#17231B] font-semibold">{String(row.deskripsiCostcenter || "-")}</td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#EAF3EC] text-[#16823B] border border-[#CDE0D3]">
                                {String(row.units || "Semua PG")}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              {row.isview ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Tampil di Dashboard
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  Disembunyikan
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                disabled={togglingId === String(row.costcenter)}
                                onClick={() => handleToggleView("cc", String(row.costcenter), Boolean(row.isview))}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                                  row.isview
                                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {togglingId === String(row.costcenter) ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : row.isview ? (
                                  <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                                <span>{row.isview ? "Sembunyikan" : "Tampilkan"}</span>
                              </button>
                            </td>
                          </>
                        )}

                        {/* ─────────────────────────────────────────────────────────
                            BODY MASTERSHEET CE2
                        ────────────────────────────────────────────────────────── */}
                        {activeTab === "master_ce2" && (
                          <>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#17231B]">{String(row.ce2)}</td>
                            <td className="py-2.5 px-3 text-[#17231B] font-medium">{String(row.deskripsiCe2 || "-")}</td>
                            <td className="py-2.5 px-3">
                              {row.isview ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Tampil di Dashboard
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  Disembunyikan
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                disabled={togglingId === String(row.ce2)}
                                onClick={() => handleToggleView("ce2", String(row.ce2), Boolean(row.isview))}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                                  row.isview
                                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {togglingId === String(row.ce2) ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : row.isview ? (
                                  <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                                <span>{row.isview ? "Sembunyikan" : "Tampilkan"}</span>
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── 4. PAGINATION NAVIGATION (RESPONSIVE SEPERTI CAPEX) ── */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#DDE5DF]">
            <div className="text-xs text-[#5F6B63] text-center sm:text-left">
              Halaman <strong className="text-[#17231B]">{page}</strong> dari{" "}
              <strong className="text-[#17231B]">{totalPages}</strong>
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white text-xs font-semibold text-[#17231B] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pNum = i + 1;
                  if (totalPages > 5 && page > 3) {
                    pNum = page - 2 + i;
                    if (pNum > totalPages) pNum = totalPages - 4 + i;
                  }
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setPage(pNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        page === pNum
                          ? "bg-[#16823B] text-white shadow-xs"
                          : "bg-white border border-[#DDE5DF] text-[#5F6B63] hover:bg-[#F8FAF9]"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white text-xs font-semibold text-[#17231B] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
              >
                <span className="hidden xs:inline">Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
