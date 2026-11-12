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
  FileSpreadsheet,
  Activity,
  Tractor,
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
  badge: string;
}

const TABS: TabMeta[] = [
  {
    key: "lokasi",
    label: "Data Lokasi",
    icon: Tractor,
    description: "Tampilan persis kolom berkas Excel Data Lokasi: Mastersheet petak ditambah kolom umur (Umur 1 s/d Umur 20).",
    badge: "Mastersheet + Umur 1-20",
  },
  {
    key: "timeline",
    label: "Data Timeline",
    icon: FileSpreadsheet,
    description: "Tampilan persis kolom berkas Excel Data Timeline: Transaksi realisasi ditambah kolom kuantitas bahan kimia dinamis.",
    badge: "Timeline + Bahan Kimia",
  },
  {
    key: "aktivitas",
    label: "Data Aktivitas",
    icon: Activity,
    description: "Tampilan persis kolom berkas Excel Data Aktivitas: Rekap transaksi lengkap dengan status, wilayah, luas, kelas, biaya, dan grup aktivitas.",
    badge: "Rekap Transaksi Aktivitas",
  },
];

export default function AdminPreviewPage() {
  const [activeTab, setActiveTab] = useState<WeedControlTab>("lokasi");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(50);

  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [materialColumns, setMaterialColumns] = useState<string[]>([]);
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
      setMaterialColumns(res.materialColumns || []);
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

  // 20 Kolom Umur untuk Data Lokasi Excel
  const umurList = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#17231B] flex items-center gap-2">
            <span>Preview Data Weed Control</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6B63] mt-1">
            Data preview disesuaikan persis seperti struktur kolom pada 3 file Excel sumber: <strong>Data Lokasi</strong>, <strong>Data Timeline</strong>, dan <strong>Data Aktivitas</strong>.
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

      {/* Tabs Navigation (3 Tab Sesuai 3 File Excel) */}
      <div className="border-b border-[#DDE5DF] flex items-center gap-2 overflow-x-auto pb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2.5 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "border-[#16823B] text-[#16823B] bg-white rounded-t-xl shadow-xs"
                  : "border-transparent text-[#5F6B63] hover:text-[#17231B] hover:bg-white/50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isActive ? "bg-[#16823B]/10 text-[#16823B]" : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab.badge}
              </span>
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

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              activeTab === "lokasi"
                ? "Cari lokasi / wilayah / jenis / status..."
                : activeTab === "timeline"
                ? "Cari lokasi / aktivitas / nama bahan kimia..."
                : "Cari lokasi / aktivitas / kode / grup..."
            }
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
        <div className="overflow-x-auto max-h-[620px] scrollbar-thin">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF] sticky top-0 z-10 shadow-2xs">
              {/* ========================================================================= */}
              {/* 1. HEADER DATA LOKASI (Kolom Excel Mastersheet + Umur 1..20) */}
              {/* ========================================================================= */}
              {activeTab === "lokasi" && (
                <tr>
                  <th className="py-3 px-3.5 sticky left-0 bg-[#F7F9F7] z-20 border-r border-[#DDE5DF]">Lokasi</th>
                  <th className="py-3 px-3 whitespace-nowrap">Status</th>
                  <th className="py-3 px-3 whitespace-nowrap">Wilayah</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Luas (Ha)</th>
                  <th className="py-3 px-3 whitespace-nowrap">Jenis</th>
                  <th className="py-3 px-2.5 whitespace-nowrap">Kelas</th>
                  <th className="py-3 px-3 whitespace-nowrap">Mulai Rawat</th>
                  <th className="py-3 px-3 whitespace-nowrap">Mulai Tanam</th>
                  <th className="py-3 px-3 whitespace-nowrap">Forcing Std</th>
                  <th className="py-3 px-3 whitespace-nowrap">Real Forcing</th>
                  <th className="py-3 px-3 whitespace-nowrap">Selesai Panen</th>
                  <th className="py-3 px-2.5 text-center whitespace-nowrap">Umur Forcing</th>
                  <th className="py-3 px-2.5 text-center whitespace-nowrap">Umur</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap bg-emerald-50/60 text-[#16823B] border-r border-[#DDE5DF]">Total Cost</th>
                  {umurList.map((u) => (
                    <th key={u} className="py-3 px-3 text-right whitespace-nowrap bg-gray-50/80 text-[#5F6B63]">
                      Umur {u}
                    </th>
                  ))}
                </tr>
              )}

              {/* ========================================================================= */}
              {/* 2. HEADER DATA TIMELINE (Kolom Excel Timeline + Kolom Bahan Kimia Dinamis) */}
              {/* ========================================================================= */}
              {activeTab === "timeline" && (
                <tr>
                  <th className="py-3 px-3.5 sticky left-0 bg-[#F7F9F7] z-20 border-r border-[#DDE5DF]">Lokasi</th>
                  <th className="py-3 px-3 whitespace-nowrap">Awal Rawat</th>
                  <th className="py-3 px-4 min-w-[200px]">Aktivitas</th>
                  <th className="py-3 px-3 whitespace-nowrap">Tgl Realisasi</th>
                  <th className="py-3 px-2.5 text-center whitespace-nowrap">Umur</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Hasil</th>
                  <th className="py-3 px-2.5 text-center whitespace-nowrap">UOM</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">TK</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Kapasitas/TK</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap bg-emerald-50/60 text-[#16823B]">Total Cost</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Upah</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Charge</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap border-r border-[#DDE5DF] bg-amber-50/50 text-amber-900">
                    Material (Biaya)
                  </th>
                  {materialColumns.map((matName) => (
                    <th
                      key={matName}
                      className="py-3 px-3 text-right whitespace-nowrap bg-blue-50/40 text-blue-900 font-semibold"
                      title={`Kuantitas bahan kimia ${matName}`}
                    >
                      {matName}
                    </th>
                  ))}
                </tr>
              )}

              {/* ========================================================================= */}
              {/* 3. HEADER DATA AKTIVITAS (Kolom Excel Rekap Transaksi Denormalisasi) */}
              {/* ========================================================================= */}
              {activeTab === "aktivitas" && (
                <tr>
                  <th className="py-3 px-3.5 sticky left-0 bg-[#F7F9F7] z-20 border-r border-[#DDE5DF]">Lokasi</th>
                  <th className="py-3 px-3 whitespace-nowrap">Status</th>
                  <th className="py-3 px-3 whitespace-nowrap">Wilayah</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Luas (Ha)</th>
                  <th className="py-3 px-2.5 whitespace-nowrap">Kelas</th>
                  <th className="py-3 px-3 font-mono whitespace-nowrap">Kode</th>
                  <th className="py-3 px-4 min-w-[220px]">Aktivitas</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap bg-emerald-50/60 text-[#16823B]">Biaya (Total)</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap text-emerald-800">Biaya/Ha</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Upah</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Charge</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Material</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Bibit</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Hasil</th>
                  <th className="py-3 px-2.5 text-center whitespace-nowrap">UOM</th>
                  <th className="py-3 px-3.5 whitespace-nowrap font-semibold text-[#16823B]">Activity Group</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-[#DDE5DF]/60">
              {loading ? (
                <tr>
                  <td
                    colSpan={
                      activeTab === "lokasi"
                        ? 14 + umurList.length
                        : activeTab === "timeline"
                        ? 13 + materialColumns.length
                        : 16
                    }
                    className="py-16 text-center text-xs text-[#5F6B63]"
                  >
                    <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Memuat data tabel...
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      activeTab === "lokasi"
                        ? 14 + umurList.length
                        : activeTab === "timeline"
                        ? 13 + materialColumns.length
                        : 16
                    }
                    className="py-16 text-center text-xs text-[#5F6B63]"
                  >
                    Tidak ada data pada tabel <strong>{currentTabMeta.label}</strong>.
                  </td>
                </tr>
              ) : (
                tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F7F9F7] text-[#17231B] transition-colors">
                    {/* ========================================================================= */}
                    {/* 1. BARIS DATA LOKASI */}
                    {/* ========================================================================= */}
                    {activeTab === "lokasi" && (
                      <>
                        <td className="py-2.5 px-3.5 font-bold font-mono text-[#16823B] sticky left-0 bg-white group-hover:bg-[#F7F9F7] z-10 border-r border-[#DDE5DF]">
                          {row.lokasi}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{row.status || "-"}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium">{row.wilayah || "-"}</td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">{formatDecimal2(row.luas)}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{row.jenis || "-"}</td>
                        <td className="py-2.5 px-2.5 whitespace-nowrap">{row.kelas || "-"}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-[#5F6B63]">{formatDateShort(row.mulaiRawat)}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-[#5F6B63]">{formatDateShort(row.mulaiTanam)}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-[#5F6B63]">{formatDateShort(row.forcingStandar)}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-[#5F6B63]">{formatDateShort(row.realForcing)}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-[#5F6B63]">{formatDateShort(row.selesaiPanen)}</td>
                        <td className="py-2.5 px-2.5 text-center font-mono whitespace-nowrap">{row.umurForcing || "-"}</td>
                        <td className="py-2.5 px-2.5 text-center font-mono whitespace-nowrap font-semibold">{row.umur || "-"}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#16823B] whitespace-nowrap bg-emerald-50/30 border-r border-[#DDE5DF]">
                          {formatCurrencyRp(row.totalCost)}
                        </td>
                        {umurList.map((u) => {
                          const cost = row.costUmurMap?.[u];
                          const hasValue = cost !== undefined && cost !== null && cost !== 0;
                          return (
                            <td
                              key={u}
                              className={`py-2.5 px-3 text-right font-mono whitespace-nowrap ${
                                hasValue ? "text-[#17231B] font-medium" : "text-gray-300"
                              }`}
                            >
                              {hasValue ? formatCurrencyRp(cost) : "-"}
                            </td>
                          );
                        })}
                      </>
                    )}

                    {/* ========================================================================= */}
                    {/* 2. BARIS DATA TIMELINE */}
                    {/* ========================================================================= */}
                    {activeTab === "timeline" && (
                      <>
                        <td className="py-2.5 px-3.5 font-bold font-mono text-[#16823B] sticky left-0 bg-white z-10 border-r border-[#DDE5DF]">
                          {row.lokasi}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-[#5F6B63]">{formatDateShort(row.awalRawat)}</td>
                        <td className="py-2.5 px-4 font-medium text-[#17231B] min-w-[200px]">{row.aktivitas || "-"}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-[#5F6B63]">{formatDateShort(row.tanggalRealisasi)}</td>
                        <td className="py-2.5 px-2.5 text-center font-mono font-bold whitespace-nowrap">
                          {row.umur !== null && row.umur !== undefined && row.umur !== 0 ? row.umur : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap" title={row.hasil !== null && row.hasil !== undefined ? `Nilai asli: ${row.hasil}` : undefined}>
                          {formatDecimal2(row.hasil)}
                        </td>
                        <td className="py-2.5 px-2.5 text-center whitespace-nowrap font-medium">{row.uom || "-"}</td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap" title={row.tk !== null && row.tk !== undefined ? `Nilai asli: ${row.tk}` : undefined}>
                          {formatDecimal2(row.tk)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap" title={row.kapasitasPerTk !== null && row.kapasitasPerTk !== undefined ? `Nilai asli: ${row.kapasitasPerTk}` : undefined}>
                          {formatDecimal2(row.kapasitasPerTk)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#16823B] whitespace-nowrap bg-emerald-50/30">
                          {formatCurrencyRp(row.totalCost)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">{formatCurrencyRp(row.upah)}</td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">{formatCurrencyRp(row.charge)}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-semibold whitespace-nowrap border-r border-[#DDE5DF] bg-amber-50/20 text-amber-900">
                          {formatCurrencyRp(row.material)}
                        </td>
                        {materialColumns.map((matName) => {
                          const qty = row.materialsMap?.[matName];
                          const hasQty = qty !== undefined && qty !== null && qty !== 0;
                          return (
                            <td
                              key={matName}
                              title={hasQty ? `Nilai asli: ${qty}` : undefined}
                              className={`py-2.5 px-3 text-right font-mono whitespace-nowrap ${
                                hasQty
                                  ? "text-blue-900 font-semibold bg-blue-50/15"
                                  : "text-gray-300"
                              }`}
                            >
                              {hasQty ? formatDecimal2(qty) : "-"}
                            </td>
                          );
                        })}
                      </>
                    )}

                    {/* ========================================================================= */}
                    {/* 3. BARIS DATA AKTIVITAS */}
                    {/* ========================================================================= */}
                    {activeTab === "aktivitas" && (
                      <>
                        <td className="py-2.5 px-3.5 font-bold font-mono text-[#16823B] sticky left-0 bg-white z-10 border-r border-[#DDE5DF]">
                          {row.lokasi}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{row.status || "-"}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium">{row.wilayah || "-"}</td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">{formatDecimal2(row.luas)}</td>
                        <td className="py-2.5 px-2.5 whitespace-nowrap">{row.kelas || "-"}</td>
                        <td className="py-2.5 px-3 font-mono font-medium whitespace-nowrap">{row.kode || "-"}</td>
                        <td className="py-2.5 px-4 font-medium text-[#17231B] min-w-[220px]">{row.aktivitas || "-"}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#16823B] whitespace-nowrap bg-emerald-50/30">
                          {formatCurrencyRp(row.biaya)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-emerald-800 whitespace-nowrap">
                          {formatCurrencyRp(row.biayaPerHa)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">{formatCurrencyRp(row.upah)}</td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">{formatCurrencyRp(row.charge)}</td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">{formatCurrencyRp(row.material)}</td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">{formatCurrencyRp(row.bibit)}</td>
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap" title={row.hasil !== null && row.hasil !== undefined ? `Nilai asli: ${row.hasil}` : undefined}>
                          {formatDecimal2(row.hasil)}
                        </td>
                        <td className="py-2.5 px-2.5 text-center whitespace-nowrap font-medium">{row.uom || "-"}</td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap font-semibold text-[#16823B]">
                          {row.activityGroup || "-"}
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
