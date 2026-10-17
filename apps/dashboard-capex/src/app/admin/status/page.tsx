"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  Check,
  X,
  RotateCcw,
  SlidersHorizontal,
  Info,
  Layers,
  ArrowRightLeft,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrencyRp, formatNumberId, getIoWbsMoDisplay } from "@/lib/formatters";
import { getCostCenterLabel } from "@/lib/costCenters";

interface CapexStatusItem {
  idTotal: string;
  nomorPr: string | null;
  capexNo: string | null;
  description: string | null;
  budgetType: string | null;
  budgetStatus: string | null;
  reqDate: string | null;
  quantity: number | null;
  amount: number | null;
  costCenter: string | null;
  io: string | null;
  mo: string | null;
  wbs: string | null;
  statusCapex: string | null;
  isManuallyClose: boolean;
  closedAt: string | null;
  closedBy: string | null;
  eligible: boolean;
  isClosed: boolean;
  eligibilityReason: string;
  detectedType: "WBS" | "MO" | "IO";
  closeCriteria: "Sudah_PO" | "Final_Approve_WBS_MO" | "Closed" | "Ineligible";
}

interface StatsData {
  total: number;
  belumCreated: number;
  sudahCreated: number;
  finalApprove: number;
  sudahPo: number;
  sudahClose: number;
  eligible: number;
  closed: number;
  ineligible: number;
}

export default function CapexAdminStatusPage() {
  const [items, setItems] = useState<CapexStatusItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    belumCreated: 0,
    sudahCreated: 0,
    finalApprove: 0,
    sudahPo: 0,
    sudahClose: 0,
    eligible: 0,
    closed: 0,
    ineligible: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Modal states
  const [modalAction, setModalAction] = useState<"close" | "reopen" | "bulk_close" | null>(null);
  const [targetItem, setTargetItem] = useState<CapexStatusItem | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [adminName, setAdminName] = useState<string>("Admin CAPEX");
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const tableScrollRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch data
  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search: debouncedSearch,
          status: statusFilter,
          type: typeFilter,
        });

        const res = await fetch(`/api/admin/status?${queryParams.toString()}`);
        const result = await res.json();

        if (!isCancelled) {
          if (result.success) {
            setItems(result.data || []);
            setTotalRecords(result.pagination?.total || 0);
            setTotalPages(result.pagination?.totalPages || 1);
            if (result.stats) setStats(result.stats);
          } else {
            setItems([]);
            setTotalRecords(0);
            setTotalPages(1);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Error fetching status capex:", err);
          setItems([]);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [page, limit, debouncedSearch, statusFilter, typeFilter, refreshKey]);

  // Selection helpers
  const eligibleItemsOnPage = useMemo(() => {
    return items.filter((i) => i.eligible);
  }, [items]);

  const allEligibleSelected = useMemo(() => {
    if (eligibleItemsOnPage.length === 0) return false;
    return eligibleItemsOnPage.every((i) => selectedIds.has(i.idTotal));
  }, [eligibleItemsOnPage, selectedIds]);

  const handleToggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (allEligibleSelected) {
      eligibleItemsOnPage.forEach((i) => next.delete(i.idTotal));
    } else {
      eligibleItemsOnPage.forEach((i) => next.add(i.idTotal));
    }
    setSelectedIds(next);
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Perform API Action (Close / Reopen)
  const executeStatusUpdate = async (action: "close" | "reopen", ids: string[]) => {
    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids,
          action,
          closedBy: adminName,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setActionMessage({ type: "success", text: result.message });
        setModalAction(null);
        setTargetItem(null);
        setSelectedIds(new Set());
        setRefreshKey((prev) => prev + 1);
      } else {
        setActionMessage({
          type: "error",
          text: result.error || "Gagal memperbarui status CAPEX",
        });
      }
    } catch (err) {
      console.error("Error executing status update:", err);
      setActionMessage({ type: "error", text: "Terjadi kesalahan koneksi server" });
    } finally {
      setActionLoading(false);
    }
  };

  const startRecord = totalRecords > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(page * limit, totalRecords);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── 1. PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-[#17231B] tracking-tight">
              Manajemen Status CAPEX
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF3EC] text-[#16823B] font-bold text-xs border border-[#D5E7DA]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16823B]" />
              Aturan Penutupan
            </span>
          </div>
          <p className="text-xs text-[#5F6B63] mt-1 max-w-2xl">
            Kelola penutupan status CAPEX menjadi <strong className="text-[#0D5224]">Sudah Close</strong>.
            Syarat penutupan: Data berstatus <strong className="text-[#17231B]">Sudah PO</strong>, atau bertipe{" "}
            <strong className="text-[#17231B]">WBS & MO</strong> saat berstatus{" "}
            <strong className="text-[#17231B]">Final Approve</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setRefreshKey((p) => p + 1)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#16823B] bg-[#EAF3EC] hover:bg-[#D5E7DA] border border-[#D5E7DA] transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* ── ALERT MESSAGE NOTIFICATION ── */}
      {actionMessage && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold animate-in fade-in duration-200 ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 2. KPI METRIC CARDS (6 STATUS STAGES) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Total CAPEX */}
        <div
          onClick={() => {
            setStatusFilter("all");
            setPage(1);
          }}
          className={`bg-white border rounded-xl p-3 shadow-xs cursor-pointer transition-all hover:border-[#16823B] ${
            statusFilter === "all" ? "border-[#16823B] ring-2 ring-[#16823B]/10" : "border-[#DDE5DF]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#5F6B63] uppercase tracking-wider">
              Total CAPEX
            </span>
            <div className="p-1 rounded-md bg-[#F7F9F7] text-[#5F6B63]">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-extrabold text-[#17231B]">
            {formatNumberId(stats.total)}
          </div>
          <p className="text-[10px] text-[#89938D] mt-0.5 truncate">Semua data</p>
        </div>

        {/* Belum Created */}
        <div
          onClick={() => {
            setStatusFilter("Belum Created");
            setPage(1);
          }}
          className={`bg-white border rounded-xl p-3 shadow-xs cursor-pointer transition-all hover:border-[#16A34A] ${
            statusFilter === "Belum Created" ? "border-[#16A34A] ring-2 ring-[#16A34A]/10" : "border-[#DDE5DF]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider">
              Belum Created
            </span>
            <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-extrabold text-[#16A34A]">
            {formatNumberId(stats.belumCreated)}
          </div>
          <p className="text-[10px] text-[#89938D] mt-0.5 truncate">Pagu awal</p>
        </div>

        {/* Sudah Created */}
        <div
          onClick={() => {
            setStatusFilter("Sudah Created");
            setPage(1);
          }}
          className={`bg-white border rounded-xl p-3 shadow-xs cursor-pointer transition-all hover:border-[#15803D] ${
            statusFilter === "Sudah Created" ? "border-[#15803D] ring-2 ring-[#15803D]/10" : "border-[#DDE5DF]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider">
              Sudah Created
            </span>
            <div className="w-2 h-2 rounded-full bg-[#15803D]" />
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-extrabold text-[#15803D]">
            {formatNumberId(stats.sudahCreated)}
          </div>
          <p className="text-[10px] text-[#89938D] mt-0.5 truncate">Registrasi</p>
        </div>

        {/* Final Approve */}
        <div
          onClick={() => {
            setStatusFilter("Final Approve");
            setPage(1);
          }}
          className={`bg-white border rounded-xl p-3 shadow-xs cursor-pointer transition-all hover:border-[#0D6D32] ${
            statusFilter === "Final Approve" ? "border-[#0D6D32] ring-2 ring-[#0D6D32]/10" : "border-[#DDE5DF]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#0D6D32] uppercase tracking-wider">
              Final Approve
            </span>
            <div className="w-2 h-2 rounded-full bg-[#0D6D32]" />
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-extrabold text-[#0D6D32]">
            {formatNumberId(stats.finalApprove)}
          </div>
          <p className="text-[10px] text-[#89938D] mt-0.5 truncate">Persetujuan</p>
        </div>

        {/* Sudah PO */}
        <div
          onClick={() => {
            setStatusFilter("Sudah PO");
            setPage(1);
          }}
          className={`bg-white border rounded-xl p-3 shadow-xs cursor-pointer transition-all hover:border-[#075322] ${
            statusFilter === "Sudah PO" ? "border-[#075322] ring-2 ring-[#075322]/10" : "border-[#DDE5DF]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#075322] uppercase tracking-wider">
              Sudah PO
            </span>
            <div className="w-2 h-2 rounded-full bg-[#075322]" />
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-extrabold text-[#075322]">
            {formatNumberId(stats.sudahPo)}
          </div>
          <p className="text-[10px] text-[#89938D] mt-0.5 truncate">Terbit PO</p>
        </div>

        {/* Sudah Close */}
        <div
          onClick={() => {
            setStatusFilter("Sudah Close");
            setPage(1);
          }}
          className={`bg-white border rounded-xl p-3 shadow-xs cursor-pointer transition-all hover:border-[#0D5224] ${
            statusFilter === "Sudah Close" ? "border-[#0D5224] ring-2 ring-[#0D5224]/10" : "border-[#DDE5DF]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#0D5224] uppercase tracking-wider">
              Sudah Close
            </span>
            <div className="w-2 h-2 rounded-full bg-[#0D5224]" />
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-extrabold text-[#0D5224]">
            {formatNumberId(stats.sudahClose)}
          </div>
          <p className="text-[10px] text-[#89938D] mt-0.5 truncate">Ditutup</p>
        </div>
      </div>

      {/* ── 3. CONTROLS TOOLBAR (SEARCH & FILTERS) ── */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari CAPEX No, deskripsi, cost center, IO, WBS, MO, nomor PR..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-9 pr-8 py-2 text-xs text-[#17231B] placeholder-[#89938D] focus:outline-none focus:border-[#16823B] transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#89938D] hover:text-[#17231B] hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Status (Hanya 5 status + Semua Status) */}
            <div className="flex items-center gap-1.5 bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-2.5 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#5F6B63]" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-bold text-[#17231B] focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">Semua Status</option>
                <option value="Belum Created">Belum Created</option>
                <option value="Sudah Created">Sudah Created</option>
                <option value="Final Approve">Final Approve</option>
                <option value="Sudah PO">Sudah PO</option>
                <option value="Sudah Close">Sudah Close</option>
              </select>
            </div>

            {/* Filter Tipe */}
            <div className="flex items-center gap-1.5 bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-2.5 py-1.5 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#5F6B63]" />
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-bold text-[#17231B] focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">Semua Tipe</option>
                <option value="wbs">Tipe WBS</option>
                <option value="mo">Tipe MO</option>
                <option value="io">Tipe IO</option>
              </select>
            </div>

            {/* Limit Selector */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#17231B] focus:outline-none cursor-pointer"
            >
              <option value={25}>25 / hal</option>
              <option value={50}>50 / hal</option>
              <option value={100}>100 / hal</option>
            </select>
          </div>
        </div>

        {/* ── BULK ACTIONS FLOATING/BAR ── */}
        {selectedIds.size > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#EAF3EC] border border-[#D5E7DA] rounded-xl p-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-[#16823B]">
              <span className="w-6 h-6 rounded-full bg-[#16823B] text-white flex items-center justify-center text-[11px]">
                {selectedIds.size}
              </span>
              <span>CAPEX terpilih untuk penutupan status</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#5F6B63] hover:bg-black/5 transition-colors cursor-pointer"
              >
                Batal Pilihan
              </button>
              <button
                type="button"
                onClick={() => setModalAction("bulk_close")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0D5224] hover:bg-[#093C1A] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tutup {selectedIds.size} CAPEX (Sudah Close)</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Horizontal Scroll Hint */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-[#89938D] bg-[#F7F9F7] px-2.5 py-1.5 rounded-lg border border-[#DDE5DF]/60">
          <div className="flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#16823B]" />
            <span>Geser horizontal untuk kolom & tombol aksi</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-[#16823B]">
            {totalRecords} Item
          </span>
        </div>

        {/* ── 4. TABLE CONTAINER ── */}
        <div className="border border-[#DDE5DF] rounded-xl overflow-hidden bg-white shadow-2xs">
          <div
            ref={tableScrollRef}
            className="overflow-x-auto max-h-[60vh] sm:max-h-[66vh] overflow-y-auto relative scrollbar-thin divide-y divide-[#DDE5DF]/60"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-[#5F6B63]">
                <RefreshCw className="w-7 h-7 animate-spin text-[#16823B]" />
                <span className="text-xs font-semibold">Memuat daftar status CAPEX...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-2.5">
                <div className="p-3 rounded-full bg-[#F7F9F7] border border-[#DDE5DF]">
                  <AlertCircle className="w-8 h-8 text-[#89938D]/60" />
                </div>
                <p className="text-sm font-bold text-[#17231B]">Tidak ada data CAPEX</p>
                <p className="text-xs text-[#5F6B63] max-w-sm">
                  {debouncedSearch
                    ? `Tidak ada data yang cocok dengan "${debouncedSearch}". Coba kata kunci lain.`
                    : "Tidak ada data pada filter status/tipe yang dipilih."}
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-20 bg-[#F7F9F7] border-b border-[#DDE5DF]">
                  <tr className="text-[#5F6B63] font-bold">
                    {/* 1. Sticky Checkbox Header */}
                    <th className="py-3 px-2.5 text-center whitespace-nowrap sticky left-0 z-30 bg-[#EEF3EF] border-r border-[#DDE5DF] w-[44px] min-w-[44px] max-w-[44px]">
                      <input
                        type="checkbox"
                        checked={allEligibleSelected}
                        onChange={handleToggleSelectAll}
                        disabled={eligibleItemsOnPage.length === 0}
                        className="rounded border-[#DDE5DF] text-[#16823B] focus:ring-[#16823B] cursor-pointer disabled:opacity-30"
                        title="Pilih semua yang siap di-close di halaman ini"
                      />
                    </th>

                    {/* 2. Sticky Row Index Header */}
                    <th className="py-3 px-2 text-center whitespace-nowrap text-[11px] uppercase tracking-wider sticky left-[44px] z-30 bg-[#EEF3EF] border-r border-[#DDE5DF] w-[44px] min-w-[44px] max-w-[44px]">
                      #
                    </th>

                    {/* 3. Sticky Aksi Status Header (Pinned on Left) */}
                    <th className="py-3 px-3 text-center whitespace-nowrap uppercase tracking-wider text-[11px] sticky left-[88px] z-30 bg-[#EEF3EF] border-r border-[#DDE5DF] shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)] w-[136px] min-w-[136px] max-w-[136px]">
                      Aksi Status
                    </th>

                    {/* 4. Status Saat Ini */}
                    <th className="py-3 px-3.5 whitespace-nowrap uppercase tracking-wider text-[11px] text-center">
                      Status Saat Ini
                    </th>

                    {/* 5. CAPEX No & Deskripsi */}
                    <th className="py-3 px-3.5 whitespace-nowrap uppercase tracking-wider text-[11px]">
                      CAPEX No & Deskripsi
                    </th>

                    {/* 6. Tipe */}
                    <th className="py-3 px-3.5 whitespace-nowrap uppercase tracking-wider text-[11px] text-center">
                      Tipe
                    </th>

                    {/* 7. IO / WBS / MO */}
                    <th className="py-3 px-3.5 whitespace-nowrap uppercase tracking-wider text-[11px]">
                      IO / WBS / MO
                    </th>

                    {/* 8. Cost Center */}
                    <th className="py-3 px-3.5 whitespace-nowrap uppercase tracking-wider text-[11px]">
                      Cost Center
                    </th>

                    {/* 9. Nomor PR */}
                    <th className="py-3 px-3.5 whitespace-nowrap uppercase tracking-wider text-[11px]">
                      Nomor PR
                    </th>

                    {/* 10. Nilai Amount */}
                    <th className="py-3 px-3.5 whitespace-nowrap uppercase tracking-wider text-[11px] text-right">
                      Nilai Amount (Rp)
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#DDE5DF]/60 bg-white">
                  {items.map((item, idx) => {
                    const rowNumber = (page - 1) * limit + idx + 1;
                    const ioWbsMo = getIoWbsMoDisplay(item);
                    const isSelected = selectedIds.has(item.idTotal);

                    // Solid opaque background colors for frozen/sticky cells (no transparency)
                    const frozenBgClass = isSelected
                      ? "bg-[#EAF3EC] group-hover:bg-[#DFEDE2]"
                      : item.isClosed
                      ? "bg-[#F7F9F7] group-hover:bg-[#EEF3F0]"
                      : "bg-white group-hover:bg-[#F2F5F3]";

                    return (
                      <tr
                        key={item.idTotal}
                        className={`transition-colors group ${
                          isSelected
                            ? "bg-[#EAF3EC] hover:bg-[#DFEDE2]"
                            : item.isClosed
                            ? "bg-[#F7F9F7] hover:bg-[#EEF3F0]"
                            : "bg-white hover:bg-[#F2F5F3]"
                        }`}
                      >
                        {/* 1. Sticky Checkbox Cell */}
                        <td
                          className={`py-2.5 px-2.5 text-center whitespace-nowrap sticky left-0 z-10 border-r border-[#DDE5DF] w-[44px] min-w-[44px] max-w-[44px] ${frozenBgClass}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!item.eligible}
                            onChange={() => handleToggleSelect(item.idTotal)}
                            className="rounded border-[#DDE5DF] text-[#16823B] focus:ring-[#16823B] cursor-pointer disabled:opacity-20"
                          />
                        </td>

                        {/* 2. Sticky Row Index */}
                        <td
                          className={`py-2.5 px-2 text-center whitespace-nowrap font-mono text-[11px] text-[#89938D] sticky left-[44px] z-10 border-r border-[#DDE5DF] select-none font-semibold w-[44px] min-w-[44px] max-w-[44px] ${frozenBgClass}`}
                        >
                          {rowNumber}
                        </td>

                        {/* 3. Sticky Aksi Status Cell (Pinned on Left) */}
                        <td
                          className={`py-2.5 px-2.5 text-center whitespace-nowrap sticky left-[88px] z-10 border-r border-[#DDE5DF] shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)] w-[136px] min-w-[136px] max-w-[136px] ${frozenBgClass}`}
                        >
                          {item.isClosed ? (
                            <button
                              type="button"
                              onClick={() => {
                                setTargetItem(item);
                                setModalAction("reopen");
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#5F6B63] hover:text-[#17231B] bg-white hover:bg-[#F7F9F7] border border-[#DDE5DF] transition-all cursor-pointer shadow-2xs"
                              title="Buka kembali status CAPEX ini"
                            >
                              <RotateCcw className="w-3 h-3 text-[#16823B]" />
                              <span>Buka Kembali</span>
                            </button>
                          ) : item.eligible ? (
                            <button
                              type="button"
                              onClick={() => {
                                setTargetItem(item);
                                setModalAction("close");
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-[#0D5224] hover:bg-[#093C1A] transition-all cursor-pointer shadow-xs active:scale-95"
                              title={`Ubah status menjadi Sudah Close (${item.closeCriteria === "Sudah_PO" ? "Sudah PO" : "WBS/MO Final Approve"})`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Sudah Close</span>
                            </button>
                          ) : (
                            <span
                              className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-[#89938D] bg-neutral-100 border border-neutral-200 select-none cursor-help"
                              title={item.eligibilityReason}
                            >
                              Belum Bisa
                            </span>
                          )}
                        </td>

                        {/* 4. Status Saat Ini */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap text-center">
                          <StatusBadge status={item.statusCapex} size="sm" />
                        </td>

                        {/* 5. CAPEX No & Deskripsi */}
                        <td className="py-2.5 px-3.5 max-w-[260px]">
                          <div className="font-bold text-[#17231B] text-xs truncate">
                            {item.capexNo || <span className="text-[#89938D] italic">Non-CAPEX</span>}
                          </div>
                          <div className="text-[11px] text-[#5F6B63] truncate mt-0.5" title={item.description || ""}>
                            {item.description || "—"}
                          </div>
                        </td>

                        {/* 6. Tipe Badge */}
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${
                              item.detectedType === "WBS"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : item.detectedType === "MO"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {item.detectedType}
                          </span>
                        </td>

                        {/* 7. IO / WBS / MO */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-xs text-[#17231B]">
                          {ioWbsMo.value}
                        </td>

                        {/* 8. Cost Center */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap text-xs text-[#17231B]" title={item.costCenter || ""}>
                          {item.costCenter ? (
                            <div>
                              <span className="font-semibold">{getCostCenterLabel(item.costCenter)}</span>
                              {item.costCenter !== getCostCenterLabel(item.costCenter) && (
                                <span className="block text-[10px] text-[#89938D] font-mono">{item.costCenter}</span>
                              )}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* 9. Nomor PR */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-xs text-[#17231B]">
                          {item.nomorPr || "—"}
                        </td>

                        {/* 10. Nilai Amount */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap text-right font-mono text-xs font-semibold text-[#17231B]">
                          {item.amount != null ? formatCurrencyRp(item.amount) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── 5. PAGINATION FOOTER ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-[#5F6B63]">
          <div className="text-center sm:text-left text-[11px] sm:text-xs">
            Menampilkan <span className="font-bold text-[#17231B]">{formatNumberId(startRecord)}</span> -{" "}
            <span className="font-bold text-[#17231B]">{formatNumberId(endRecord)}</span> dari{" "}
            <span className="font-bold text-[#17231B]">{formatNumberId(totalRecords)}</span> data
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={page <= 1 || loading}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F9F7] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-4 h-4 text-[#17231B]" />
            </button>

            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F9F7] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer font-semibold transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Sebelumnya</span>
            </button>

            <div className="px-2.5 py-1 rounded-xl bg-[#F7F9F7] border border-[#DDE5DF] text-xs font-bold text-[#17231B] min-w-[70px] text-center">
              {page} / {Math.max(1, totalPages)}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F9F7] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer font-semibold transition-colors shadow-2xs"
            >
              <span className="hidden xs:inline">Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages || loading}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F9F7] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="w-4 h-4 text-[#17231B]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 6. CONFIRMATION MODALS ── */}

      {/* MODAL 1: SINGLE CLOSE */}
      {modalAction === "close" && targetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#DDE5DF] space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 pb-3 border-b border-[#DDE5DF]">
              <div className="p-2 rounded-xl bg-[#0D5224] text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#17231B]">
                  Konfirmasi Tutup CAPEX
                </h3>
                <p className="text-xs text-[#5F6B63]">Ubah status menjadi Sudah Close</p>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-[#F7F9F7] p-3.5 rounded-xl border border-[#DDE5DF]">
              <div className="flex justify-between">
                <span className="text-[#5F6B63]">CAPEX No:</span>
                <span className="font-bold text-[#17231B]">{targetItem.capexNo || "Non-CAPEX"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F6B63]">Deskripsi:</span>
                <span className="font-medium text-[#17231B] text-right truncate max-w-[200px]" title={targetItem.description || ""}>
                  {targetItem.description || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F6B63]">Tipe / Nomor:</span>
                <span className="font-bold text-[#17231B]">
                  {targetItem.detectedType} ({getIoWbsMoDisplay(targetItem).value})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F6B63]">Status Saat Ini:</span>
                <StatusBadge status={targetItem.statusCapex} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F6B63]">Syarat Terpenuhi:</span>
                <span className="font-bold text-emerald-700">
                  {targetItem.closeCriteria === "Sudah_PO"
                    ? "Sudah PO"
                    : `Tipe ${targetItem.detectedType} Final Approve`}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#5F6B63] block mb-1">
                Dicatat Oleh (Admin PIC):
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                placeholder="Nama Admin"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalAction(null);
                  setTargetItem(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5F6B63] hover:bg-[#F7F9F7] border border-[#DDE5DF] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeStatusUpdate("close", [targetItem.idTotal])}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0D5224] hover:bg-[#093C1A] shadow-xs cursor-pointer active:scale-95"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Ubah ke Sudah Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK CLOSE */}
      {modalAction === "bulk_close" && selectedIds.size > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#DDE5DF] space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 pb-3 border-b border-[#DDE5DF]">
              <div className="p-2 rounded-xl bg-[#0D5224] text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#17231B]">
                  Tutup Massal ({selectedIds.size} CAPEX)
                </h3>
                <p className="text-xs text-[#5F6B63]">
                  Konfirmasi pengubahan status secara serentak
                </p>
              </div>
            </div>

            <p className="text-xs text-[#5F6B63]">
              Anda akan mengubah status <strong className="text-[#17231B]">{selectedIds.size} proyek CAPEX</strong> terpilih menjadi{" "}
              <strong className="text-[#0D5224]">Sudah Close</strong>. Seluruh data yang dipilih telah diverifikasi memenuhi kriteria penutupan (Sudah PO atau WBS/MO Final Approve).
            </p>

            <div>
              <label className="text-[11px] font-bold text-[#5F6B63] block mb-1">
                Dicatat Oleh (Admin PIC):
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                placeholder="Nama Admin"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5F6B63] hover:bg-[#F7F9F7] border border-[#DDE5DF] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeStatusUpdate("close", Array.from(selectedIds))}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0D5224] hover:bg-[#093C1A] shadow-xs cursor-pointer active:scale-95"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Tutup {selectedIds.size} CAPEX</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REOPEN */}
      {modalAction === "reopen" && targetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#DDE5DF] space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 pb-3 border-b border-[#DDE5DF]">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#17231B]">
                  Buka Kembali Status CAPEX
                </h3>
                <p className="text-xs text-[#5F6B63]">Batalkan status Sudah Close</p>
              </div>
            </div>

            <p className="text-xs text-[#5F6B63]">
              Apakah Anda yakin ingin membatalkan status <strong className="text-[#0D5224]">Sudah Close</strong> untuk CAPEX{" "}
              <strong className="text-[#17231B]">{targetItem.capexNo || targetItem.description || "ini"}</strong>? Status akan dipulihkan kembali ke status operasional sebelumnya.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalAction(null);
                  setTargetItem(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5F6B63] hover:bg-[#F7F9F7] border border-[#DDE5DF] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeStatusUpdate("reopen", [targetItem.idTotal])}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs cursor-pointer active:scale-95"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Buka Kembali</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
