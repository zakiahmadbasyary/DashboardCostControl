"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Layers,
  FileSpreadsheet,
  Users,
  Building,
  X,
  SlidersHorizontal,
  ArrowRightLeft,
  Plus,
  Pencil,
  AlertCircle,
  CheckCircle2,
  Save,
  Trash2,
} from "lucide-react";
import { formatCurrencyRp, formatNumberId } from "@/lib/formatters";

type CapexTabType = "created" | "po" | "budget" | "purchasing" | "kategori" | "approver" | "cost_center";

interface TabItem {
  key: CapexTabType;
  label: string;
  shortLabel: string;
  icon: typeof TableIcon;
  description: string;
}

const TABS: TabItem[] = [
  { key: "created", label: "Created (Harian)", shortLabel: "Created", icon: FileSpreadsheet, description: "Data registrasi transaksi CAPEX harian" },
  { key: "po", label: "PO (Harian)", shortLabel: "PO", icon: TableIcon, description: "Purchase Order terkait transaksi CAPEX" },
  { key: "budget", label: "Budget (Tahunan)", shortLabel: "Budget", icon: Layers, description: "Pagu anggaran CAPEX tahunan" },
  { key: "purchasing", label: "Purchasing", shortLabel: "Purchasing", icon: Building, description: "Data departemen purchasing/pengadaan" },
  { key: "kategori", label: "Kategori", shortLabel: "Kategori", icon: TableIcon, description: "Klasifikasi dan mapping kategori CAPEX" },
  { key: "approver", label: "User Approver", shortLabel: "Approver", icon: Users, description: "Daftar approver & PIC persetujuan" },
  { key: "cost_center", label: "Master Cost Center", shortLabel: "Cost Center", icon: Building, description: "Master kamus kode cost center dan keterangannya" },
];

// Helper to filter out internal database ID columns
function isIdColumn(col: string): boolean {
  const lower = col.toLowerCase();
  if (lower === "id") return true;
  if (lower.startsWith("id_") || lower.endsWith("_id")) return true;
  if (/^id[A-Z0-9]/.test(col)) return true;
  if (
    lower === "idcreated" ||
    lower === "idbudget" ||
    lower === "idtotal" ||
    lower === "idpo" ||
    lower === "idpurchasing" ||
    lower === "idkategori" ||
    lower === "idapprover"
  ) {
    return true;
  }
  return false;
}

// Helper to extract identifier key from record
function getRowKey(tab: CapexTabType, row: Record<string, unknown>): string {
  if (tab === "budget") return String(row.idBudget ?? row.id_budget ?? "");
  if (tab === "kategori") return String(row.capexNo ?? row.capex_no ?? "");
  if (tab === "approver") return String(row.kodeApprover ?? row.kode_approver ?? "");
  if (tab === "cost_center") return String(row.kodeCostCenter ?? row.kode_cost_center ?? "");
  return "";
}

export default function CapexAdminPreviewPage() {
  const [activeTab, setActiveTab] = useState<CapexTabType>("created");
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);

  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Modal State for Add & Edit
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [activeRowId, setActiveRowId] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal State for Reset Data
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);

  // Handle Reset Data
  const handleConfirmReset = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: activeTab }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || "Gagal mengosongkan data tabel.");
      }

      setToastMessage({ text: result.message, type: "success" });
      setResetModalOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setToastMessage({ text: err?.message || "Terjadi kesalahan saat reset data.", type: "error" });
    } finally {
      setResetting(false);
    }
  };

  const tableScrollRef = useRef<HTMLDivElement>(null);

  // Debounce search input (300ms) to ensure smooth input without lag
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Reset page and search on tab change
  const handleTabChange = (tab: CapexTabType) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = 0;
      tableScrollRef.current.scrollTop = 0;
    }
  };

  // Fetch data from API
  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          table: activeTab,
          search: debouncedSearch,
          page: String(page),
          limit: String(limit),
        });

        const res = await fetch(`/api/admin/preview?${queryParams.toString()}`);
        const result = await res.json();

        if (!isCancelled) {
          if (result.success) {
            setTableData(result.data || []);
            setTotalRecords(result.pagination?.total || 0);
            setTotalPages(result.pagination?.totalPages || 1);
          } else {
            setTableData([]);
            setTotalRecords(0);
            setTotalPages(1);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Error fetching preview data:", err);
          setTableData([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [activeTab, debouncedSearch, page, limit, refreshKey]);

  // Calculate record range
  const startRecord = totalRecords > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(page * limit, totalRecords);

  const activeTabMeta = useMemo(() => {
    return TABS.find((t) => t.key === activeTab) || TABS[0];
  }, [activeTab]);

  // Check if current tab supports Edit & Add
  const canEdit = useMemo(() => {
    return ["budget", "kategori", "approver", "cost_center"].includes(activeTab);
  }, [activeTab]);

  const canAdd = useMemo(() => {
    return ["kategori", "approver", "cost_center"].includes(activeTab);
  }, [activeTab]);

  // Extract column keys from first item, excluding internal IDs and created_at/updated_at for Cost Center
  const columnKeys = useMemo(() => {
    if (tableData.length === 0) return [];
    return Object.keys(tableData[0]).filter((col) => {
      if (isIdColumn(col)) return false;
      // Master Cost Center: jangan tampilkan created_at dan updated_at
      if (activeTab === "cost_center") {
        const lower = col.toLowerCase();
        if (
          lower === "createdat" ||
          lower === "created_at" ||
          lower === "updatedat" ||
          lower === "updated_at"
        ) {
          return false;
        }
      }
      return true;
    });
  }, [tableData, activeTab]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setModalMode("add");
    setActiveRowId("");
    setFormError(null);

    if (activeTab === "kategori") {
      setFormData({
        capexNo: "",
        description: "",
        costCenter: "",
        kategori: "",
        komoditi: "",
      });
    } else if (activeTab === "approver") {
      setFormData({
        kodeApprover: "",
        nama: "",
      });
    } else if (activeTab === "cost_center") {
      setFormData({
        kodeCostCenter: "",
        keterangan: "",
      });
    }
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (row: Record<string, unknown>) => {
    const rowId = getRowKey(activeTab, row);
    if (!rowId) {
      alert("Kunci baris data tidak ditemukan.");
      return;
    }

    setModalMode("edit");
    setActiveRowId(rowId);
    setFormError(null);

    if (activeTab === "budget") {
      setFormData({
        capexNo: row.capexNo ?? "",
        description: row.description ?? "",
        quantity: row.quantity ?? "",
        amount: row.amount ?? "",
        io: row.io ?? "",
        mo: row.mo ?? "",
        wbs: row.wbs ?? "",
        costCenter: row.costCenter ?? "",
        groupCapex: row.groupCapex ?? "",
        kategori: row.kategori ?? "",
        komoditi: row.komoditi ?? "",
      });
    } else if (activeTab === "kategori") {
      setFormData({
        capexNo: row.capexNo ?? "",
        description: row.description ?? "",
        costCenter: row.costCenter ?? "",
        kategori: row.kategori ?? "",
        komoditi: row.komoditi ?? "",
      });
    } else if (activeTab === "approver") {
      setFormData({
        kodeApprover: row.kodeApprover ?? "",
        nama: row.nama ?? "",
      });
    } else if (activeTab === "cost_center") {
      setFormData({
        kodeCostCenter: row.kodeCostCenter ?? "",
        keterangan: row.keterangan ?? "",
      });
    }

    setModalOpen(true);
  };

  // Handle Modal Submit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      if (modalMode === "add") {
        if (activeTab === "kategori" && !String(formData.capexNo || "").trim()) {
          throw new Error("Nomor CAPEX wajib diisi.");
        }
        if (activeTab === "approver" && !String(formData.kodeApprover || "").trim()) {
          throw new Error("Kode Approver wajib diisi.");
        }
        if (activeTab === "cost_center") {
          if (!String(formData.kodeCostCenter || "").trim()) {
            throw new Error("Kode Cost Center wajib diisi.");
          }
          if (!String(formData.keterangan || "").trim()) {
            throw new Error("Keterangan Cost Center wajib diisi.");
          }
        }

        const res = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            table: activeTab,
            data: formData,
          }),
        });

        const result = await res.json();
        if (!result.success) {
          throw new Error(result.message || "Gagal menambahkan data.");
        }

        setToastMessage({ text: result.message, type: "success" });
        setModalOpen(false);
        setRefreshKey((k) => k + 1);
      } else {
        // Edit mode
        if (activeTab === "cost_center" && !String(formData.keterangan || "").trim()) {
          throw new Error("Keterangan Cost Center wajib diisi.");
        }

        const res = await fetch("/api/admin/preview", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            table: activeTab,
            id: activeRowId,
            data: formData,
          }),
        });

        const result = await res.json();
        if (!result.success) {
          throw new Error(result.message || "Gagal memperbarui data.");
        }

        setToastMessage({ text: result.message, type: "success" });
        setModalOpen(false);
        setRefreshKey((k) => k + 1);
      }
    } catch (err: any) {
      setFormError(err?.message || "Terjadi kesalahan saat memproses data.");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if column is numeric or currency
  const isCurrencyOrNumber = (colName: string, val: unknown): boolean => {
    if (typeof val === "number") {
      const colLower = colName.toLowerCase();
      return /amount|budget|actual|po_value|povalue|nominal|nilai|harga|biaya|total|saldo|sisa/i.test(colLower);
    }
    return false;
  };

  // Format cell value intelligently
  const formatCellValue = (colName: string, cellVal: unknown, row?: Record<string, unknown>) => {
    if (cellVal === null || cellVal === undefined || cellVal === "") {
      if (
        (activeTab === "kategori" && colName.toLowerCase() === "kategori") ||
        (activeTab === "approver" && colName.toLowerCase() === "nama") ||
        (activeTab === "cost_center" && colName.toLowerCase() === "keterangan")
      ) {
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
            Belum diisi
          </span>
        );
      }
      return <span className="text-[#89938D] italic select-none">—</span>;
    }

    if (
      activeTab === "cost_center" &&
      colName.toLowerCase() === "keterangan" &&
      row &&
      String(cellVal).trim() === String(row.kodeCostCenter ?? row.kode_cost_center).trim()
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-[#17231B]">
          <span>{String(cellVal)}</span>
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
            Perlu dilengkapi
          </span>
        </span>
      );
    }

    if (typeof cellVal === "boolean") {
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
            cellVal ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-neutral-100 text-neutral-600 border border-neutral-200"
          }`}
        >
          {cellVal ? "Ya" : "Tidak"}
        </span>
      );
    }

    // Number & Currency
    if (typeof cellVal === "number") {
      if (isCurrencyOrNumber(colName, cellVal)) {
        return (
          <span className="font-mono text-xs font-semibold text-[#17231B]">
            {formatCurrencyRp(cellVal)}
          </span>
        );
      }
      return <span className="font-mono text-xs text-[#17231B]">{formatNumberId(cellVal)}</span>;
    }

    const colLower = colName.toLowerCase();

    // Kolom kode approver, kode, nomor, id, atau teks identitas TIDAK BOLEH dikonversi ke tanggal
    const isExplicitTextCode =
      colLower.includes("kode") ||
      colLower.includes("approver") ||
      colLower.includes("code") ||
      colLower.includes("pgr") ||
      colLower.includes("io") ||
      colLower.includes("mo") ||
      colLower.includes("wbs") ||
      colLower.includes("no");

    if (isExplicitTextCode) {
      return <span>{String(cellVal)}</span>;
    }

    // Date: hanya kolom tanggal sebenarnya & format tanggal yang sesuai
    const isDateCol =
      /date_approve|dateapprove|req_date|reqdate|tanggal_pr|tanggalpr|request_date|requestdate|created_at|updated_at/i.test(colName) ||
      (/(date|tanggal)/i.test(colName) && !/(kode|code|approver)/i.test(colName));

    const isIsoDate =
      typeof cellVal === "string" &&
      /^\d{4}-\d{2}-\d{2}(T|\b)/.test(cellVal.trim());

    const isFormattedDateString =
      typeof cellVal === "string" &&
      /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/.test(cellVal.trim());

    if ((isIsoDate || (isDateCol && isFormattedDateString)) && typeof cellVal === "string") {
      const d = new Date(cellVal.trim());
      if (!isNaN(d.getTime())) {
        const day = String(d.getUTCDate()).padStart(2, "0");
        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
        const year = d.getUTCFullYear();
        return (
          <span className="font-mono text-[#16823B] bg-[#EAF3EC] px-2 py-0.5 rounded-md text-[11px] font-semibold border border-[#D5E7DA] whitespace-nowrap">
            {`${day}/${month}/${year}`}
          </span>
        );
      }
    }

    // Status strings
    const strVal = String(cellVal);
    if (/status/i.test(colName)) {
      const lower = strVal.toLowerCase();
      let colorClass = "bg-neutral-100 text-neutral-700 border-neutral-200";
      if (lower.includes("approved") || lower.includes("disetujui") || lower.includes("selesai") || lower.includes("close")) {
        colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      } else if (lower.includes("pending") || lower.includes("menunggu") || lower.includes("progress")) {
        colorClass = "bg-amber-50 text-amber-700 border-amber-200";
      } else if (lower.includes("reject") || lower.includes("ditolak") || lower.includes("batal")) {
        colorClass = "bg-rose-50 text-rose-700 border-rose-200";
      }
      return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${colorClass}`}>
          {strVal}
        </span>
      );
    }

    // Long strings
    if (strVal.length > 45) {
      return (
        <span className="block max-w-[280px] truncate cursor-help" title={strVal}>
          {strVal}
        </span>
      );
    }

    return <span>{strVal}</span>;
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── 1. PAGE HEADER (RESPONSIVE) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#DDE5DF] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-extrabold text-[#17231B] tracking-tight">
              Preview Data CAPEX
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF3EC] text-[#16823B] font-bold text-xs border border-[#D5E7DA]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16823B] animate-pulse" />
              {activeTabMeta.shortLabel} · {formatNumberId(totalRecords)} Data
            </span>
          </div>
          <p className="text-xs text-[#5F6B63] mt-1 line-clamp-1 sm:line-clamp-none">
            {activeTabMeta.description}
          </p>
        </div>

        {/* Action Buttons: Add, Reset & Refresh */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
          {canAdd && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#16823B] hover:bg-[#126b30] shadow-xs transition-all cursor-pointer active:scale-95"
              title={`Tambah ${activeTabMeta.shortLabel}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah {activeTabMeta.shortLabel}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            disabled={loading || totalRecords === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-2xs"
            title={`Kosongkan data pada tabel ${activeTabMeta.shortLabel}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>

          <button
            type="button"
            onClick={() => setRefreshKey((prev) => prev + 1)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#16823B] bg-[#EAF3EC] hover:bg-[#D5E7DA] border border-[#D5E7DA] transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            title="Muat ulang data tabel"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* ── 2. CONTROLS CARD: TABS & SEARCH & LIMIT ── */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3.5 sm:space-y-4">
        {/* Navigation Tabs */}
        <div>
          {/* Mobile Select (sm:hidden) */}
          <div className="sm:hidden">
            <label className="text-[10px] font-bold text-[#89938D] uppercase tracking-wider mb-1 block">
              Pilih Tabel Database
            </label>
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value as CapexTabType)}
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
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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

        {/* Search Bar & Rows Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Cari di tabel ${activeTabMeta.shortLabel}...`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-9 pr-8 py-2 text-xs text-[#17231B] placeholder-[#89938D] focus:outline-none focus:border-[#16823B] transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#89938D] hover:text-[#17231B] hover:bg-neutral-200 transition-colors"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Rows Limit Selector */}
          <div className="flex items-center justify-end gap-2 shrink-0 text-xs text-[#5F6B63]">
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

        {/* Mobile Horizontal Scroll Hint */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-[#89938D] bg-[#F7F9F7] px-2.5 py-1.5 rounded-lg border border-[#DDE5DF]/60">
          <div className="flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#16823B]" />
            <span>Geser horizontal untuk kolom lain</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-[#16823B]">
            {columnKeys.length} Kolom
          </span>
        </div>

        {/* ── 3. DATA TABLE CARD (STICKY HEADER + STICKY ROW NO + STICKY ACTION) ── */}
        <div className="border border-[#DDE5DF] rounded-xl overflow-hidden bg-white shadow-2xs">
          <div
            ref={tableScrollRef}
            className="overflow-x-auto max-h-[58vh] sm:max-h-[64vh] overflow-y-auto relative scrollbar-thin divide-y divide-[#DDE5DF]/60"
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
                  {debouncedSearch
                    ? `Tidak ada hasil pencarian untuk "${debouncedSearch}". Coba kata kunci lain.`
                    : `Belum ada data pada tabel ${activeTabMeta.label}. Silakan tambah data atau upload file Excel.`}
                </p>
                {debouncedSearch && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="mt-1 px-3 py-1.5 rounded-xl bg-[#EAF3EC] text-[#16823B] font-bold text-xs hover:bg-[#D5E7DA] transition-colors cursor-pointer"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                {/* Table Header (Sticky top) */}
                <thead className="sticky top-0 z-20 bg-[#F7F9F7] backdrop-blur-md shadow-2xs border-b border-[#DDE5DF]">
                  <tr className="text-[#5F6B63] font-bold">
                    {/* Sticky Row Number Header */}
                    <th className="py-3 px-3 text-center whitespace-nowrap text-[11px] uppercase tracking-wider sticky left-0 z-30 bg-[#F7F9F7] border-r border-[#DDE5DF] w-12 min-w-[48px]">
                      #
                    </th>
                    {/* Action Header Column (Left-positioned) */}
                    {canEdit && (
                      <th className="py-3 px-3 text-center whitespace-nowrap text-[11px] uppercase tracking-wider sticky left-12 z-30 bg-[#F7F9F7] border-r border-[#DDE5DF] w-20 min-w-[76px]">
                        Aksi
                      </th>
                    )}
                    {columnKeys.map((col) => {
                      const isNum = isCurrencyOrNumber(col, tableData[0]?.[col]);
                      return (
                        <th
                          key={col}
                          className={`py-3 px-3.5 whitespace-nowrap uppercase tracking-wider text-[11px] font-bold ${
                            isNum ? "text-right" : "text-left"
                          }`}
                        >
                          {col}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-[#DDE5DF]/60 bg-white">
                  {tableData.map((row, idx) => {
                    const rowNumber = (page - 1) * limit + idx + 1;
                    return (
                      <tr key={idx} className="hover:bg-[#F7F9F7]/70 transition-colors group">
                        {/* Sticky Row Number */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono text-[11px] text-[#89938D] sticky left-0 z-10 bg-white group-hover:bg-[#F7F9F7] border-r border-[#DDE5DF] select-none font-semibold w-12 min-w-[48px]">
                          {rowNumber}
                        </td>
                        {/* Action Body Column (Left-positioned) */}
                        {canEdit && (
                          <td className="py-2.5 px-3 text-center whitespace-nowrap sticky left-12 z-10 bg-white group-hover:bg-[#F7F9F7] border-r border-[#DDE5DF] w-20 min-w-[76px]">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(row)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#16823B] bg-[#EAF3EC] hover:bg-[#16823B] hover:text-white border border-[#D5E7DA] transition-all cursor-pointer active:scale-95 shadow-2xs"
                              title="Edit Data"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          </td>
                        )}
                        {columnKeys.map((colName) => {
                          const cellVal = row[colName];
                          const isNum = isCurrencyOrNumber(colName, cellVal);
                          return (
                            <td
                              key={colName}
                              className={`py-2.5 px-3.5 whitespace-nowrap text-[#17231B] text-xs ${
                                isNum ? "text-right font-mono" : "text-left"
                              }`}
                            >
                              {formatCellValue(colName, cellVal, row)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── 4. PAGINATION FOOTER ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-[#5F6B63]">
          {/* Records Counter */}
          <div className="text-center sm:text-left text-[11px] sm:text-xs">
            Menampilkan <span className="font-bold text-[#17231B]">{formatNumberId(startRecord)}</span> -{" "}
            <span className="font-bold text-[#17231B]">{formatNumberId(endRecord)}</span> dari{" "}
            <span className="font-bold text-[#17231B]">{formatNumberId(totalRecords)}</span> data
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* First Page */}
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={page <= 1 || loading}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F9F7] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-4 h-4 text-[#17231B]" />
            </button>

            {/* Prev Page */}
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F9F7] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer font-semibold transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Sebelumnya</span>
            </button>

            {/* Current Page Badge */}
            <div className="px-2.5 py-1 rounded-xl bg-[#F7F9F7] border border-[#DDE5DF] text-xs font-bold text-[#17231B] min-w-[70px] text-center">
              {page} / {Math.max(1, totalPages)}
            </div>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F9F7] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer font-semibold transition-colors shadow-2xs"
            >
              <span className="hidden xs:inline">Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
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

      {/* ── 5. MODAL FORM: ADD / EDIT DATA ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#DDE5DF] rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#DDE5DF] bg-[#F7F9F7]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EAF3EC] text-[#16823B] flex items-center justify-center border border-[#D5E7DA]">
                  {modalMode === "add" ? <Plus className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#17231B]">
                    {modalMode === "add" ? "Tambah Data" : "Edit Data"} {activeTabMeta.shortLabel}
                  </h3>
                  <p className="text-[11px] text-[#5F6B63]">
                    {modalMode === "add" ? "Lengkapi formulir untuk menambahkan data baru." : "Perbarui informasi data yang dipilih."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setModalOpen(false)}
                disabled={submitting}
                className="p-1.5 rounded-lg text-[#89938D] hover:text-[#17231B] hover:bg-neutral-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Tab: Cost Center */}
              {activeTab === "cost_center" && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                      Kode Cost Center <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={modalMode === "edit" || submitting}
                      value={formData.kodeCostCenter || ""}
                      onChange={(e) => setFormData({ ...formData, kodeCostCenter: e.target.value })}
                      placeholder="Contoh: 1101, CC_FINANCE"
                      className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
                    />
                    {modalMode === "edit" && (
                      <span className="text-[10px] text-[#89938D] mt-1 block">
                        Kode Cost Center adalah Primary Key dan tidak dapat diubah.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                      Keterangan / Nama Bagian <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={submitting}
                      value={formData.keterangan || ""}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      placeholder="Contoh: Bagian Keuangan & Akuntansi"
                      className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                    />
                  </div>
                </div>
              )}

              {/* Form Tab: Approver */}
              {activeTab === "approver" && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                      Kode Approver <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={modalMode === "edit" || submitting}
                      value={formData.kodeApprover || ""}
                      onChange={(e) => setFormData({ ...formData, kodeApprover: e.target.value })}
                      placeholder="Contoh: APV01, KADIV"
                      className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
                    />
                    {modalMode === "edit" && (
                      <span className="text-[10px] text-[#89938D] mt-1 block">
                        Kode Approver adalah Primary Key dan tidak dapat diubah.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                      Nama Lengkap / Jabatan Approver
                    </label>
                    <input
                      type="text"
                      disabled={submitting}
                      value={formData.nama || ""}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      placeholder="Contoh: Budi Santoso (Kadiv Teknik)"
                      className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                    />
                  </div>
                </div>
              )}

              {/* Form Tab: Kategori */}
              {activeTab === "kategori" && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                      Nomor CAPEX <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={modalMode === "edit" || submitting}
                      value={formData.capexNo || ""}
                      onChange={(e) => setFormData({ ...formData, capexNo: e.target.value })}
                      placeholder="Contoh: CPX-2024-001"
                      className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B] disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
                    />
                    {modalMode === "edit" && (
                      <span className="text-[10px] text-[#89938D] mt-1 block">
                        Nomor CAPEX adalah Primary Key dan tidak dapat diubah.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                      Deskripsi
                    </label>
                    <input
                      type="text"
                      disabled={submitting}
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Contoh: Pengadaan Mesin Turbin"
                      className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                        Cost Center
                      </label>
                      <input
                        type="text"
                        disabled={submitting}
                        value={formData.costCenter || ""}
                        onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                        placeholder="Contoh: 1102"
                        className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                        Kategori
                      </label>
                      <input
                        type="text"
                        disabled={submitting}
                        value={formData.kategori || ""}
                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                        placeholder="Contoh: Mesin & Peralatan"
                        className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                        Komoditi
                      </label>
                      <input
                        type="text"
                        disabled={submitting}
                        value={formData.komoditi || ""}
                        onChange={(e) => setFormData({ ...formData, komoditi: e.target.value })}
                        placeholder="Contoh: Kelapa Sawit"
                        className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Tab: Budget */}
              {activeTab === "budget" && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                        Nomor CAPEX
                      </label>
                      <input
                        type="text"
                        disabled={submitting}
                        value={formData.capexNo || ""}
                        onChange={(e) => setFormData({ ...formData, capexNo: e.target.value })}
                        placeholder="Contoh: CPX-2024-001"
                        className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                        Cost Center
                      </label>
                      <input
                        type="text"
                        disabled={submitting}
                        value={formData.costCenter || ""}
                        onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                        placeholder="Contoh: 1102"
                        className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      rows={2}
                      disabled={submitting}
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Deskripsi kegiatan atau pagu anggaran"
                      className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                        Pagu Anggaran (Amount)
                      </label>
                      <input
                        type="number"
                        step="any"
                        disabled={submitting}
                        value={formData.amount ?? ""}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0"
                        className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                      />
                      <span className="text-[11px] font-mono text-[#16823B] font-semibold mt-1 block">
                        {formatCurrencyRp(Number(formData.amount) || 0)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        step="any"
                        disabled={submitting}
                        value={formData.quantity ?? ""}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="0"
                        className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                        IO (Internal Order)
                      </label>
                      <input
                        type="text"
                        disabled={submitting}
                        value={formData.io || ""}
                        onChange={(e) => setFormData({ ...formData, io: e.target.value })}
                        placeholder="IO..."
                        className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                        MO (Maint. Order)
                      </label>
                      <input
                        type="text"
                        disabled={submitting}
                        value={formData.mo || ""}
                        onChange={(e) => setFormData({ ...formData, mo: e.target.value })}
                        placeholder="MO..."
                        className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                        WBS Element
                      </label>
                      <input
                        type="text"
                        disabled={submitting}
                        value={formData.wbs || ""}
                        onChange={(e) => setFormData({ ...formData, wbs: e.target.value })}
                        placeholder="WBS..."
                        className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                        Group CAPEX
                      </label>
                      <input
                        type="text"
                        disabled={submitting}
                        value={formData.groupCapex || ""}
                        onChange={(e) => setFormData({ ...formData, groupCapex: e.target.value })}
                        placeholder="Group..."
                        className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                        Kategori
                      </label>
                      <input
                        type="text"
                        disabled={submitting}
                        value={formData.kategori || ""}
                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                        placeholder="Kategori..."
                        className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6B63] mb-1">
                        Komoditi
                      </label>
                      <input
                        type="text"
                        disabled={submitting}
                        value={formData.komoditi || ""}
                        onChange={(e) => setFormData({ ...formData, komoditi: e.target.value })}
                        placeholder="Komoditi..."
                        className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs font-semibold text-[#17231B] focus:outline-none focus:border-[#16823B]"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      Menyimpan perubahan data budget akan otomatis menjalankan rekonsiliasi tabel Total agar dashboard analitik tetap sinkron.
                    </span>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DDE5DF]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#5F6B63] bg-[#F7F9F7] hover:bg-[#DDE5DF]/60 border border-[#DDE5DF] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#16823B] hover:bg-[#126b30] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. MODAL CONFIRMATION: RESET DATA ── */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#DDE5DF] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100 bg-rose-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#17231B]">
                    Reset Data {activeTabMeta.label}
                  </h3>
                  <p className="text-[11px] text-rose-600 font-semibold">
                    Tindakan permanen & tidak dapat dibatalkan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !resetting && setResetModalOpen(false)}
                disabled={resetting}
                className="p-1.5 rounded-lg text-[#89938D] hover:text-[#17231B] hover:bg-neutral-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3.5">
              <p className="text-xs text-[#5F6B63] leading-relaxed">
                Apakah Anda yakin ingin menghapus dan mengosongkan seluruh data pada tabel{" "}
                <strong className="text-[#17231B]">{activeTabMeta.label}</strong> yang saat ini berjumlah{" "}
                <strong className="text-rose-600">{formatNumberId(totalRecords)} data</strong>?
              </p>

              {["created", "po", "budget"].includes(activeTab) && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Tabel <strong>Total</strong> akan otomatis direkonsiliasi ulang setelah pengosongan tabel ini.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-[#DDE5DF] bg-[#F7F9F7]">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                disabled={resetting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5F6B63] bg-white hover:bg-neutral-100 border border-[#DDE5DF] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {resetting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengosongkan...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Kosongkan Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold transition-all duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
