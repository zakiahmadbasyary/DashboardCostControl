"use client";

import { useState, useEffect } from "react";
import { previewService } from "@/services/previewService";
import { Search, Layers, ListChecks, MapPin, Table as TableIcon, ChevronLeft, ChevronRight } from "lucide-react";

type TabType = "mastersheet" | "lokasi" | "sbt" | "aktivitas";

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
        <h1 className="text-xl font-extrabold text-[#17231B]">Preview Data Database</h1>
        <p className="text-xs text-[#5F6B63] mt-1">
          Inspeksi data mentah dari 4 tabel database (MasterSheet, Lokasi, SBT, dan Aktivitas) dengan sistem paginasi 50 data per halaman.
        </p>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
          {/* 4 Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleTabChange("mastersheet")}
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
              onClick={() => handleTabChange("lokasi")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "lokasi"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Data Lokasi</span>
            </button>

            <button
              onClick={() => handleTabChange("sbt")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "sbt"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Data SBT</span>
            </button>

            <button
              onClick={() => handleTabChange("aktivitas")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "aktivitas"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>Data Aktivitas</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari kata kunci..."
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
            <p className="text-xs text-[#89938D] mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
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
                      <th className="py-2.5 px-3 text-right">Luas (Ha)</th>
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
                        <td className="py-2.5 px-3 text-right font-mono">{Number(item.luas ?? 0)} Ha</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{String(item.kodeBibit ?? "")}</td>
                        <td className="py-2.5 px-3 font-medium">{String(item.jenisBibit ?? "")}</td>
                        <td className="py-2.5 px-3">{String(item.kelasBibit ?? "")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. Data Lokasi Table */}
            {activeTab === "lokasi" && (
              <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                    <tr>
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Lokasi</th>
                      <th className="py-2.5 px-3">Wilayah</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Luas (Ha)</th>
                      <th className="py-2.5 px-3">Umur</th>
                      <th className="py-2.5 px-3">Jenis Bibit</th>
                      <th className="py-2.5 px-3">Kelas Bibit</th>
                      <th className="py-2.5 px-3">Group Cost</th>
                      <th className="py-2.5 px-3">Ket. Group Cost</th>
                      <th className="py-2.5 px-3 text-right">Cost / Ha</th>
                      <th className="py-2.5 px-3 text-right">Total Cost</th>
                      <th className="py-2.5 px-3">Pupuk</th>
                      <th className="py-2.5 px-3">Kode SBT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F9F7]">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{String(item.idLokasi ?? "")}</td>
                        <td className="py-2.5 px-3 font-bold">{String(item.lokasi ?? "")}</td>
                        <td className="py-2.5 px-3">{String(item.wilayah ?? "")}</td>
                        <td className="py-2.5 px-3">{String(item.status ?? "")}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{Number(item.luas ?? 0)} Ha</td>
                        <td className="py-2.5 px-3">{Number(item.umur ?? 0)} Bln</td>
                        <td className="py-2.5 px-3 font-medium">{String(item.jenisBibit ?? "")}</td>
                        <td className="py-2.5 px-3">{String(item.kelasBibit ?? "")}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{String(item.groupCost ?? "")}</td>
                        <td className="py-2.5 px-3 font-medium">{String(item.keteranganGroupCost ?? "")}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          Rp {Number(item.costHa ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                          Rp {Number(item.cost ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-[#5F6B63]">{String(item.pupuk ?? "")}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#16823B] font-medium">{String(item.kodeSbt ?? "")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Data SBT Table */}
            {activeTab === "sbt" && (
              <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                    <tr>
                      <th className="py-2.5 px-3">Kode SBT</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Pupuk</th>
                      <th className="py-2.5 px-3">Jenis Bibit</th>
                      <th className="py-2.5 px-3">Kelas Bibit</th>
                      <th className="py-2.5 px-3">Group Cost</th>
                      <th className="py-2.5 px-3">Umur</th>
                      <th className="py-2.5 px-3 text-right">Nilai SBT (Rp / Ha)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F9F7]">
                        <td className="py-2.5 px-3 font-bold font-mono text-[#16823B]">{String(item.kodeSbt ?? "")}</td>
                        <td className="py-2.5 px-3">{String(item.status ?? "-")}</td>
                        <td className="py-2.5 px-3">{String(item.pupuk ?? "-")}</td>
                        <td className="py-2.5 px-3">{String(item.jenis ?? "-")}</td>
                        <td className="py-2.5 px-3">{String(item.kelas ?? "-")}</td>
                        <td className="py-2.5 px-3 font-medium">{String(item.groupCost ?? "-")}</td>
                        <td className="py-2.5 px-3">{item.umur !== null && item.umur !== undefined ? `${item.umur} Bln` : "-"}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                          Rp {Number(item.nilaiSbt ?? 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. Data Aktivitas Table */}
            {activeTab === "aktivitas" && (
              <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                    <tr>
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Lokasi</th>
                      <th className="py-2.5 px-3">Wilayah</th>
                      <th className="py-2.5 px-3 text-right">Luas (Ha)</th>
                      <th className="py-2.5 px-3">Kelas Bibit</th>
                      <th className="py-2.5 px-3">Aktivitas</th>
                      <th className="py-2.5 px-3 text-right">Total Biaya (Rp)</th>
                      <th className="py-2.5 px-3 text-right">Cost / Ha (Rp)</th>
                      <th className="py-2.5 px-3">Group Cost</th>
                      <th className="py-2.5 px-3">Ket. Group Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {tableData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F9F7]">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{String(item.idAktivitas ?? "")}</td>
                        <td className="py-2.5 px-3 font-bold">{String(item.lokasi ?? "")}</td>
                        <td className="py-2.5 px-3">{String(item.wilayah ?? "")}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">{Number(item.luas ?? 0)} Ha</td>
                        <td className="py-2.5 px-3">{String(item.kelasBibit ?? "")}</td>
                        <td className="py-2.5 px-3 font-bold">{String(item.aktivitas ?? "")}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                          Rp {Number(item.biaya ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          Rp {Number(item.costHa ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{String(item.groupCost ?? "")}</td>
                        <td className="py-2.5 px-3 font-medium">{String(item.keteranganGroupCost ?? "")}</td>
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
