"use client";

import { useState, useEffect } from "react";
import { hppPreviewService } from "@/services/hppPreviewService";
import { Search, Table as TableIcon, MapPin, Calculator, Activity, ChevronLeft, ChevronRight } from "lucide-react";

type TabType = "mastersheet" | "budget" | "lokasi" | "aktivitas";

export default function AdminPreviewPage() {
  const [activeTab, setActiveTab] = useState<TabType>("mastersheet");
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
        const res = await hppPreviewService.getTableData(activeTab, searchQuery, page, limit);
        setTableData(res.data || []);
        setTotalRecords(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        console.error("Error fetching preview data:", err);
        setTableData([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, searchQuery, page]);

  const startRecord = totalRecords > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(page * limit, totalRecords);

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* Page Header */}
      <div suppressHydrationWarning>
        <h1 className="text-xl font-extrabold text-[#17231B]">Preview Data Database HPP</h1>
        <p className="text-xs text-[#5F6B63] mt-1">
          Inspeksi data mentah dari 4 tabel database HPP (MasterSheet, Data Budget, Data Lokasi HPP, dan Data Aktivitas HPP) dengan paginasi 50 data per halaman.
        </p>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs space-y-4" suppressHydrationWarning>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4" suppressHydrationWarning>
          {/* 4 Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full shrink-0 scrollbar-none" suppressHydrationWarning>
            <button
              onClick={() => handleTabChange("mastersheet")}
              suppressHydrationWarning
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "mastersheet"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>MasterSheet</span>
            </button>

            <button
              onClick={() => handleTabChange("budget")}
              suppressHydrationWarning
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "budget"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Data Budget</span>
            </button>

            <button
              onClick={() => handleTabChange("lokasi")}
              suppressHydrationWarning
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "lokasi"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Data Lokasi HPP</span>
            </button>

            <button
              onClick={() => handleTabChange("aktivitas")}
              suppressHydrationWarning
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "aktivitas"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Data Aktivitas HPP</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]" suppressHydrationWarning>
            <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari kata kunci..."
              suppressHydrationWarning
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B]"
            />
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#5F6B63]">Memuat data tabel...</p>
          </div>
        ) : tableData.length === 0 ? (
          <div className="p-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
            <p className="text-sm font-semibold text-[#5F6B63]">Data tidak ditemukan</p>
            <p className="text-xs text-[#89938D] mt-1">Coba sesuaikan kata kunci pencarian Anda atau upload data baru.</p>
          </div>
        ) : (
          <div>
            {/* 1. MasterSheet Table */}
            {activeTab === "mastersheet" && (
              <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                    <tr>
                      <th className="py-2.5 px-3">Lokasi</th>
                      <th className="py-2.5 px-3">Wilayah</th>
                      <th className="py-2.5 px-3">Kode Bibit</th>
                      <th className="py-2.5 px-3">Jenis Bibit</th>
                      <th className="py-2.5 px-3">Kelas Bibit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F9F7]">
                        <td className="py-2.5 px-3 font-bold">{String(item.lokasi ?? "")}</td>
                        <td className="py-2.5 px-3">{String(item.wilayah ?? "")}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">
                          {item.kodeBibit ? String(item.kodeBibit) : "-"}
                        </td>
                        <td className="py-2.5 px-3 font-medium">{item.jenisBibit ? String(item.jenisBibit) : "-"}</td>
                        <td className="py-2.5 px-3">{item.kelasBibit ? String(item.kelasBibit) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. Data Budget Table */}
            {activeTab === "budget" && (
              <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                    <tr>
                      <th className="py-2.5 px-3">ID Budget</th>
                      <th className="py-2.5 px-3">Group</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-center">Periode</th>
                      <th className="py-2.5 px-3 text-right">Budget (Rp / Ha)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F9F7]">
                        <td className="py-2.5 px-3 font-bold font-mono text-[#16823B]">{String(item.idBudget ?? "")}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{String(item.group ?? "-")}</td>
                        <td className="py-2.5 px-3 font-medium">{String(item.status ?? "-")}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{String(item.periode ?? "-")}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                          Rp {Number(item.budget ?? 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Data Lokasi HPP Table */}
            {activeTab === "lokasi" && (
              <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                    <tr>
                      <th className="py-2.5 px-3">ID Lokasi HPP</th>
                      <th className="py-2.5 px-3">Lokasi</th>
                      <th className="py-2.5 px-3">Wilayah</th>
                      <th className="py-2.5 px-3">ID Budget</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Qty Panen (Kg)</th>
                      <th className="py-2.5 px-3 text-right">Luas Panen (Ha)</th>
                      <th className="py-2.5 px-3 text-right">Luas Aktif (Ha)</th>
                      <th className="py-2.5 px-3">Group</th>
                      <th className="py-2.5 px-3">Desc Group</th>
                      <th className="py-2.5 px-3">Jenis Biaya</th>
                      <th className="py-2.5 px-3 text-right">Biaya (Rp)</th>
                      <th className="py-2.5 px-3 text-right">Cost / Ha (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F9F7]">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{String(item.idLokasiHpp ?? "")}</td>
                        <td className="py-2.5 px-3 font-bold">{String(item.lokasi ?? "")}</td>
                        <td className="py-2.5 px-3">{String(item.wilayah ?? "")}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#16823B]">{String(item.idBudget ?? "")}</td>
                        <td className="py-2.5 px-3">{String(item.status ?? "")}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{Number(item.qtyPanen ?? 0).toLocaleString("id-ID")}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{Number(item.luasPanen ?? 0).toLocaleString("id-ID")} Ha</td>
                        <td className="py-2.5 px-3 text-right font-mono">{Number(item.luasAktif ?? 0).toLocaleString("id-ID")} Ha</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{String(item.group ?? "")}</td>
                        <td className="py-2.5 px-3 font-medium">{String(item.descGroup ?? "")}</td>
                        <td className="py-2.5 px-3 text-[#5F6B63]">{String(item.jenisBiaya ?? "")}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                          Rp {Number(item.biaya ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          Rp {Number(item.costHa ?? 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. Data Aktivitas HPP Table */}
            {activeTab === "aktivitas" && (
              <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                    <tr>
                      <th className="py-2.5 px-3">ID Aktivitas</th>
                      <th className="py-2.5 px-3">Lokasi</th>
                      <th className="py-2.5 px-3">Wilayah</th>
                      <th className="py-2.5 px-3">Aktivitas</th>
                      <th className="py-2.5 px-3">Group</th>
                      <th className="py-2.5 px-3">UoM</th>
                      <th className="py-2.5 px-3 text-right">Hasil</th>
                      <th className="py-2.5 px-3 text-right">Total Biaya (Rp)</th>
                      <th className="py-2.5 px-3">Mulai Rawat</th>
                      <th className="py-2.5 px-3">Mulai Tanam</th>
                      <th className="py-2.5 px-3">Forcing Std</th>
                      <th className="py-2.5 px-3">Rencana Forcing</th>
                      <th className="py-2.5 px-3">Real Forcing</th>
                      <th className="py-2.5 px-3">Rencana Panen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F9F7]">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{String(item.idAktivitas ?? "")}</td>
                        <td className="py-2.5 px-3 font-bold">{String(item.lokasi ?? "")}</td>
                        <td className="py-2.5 px-3">{String(item.wilayah ?? "")}</td>
                        <td className="py-2.5 px-3 font-bold">{String(item.aktivitas ?? "")}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{String(item.group ?? "")}</td>
                        <td className="py-2.5 px-3 font-medium">{String(item.uom ?? "")}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{Number(item.hasil ?? 0).toLocaleString("id-ID")}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                          Rp {Number(item.biaya ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{item.tanggalMulaiRawat ? String(item.tanggalMulaiRawat) : "-"}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{item.tanggalMulaiTanam ? String(item.tanggalMulaiTanam) : "-"}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{item.tanggalForcingStandard ? String(item.tanggalForcingStandard) : "-"}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{item.rencanaForcing ? String(item.rencanaForcing) : "-"}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{item.realForcing ? String(item.realForcing) : "-"}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{item.rencanaPanen ? String(item.rencanaPanen) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-3 border-t border-[#DDE5DF]/60 text-xs text-[#5F6B63]">
              <div>
                Menampilkan <span className="font-semibold text-[#17231B]">{startRecord}</span> -{" "}
                <span className="font-semibold text-[#17231B]">{endRecord}</span> dari{" "}
                <span className="font-bold text-[#16823B]">{totalRecords.toLocaleString("id-ID")}</span> data
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-[#17231B] hover:bg-[#F7F9F7] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <span className="px-3 py-1 bg-[#F7F9F7] rounded-lg border border-[#DDE5DF] font-semibold text-[#17231B]">
                  Halaman {page} dari {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white text-[#17231B] hover:bg-[#F7F9F7] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
