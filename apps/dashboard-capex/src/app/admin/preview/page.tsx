"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Layers,
  FileSpreadsheet,
  Users,
  Building,
  CheckCircle,
} from "lucide-react";

type CapexTabType = "created" | "po" | "budget" | "purchasing" | "kategori" | "approver" | "total";

export default function CapexAdminPreviewPage() {
  const [activeTab, setActiveTab] = useState<CapexTabType>("created");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 50;

  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const handleTabChange = (tab: CapexTabType) => {
    setActiveTab(tab);
    setSearchQuery("");
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          table: activeTab,
          search: searchQuery,
          page: String(page),
          limit: String(limit),
        });

        const res = await fetch(`/api/admin/preview?${queryParams.toString()}`);
        const result = await res.json();

        if (result.success) {
          setTableData(result.data || []);
          setTotalRecords(result.pagination?.total || 0);
          setTotalPages(result.pagination?.totalPages || 1);
        } else {
          setTableData([]);
          setTotalRecords(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Error fetching preview data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, searchQuery, page]);

  const startRecord = totalRecords > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(page * limit, totalRecords);

  const tabs: { key: CapexTabType; label: string; icon: typeof TableIcon }[] = [
    { key: "created", label: "Created (Harian)", icon: FileSpreadsheet },
    { key: "po", label: "PO (Harian)", icon: TableIcon },
    { key: "budget", label: "Budget (Tahunan)", icon: Layers },
    { key: "purchasing", label: "Purchasing", icon: Building },
    { key: "kategori", label: "Kategori", icon: TableIcon },
    { key: "approver", label: "User Approver", icon: Users },
    { key: "total", label: "Total Rekonsiliasi", icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#17231B]">Preview Data CAPEX</h1>
        <p className="text-xs text-[#5F6B63] mt-1">
          Inspeksi data mentah dari tabel database (Created, PO, Budget, Purchasing, Kategori, Approver, dan Total Rekonsiliasi).
        </p>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full shrink-0 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#16823B] text-white shadow-xs"
                      : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari data..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-9 pr-4 py-2 text-xs text-[#17231B] placeholder-[#89938D] focus:outline-none focus:border-[#16823B]"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[350px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#5F6B63]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#16823B]" />
              <span className="text-xs font-medium">Memuat data dari database...</span>
            </div>
          ) : tableData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
              <TableIcon className="w-10 h-10 text-[#89938D]/40" />
              <p className="text-sm font-bold text-[#17231B]">Tidak ada data ditemukan</p>
              <p className="text-xs text-[#5F6B63]">
                {searchQuery ? "Coba ubah kata kunci pencarian Anda." : "Belum ada data pada tabel ini."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DDE5DF] bg-[#F7F9F7]/70 text-[#5F6B63] font-bold">
                  {Object.keys(tableData[0] || {}).map((col) => (
                    <th key={col} className="py-3 px-3.5 whitespace-nowrap uppercase tracking-wider text-[11px]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]/60">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F7F9F7]/60 transition-colors">
                    {Object.entries(row).map(([colName, cellVal], cellIdx) => (
                      <td key={cellIdx} className="py-2.5 px-3.5 whitespace-nowrap text-[#17231B]">
                        {cellVal === null || cellVal === undefined ? (
                          <span className="text-[#89938D] italic">-</span>
                        ) : typeof cellVal === "boolean" ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cellVal ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {cellVal ? "Ya" : "Tidak"}
                          </span>
                        ) : typeof cellVal === "string" && cellVal.length > 40 ? (
                          <span title={cellVal}>{cellVal.slice(0, 40)}...</span>
                        ) : (
                          String(cellVal)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#DDE5DF] text-xs text-[#5F6B63]">
          <div>
            Menampilkan <span className="font-bold text-[#17231B]">{startRecord}</span> -{" "}
            <span className="font-bold text-[#17231B]">{endRecord}</span> dari{" "}
            <span className="font-bold text-[#17231B]">{totalRecords}</span> data
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F9F7] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="px-2 font-bold text-[#17231B]">
              {page} / {Math.max(1, totalPages)}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F9F7] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold transition-colors"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
