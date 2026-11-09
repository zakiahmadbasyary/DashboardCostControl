"use client";

import { useState, useEffect, useCallback } from "react";
import { previewService, WeedControlTab } from "@/services/previewService";
import {
  formatNumberId,
  formatCurrencyRp,
  formatDecimal2,
  formatDecimal4,
  formatDateShort,
} from "@/lib/formatters";
import {
  Search,
  X,
  Layers,
  FileSpreadsheet,
  Activity,
  Tractor,
  Boxes,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Info,
} from "lucide-react";

interface TabMeta {
  key: WeedControlTab;
  label: string;
  icon: typeof Tractor;
  description: string;
}

const TABS: TabMeta[] = [
  {
    key: "mastersheet",
    label: "Mastersheet Lokasi",
    icon: Tractor,
    description: "Daftar master petak perkebunan per lokasi (Primary Key lokasi unik).",
  },
  {
    key: "cost_umur",
    label: "Biaya Umur (1-20)",
    icon: Layers,
    description: "Rincian biaya umur hasil transformasi wide-to-long dari kolom Umur 1 s/d 20.",
  },
  {
    key: "data_timeline",
    label: "Data Timeline",
    icon: FileSpreadsheet,
    description: "Transaksi realisasi kegiatan lapangan per petak lokasi, mendukung umur negatif.",
  },
  {
    key: "data_material",
    label: "Detail Material Herbisida",
    icon: Boxes,
    description: "Rincian kuantitas aplikasi bahan herbisida/pestisida kimia dari kolom material dinamis.",
  },
  {
    key: "data_aktivitas",
    label: "Data Rekap Aktivitas",
    icon: Activity,
    description: "Rekap transaksi aktivitas lapangan lengkap dengan denormalisasi wilayah, status, luas, dan kelas.",
  },
];

export default function AdminPreviewPage() {
  const [activeTab, setActiveTab] = useState<WeedControlTab>("mastersheet");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(50);

  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await previewService.getPreviewData(activeTab, page, limit, searchQuery);
      setTableData(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Error loading preview:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, limit, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (tab: WeedControlTab) => {
    setActiveTab(tab);
    setPage(1);
    setSearchQuery("");
  };

  const currentTabMeta = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#17231B] flex items-center gap-2">
            <span>Preview Database Weed Control</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6B63] mt-1">
            Lihat dan verifikasi 5 tabel data Weed Control yang tersimpan di PostgreSQL.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F8FAF9] text-[#17231B] font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#DDE5DF] flex items-center gap-1 overflow-x-auto pb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "border-[#16823B] text-[#16823B] bg-white rounded-t-xl"
                  : "border-transparent text-[#5F6B63] hover:text-[#17231B] hover:bg-white/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Description & Search Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#5F6B63]">
          <Info className="w-4 h-4 text-[#16823B] shrink-0" />
          <span>{currentTabMeta.description}</span>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari lokasi / aktivitas / material..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#DDE5DF] bg-white text-[#17231B] placeholder-[#89938D] focus:outline-none focus:ring-2 focus:ring-[#16823B]/30 focus:border-[#16823B]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#89938D] hover:text-[#17231B] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[560px] scrollbar-thin">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
              {activeTab === "mastersheet" && (
                <tr>
                  <th className="py-3 px-3.5">Lokasi (PK)</th>
                  <th className="py-3 px-3">Wilayah</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Luas (Ha)</th>
                  <th className="py-3 px-3">Jenis</th>
                  <th className="py-3 px-3">Kelas</th>
                  <th className="py-3 px-3">Mulai Rawat</th>
                  <th className="py-3 px-3">Mulai Tanam</th>
                  <th className="py-3 px-3 text-right">Umur</th>
                  <th className="py-3 px-3.5 text-right">Total Cost</th>
                </tr>
              )}

              {activeTab === "cost_umur" && (
                <tr>
                  <th className="py-3 px-3.5">ID</th>
                  <th className="py-3 px-3.5">Lokasi (FK)</th>
                  <th className="py-3 px-3 text-center">Umur</th>
                  <th className="py-3 px-3.5 text-right">Biaya (Rp)</th>
                  <th className="py-3 px-3.5">Updated At</th>
                </tr>
              )}

              {activeTab === "data_timeline" && (
                <tr>
                  <th className="py-3 px-3.5">ID</th>
                  <th className="py-3 px-3.5">Lokasi</th>
                  <th className="py-3 px-3.5">Aktivitas</th>
                  <th className="py-3 px-3">Tgl Realisasi</th>
                  <th className="py-3 px-2.5 text-center">Umur</th>
                  <th className="py-3 px-2.5 text-right">Hasil</th>
                  <th className="py-3 px-2.5 text-right">TK</th>
                  <th className="py-3 px-3 text-right">Upah (Rp)</th>
                  <th className="py-3 px-3 text-right">Material (Rp)</th>
                  <th className="py-3 px-3.5 text-right">Total Cost (Rp)</th>
                </tr>
              )}

              {activeTab === "data_material" && (
                <tr>
                  <th className="py-3 px-3.5">ID</th>
                  <th className="py-3 px-3.5">Timeline ID (FK)</th>
                  <th className="py-3 px-4">Nama Material</th>
                  <th className="py-3 px-4 text-right">Kuantitas</th>
                  <th className="py-3 px-3.5">Created At</th>
                </tr>
              )}

              {activeTab === "data_aktivitas" && (
                <tr>
                  <th className="py-3 px-3">Lokasi</th>
                  <th className="py-3 px-2.5">Wilayah</th>
                  <th className="py-3 px-2.5">Status</th>
                  <th className="py-3 px-2.5 text-right">Luas</th>
                  <th className="py-3 px-2.5">Kode</th>
                  <th className="py-3 px-3.5">Aktivitas</th>
                  <th className="py-3 px-3">Activity Group</th>
                  <th className="py-3 px-3 text-right">Upah</th>
                  <th className="py-3 px-3 text-right">Material</th>
                  <th className="py-3 px-3.5 text-right">Biaya</th>
                  <th className="py-3 px-3 text-right">Biaya/Ha</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-[#DDE5DF]/60">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-xs text-[#5F6B63]">
                    <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Memuat data tabel...
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-xs text-[#5F6B63]">
                    Tidak ada data pada tabel <strong>{currentTabMeta.label}</strong>.
                  </td>
                </tr>
              ) : (
                tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F7F9F7] text-[#17231B] transition-colors">
                    {activeTab === "mastersheet" && (
                      <>
                        <td className="py-2.5 px-3.5 font-bold font-mono text-[#16823B]">{row.lokasi}</td>
                        <td className="py-2.5 px-3 font-semibold">{row.wilayah || "-"}</td>
                        <td className="py-2.5 px-3">{row.status || "-"}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatDecimal2(row.luas)}</td>
                        <td className="py-2.5 px-3">{row.jenis || "-"}</td>
                        <td className="py-2.5 px-3">{row.kelas || "-"}</td>
                        <td className="py-2.5 px-3">{formatDateShort(row.mulaiRawat)}</td>
                        <td className="py-2.5 px-3">{formatDateShort(row.mulaiTanam)}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{row.umur ?? "-"}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#16823B]">
                          {formatCurrencyRp(row.totalCost)}
                        </td>
                      </>
                    )}

                    {activeTab === "cost_umur" && (
                      <>
                        <td className="py-2.5 px-3.5 font-mono text-gray-500">{String(row.id)}</td>
                        <td className="py-2.5 px-3.5 font-bold font-mono text-[#16823B]">{row.lokasi}</td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono">{row.umur}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#16823B]">
                          {formatCurrencyRp(row.cost)}
                        </td>
                        <td className="py-2.5 px-3.5 text-gray-500">{formatDateShort(row.updatedAt)}</td>
                      </>
                    )}

                    {activeTab === "data_timeline" && (
                      <>
                        <td className="py-2.5 px-3.5 font-mono text-gray-500">{String(row.id)}</td>
                        <td className="py-2.5 px-3.5 font-bold font-mono text-[#16823B]">{row.lokasi}</td>
                        <td className="py-2.5 px-3.5 font-medium">{row.aktivitas || "-"}</td>
                        <td className="py-2.5 px-3">{formatDateShort(row.tanggalRealisasi)}</td>
                        <td className="py-2.5 px-2.5 text-center font-mono font-bold">
                          {row.umur !== null ? row.umur : "-"}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono">{formatDecimal4(row.hasil)}</td>
                        <td className="py-2.5 px-2.5 text-right font-mono">{formatDecimal4(row.tk)}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrencyRp(row.upah)}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrencyRp(row.material)}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#16823B]">
                          {formatCurrencyRp(row.totalCost)}
                        </td>
                      </>
                    )}

                    {activeTab === "data_material" && (
                      <>
                        <td className="py-2.5 px-3.5 font-mono text-gray-500">{String(row.id)}</td>
                        <td className="py-2.5 px-3.5 font-mono font-bold text-[#16823B]">{String(row.timelineId)}</td>
                        <td className="py-2.5 px-4 font-bold">{row.namaMaterial}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#16823B]">
                          {formatDecimal4(row.quantity)}
                        </td>
                        <td className="py-2.5 px-3.5 text-gray-500">{formatDateShort(row.createdAt)}</td>
                      </>
                    )}

                    {activeTab === "data_aktivitas" && (
                      <>
                        <td className="py-2.5 px-3 font-bold font-mono text-[#16823B]">{row.lokasi}</td>
                        <td className="py-2.5 px-2.5 font-semibold">{row.wilayah || "-"}</td>
                        <td className="py-2.5 px-2.5">{row.status || "-"}</td>
                        <td className="py-2.5 px-2.5 text-right font-mono">{formatDecimal2(row.luas)}</td>
                        <td className="py-2.5 px-2.5 font-mono font-medium">{row.kode || "-"}</td>
                        <td className="py-2.5 px-3.5 font-medium">{row.aktivitas || "-"}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#16823B]">{row.activityGroup || "-"}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrencyRp(row.upah)}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrencyRp(row.material)}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#16823B]">
                          {formatCurrencyRp(row.biaya)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium">
                          {formatCurrencyRp(row.biayaPerHa)}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#DDE5DF] bg-[#F8FAF9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-[#5F6B63]">
            Menampilkan{" "}
            <strong className="text-[#17231B]">
              {tableData.length > 0 ? (page - 1) * limit + 1 : 0} -{" "}
              {Math.min(page * limit, totalRecords)}
            </strong>{" "}
            dari <strong className="text-[#17231B]">{totalRecords.toLocaleString("id-ID")}</strong> baris data
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-[#17231B] flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>
            <span className="px-3 py-1 font-bold text-[#16823B]">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-white hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-[#17231B] flex items-center gap-1 cursor-pointer"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
