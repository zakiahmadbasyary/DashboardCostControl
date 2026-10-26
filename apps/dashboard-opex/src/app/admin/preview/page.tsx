"use client";

import { useState, useEffect } from "react";
import { previewService } from "@/services/previewService";
import {
  Search,
  Layers,
  FileSpreadsheet,
  Building2,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-react";

type TabType = "actual" | "budget" | "summary" | "master";

export default function AdminPreviewPage() {
  const [activeTab, setActiveTab] = useState<TabType>("actual");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 50;

  // Data states
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Reset page when tab or search changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
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
        const res = await previewService.getTableData(activeTab, searchQuery, page, limit);
        setTableData(res.data);
        setTotalRecords(res.total);
        setTotalPages(res.totalPages);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#17231B]">Preview Data Database OPEX</h1>
        <p className="text-xs text-[#5F6B63] mt-1">
          Inspeksi data mentah dari tabel database (Data Actual, Data Budget, Summary, dan Master Data) dengan sistem paginasi 50 data per halaman.
        </p>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
          {/* 4 Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full shrink-0 scrollbar-none">
            <button
              onClick={() => handleTabChange("actual")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "actual"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Data Actual</span>
            </button>

            <button
              onClick={() => handleTabChange("budget")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "budget"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Data Budget</span>
            </button>

            <button
              onClick={() => handleTabChange("summary")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "summary"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Summary OPEX</span>
            </button>

            <button
              onClick={() => handleTabChange("master")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "master"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Master Data</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#89938D]" />
            <input
              type="text"
              placeholder="Cari kata kunci..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-9 pr-4 py-2 text-xs text-[#17231B] placeholder-[#89938D] focus:outline-none focus:border-[#16823B] transition-colors"
            />
          </div>
        </div>

        {/* Total Records Counter */}
        <div className="flex items-center justify-between text-xs text-[#5F6B63] px-1">
          <span>
            Menampilkan <strong>{startRecord}</strong> - <strong>{endRecord}</strong> dari{" "}
            <strong>{totalRecords.toLocaleString("id-ID")}</strong> total baris
          </span>
          <span className="text-[11px] font-semibold text-[#16823B] bg-[#EAF3EC] px-2.5 py-1 rounded-lg border border-[#CBE0D1]">
            Halaman {page} dari {totalPages}
          </span>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[#DDE5DF] min-h-[350px]">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs font-semibold text-[#5F6B63]">Memuat data preview...</p>
            </div>
          ) : tableData.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-xs text-[#89938D]">
              <Database className="w-8 h-8 text-[#89938D]/40 mb-2" />
              <p className="font-semibold">Tidak ada data ditemukan.</p>
              <p className="text-[11px] mt-0.5">Coba ubah kata kunci pencarian atau unggah file Excel terkait.</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase text-[10px] font-bold border-b border-[#DDE5DF]">
                {activeTab === "actual" && (
                  <tr>
                    <th className="py-3 px-3">Bulan</th>
                    <th className="py-3 px-3">PG</th>
                    <th className="py-3 px-3">Cost Center</th>
                    <th className="py-3 px-3">Cost Element (CE2)</th>
                    <th className="py-3 px-3">Aktivitas / Notes</th>
                    <th className="py-3 px-3 text-right">Actual (IDR)</th>
                    <th className="py-3 px-3 text-right">Actual (USD)</th>
                    <th className="py-3 px-3">No. Dokumen</th>
                    <th className="py-3 px-3">Tgl Posting</th>
                  </tr>
                )}
                {activeTab === "budget" && (
                  <tr>
                    <th className="py-3 px-3">Bulan</th>
                    <th className="py-3 px-3">Cost Center</th>
                    <th className="py-3 px-3">Cost Element (CE2)</th>
                    <th className="py-3 px-3 text-right">Budget (IDR)</th>
                    <th className="py-3 px-3 text-right">Budget (USD)</th>
                    <th className="py-3 px-3">BBP</th>
                    <th className="py-3 px-3">Group Exp</th>
                  </tr>
                )}
                {activeTab === "summary" && (
                  <tr>
                    <th className="py-3 px-3">Bulan</th>
                    <th className="py-3 px-3">PG</th>
                    <th className="py-3 px-3">Cost Center</th>
                    <th className="py-3 px-3">Cost Element (CE2)</th>
                    <th className="py-3 px-3 text-right">Actual (Rp)</th>
                    <th className="py-3 px-3 text-right">Budget (Rp)</th>
                    <th className="py-3 px-3 text-right">Variance (%)</th>
                  </tr>
                )}
                {activeTab === "master" && (
                  <tr>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Kode</th>
                    <th className="py-3 px-3">Deskripsi</th>
                    <th className="py-3 px-3">Status Tampil</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAF9] transition-colors">
                    {activeTab === "actual" && (
                      <>
                        <td className="py-2.5 px-3 font-semibold text-[#16823B]">
                          Bln {String(row.period)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#17231B]">{String(row.pg || "-")}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#17231B] block">{String(row.costcenter)}</span>
                          <span className="text-[10px] text-[#5F6B63] line-clamp-1">
                            {String(row.deskripsiCostcenter || "")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#17231B] block">{String(row.ce2)}</span>
                          <span className="text-[10px] text-[#5F6B63] line-clamp-1">
                            {String(row.deskripsiCe2 || "")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 max-w-xs">
                          <span className="text-[#17231B] line-clamp-1" title={String(row.notes || "")}>
                            {String(row.notes || "-")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#17231B] whitespace-nowrap">
                          {Number(row.idrAct || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63] whitespace-nowrap">
                          {Number(row.usdAct || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">
                          {String(row.documentNumber || "-")}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-[#5F6B63] whitespace-nowrap">
                          {String(row.postingDate || "-")}
                        </td>
                      </>
                    )}

                    {activeTab === "budget" && (
                      <>
                        <td className="py-2.5 px-3 font-semibold text-[#16823B]">
                          Bln {String(row.period)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#17231B] block">{String(row.costcenter)}</span>
                          <span className="text-[10px] text-[#5F6B63] line-clamp-1">
                            {String(row.deskripsiCostcenter || "")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#17231B] block">{String(row.ce2)}</span>
                          <span className="text-[10px] text-[#5F6B63] line-clamp-1">
                            {String(row.deskripsiCe2 || "")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#17231B] whitespace-nowrap">
                          {Number(row.amountIdr || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63] whitespace-nowrap">
                          {Number(row.amountUsd || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-[#17231B]">{String(row.bbp || "-")}</td>
                        <td className="py-2.5 px-3 text-[#5F6B63] text-[11px]">{String(row.groupExp || "-")}</td>
                      </>
                    )}

                    {activeTab === "summary" && (
                      <>
                        <td className="py-2.5 px-3 font-semibold text-[#16823B]">
                          Bln {String(row.periode)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#17231B]">{String(row.pg)}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#17231B] block">{String(row.costcenter)}</span>
                          <span className="text-[10px] text-[#5F6B63] line-clamp-1">
                            {String(row.deskripsiCostcenter || "")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#17231B] block">{String(row.ce2)}</span>
                          <span className="text-[10px] text-[#5F6B63] line-clamp-1">
                            {String(row.deskripsiCe2 || "")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#17231B] whitespace-nowrap">
                          {row.nilaiActual !== null
                            ? Number(row.nilaiActual).toLocaleString("id-ID")
                            : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63] whitespace-nowrap">
                          {row.nilaiBudget !== null
                            ? Number(row.nilaiBudget).toLocaleString("id-ID")
                            : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                          {row.variance !== null ? (
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

                    {activeTab === "master" && (
                      <>
                        <td className="py-2.5 px-3 font-semibold text-[#16823B]">
                          {String(row.type)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#17231B]">
                          {String(row.code)}
                        </td>
                        <td className="py-2.5 px-3 text-[#17231B]">{String(row.description || "-")}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Aktif
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Navigation */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#DDE5DF]">
            <div className="text-xs text-[#5F6B63]">
              Halaman <strong className="text-[#17231B]">{page}</strong> dari{" "}
              <strong className="text-[#17231B]">{totalPages}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white text-xs font-semibold text-[#17231B] hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
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
                <span>Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
